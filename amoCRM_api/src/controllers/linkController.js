const constants = require("../config/constants");

class LinkController {
    constructor(linkService) {
        this.linkService = linkService;
    }

    async linkLeadWithContact(req, res, next) {
        try {
            const { buildLinkDTO } = require("../dto/linkDto");
            const dto = buildLinkDTO(req.body || {});
            if (!dto.ok) {
                return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
                    error: constants.ERROR_MESSAGES.VALIDATION_FAILED,
                    details: dto.errors,
                });
            }
            const { lead_id, contact_id } = dto.value;
            await this.linkService.linkLeadWithContact(lead_id, contact_id);
            res.status(constants.HTTP_STATUS.CREATED).json({
                [constants.USER_MESSAGES.LINKED_SUCCESS]: { lead_id, contact_id },
            });
        } catch (error) {
            next(error);
        }
    }

    async unlinkLeadFromContact(req, res, next) {
        try {
            const { buildLinkDTO } = require("../dto/linkDto");
            const dto = buildLinkDTO(req.body || {});
            if (!dto.ok) {
                return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
                    error: constants.ERROR_MESSAGES.VALIDATION_FAILED,
                    details: dto.errors,
                });
            }
            const { lead_id, contact_id } = dto.value;
            await this.linkService.unlinkLeadFromContact(lead_id, contact_id);
            res.status(constants.HTTP_STATUS.OK).json({
                [constants.USER_MESSAGES.UNLINKED_SUCCESS]: { lead_id, contact_id },
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LinkController;
