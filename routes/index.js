const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRoutes = require('./users');
const moviesRoutes = require('./movies');
const pageNotFoundRoutes = require('./pageNotFound');
const auth = require('../middlewares/auth');
const { createUser, login } = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

router.use('/users', auth, userRoutes);
router.use('/movies', auth, moviesRoutes);
router.use('*', auth, pageNotFoundRoutes);

module.exports = router;
