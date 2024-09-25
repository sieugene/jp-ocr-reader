import type { Express } from "express";

export abstract class Route {
  constructor(protected readonly app: Express) {}
  public abstract process(): Express;
}
