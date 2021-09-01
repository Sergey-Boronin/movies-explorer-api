const router = require('express').Router();
const NotFoundPage = require('../errors/NoFoundError');

router.get('*', (req, res) => {
  throw new NotFoundPage('Запрашиваемый ресурс не найден');
});

router.post('*', (req, res) => {
  throw new NotFoundPage('Запрашиваемый ресурс не найден');
});

module.exports = router;
