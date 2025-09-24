import cardSchema from "./cardValidationSchema.js";

// Universal card validation function.
// 1. abortEarly:false — collect ALL errors to show to user/log
// 2. stripUnknown:true — remove extra fields so they don't get into DB
// Returns standard { value, error } object from Joi.
export const validateCard = (card) => {
  const result = cardSchema.validate(card, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (result.error) {
    const lines = ["Card validation failed:"];
    result.error.details.forEach((d) => {
      const path = d.path.join(".") || "root";
      lines.push(` - ${path}: ${d.message}`);
    });
    // stdout for general info, stderr for error signaling
    lines.forEach(l => console.log(l));
  }
  return result;
};
