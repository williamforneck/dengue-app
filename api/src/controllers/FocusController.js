const knex = require("../database");
const dayjs = require("dayjs");

class FocusController {
  async index(request, response) {
    const focus = await knex("focus")
      .select(
        "focus.id",
        "focus.descricao",
        "focus.filename",
        "focus.concluido",
        "users.name",
        "focus.created_at"
      )
      .leftJoin("users", "users.id", "=", "focus.user_id")
      .orderBy("focus.created_at", "desc");

    const days = [];

    for (let f of focus) {
      const day = dayjs(f.created_at).format("DD/MM/YYYY");

      if (!days.includes(day)) {
        days.push(day);
      }
    }

    const focusByDay = days.map((day) => {
      const exercises = focus
        .filter(
          (exercise) => dayjs(exercise.created_at).format("DD/MM/YYYY") === day
        )
        .map((exercise) => {
          return {
            ...exercise,
            hour: dayjs(exercise.created_at).format("HH:mm"),
          };
        });

      return { title: day, data: exercises };
    });

    return response.json(focusByDay);
  }

  async getFocus(request, response) {
    const focus = await knex("focus").where({ id: request.params.id }).first();
    const usuario = await knex("users").where({ id: focus.user_id }).first();
    let userWhoFinished;
    if (focus.concluido) {
      userWhoFinished = await knex("users")
        .where({ id: focus.userWhoFinished })
        .first();
    }
    const data = {
      ...focus,
      name: usuario.name,
      userPhoto: usuario.avatar,
      userLocal: usuario.cidade + " - " + usuario.uf,
      userWhoFinished: userWhoFinished
        ? {
            name: userWhoFinished?.name,
            userPhoto: userWhoFinished?.avatar,
            userLocal: userWhoFinished?.cidade + " - " + userWhoFinished?.uf,
          }
        : undefined,
    };
    return response.json(data);
  }

  async update(request, response) {
    const newData = request.body;
    const user_id = request.user.id;

    await knex("focus")
      .where({ filename: request.body.filename })
      .update({ ...newData, user_id });

    await knex("users").where({ id: user_id }).increment("pontos", 1);

    return response.status(201).json();
  }

  async markAsFinished(request, response) {
    const user_id = request.user.id;
    try {
      await knex("users").where({ id: user_id }).increment("pontos", 2);

      await knex("focus")
        .where({ id: request.params.id })
        .update({ concluido: true, userWhoFinished: user_id });

      return response.status(201).json();
    } catch (error) {
      return response.status(400).json({
        status: "error",
        message: "Erro ao marcar como concluído",
      });
    }
  }
}

module.exports = FocusController;
