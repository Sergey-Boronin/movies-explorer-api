const Movie = require('../models/movie');

const NoFoundError = require('../errors/NoFoundError');
const ValidationError = require('../errors/ValidationError');
const AccessError = require('../errors/AccessError');
const {
  NoFoundErrorMessage,
  ValidationErrorMessage,
  AccessErrorMessage,
} = require('../utils/const');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    owner: req.user._id,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(ValidationErrorMessage);
      }
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NoFoundError(NoFoundErrorMessage);
      } else if (movie.owner.toString() !== req.user._id) {
        throw new AccessError(AccessErrorMessage);
      }

      Movie.findByIdAndDelete(req.params.movieId)
        .then((movie) => res.send(movie))
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new ValidationError(ValidationErrorMessage);
          }
        })
        .catch(next);
    })
    .catch(next);
};
