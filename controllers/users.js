const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NoUserFoundError = require('../errors/NoFoundError');
const AuthorizationError = require('../errors/AuthorizationError');
const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const {
  NoUserFoundErrorMessage,
  AuthorizationErrorMessage,
  ValidationErrorMessage,
  ConflictErrorMessage,
} = require('../utils/const');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError(ValidationErrorMessage);
      } else if (err.message === 'NotFound') {
        throw new NoUserFoundError(NoUserFoundErrorMessage);
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(ValidationErrorMessage);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(ConflictErrorMessage);
      }
    })
    .catch(next);
};

module.exports.updateInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { runValidators: true, new: true })
    .then((user) => {
      if (!user) {
        throw new NoUserFoundError(NoUserFoundErrorMessage);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(ValidationErrorMessage);
      } else if (err.name === 'CastError') {
        throw new ValidationError(ValidationErrorMessage);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(ConflictErrorMessage);
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(AuthorizationErrorMessage));
      }

      // пользователь найден
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          // хеши не совпали — отклоняем промис
          return Promise.reject(new Error(AuthorizationErrorMessage));
        }
        return user;
      });
    })
    // аутентификация успешна
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch((err) => {
      throw new AuthorizationError(AuthorizationErrorMessage);
    })
    .catch(next);
};
