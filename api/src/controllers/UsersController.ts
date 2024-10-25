import { getDb } from "../configs/db";

import { compare, hash } from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import { AppError } from "../utils/AppError";

export class UsersController {
  async create(
    req: FastifyRequest<{
      Body: { name: string; password: string; email: string };
    }>,
    res: FastifyReply
  ) {
    console.log(req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new AppError("Informe todos os campos (nome, email e senha).");
    }

    const db = await getDb();

    const checkUserExists = await db.collection("users").findOne({ email });

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).send();
  }

  async update(
    req: FastifyRequest<{
      Body: { name: string; password: string; old_password: string };
    }>,
    res: FastifyReply
  ) {
    const { name, password, old_password } = req.body;
    const user_id = req.headers.user as string;
    const db = await getDb();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id as string) });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    user.name = name ?? user.name;

    if (password && !old_password) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha."
      );
    }

    if (!password && old_password) {
      throw new AppError("Informe a nova senha.");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere.");
      }

      user.password = await hash(password, 8);
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user_id as string) }, { $set: user });

    return res.send();
  }

  async updateAvatar(
    req: FastifyRequest<{
      Body: { filename: string };
    }>,
    res: FastifyReply
  ) {
    const { filename } = req.body;
    const user_id = req.headers.user as string;
    const db = await getDb();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id as string) });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (!filename || !user_id) {
      throw new AppError("Erro ao tentar atualizar a foto de perfil");
    }

    user.avatar = filename ?? user.avatar;

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user_id as string) }, { $set: user });

    return res.send();
  }
}
