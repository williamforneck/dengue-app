import { Router } from "express";
import multer from "multer";

import uploadConfig from "../configs/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

import { ImageUploadController } from "../controllers/ImageUploadController";
import { UsersController } from "../controllers/UsersController";

const usersRoutes = Router();

const usersController = new UsersController();
const imageUploadController = new ImageUploadController();

const upload = multer(uploadConfig.MULTER);

usersRoutes.post("/", usersController.create);
usersRoutes.put("/", ensureAuthenticated, usersController.update);
usersRoutes.patch(
  "/avatar",
  ensureAuthenticated,
  upload.single("avatar"),
  imageUploadController.update
);

export default usersRoutes;
