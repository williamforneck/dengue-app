import { verify } from "jsonwebtoken";
import authConfig from "../configs/auth";
import { AppError } from "../utils/AppError";

export async function ensureAuthenticated(
  request: any,
  response: any,
  next: any
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token não informado", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, authConfig.jwt.secret);

    request.user = {
      _id: user_id,
    };

    return next();
  } catch {
    throw new AppError("token.invalid", 401);
  }
}
