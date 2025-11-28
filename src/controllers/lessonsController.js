const lessonsService = require("../services/lessonsService");

const getLessons = async (req, res, next) => {
    try {
        const result = await lessonsService.getLessons(req.query);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getLessons,
};
