const LeadModel = require('../models/leadModel');
const constants = require('../config/constants');

class LeadService {
  constructor(amoApi) { 
    this.amoApi = amoApi;  
  }

  async getLeadById(id) {
    try {
      const response = await this.amoApi.getLeadById(id);
      return LeadModel.fromApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async createLead(leadData) {
    try {
      if (leadData.name) {
        const filter = { name: leadData.name };
        const existingLeads = await this.amoApi.searchLeadsByFilter(filter);
        
        if (existingLeads && 
            existingLeads[constants.API_RESPONSE_KEYS.EMBEDDED] && 
            existingLeads[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS] && 
            existingLeads[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS].length > 0) {
          return LeadModel.fromApiResponse(existingLeads[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS][0]);
        }
      }

      const leadModel = new LeadModel(leadData);
      const response = await this.amoApi.createLead(leadModel.toJSON());
      
      if (response && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS].length > 0) {
        return LeadModel.fromApiResponse(response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS][0]);
      }
      
      throw new Error(constants.ERROR_MESSAGES.FAILED_CREATE_LEAD);
    } catch (error) {
      throw error;
    }
  }

  async updateLead(id, leadData) {
    try {
      await this.getLeadById(id);
      
      const leadModel = new LeadModel({ id, ...leadData });
      const response = await this.amoApi.updateLead(id, leadModel.toJSON());
      
      if (response && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS].length > 0) {
        return LeadModel.fromApiResponse(response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.LEADS][0]);
      }
      
      throw new Error(constants.ERROR_MESSAGES.FAILED_UPDATE_LEAD);
    } catch (error) {
      throw error;
    }
  } 
}

module.exports = LeadService;