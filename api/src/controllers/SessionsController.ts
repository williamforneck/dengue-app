import { compare } from "bcryptjs";
import { getDb } from "../configs/db";
import { GenerateRefreshToken } from "../providers/GenerateRefreshToken";
import { GenerateToken } from "../providers/GenerateToken";
import { AppError } from "../utils/AppError";

export class SessionsController {
  async create(request: any, response: any) {
    const { email, password } = request.body;

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

    response.status(201).json({ user, token, refresh_token });
  }
}
