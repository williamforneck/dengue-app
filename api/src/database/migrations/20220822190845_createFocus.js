exports.up = (knex) =>
  knex.schema.createTable("focus", (table) => {
    table.increments("id");
    table.text("filename").notNullable();
    table.integer("user_id").references("id").inTable("users");
    table.text("descricao");
    table.text("cep");
    table.text("uf");
    table.text("cidade");
    table.text("logradouro");
    table.text("bairro");
    table.text("numero");
    table.text("complemento");
    table.boolean("concluido");
    table.integer("userWhoFinished").references("id").inTable("users");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("focus");
