import {
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import * as crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";

const region = process.env.AWS_S3_REGION ?? "";
const awsBucketName = process.env.AWS_BUCKET_NAME ?? "";
const awsUrl = process.env.AWS_URL ?? "";

async function uploadFileToS3(file: Buffer, fileName: string) {
  const fileBuffer = file;

  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
    },
  });

  let params = {
    Bucket: awsBucketName,
    Key: `${fileName}`,
    Body: fileBuffer,
  };

  const command = new PutObjectCommand(params);
  try {
    await s3Client.send(command);
  } catch (error) {
    throw error;
  }
}

export async function uploadFile(req: FastifyRequest, res: FastifyReply) {
  try {
    const user = req.headers.user;

    if (!user) {
      return res.status(404).send({ message: "Erro ao validar token" });
    }

    const file = await req.file();

    if (!file) {
      return res.status(404).send({ message: "Erro ao obter arquivo" });
    }

    const buffer = await file.toBuffer();

    const fileName =
      crypto.randomUUID() + file.filename.toLowerCase().split(" ").join("");

    await uploadFileToS3(buffer, fileName);

    const filename = awsUrl + fileName;

    return res.send({ filename });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Erro ao fazer upload" });
  }
}

export async function deleteFile(
  req: FastifyRequest<{ Body: { files: string[] } }>,
  res: FastifyReply
) {
  const keys = req.body.files.map((file) =>
    file.replace("https://catalogo-develop.s3.sa-east-1.amazonaws.com/", "")
  );
  try {
    const user = req.headers.user;

    if (!user) {
      return res.status(404).send({ message: "Erro ao validar token" });
    }

    await deleteFiles(keys);

    return res.status(204).send();
  } catch (error) {
    res.status(400).send({ message: "Erro ao deletar arquivo" });
  }
}

export const deleteFiles = async (keys: string[]) => {
  try {
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
      },
    });

    const params: DeleteObjectsCommandInput = {
      Bucket: awsBucketName,
      Delete: {
        Objects: keys.map((k) => ({ Key: k })),
      },
    };

    const command = new DeleteObjectsCommand(params);
    const { Deleted } = await s3Client.send(command);
    console.log(Deleted);
  } catch (error) {}
};
