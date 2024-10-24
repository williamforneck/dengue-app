import { getDb } from "../configs/db";

import { compare, hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import { AppError } from "../utils/AppError";

export class UsersController {
  async create(request: any, response: any) {
    const { name, email, password } = request.body;
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

    return response.status(201).json();
  }

  async update(request: any, response: any) {
    const { name, password, old_password } = request.body;
    const user_id = request.user._id;
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

    return response.json();
  }
}
