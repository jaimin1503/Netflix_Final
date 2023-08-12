const Joi = require("joi");

module.exports.userSchema = Joi.object({
  user: Joi.object({
    email: Joi.string().required(),
    username: Joi.number().required(),
    password: Joi.string().required(),
  }).required(),
});
