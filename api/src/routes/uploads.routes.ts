import { Router } from "express";
import multer from "multer";

import uploadConfig from "../configs/upload";
import { ImageUploadController } from "../controllers/ImageUploadController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const usersRoutes = Router();

const imageUploadController = new ImageUploadController();

const upload = multer(uploadConfig.MULTER);

usersRoutes.post(
  "/",
  ensureAuthenticated,
  upload.single("imagem"),
  imageUploadController.create
);

export default usersRoutes;
