const express = require("express");
const router = express.Router();

const amoConfig = require("../config/amoConfig");
const AmoApi = require("../utils/amoApi");
const LeadService = require("../services/leadService");
const ContactService = require("../services/contactService");
const LinkService = require("../services/linkService");
const LinkController = require("../controllers/linkController");

const amoApi = new AmoApi(amoConfig);
const leadService = new LeadService(amoApi);
const contactService = new ContactService(amoApi);
const linkService = new LinkService(amoApi, leadService, contactService);
const linkController = new LinkController(linkService);

router.post("/", (req, res, next) =>
    linkController.linkLeadWithContact(req, res, next)
);
router.post("/unlink", (req, res, next) =>
    linkController.unlinkLeadFromContact(req, res, next)
);

module.exports = router;
