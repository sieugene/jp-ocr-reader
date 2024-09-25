import { configDotenv } from "dotenv";
import type { Express } from "express";
import express from "express";
import { Route } from "./routes/Route.types";

configDotenv();

export class App {
  public PORT = process.env.PORT;
  public app = express();
  constructor(private readonly routes: (new (app: Express) => Route)[]) {}
  public boostrap() {
    this.routes.map((Route) => {
      const instance = new Route(this.app);
      console.log("======= anon {{ }} route started =======");
      instance.process();
    });
    this.app.listen(this.PORT, () => {
      console.log(
        `[server]: Server is running at http://localhost:${this.PORT}`
      );
    });
  }
}
