const knex = require("../database");
const DiskStorage = require("../providers/DiskStorage");
const AppError = require("../utils/AppError");

class ImageUploadController {
  async update(request, response) {
    const user_id = request.user.id;
    const avatarFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const user = await knex("users").where({ id: user_id }).first();

    if (!user) {
      throw new AppError(
        "Somente usuários autenticados podem mudar o avatar",
        401
      );
    }

    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar);
    }

    const filename = await diskStorage.saveFile(avatarFilename);
    user.avatar = filename;

    await knex("users").where({ id: user_id }).update(user);

    return response.json(user);
  }

  async create(request, response) {
    const user_id = request.user.id;
    const avatarFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const user = await knex("users").where({ id: user_id }).first();

    if (!user) {
      throw new AppError(
        "Somente usuários autenticados podem mandar uma imagem",
        401
      );
    }

    const filename = await diskStorage.saveFile(avatarFilename);

    await knex("focus").insert({ user_id, filename });

    return response.json({ filename });
  }
}

module.exports = ImageUploadController;
