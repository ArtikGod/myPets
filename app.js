const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const config = require("./config");
const { SUCCESS_MESSAGES, SERVER } = require("./shared/constants");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const userRoutes = require("./routes/user");

const db = require("./db");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

db.initialize();

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: true,
        methods: SERVER.CORS_METHODS,
        allowedHeaders: SERVER.CORS_HEADERS,
        credentials: true,
    })
);

if (!fs.existsSync(config.FILES.UPLOAD_DIR)) {
    fs.mkdirSync(config.FILES.UPLOAD_DIR);
}

app.use(authRoutes);
app.use("/file", fileRoutes);
app.use(userRoutes);

app.get("/test", (req, res) => {
    res.json({ message: SUCCESS_MESSAGES.TEST_MESSAGE });
});

app.use(errorHandler);

app.listen(config.SERVER.PORT, () => {
    console.log(
        SUCCESS_MESSAGES.SERVER_RUNNING.replace("{port}", config.SERVER.PORT)
    );
});

module.exports = app;
