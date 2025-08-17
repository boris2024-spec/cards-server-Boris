import 'dotenv/config';
import chalk from "chalk";
import { connectToDb } from "./DB/dbService.js";
import app from "./app.js";

const port = process.env.PORT || 3000;

(async () => {
  try {
    await connectToDb();
    app.listen(port, () => {
      console.log(chalk.blueBright(`Listening on: http://localhost:${port}`));
    });
  } catch (err) {
    console.error(chalk.red('DB connection failed:'), err);
    process.exit(1);
  }
})();


