import chalk from "chalk";
import { connectToDb } from "./DB/dbService.js";
import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(chalk.blueBright(`Listening on: http://localhost:${port}`));
  connectToDb();
});
