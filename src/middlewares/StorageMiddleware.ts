import * as fs from "fs";
import multer from "multer";
import * as path from "path";

export class StorageMiddleware {
  static #instance: StorageMiddleware;
  private multerMiddleware: multer.Multer;

  private constructor() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const { name } = req.body;
        const dir = this.getImageDirectory(name);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });
    this.multerMiddleware = multer({ storage: storage });
  }

  public static get instance(): StorageMiddleware {
    if (!StorageMiddleware.#instance) {
      StorageMiddleware.#instance = new StorageMiddleware();
    }

    return StorageMiddleware.#instance;
  }

  public getProjectDirectory(projectName: string) {
    return path.join(__dirname, "..", "uploads", projectName);
  }
  public getFileFromProject(projectName: string, fileName: string) {
    return path.join(__dirname, "..", "uploads", projectName, fileName);
  }
  public getImageDirectory(projectName: string) {
    return path.join(__dirname, "..", "uploads", projectName, "images");
  }

  public middleware() {
    return this.multerMiddleware;
  }
}
