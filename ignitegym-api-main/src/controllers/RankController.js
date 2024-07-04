const knex = require("../database");

class RankController {
  async index(request, response) {
    const rank = await knex("users")
      .select(
        "users.id",
        "users.pontos",
        "users.name",
        "users.avatar",
        "users.cidade",
        "users.uf"
      )
      .where("pontos", ">", 0)
      .orderBy("pontos", "desc");

    return response.json(rank);
  }

  async getPoints(request, response) {
    const user_id = request.user.id;

    const rank = await knex("users")
      .select("users.pontos")
      .where({ id: user_id })
      .first();

    return response.json(rank);
  }
}

module.exports = RankController;
