import { ObjectId } from "mongodb";
import { getDb } from "../configs/db";

export class RankController {
  async index(request: any, response: any) {
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

    return response.json(rank);
  }

  async getPoints(request: any, response: any) {
    const user_id: string = request.user._id;

    const db = await getDb();

    const rank = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id) });

    return response.json({ pontos: rank?.pontos });
  }
}
