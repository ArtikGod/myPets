import express from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes";
import { db } from "./database/connection";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { SUCCESS_MESSAGES } from "./constants/errorMessages";
import { CONFIG } from "./constants/config";

const app = express();
const port = Number(process.env.PORT) || CONFIG.DEFAULT_PORT;

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(require("../swagger.json")));

RegisterRoutes(app);

app.use(errorHandler);

db.raw("SELECT 1")
  .then(() => {
    console.log(SUCCESS_MESSAGES.DATABASE_CONNECTED);
    app.listen(port, () => {
      console.log(SUCCESS_MESSAGES.SERVER_STARTED(port));
      console.log(SUCCESS_MESSAGES.SWAGGER_AVAILABLE(port));
    });
  })
  .catch((err: Error) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  }); 