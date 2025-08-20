import Joi from 'joi';

const nameSchema = Joi.object({
    first: Joi.string().min(2).max(256).required(),
    middle: Joi.string().allow('').max(256),
    last: Joi.string().min(2).max(256).required(),
});

const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][\w-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][\w-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const imageSchema = Joi.object({
    url: Joi.string().pattern(urlRegex).allow(''),
    alt: Joi.string().max(256).allow(''),
});

const addressSchema = Joi.object({
    state: Joi.string().allow(''),
    country: Joi.string().min(2).max(256).required(),
    city: Joi.string().min(2).max(256).required(),
    street: Joi.string().min(2).max(256).required(),
    houseNumber: Joi.number().required(),
    zip: Joi.number().allow('', null),
});

export const userRegisterSchema = Joi.object({
    name: nameSchema.required(),
    phone: Joi.string().pattern(/0[0-9]{1,2}-?\s?[0-9]{3}\s?[0-9]{4}/).required(),
    email: Joi.string().pattern(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/).required(),
    password: Joi.string().min(8).max(256).required(),
    image: imageSchema,
    address: addressSchema,
    isBusiness: Joi.boolean().optional(),
    adminCode: Joi.string().max(128).optional(),
});

export const userUpdateSchema = Joi.object({
    name: nameSchema,
    phone: Joi.string().pattern(/0[0-9]{1,2}-?\s?[0-9]{3}\s?[0-9]{4}/),
    email: Joi.forbidden(),
    password: Joi.string().min(8).max(256),
    image: imageSchema,
    address: addressSchema,
    isBusiness: Joi.boolean(),
    isAdmin: Joi.boolean(),
});

export const loginSchema = Joi.object({
    email: Joi.string().pattern(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/).required(),
    password: Joi.string().min(1).required(),
});

export const validate = (schema, payload) => {
    return schema.validate(payload, { abortEarly: false, stripUnknown: true });
};
