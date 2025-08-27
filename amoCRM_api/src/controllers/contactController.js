const constants = require("../config/constants");

class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
    }

    async getContactById(req, res, next) {
        try {
            const { id } = req.params;
            const contact = await this.contactService.getContactById(id);
            res.json(contact);
        } catch (error) {
            next(error);
        }
    }

    async createContact(req, res, next) {
        try {
            const { buildContactDTO } = require("../dto/contactDto");
            const dto = buildContactDTO(req.body || {});
            if (!dto.ok) {
                return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
                    error: constants.ERROR_MESSAGES.VALIDATION_FAILED,
                    details: dto.errors,
                });
            }
            const contact = await this.contactService.createContact(dto.value);
            res.status(constants.HTTP_STATUS.CREATED).json({ id: contact.id });
        } catch (error) {
            next(error);
        }
    }

    async updateContact(req, res, next) {
        try {
            const { id } = req.params;
            const { buildContactDTO } = require("../dto/contactDto");
            const dto = buildContactDTO(req.body || {});
            if (!dto.ok) {
                return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
                    error: constants.ERROR_MESSAGES.VALIDATION_FAILED,
                    details: dto.errors,
                });
            }
            const contact = await this.contactService.updateContact(
                id,
                dto.value
            );
            res.json(contact);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ContactController;
