// export default function logger(req, res, next) {
//   const now = new Date();
//   console.log(`${now} - ${req.method} - ${req.path}`);
//   next();
// }

import chalk from "chalk";

// Custom logger middleware matching required format:
// [YYYY/MM/DD HH:MM:SS] METHOD URL STATUS – RESPONSE_TIME ms
// STATUS >= 400 -> bright red, else cyan (or greenish)

const pad = (n) => String(n).padStart(2, "0");

export default function logger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const diffMs = Number(end - start) / 1_000_000; // convert ns to ms
    const now = new Date();
    const timestamp = `[${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}]`;
    const base = `${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} – ${diffMs.toFixed(1)} ms`;
    const colored = res.statusCode >= 400
      ? chalk.redBright(`[ERROR] ${base}`)
      : chalk.bgGreen.black(`[OK] ${base}`);
    console.log(colored);
  });
  next();
}
