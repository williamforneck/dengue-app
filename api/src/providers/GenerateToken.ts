import { sign } from "jsonwebtoken";
import authConfig from "../configs/auth";

export class GenerateToken {
  async execute(userId: any) {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: String(userId),
      expiresIn,
    });

    return token;
  }
}
