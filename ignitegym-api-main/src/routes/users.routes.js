const { Router } = require("express");
const multer = require("multer");

const uploadConfig = require("../configs/upload");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const UsersController = require("../controllers/UsersController");
const ImageUploadController = require("../controllers/ImageUploadController");

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

module.exports = usersRoutes;
