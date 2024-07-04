exports.up = (knex) =>
  knex.schema.createTable("users", (table) => {
    table.increments("id");
    table.text("name").notNullable();
    table.text("email").notNullable();
    table.text("password").notNullable();
    table.text("cep").notNullable();
    table.text("uf").notNullable();
    table.text("cidade").notNullable();
    table.text("logradouro").notNullable();
    table.text("bairro").notNullable();
    table.text("numero").notNullable();
    table.text("complemento");
    table.text("avatar");
    table.integer("pontos").default(0);
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("users");
