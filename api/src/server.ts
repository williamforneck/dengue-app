import { getMongoClient } from "./configs/db";

require("express-async-errors");

import path from "path";

import cors from "cors";
import express from "express";
import uploadConfig from "./configs/upload";
import routes from "./routes";
import { AppError } from "./utils/AppError";

const app = express();

app.use("/avatar", express.static(uploadConfig.UPLOADS_FOLDER));

const demoExercisePath = path.resolve(__dirname, "..", "exercises", "gif");
app.use("/exercise/demo", express.static(demoExercisePath));

const thumbExercisesPath = path.resolve(__dirname, "..", "exercises", "thumb");
app.use("/exercise/thumb", express.static(thumbExercisesPath));

app.use(express.json());
app.use(cors());

app.use(routes);

app.use((err: any, request: any, response: any, next: any) => {
  if (err instanceof AppError) {
    console.log(err);
    return response.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error(err);

  return response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, async () => {
  await getMongoClient();
  console.log(`Server is running on Port ${PORT}`);
});
