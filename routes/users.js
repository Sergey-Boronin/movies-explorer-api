const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUserMe, updateInfo } = require('../controllers/users');

router.get('/me', getUserMe);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateInfo);

module.exports = router;
