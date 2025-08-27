const LinkService = require("../../src/services/linkService");

describe("LinkService", () => {
    let linkService;
    let mockAmoApi;
    let mockLeadService;
    let mockContactService;

    beforeEach(() => {
        mockAmoApi = {
            linkLeadWithContact: jest.fn(),
            unlinkLeadFromContact: jest.fn(),
        };

        mockLeadService = {
            getLeadById: jest.fn(),
        };

        mockContactService = {
            getContactById: jest.fn(),
        };

        linkService = new LinkService(
            mockAmoApi,
            mockLeadService,
            mockContactService
        );
    });

    describe("constructor", () => {
        it("should initialize with dependencies", () => {
            expect(linkService.amoApi).toBe(mockAmoApi);
            expect(linkService.leadService).toBe(mockLeadService);
            expect(linkService.contactService).toBe(mockContactService);
        });
    });

    describe("linkLeadWithContact", () => {
        it("should link lead with contact successfully", async () => {
            const leadId = 123;
            const contactId = 456;

            const mockLead = { id: 123, name: "Test Lead" };
            const mockContact = { id: 456, name: "Test Contact" };
            const mockLinkResponse = { success: true };

            mockLeadService.getLeadById.mockResolvedValue(mockLead);
            mockContactService.getContactById.mockResolvedValue(mockContact);
            mockAmoApi.linkLeadWithContact.mockResolvedValue(mockLinkResponse);

            const result = await linkService.linkLeadWithContact(
                leadId,
                contactId
            );

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).toHaveBeenCalledWith(
                contactId
            );
            expect(mockAmoApi.linkLeadWithContact).toHaveBeenCalledWith(
                leadId,
                contactId
            );
            expect(result).toEqual(mockLinkResponse);
        });

        it("should throw error when lead not found", async () => {
            const leadId = 999;
            const contactId = 456;

            mockLeadService.getLeadById.mockRejectedValue(
                new Error("Lead not found")
            );

            await expect(
                linkService.linkLeadWithContact(leadId, contactId)
            ).rejects.toThrow("Lead not found");

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).not.toHaveBeenCalled();
            expect(mockAmoApi.linkLeadWithContact).not.toHaveBeenCalled();
        });

        it("should throw error when contact not found", async () => {
            const leadId = 123;
            const contactId = 999;

            const mockLead = { id: 123, name: "Test Lead" };

            mockLeadService.getLeadById.mockResolvedValue(mockLead);
            mockContactService.getContactById.mockRejectedValue(
                new Error("Contact not found")
            );

            await expect(
                linkService.linkLeadWithContact(leadId, contactId)
            ).rejects.toThrow("Contact not found");

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).toHaveBeenCalledWith(
                contactId
            );
            expect(mockAmoApi.linkLeadWithContact).not.toHaveBeenCalled();
        });

        it("should throw error when linking fails", async () => {
            const leadId = 123;
            const contactId = 456;

            const mockLead = { id: 123, name: "Test Lead" };
            const mockContact = { id: 456, name: "Test Contact" };

            mockLeadService.getLeadById.mockResolvedValue(mockLead);
            mockContactService.getContactById.mockResolvedValue(mockContact);
            mockAmoApi.linkLeadWithContact.mockRejectedValue(
                new Error("Linking failed")
            );

            await expect(
                linkService.linkLeadWithContact(leadId, contactId)
            ).rejects.toThrow("Linking failed");

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).toHaveBeenCalledWith(
                contactId
            );
            expect(mockAmoApi.linkLeadWithContact).toHaveBeenCalledWith(
                leadId,
                contactId
            );
        });
    });

    describe("unlinkLeadFromContact", () => {
        it("should unlink lead from contact successfully", async () => {
            const leadId = 123;
            const contactId = 456;

            const mockLead = { id: 123, name: "Test Lead" };
            const mockContact = { id: 456, name: "Test Contact" };
            const mockUnlinkResponse = { success: true };

            mockLeadService.getLeadById.mockResolvedValue(mockLead);
            mockContactService.getContactById.mockResolvedValue(mockContact);
            mockAmoApi.unlinkLeadFromContact.mockResolvedValue(
                mockUnlinkResponse
            );

            const result = await linkService.unlinkLeadFromContact(
                leadId,
                contactId
            );

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).toHaveBeenCalledWith(
                contactId
            );
            expect(mockAmoApi.unlinkLeadFromContact).toHaveBeenCalledWith(
                leadId,
                contactId
            );
            expect(result).toEqual(mockUnlinkResponse);
        });

        it("should throw error when lead not found during unlink", async () => {
            const leadId = 999;
            const contactId = 456;

            mockLeadService.getLeadById.mockRejectedValue(
                new Error("Lead not found")
            );

            await expect(
                linkService.unlinkLeadFromContact(leadId, contactId)
            ).rejects.toThrow("Lead not found");

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).not.toHaveBeenCalled();
            expect(mockAmoApi.unlinkLeadFromContact).not.toHaveBeenCalled();
        });

        it("should throw error when contact not found during unlink", async () => {
            const leadId = 123;
            const contactId = 999;

            const mockLead = { id: 123, name: "Test Lead" };

            mockLeadService.getLeadById.mockResolvedValue(mockLead);
            mockContactService.getContactById.mockRejectedValue(
                new Error("Contact not found")
            );

            await expect(
                linkService.unlinkLeadFromContact(leadId, contactId)
            ).rejects.toThrow("Contact not found");

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).toHaveBeenCalledWith(
                contactId
            );
            expect(mockAmoApi.unlinkLeadFromContact).not.toHaveBeenCalled();
        });

        it("should throw error when unlinking fails", async () => {
            const leadId = 123;
            const contactId = 456;

            const mockLead = { id: 123, name: "Test Lead" };
            const mockContact = { id: 456, name: "Test Contact" };

            mockLeadService.getLeadById.mockResolvedValue(mockLead);
            mockContactService.getContactById.mockResolvedValue(mockContact);
            mockAmoApi.unlinkLeadFromContact.mockRejectedValue(
                new Error("Unlinking failed")
            );

            await expect(
                linkService.unlinkLeadFromContact(leadId, contactId)
            ).rejects.toThrow("Unlinking failed");

            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(leadId);
            expect(mockContactService.getContactById).toHaveBeenCalledWith(
                contactId
            );
            expect(mockAmoApi.unlinkLeadFromContact).toHaveBeenCalledWith(
                leadId,
                contactId
            );
        });
    });
});
