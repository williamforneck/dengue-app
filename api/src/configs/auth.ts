export default {
  jwt: {
    secret: process.env.SECRET ?? "",
    expiresIn: "7d",
  },
};
