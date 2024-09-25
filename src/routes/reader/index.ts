import { exec } from "child_process";
import express, { Express, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { StorageMiddleware } from "../../middlewares/StorageMiddleware";
import { Route } from "../Route.types";

interface ExtractTextRequest {
  name: string;
}

export class ReaderRoute extends Route {
  constructor(app: Express) {
    super(app);
  }
  public process(): Express {
    this.processOcrUpload();
    this.shareStatic();
    this.getHtml();
    return this.app;
  }

  private processOcrUpload() {
    this.app.post(
      "/extract-text",
      StorageMiddleware.instance.middleware().array("images", 10),
      (req: Request<{}, {}, ExtractTextRequest>, res: Response) => {
        const { name } = req.body;

        if (!name) {
          return res.status(400).send("The “name” parameter is required");
        }

        const imagePath = StorageMiddleware.instance.getImageDirectory(name);

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          return res.status(400).send("The image files have not been uploaded");
        }

        console.log("================== mokuro started ==================");
        exec(
          `mokuro ${imagePath} --force_cpu --disable_confirmation`,
          (error, stdout, stderr) => {
            console.log("stdout", stdout);
            if (error) {
              console.error(`Error: ${error.message}`);
              return res
                .status(500)
                .send("An error occurred while executing the command");
            }

            if (stderr) {
              console.error(`stderr: ${stderr}`);
              return res
                .status(500)
                .send("An error occurred while executing the command");
            }

            const outputFilePath = path.join(imagePath, "output.txt");
            fs.readFile(outputFilePath, "utf8", (err, data) => {
              if (err) {
                console.error(err);
                return res.status(500).send("Error when reading a file");
              }

              res.json({ text: data });
            });
          }
        );
      }
    );
  }

  private shareStatic() {
    this.app.use("/:name", (req: Request, res: Response, next) => {
      const { name } = req.params;
      const uploadPath = StorageMiddleware.instance.getProjectDirectory(name);

      if (fs.existsSync(uploadPath) && fs.lstatSync(uploadPath).isDirectory()) {
        express.static(uploadPath)(req, res, next);
      } else {
        res.status(404).send("Folder was not found");
      }
    });
  }

  private getHtml() {
    this.app.get("/:name/", (req: Request, res: Response) => {
      const { name } = req.params;
      const filePath = StorageMiddleware.instance.getFileFromProject(
        name,
        "images.html"
      );

      res.sendFile(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error when sending a file");
        }
      });
    });
  }
}
