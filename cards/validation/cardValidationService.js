import cardSchema from "./cardValidationSchema.js";

// Универсальная функция валидации карточки.
// 1. abortEarly:false — собираем ВСЕ ошибки, чтобы вывести пользователю/в лог
// 2. stripUnknown:true — отсекаем лишние поля, чтобы они не попадали в БД
// Возвращает стандартный объект { value, error } из Joi.
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
    // stdout для общей информации, stderr для сигнализации об ошибках
    lines.forEach(l => console.log(l));
  }
  return result;
};

// משימה:
// למנוע הכנסת כרטיס לא תקין למסד הנתונים
// להדפיס בקונסול את הסיבה / כל הסיבות לשגיאה
