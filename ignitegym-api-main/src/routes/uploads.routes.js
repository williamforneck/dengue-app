const { Router } = require("express");
const multer = require("multer");

const uploadConfig = require("../configs/upload");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const ImageUploadController = require("../controllers/ImageUploadController");

const usersRoutes = Router();

const imageUploadController = new ImageUploadController();

const upload = multer(uploadConfig.MULTER);

usersRoutes.post(
  "/",
  ensureAuthenticated,
  upload.single("imagem"),
  imageUploadController.create
);

module.exports = usersRoutes;
