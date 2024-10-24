import dayjs from "dayjs";
import { v4 } from "uuid";
import { getDb } from "../configs/db";

export class GenerateRefreshToken {
  async execute(user_id: any) {
    const db = await getDb();

    await db.collection("refresh_token").deleteMany({ user_id });

    const expires_in = dayjs().add(15, "m").unix();
    const refresh_token = v4();

    await db.collection("refresh_token").insertOne({
      user_id,
      expires_in,
      refresh_token,
    });

    return refresh_token;
  }
}
