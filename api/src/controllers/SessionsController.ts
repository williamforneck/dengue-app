import { compare } from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { getDb } from "../configs/db";
import { GenerateRefreshToken } from "../providers/GenerateRefreshToken";
import { GenerateToken } from "../providers/GenerateToken";
import { AppError } from "../utils/AppError";

export class SessionsController {
  async create(
    req: FastifyRequest<{ Body: { email: string; password: string } }>,
    res: FastifyReply
  ) {
    const { email, password } = req.body;

    const db = await getDb();

    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("E-mail e/ou senha incorreta.", 404);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorreta.", 404);
    }

    const generateTokenProvider = new GenerateToken();
    const token = await generateTokenProvider.execute(user._id);

    const generateRefreshToken = new GenerateRefreshToken();
    const refresh_token = await generateRefreshToken.execute(user._id);

    delete user.password;

    res.status(201).send({ user, token, refresh_token });
  }
}
