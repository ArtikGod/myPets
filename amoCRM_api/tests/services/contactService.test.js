const ContactService = require("../../src/services/contactService");
const ContactModel = require("../../src/models/contactModel");
const constants = require("../../src/config/constants");

// Mock ContactModel
jest.mock("../../src/models/contactModel");

describe("ContactService", () => {
    let contactService;
    let mockAmoApi;
    let mockContactModel;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAmoApi = {
            createContact: jest.fn(),
            getContactById: jest.fn(),
            updateContact: jest.fn(),
        };

        mockContactModel = {
            toJSON: jest.fn(),
        };

        ContactModel.mockImplementation(() => mockContactModel);
        // Use real ContactModel for static method
        const RealContactModel = jest.requireActual(
            "../../src/models/contactModel"
        );
        ContactModel.fromApiResponse = RealContactModel.fromApiResponse;

        contactService = new ContactService(mockAmoApi);
    });

    describe("constructor", () => {
        it("should initialize with amoApi", () => {
            expect(contactService.amoApi).toBe(mockAmoApi);
        });
    });

    describe("createContact", () => {
        it("should create contact successfully", async () => {
            const contactData = { name: "John Doe" };
            const mockResponse = {
                [constants.API_RESPONSE_KEYS.EMBEDDED]: {
                    [constants.API_RESPONSE_KEYS.CONTACTS]: [
                        { id: 123, name: "John Doe" },
                    ],
                },
            };

            mockContactModel.toJSON.mockReturnValue(contactData);
            mockAmoApi.createContact.mockResolvedValue(mockResponse);

            const result = await contactService.createContact(contactData);

            expect(ContactModel).toHaveBeenCalledWith(contactData);
            expect(mockContactModel.toJSON).toHaveBeenCalled();
            expect(mockAmoApi.createContact).toHaveBeenCalledWith(contactData);
            expect(result).toBeTruthy();
        });

        it("should handle creation errors", async () => {
            const contactData = { name: "John Doe" };
            const mockError = new Error("API Error");

            mockContactModel.toJSON.mockReturnValue(contactData);
            mockAmoApi.createContact.mockRejectedValue(mockError);

            await expect(
                contactService.createContact(contactData)
            ).rejects.toEqual(mockError);
        });

        it("should throw error when response is invalid", async () => {
            const contactData = { name: "John Doe" };
            const mockResponse = { invalid: "response" };

            mockContactModel.toJSON.mockReturnValue(contactData);
            mockAmoApi.createContact.mockResolvedValue(mockResponse);

            await expect(
                contactService.createContact(contactData)
            ).rejects.toThrow(constants.ERROR_MESSAGES.FAILED_CREATE_CONTACT);
        });
    });

    describe("getContactById", () => {
        it("should get contact by ID", async () => {
            const contactId = 123;
            const mockResponse = { id: 123, name: "John Doe" };

            mockAmoApi.getContactById.mockResolvedValue(mockResponse);

            const result = await contactService.getContactById(contactId);

            expect(mockAmoApi.getContactById).toHaveBeenCalledWith(contactId);
            expect(result).toBeTruthy();
        });

        it("should handle get errors", async () => {
            const contactId = 123;
            const mockError = new Error("Not found");

            mockAmoApi.getContactById.mockRejectedValue(mockError);

            await expect(
                contactService.getContactById(contactId)
            ).rejects.toEqual(mockError);
        });
    });

    describe("updateContact", () => {
        it("should update contact successfully", async () => {
            const contactId = 123;
            const updateData = { name: "Jane Doe" };
            const mockResponse = {
                [constants.API_RESPONSE_KEYS.EMBEDDED]: {
                    [constants.API_RESPONSE_KEYS.CONTACTS]: [
                        { id: 123, name: "Jane Doe" },
                    ],
                },
            };

            mockContactModel.toJSON.mockReturnValue(updateData);
            mockAmoApi.updateContact.mockResolvedValue(mockResponse);

            const result = await contactService.updateContact(
                contactId,
                updateData
            );

            expect(ContactModel).toHaveBeenCalledWith({
                id: contactId,
                ...updateData,
            });
            expect(mockContactModel.toJSON).toHaveBeenCalled();
            expect(mockAmoApi.updateContact).toHaveBeenCalledWith(
                contactId,
                updateData
            );
            expect(result).toBeTruthy();
        });

        it("should handle update errors", async () => {
            const contactId = 123;
            const updateData = { name: "Jane Doe" };
            const mockError = new Error("Update failed");

            mockContactModel.toJSON.mockReturnValue(updateData);
            mockAmoApi.updateContact.mockRejectedValue(mockError);

            await expect(
                contactService.updateContact(contactId, updateData)
            ).rejects.toEqual(mockError);
        });

        it("should throw error when update response is invalid", async () => {
            const contactId = 123;
            const updateData = { name: "Jane Doe" };
            const mockResponse = { invalid: "response" };

            mockContactModel.toJSON.mockReturnValue(updateData);
            mockAmoApi.updateContact.mockResolvedValue(mockResponse);

            await expect(
                contactService.updateContact(contactId, updateData)
            ).rejects.toThrow(constants.ERROR_MESSAGES.FAILED_UPDATE_CONTACT);
        });
    });
});
