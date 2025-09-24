import Joi from "joi";

// Unified URL regexp
const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][\w-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][\w-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

// Custom validator for bizNumber (7 digits), can be empty before assignment
const bizNumberRule = Joi.alternatives().try(
  Joi.number()
    .integer()
    .min(1000000)
    .max(9999999)
    .messages({
      "number.base": "bizNumber must be 7 digits",
      "number.min": "bizNumber must be 7 digits",
      "number.max": "bizNumber must be 7 digits",
    }),
  Joi.string().allow("") // can be empty before assignment
);

const requiredMsg = (field) => ({ "any.required": `${field} is required` });

const cardSchema = Joi.object({
  title: Joi.string().min(2).max(256).required().messages(requiredMsg("title")),
  subtitle: Joi.string().min(2).max(256).required().messages(requiredMsg("subtitle")),
  description: Joi.string().min(2).max(1024).required().messages(requiredMsg("description")),
  phone: Joi.string()
    .pattern(/0[0-9]{1,2}-?\s?[0-9]{3}\s?[0-9]{4}/)
    .required()
    .messages({
      ...requiredMsg("phone"),
      "string.pattern.base": "phone must be a valid phone number (e.g. 050-123 4567)",
    }),
  email: Joi.string()
    .pattern(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/)
    .required()
    .messages({
      ...requiredMsg("email"),
      "string.pattern.base": "email must be a valid email",
    }),
  web: Joi.string()
    .pattern(urlRegex)
    .allow("")
    .messages({ "string.pattern.base": "web must be a valid url" }),
  image: Joi.object({
    url: Joi.string()
      .pattern(urlRegex)
      .allow("")
      .messages({ "string.pattern.base": "image.url must be a valid url" }),
    alt: Joi.string()
      .min(2)
      .max(256)
      .allow("")
      .messages({ "string.min": "image.alt must have at least 2 chars" }),
  }).required(),
  address: Joi.object({
    state: Joi.string().allow(""),
    country: Joi.string().min(2).max(256).required().messages(requiredMsg("country")),
    city: Joi.string().min(2).max(256).required().messages(requiredMsg("city")),
    street: Joi.string().min(2).max(256).required().messages(requiredMsg("street")),
    houseNumber: Joi.number().required().messages({
      ...requiredMsg("houseNumber"),
      "number.base": "houseNumber must be a number",
    }),
    zip: Joi.number().allow("", null),
  }).required(),
  bizNumber: bizNumberRule,
  user_id: Joi.string().allow(""),
});

export default cardSchema;
