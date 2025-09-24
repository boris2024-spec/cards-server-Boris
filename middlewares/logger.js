// export default function logger(req, res, next) {
//   const now = new Date();
//   console.log(`${now} - ${req.method} - ${req.path}`);
//   next();
// }

import chalk from "chalk";
import { logger as fileLogger } from "../logger.js";

// Custom logger middleware matching required format:
// [YYYY/MM/DD HH:MM:SS] METHOD URL STATUS – RESPONSE_TIME ms
// STATUS >= 400 -> bright red, else cyan (or greenish)

const pad = (n) => String(n).padStart(2, "0");

export default function logger(req, res, next) {
  const start = process.hrtime.bigint();

  // Intercept writeHead to optionally add a message later
  res.locals = res.locals || {};

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const diffMs = Number(end - start) / 1_000_000; // convert ns to ms

    const now = new Date();
    const timestamp =
      `[${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;

    const status = res.statusCode;
    const statusColored =
      status >= 500
        ? chalk.red(status)
        : status >= 400
          ? chalk.yellow(status)
          : status >= 300
            ? chalk.cyan(status)
            : chalk.green(status);

    // Collect brief user info (if auth middleware has already set req.user)
    let userInfo = 'guest';
    if (req.user) {
      const { _id, isAdmin, isBusiness } = req.user;
      // Format: <id>(A?)(B?)
      const flags = `${isAdmin ? 'A' : ''}${isBusiness ? 'B' : ''}`;
      userInfo = `${_id || 'no-id'}${flags ? '[' + flags + ']' : ''}`;
    }

    let line = `${timestamp} ${req.method} ${req.originalUrl} ${statusColored} – ${diffMs.toFixed(1)} ms – user:${userInfo}`;

    if (status >= 400) {
      const msg = res.locals.errorMessage || res.statusMessage;
      if (msg) line += ` -> ${msg}`;
    }

    // Log to console with colors
    console.log(line);

    // Log to file only errors (status 400 and above)
    if (status >= 400) {
      const logMessage = `STATUS: ${status} | METHOD: ${req.method} | URL: ${req.originalUrl} | RESPONSE_TIME: ${diffMs.toFixed(1)}ms | USER: ${userInfo}`;
      const msg = res.locals.errorMessage || res.statusMessage;
      if (msg) {
        fileLogger.error(`${logMessage} | MESSAGE: ${msg}`);
      } else {
        fileLogger.error(logMessage);
      }
    }
  });

  next();
}
