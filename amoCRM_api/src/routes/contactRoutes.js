const express = require("express");
const router = express.Router();

const amoConfig = require("../config/amoConfig");
const AmoApi = require("../utils/amoApi");
const ContactService = require("../services/contactService");
const ContactController = require("../controllers/contactController");

const amoApi = new AmoApi(amoConfig);
const contactService = new ContactService(amoApi);
const contactController = new ContactController(contactService);

router.get("/:id", (req, res, next) =>
    contactController.getContactById(req, res, next)
);
router.post("/", (req, res, next) =>
    contactController.createContact(req, res, next)
);
router.put("/:id", (req, res, next) =>
    contactController.updateContact(req, res, next)
);

module.exports = router;
