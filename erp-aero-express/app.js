const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const userRoutes = require("./routes/user");

const db = require("./db");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

db.initialize();

app.use(helmet());
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: config.CORS.WHITELIST,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

const fs = require("fs");
if (!fs.existsSync(config.FILES.UPLOAD_DIR)) {
    fs.mkdirSync(config.FILES.UPLOAD_DIR);
}

app.use(authRoutes);
app.use(authRoutes);
app.use(authRoutes);
app.use(fileRoutes);
app.use(userRoutes);
app.use(userRoutes);

app.use(errorHandler);

app.listen(config.SERVER.PORT, () => {
    console.log(`Server running on port ${config.SERVER.PORT}`);
});

app.get("/test", (req, res) => {
    res.json({ message: "Works!" });
});

module.exports = app;
