const express = require("express");
const router = express.Router();

const amoConfig = require("../config/amoConfig");
const AmoApi = require("../utils/amoApi");
const LeadService = require("../services/leadService");
const LeadController = require("../controllers/leadController");

const amoApi = new AmoApi(amoConfig);
const leadService = new LeadService(amoApi);
const leadController = new LeadController(leadService);

router.get("/:id", (req, res, next) =>
    leadController.getLeadById(req, res, next)
);
router.post("/", (req, res, next) => leadController.createLead(req, res, next));
router.put("/:id", (req, res, next) =>
    leadController.updateLead(req, res, next)
);

module.exports = router;
