// export default function logger(req, res, next) {
//   const now = new Date();
//   console.log(`${now} - ${req.method} - ${req.path}`);
//   next();
// }

import morgan from "morgan";

export default morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);
