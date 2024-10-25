import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import { getDb } from "../configs/db";

export class RankController {
  async index(req: FastifyRequest, res: FastifyReply) {
    const db = await getDb();
    const rank = await db
      .collection("users")
      .find({ pontos: { $gt: 0 } })
      .project({
        id: 1,
        pontos: 1,
        name: 1,
        avatar: 1,
        cidade: 1,
        uf: 1,
      })
      .sort({ pontos: -1 })
      .toArray();

    return res.send(rank);
  }

  async getPoints(req: FastifyRequest, res: FastifyReply) {
    const user_id: string = req.headers.user as string;

    const db = await getDb();

    const rank = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id) });

    return res.send({ pontos: rank?.pontos });
  }
}
