class ContactModel {
  constructor(data = {}) { 
    this.id = data.id || null;
    this.name = data.name || '';
    this.first_name = data.first_name || '';
    this.last_name = data.last_name || '';
    this.responsible_user_id = data.responsible_user_id || 0;
    this.created_by = data.created_by || 0;
    this.updated_by = data.updated_by || 0;
    this.created_at = data.created_at || Math.floor(Date.now() / 1000);
    this.updated_at = data.updated_at || Math.floor(Date.now() / 1000);
    this.custom_fields_values = data.custom_fields_values || [];
  }

  toJSON() {
    const json = {};
    
    if (this.name) json.name = this.name;
    if (this.first_name) json.first_name = this.first_name;
    if (this.last_name) json.last_name = this.last_name;
    if (this.responsible_user_id) json.responsible_user_id = this.responsible_user_id;
    if (this.custom_fields_values && this.custom_fields_values.length > 0) {
      json.custom_fields_values = this.custom_fields_values;
    }
    
    return json;
  }

  static fromApiResponse(data) {
    return new ContactModel(data);
  }
}

module.exports = ContactModel;