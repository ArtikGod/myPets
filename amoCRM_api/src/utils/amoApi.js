const TokenManager = require("./tokenManager");
const OAuthService = require("./oauthService");
const HttpClient = require("./httpClient");
const constants = require("../config/constants");

class AmoApi {
    constructor(config) {
        this.tokenManager = new TokenManager();
        this.oauthService = new OAuthService(config, this.tokenManager);
        this.httpClient = new HttpClient(
            config.domain,
            this.oauthService,
            this.tokenManager
        );

        this.tokens = this.tokenManager.loadTokens();
    }

    setAuthCode(code) {
        this.tokens = this.oauthService.setAuthCode(code);
    }

    async getLeadById(id) {
        return this.httpClient.request(
            "GET",
            `${constants.API_PATHS.LEADS}/${id}`
        );
    }

    async createLead(leadData) {
        return this.httpClient.request("POST", constants.API_PATHS.LEADS, [
            leadData,
        ]);
    }

    async updateLead(id, leadData) {
        return this.httpClient.request(
            "PATCH",
            `${constants.API_PATHS.LEADS}/${id}`,
            leadData
        );
    }

    async searchLeadsByFilter(filter) {
        const queryParams = new URLSearchParams();
        if (filter.name) {
            queryParams.append("query", filter.name);
        }
        return this.httpClient.request(
            "GET",
            `${constants.API_PATHS.LEADS}?${queryParams.toString()}`
        );
    }

    async getContactById(id) {
        return this.httpClient.request(
            "GET",
            `${constants.API_PATHS.CONTACTS}/${id}`
        );
    }

    async createContact(contactData) {
        return this.httpClient.request("POST", constants.API_PATHS.CONTACTS, [
            contactData,
        ]);
    }

    async updateContact(id, contactData) {
        return this.httpClient.request(
            "PATCH",
            `${constants.API_PATHS.CONTACTS}/${id}`,
            contactData
        );
    }

    async searchContactsByFilter(filter) {
        const queryParams = new URLSearchParams();
        if (filter.email) {
            queryParams.append("query", filter.email);
        } else if (filter.phone) {
            queryParams.append("query", filter.phone);
        }
        return this.httpClient.request(
            "GET",
            `${constants.API_PATHS.CONTACTS}?${queryParams.toString()}`
        );
    }

    async linkLeadWithContact(leadId, contactId) {
        return this.httpClient.request(
            "POST",
            `${constants.API_PATHS.LEADS}/${leadId}/link`,
            [
                {
                    to_entity_id: contactId,
                    to_entity_type: constants.ENTITY_TYPES.CONTACT,
                },
            ]
        );
    }

    async unlinkLeadFromContact(leadId, contactId) {
        return this.httpClient.request(
            "DELETE",
            `${constants.API_PATHS.LEADS}/${leadId}/link`,
            [
                {
                    to_entity_id: contactId,
                    to_entity_type: constants.ENTITY_TYPES.CONTACT,
                },
            ]
        );
    }
}

module.exports = AmoApi;
