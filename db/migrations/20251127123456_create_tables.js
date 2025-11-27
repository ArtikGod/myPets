exports.up = function (knex) {
    return knex.schema
        .createTable("lessons", (table) => {
            table.increments("id");
            table.date("date").notNullable();
            table.string("title", 100);
            table.integer("status").defaultTo(0);
        })
        .createTable("teachers", (table) => {
            table.increments("id");
            table.string("name", 10);
        })
        .createTable("students", (table) => {
            table.increments("id");
            table.string("name", 10);
        })
        .createTable("lesson_teachers", (table) => {
            table.integer("lesson_id").references("id").inTable("lessons");
            table.integer("teacher_id").references("id").inTable("teachers");
            table.primary(["lesson_id", "teacher_id"]);
        })
        .createTable("lesson_students", (table) => {
            table.integer("lesson_id").references("id").inTable("lessons");
            table.integer("student_id").references("id").inTable("students");
            table.boolean("visit").defaultTo(false);
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("lesson_students")
        .dropTableIfExists("lesson_teachers")
        .dropTableIfExists("students")
        .dropTableIfExists("teachers")
        .dropTableIfExists("lessons");
};
