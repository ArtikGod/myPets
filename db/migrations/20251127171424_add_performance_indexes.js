exports.up = async function (knex) {
    await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS idx_lessons_date_id
        ON lessons(date ASC, id ASC)
    `);

    await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS idx_lessons_status_date_id
        ON lessons(status, date ASC, id ASC)
    `);

    await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS idx_lesson_students_lesson_id
        ON lesson_students(lesson_id)
    `);

    await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS idx_lesson_teachers_lesson_id
        ON lesson_teachers(lesson_id)
    `);
};

exports.down = async function (knex) {
    await knex.schema.raw(`DROP INDEX IF EXISTS idx_lessons_date_id`);
    await knex.schema.raw(`DROP INDEX IF EXISTS idx_lessons_status_date_id`);
    await knex.schema.raw(`DROP INDEX IF EXISTS idx_lesson_students_lesson_id`);
    await knex.schema.raw(`DROP INDEX IF EXISTS idx_lesson_teachers_lesson_id`);
};
