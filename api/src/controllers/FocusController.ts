import { ObjectId } from "mongodb";
import { getDb } from "../configs/db";
import { DiskStorage } from "../providers/DiskStorage";
import { AppError } from "../utils/AppError";
import { getDateInfo } from "../utils/getDateInfo";

export class FocusController {
  async index(request: any, response: any) {
    const db = await getDb();

    const focus = await db
      .collection("focus")
      .aggregate([
        {
          $project: {
            _id: 1,
            filename: 1,
            concluido: 1,
            coords: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return response.json(focus);
  }

  async deleteFocus(request: any, response: any) {
    const db = await getDb();

    const focus = await db
      .collection("focus")
      .findOne({ _id: new ObjectId(request.params.id as string) });

    if (!focus) {
      throw new AppError("Esse foco não existe");
    }

    if (focus.filename) {
      const diskStorage = new DiskStorage();
      await diskStorage.deleteFile(focus.filename);
    }

    await db
      .collection("focus")
      .deleteOne({ _id: new ObjectId(request.params.id as string) });

    return response.json();
  }

  async getFocus(request: any, response: any) {
    const db = await getDb();

    const focus = await db
      .collection("focus")
      .findOne({ _id: new ObjectId(request.params.id as string) });

    if (!focus) {
      throw new AppError("Erro ao obter o foco");
    }

    const usuario = await db
      .collection("users")
      .findOne({ _id: new ObjectId(focus.user_id as string) });

    if (!usuario) {
      throw new AppError("Erro ao obter o usuário");
    }

    let userWhoFinished;
    if (focus.concluido) {
      userWhoFinished = await db
        .collection("users")
        .findOne({ _id: new ObjectId(focus.userWhoFinished as string) });
    }
    const data = {
      ...focus,
      name: usuario.name,
      user_id: focus.user_id,
      userPhoto: usuario.avatar,
      userWhoFinished: userWhoFinished
        ? {
            name: userWhoFinished?.name,
            userPhoto: userWhoFinished?.avatar,
          }
        : undefined,
    };
    return response.json(data);
  }

  async update(request: any, response: any) {
    const newData = request.body;
    const user_id: string = request.user._id;

    const db = await getDb();

    await db
      .collection("focus")
      .updateOne(
        { filename: request.body.filename },
        { $set: { ...newData, user_id } }
      );

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user_id) }, { $inc: { pontos: 1 } });

    return response.status(201).json();
  }

  async markAsFinished(request: any, response: any) {
    const user_id: string = request.user._id;
    try {
      const db = await getDb();

      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(user_id) }, { $inc: { pontos: 2 } });

      await db.collection("focus").updateOne(
        { _id: new ObjectId(request.params.id as string) },
        {
          $set: {
            concluido: true,
            userWhoFinished: user_id,
            resolutionPhoto: request.body.resolutionPhoto,
            ...getDateInfo(true),
          },
        }
      );

      return response.status(201).json();
    } catch (error) {
      return response.status(400).json({
        status: "error",
        message: "Erro ao marcar como concluído",
      });
    }
  }
}
