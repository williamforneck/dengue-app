import { ObjectId } from "mongodb";
import { getDb } from "../configs/db";
import { DiskStorage } from "../providers/DiskStorage";
import { AppError } from "../utils/AppError";
import { getDateInfo } from "../utils/getDateInfo";

export class ImageUploadController {
  async update(request: any, response: any) {
    const user_id = request.user._id;
    const avatarFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const db = await getDb();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id as string) });

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

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user_id as string) }, { $set: user });

    return response.json(user);
  }

  async create(request: any, response: any) {
    const user_id = request.user._id;
    const avatarFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const db = await getDb();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id as string) });

    if (!user) {
      throw new AppError(
        "Somente usuários autenticados podem mandar uma imagem",
        401
      );
    }

    const filename = await diskStorage.saveFile(avatarFilename);

    await db
      .collection("focus")
      .insertOne({ user_id, filename, ...getDateInfo() });

    return response.json({ filename });
  }
}
