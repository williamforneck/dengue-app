import { FastifyReply, FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";
import authConfig from "../configs/auth";
import { AppError } from "../utils/AppError";
export const AuthMiddleware = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token não informado", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, authConfig.jwt.secret);

    req.headers.user = user_id?.toString();
  } catch {
    throw new AppError("token.invalid", 401);
  }
};
