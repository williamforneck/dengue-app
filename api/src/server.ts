import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify, { FastifyInstance } from "fastify";
import { getMongoClient } from "./configs/db";
import { uploadFile } from "./controllers/FilesController.ts";
import { FocusController } from "./controllers/FocusController";
import { RankController } from "./controllers/RankController";
import { SessionsController } from "./controllers/SessionsController";
import { UserRefreshToken } from "./controllers/UserRefreshToken";
import { UsersController } from "./controllers/UsersController";
import { AuthMiddleware } from "./middlewares/middleware";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const server: FastifyInstance = Fastify();

const privateRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", AuthMiddleware);

  const focusController = new FocusController();
  fastify.post("/focus", focusController.create);
  fastify.get("/focus", focusController.index);
  fastify.get("/focus/:id", focusController.getFocus);
  fastify.delete("/focus/:id", focusController.deleteFocus);
  fastify.put("/focus/:id", focusController.markAsFinished);

  const rankController = new RankController();
  fastify.get("/rank", rankController.index);
  fastify.get("/rank/points", rankController.getPoints);

  const usersController = new UsersController();
  fastify.put("/users", usersController.update);
  fastify.patch("/users", usersController.updateAvatar);

  fastify.post("/upload", uploadFile);
};

const publicRoutes = async (fastify: FastifyInstance) => {
  const sessionsController = new SessionsController();
  fastify.post("/sessions", sessionsController.create);

  const userRefreshToken = new UserRefreshToken();
  fastify.post("/sessions/refresh-token", userRefreshToken.create);

  const usersController = new UsersController();
  fastify.post("/users", usersController.create);
};

async function init() {
  await getMongoClient();
  server.register(cors);
  server.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 20, // For multipart forms, the max file size in bytes
      files: 20, // Max number of file fields
    },
  });
  server.register(privateRoutes);
  server.register(publicRoutes);

  const port = Number(process.env.PORT) || 8080;

  server
    .listen({
      host: "0.0.0.0",
      port,
    })
    .then(() => {
      console.log("server running on " + port);
    });
}

init();
