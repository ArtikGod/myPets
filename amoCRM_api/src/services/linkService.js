const constants = require('../config/constants');

class LinkService {
  constructor(amoApi, leadService, contactService) {
    this.amoApi = amoApi;
    this.leadService = leadService;
    this.contactService = contactService;
  }

  async linkLeadWithContact(leadId, contactId) {
    try {
      await this.leadService.getLeadById(leadId);  
      await this.contactService.getContactById(contactId);
      
      const response = await this.amoApi.linkLeadWithContact(leadId, contactId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async unlinkLeadFromContact(leadId, contactId) {
    try {
      await this.leadService.getLeadById(leadId);
      await this.contactService.getContactById(contactId);
      
      const response = await this.amoApi.unlinkLeadFromContact(leadId, contactId);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LinkService;