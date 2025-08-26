class LeadModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.price = data.price || 0;
    this.status_id = data.status_id || null;
    this.pipeline_id = data.pipeline_id || null;
    this.created_by = data.created_by || 0;
    this.updated_by = data.updated_by || 0;
    this.created_at = data.created_at || Math.floor(Date.now() / 1000);
    this.updated_at = data.updated_at || Math.floor(Date.now() / 1000);
    this.custom_fields_values = data.custom_fields_values || [];
  }

  toJSON() {
    const json = {};
    
    if (this.name) json.name = this.name;
    if (this.price) json.price = this.price;
    if (this.status_id) json.status_id = this.status_id;
    if (this.pipeline_id) json.pipeline_id = this.pipeline_id;
    if (this.custom_fields_values && this.custom_fields_values.length > 0) {
      json.custom_fields_values = this.custom_fields_values;
    }
    
    return json;
  }

  static fromApiResponse(data) {
    return new LeadModel(data);
  }
}

module.exports = LeadModel;