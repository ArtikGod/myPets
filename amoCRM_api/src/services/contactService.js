const ContactModel = require('../models/contactModel');
const constants = require('../config/constants');

class ContactService {
  constructor(amoApi) {
    this.amoApi = amoApi;
  }

  async getContactById(id) {
    try {
      const response = await this.amoApi.getContactById(id);
      return ContactModel.fromApiResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async createContact(contactData) {
    try {
      if (contactData.custom_fields_values) { 
        const emailField = contactData.custom_fields_values.find(field => field.field_code === 'EMAIL');
        const phoneField = contactData.custom_fields_values.find(field => field.field_code === 'PHONE');
        
        if (emailField || phoneField) {
          let filter = {};
          
          if (emailField) {
            filter.email = emailField.values[0].value;
          } else if (phoneField) {
            filter.phone = phoneField.values[0].value;
          }
          
          const existingContacts = await this.amoApi.searchContactsByFilter(filter);
          
          if (existingContacts && 
              existingContacts[constants.API_RESPONSE_KEYS.EMBEDDED] && 
              existingContacts[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS] && 
              existingContacts[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS].length > 0) {
            return ContactModel.fromApiResponse(existingContacts[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS][0]);
          }
        }
      }

      const contactModel = new ContactModel(contactData);
      const response = await this.amoApi.createContact(contactModel.toJSON());
      
      if (response && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS].length > 0) {
        return ContactModel.fromApiResponse(response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS][0]);
      }
      
      throw new Error(constants.ERROR_MESSAGES.FAILED_CREATE_CONTACT);
    } catch (error) {
      throw error;
    }
  }

  async updateContact(id, contactData) {
    try {
      await this.getContactById(id);
      
      const contactModel = new ContactModel({ id, ...contactData });
      const response = await this.amoApi.updateContact(id, contactModel.toJSON());
      
      if (response && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS] && 
          response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS].length > 0) {
        return ContactModel.fromApiResponse(response[constants.API_RESPONSE_KEYS.EMBEDDED][constants.API_RESPONSE_KEYS.CONTACTS][0]);
      }
      
      throw new Error(constants.ERROR_MESSAGES.FAILED_UPDATE_CONTACT);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ContactService;