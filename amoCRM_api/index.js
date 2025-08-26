require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const constants = require("./src/config/constants");

const leadRoutes = require("./src/routes/leadRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const linkRoutes = require("./src/routes/linkRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/leads", leadRoutes);
app.use("/contacts", contactRoutes);
app.use("/link", linkRoutes);
app.use("/auth", authRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/ready", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: constants.ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        const amoConfig = require("./src/config/amoConfig");
        console.log(`Auth redirectUri: ${amoConfig.redirectUri}`);
    } catch (_) {}
});
