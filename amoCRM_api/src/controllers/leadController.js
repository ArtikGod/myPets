const constants = require("../config/constants");

class LeadController {
    constructor(leadService) {
        this.leadService = leadService;
    }

    async getLeadById(req, res, next) {
        try {
            const { id } = req.params;
            const lead = await this.leadService.getLeadById(id);
            res.json(lead);
        } catch (error) {
            next(error);
        }
    }

    async createLead(req, res, next) {
        try {
            const { buildLeadDTO } = require("../dto/leadDto");
            const dto = buildLeadDTO(req.body || {});
            if (!dto.ok) {
                return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
                    error: constants.ERROR_MESSAGES.VALIDATION_FAILED,
                    details: dto.errors,
                });
            }
            const lead = await this.leadService.createLead(dto.value);
            res.status(constants.HTTP_STATUS.CREATED).json({ id: lead.id });
        } catch (error) {
            next(error);
        }
    }

    async updateLead(req, res, next) {
        try {
            const { id } = req.params;
            const { buildLeadDTO } = require("../dto/leadDto");
            const dto = buildLeadDTO(req.body || {});
            if (!dto.ok) {
                return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
                    error: constants.ERROR_MESSAGES.VALIDATION_FAILED,
                    details: dto.errors,
                });
            }
            const lead = await this.leadService.updateLead(id, dto.value);
            res.json(lead);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LeadController;
