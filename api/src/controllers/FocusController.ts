import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import { getDb } from "../configs/db";
import { AppError } from "../utils/AppError";
import { getDateInfo } from "../utils/getDateInfo";

export class FocusController {
  async index(req: FastifyRequest, res: FastifyReply) {
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

    return res.send(focus);
  }

  async deleteFocus(
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) {
    const db = await getDb();

    const focus = await db
      .collection("focus")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!focus) {
      throw new AppError("Esse foco não existe");
    }

    if (focus.filename) {
      //todo delete
      // await deleteFile(req.body = {});
    }

    await db
      .collection("focus")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    return res.send();
  }

  async getFocus(
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply
  ) {
    const db = await getDb();

    const focus = await db
      .collection("focus")
      .findOne({ _id: new ObjectId(req.params.id) });

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
    return res.send(data);
  }

  async create(
    req: FastifyRequest<{
      Body: {
        filename: string;
        coords: { latitude: number; longitude: number };
        descricao: string;
      };
    }>,
    res: FastifyReply
  ) {
    const user_id = req.headers.user as string;

    const db = await getDb();

    await db
      .collection("focus")
      .insertOne({ ...req.body, user_id, ...getDateInfo() });

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user_id) }, { $inc: { pontos: 1 } });

    return res.status(201).send();
  }

  async markAsFinished(
    req: FastifyRequest<{
      Params: { id: string };
      Body: { resolutionPhoto: string };
    }>,
    res: FastifyReply
  ) {
    const user_id = req.headers.user as string;
    try {
      const db = await getDb();

      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(user_id) }, { $inc: { pontos: 2 } });

      await db.collection("focus").updateOne(
        { _id: new ObjectId(req.params.id as string) },
        {
          $set: {
            concluido: true,
            userWhoFinished: user_id,
            resolutionPhoto: req.body.resolutionPhoto,
            ...getDateInfo(true),
          },
        }
      );

      return res.status(201).send();
    } catch (error) {
      return res.status(400).send({
        status: "error",
        message: "Erro ao marcar como concluído",
      });
    }
  }
}
