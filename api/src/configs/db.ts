import { Db, MongoClient } from "mongodb";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const uri = process.env.DB_URI || "";

let cachedClient: MongoClient;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

export async function getMongoClient(): Promise<{
  client: MongoClient;
}> {
  if (cachedClient) {
    return { client: cachedClient };
  }

  const client = await MongoClient.connect(uri);

  cachedClient = client;

  return { client };
}

export async function getDb(): Promise<Db> {
  const { client } = await getMongoClient();

  return client.db("dengue-app");
}
