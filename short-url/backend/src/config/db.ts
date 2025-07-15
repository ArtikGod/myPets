import "reflect-metadata";
import { DataSource } from "typeorm";
import { Url } from "../entity/url.entity.js";
import { Analytics } from "../entity/analytics.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "url_shortener",
    synchronize: true,
    logging: false,
    entities: [Url, Analytics],
    migrations: [],
    subscribers: [],
});