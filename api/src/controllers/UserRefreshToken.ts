import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { getDb } from "../configs/db";
import { GenerateRefreshToken } from "../providers/GenerateRefreshToken";
import { GenerateToken } from "../providers/GenerateToken";
import { AppError } from "../utils/AppError";

export class UserRefreshToken {
  async create(
    req: FastifyRequest<{ Body: { refresh_token: string } }>,
    res: FastifyReply
  ) {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError("Informe o token de autenticação.", 401);
    }

    const db = await getDb();

    const refreshToken = await db
      .collection("refresh_token")
      .findOne({ refresh_token });

    if (!refreshToken) {
      throw new AppError(
        "Refresh token não encontrado para este usuário.",
        401
      );
    }

    const generateTokenProvider = new GenerateToken();
    const token = await generateTokenProvider.execute(refreshToken.user_id);

    const refreshTokenExpired = dayjs().isAfter(
      dayjs.unix(refreshToken.expires_in)
    );

    if (refreshTokenExpired) {
      await db
        .collection("refresh_token")
        .deleteMany({ user_id: refreshToken.user_id });

      const generateRefreshToken = new GenerateRefreshToken();
      const newRefreshToken = await generateRefreshToken.execute(
        refreshToken.user_id
      );

      return res.send({ token, refresh_token: newRefreshToken });
    }

    return res.send({ token, refresh_token });
  }
}
