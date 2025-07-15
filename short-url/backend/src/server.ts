import "reflect-metadata";
import { AppDataSource } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error: unknown) => console.log("Database connection error:", error));