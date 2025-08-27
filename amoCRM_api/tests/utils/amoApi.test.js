const AmoApi = require("../../src/utils/amoApi");
const TokenManager = require("../../src/utils/tokenManager");
const OAuthService = require("../../src/utils/oauthService");
const HttpClient = require("../../src/utils/httpClient");
const constants = require("../../src/config/constants");

// Mock dependencies
jest.mock("../../src/utils/tokenManager");
jest.mock("../../src/utils/oauthService");
jest.mock("../../src/utils/httpClient");

describe("AmoApi", () => {
    let amoApi;
    let mockConfig;
    let mockTokenManager;
    let mockOAuthService;
    let mockHttpClient;

    beforeEach(() => {
        jest.clearAllMocks();

        mockConfig = {
            domain: "test.amocrm.ru",
            clientId: "test-client-id",
            clientSecret: "test-client-secret",
            redirectUri: "http://localhost:3002/auth/callback",
            authCode: "test-auth-code",
        };

        mockTokenManager = {
            loadTokens: jest.fn().mockReturnValue({
                accessToken: "test-token",
                refreshToken: "test-refresh",
                expires: Date.now() + 3600000,
                authCode: "test-code",
            }),
        };

        mockOAuthService = {
            setAuthCode: jest.fn().mockReturnValue({
                accessToken: "test-token",
                refreshToken: "test-refresh",
                expires: Date.now() + 3600000,
                authCode: "new-code",
            }),
        };

        mockHttpClient = {
            request: jest.fn(),
        };

        // Mock constructor calls
        TokenManager.mockImplementation(() => mockTokenManager);
        OAuthService.mockImplementation(() => mockOAuthService);
        HttpClient.mockImplementation(() => mockHttpClient);

        amoApi = new AmoApi(mockConfig);
    });

    describe("constructor", () => {
        it("should initialize dependencies correctly", () => {
            expect(TokenManager).toHaveBeenCalled();
            expect(OAuthService).toHaveBeenCalledWith(
                mockConfig,
                mockTokenManager
            );
            expect(HttpClient).toHaveBeenCalledWith(
                mockConfig.domain,
                mockOAuthService,
                mockTokenManager
            );
            expect(mockTokenManager.loadTokens).toHaveBeenCalled();
        });

        it("should load initial tokens", () => {
            expect(amoApi.tokens).toEqual({
                accessToken: "test-token",
                refreshToken: "test-refresh",
                expires: expect.any(Number),
                authCode: "test-code",
            });
        });
    });

    describe("setAuthCode", () => {
        it("should update auth code via OAuth service", () => {
            const newCode = "new-auth-code";

            amoApi.setAuthCode(newCode);

            expect(mockOAuthService.setAuthCode).toHaveBeenCalledWith(newCode);
            expect(amoApi.tokens.authCode).toBe("new-code");
        });
    });

    describe("Lead methods", () => {
        beforeEach(() => {
            mockHttpClient.request.mockResolvedValue({
                id: 1,
                name: "Test Lead",
            });
        });

        it("should get lead by ID", async () => {
            const result = await amoApi.getLeadById(123);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "GET",
                `${constants.API_PATHS.LEADS}/123`
            );
            expect(result).toEqual({ id: 1, name: "Test Lead" });
        });

        it("should create lead", async () => {
            const leadData = { name: "New Lead" };
            const result = await amoApi.createLead(leadData);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "POST",
                constants.API_PATHS.LEADS,
                [leadData]
            );
            expect(result).toEqual({ id: 1, name: "Test Lead" });
        });

        it("should update lead", async () => {
            const leadData = { name: "Updated Lead" };
            const result = await amoApi.updateLead(123, leadData);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "PATCH",
                `${constants.API_PATHS.LEADS}/123`,
                leadData
            );
            expect(result).toEqual({ id: 1, name: "Test Lead" });
        });

        it("should search leads by filter", async () => {
            const filter = { name: "Test" };
            const result = await amoApi.searchLeadsByFilter(filter);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "GET",
                `${constants.API_PATHS.LEADS}?query=Test`
            );
            expect(result).toEqual({ id: 1, name: "Test Lead" });
        });
    });

    describe("Contact methods", () => {
        beforeEach(() => {
            mockHttpClient.request.mockResolvedValue({
                id: 1,
                name: "Test Contact",
            });
        });

        it("should get contact by ID", async () => {
            const result = await amoApi.getContactById(123);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "GET",
                `${constants.API_PATHS.CONTACTS}/123`
            );
            expect(result).toEqual({ id: 1, name: "Test Contact" });
        });

        it("should create contact", async () => {
            const contactData = { name: "New Contact" };
            const result = await amoApi.createContact(contactData);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "POST",
                constants.API_PATHS.CONTACTS,
                [contactData]
            );
            expect(result).toEqual({ id: 1, name: "Test Contact" });
        });

        it("should update contact", async () => {
            const contactData = { name: "Updated Contact" };
            const result = await amoApi.updateContact(123, contactData);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "PATCH",
                `${constants.API_PATHS.CONTACTS}/123`,
                contactData
            );
            expect(result).toEqual({ id: 1, name: "Test Contact" });
        });

        it("should search contacts by email filter", async () => {
            const filter = { email: "test@example.com" };
            const result = await amoApi.searchContactsByFilter(filter);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "GET",
                `${constants.API_PATHS.CONTACTS}?query=test%40example.com`
            );
            expect(result).toEqual({ id: 1, name: "Test Contact" });
        });

        it("should search contacts by phone filter", async () => {
            const filter = { phone: "+1234567890" };
            const result = await amoApi.searchContactsByFilter(filter);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "GET",
                `${constants.API_PATHS.CONTACTS}?query=%2B1234567890`
            );
            expect(result).toEqual({ id: 1, name: "Test Contact" });
        });
    });

    describe("Link methods", () => {
        beforeEach(() => {
            mockHttpClient.request.mockResolvedValue({ success: true });
        });

        it("should link lead with contact", async () => {
            const result = await amoApi.linkLeadWithContact(123, 456);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "POST",
                `${constants.API_PATHS.LEADS}/123/link`,
                [
                    {
                        to_entity_id: 456,
                        to_entity_type: constants.ENTITY_TYPES.CONTACT,
                    },
                ]
            );
            expect(result).toEqual({ success: true });
        });

        it("should unlink lead from contact", async () => {
            const result = await amoApi.unlinkLeadFromContact(123, 456);

            expect(mockHttpClient.request).toHaveBeenCalledWith(
                "DELETE",
                `${constants.API_PATHS.LEADS}/123/link`,
                [
                    {
                        to_entity_id: 456,
                        to_entity_type: constants.ENTITY_TYPES.CONTACT,
                    },
                ]
            );
            expect(result).toEqual({ success: true });
        });
    });
});
