const _ = require('underscore');
const BaseAction = require('./baseAction');

class EditAction extends BaseAction {
  constructor(body) {
    super();
    this.data.body = body;
  }

  validate(collection) {
    if(this.data.body === undefined || this.data.body === null)
      return this.validationMessage(false, 400, `Request body is missing`);

    if(this.constructor.required_properties) {
      const missing_props = this.constructor.required_properties
        .filter(prop => !this.data.body.hasOwnProperty(prop))

      if(missing_props.length) {
        return this.validationMessage(false, 400, `The following required fields are missing: ${missing_props.join(', ')}`, {
          type: `missing_fields`,
          data: missing_props 
        });
      }
    }

    const record = _.findWhere(collection, {id: this.data.body.id}); 

    if(record === undefined || record.deleted)
      return this.validationMessage(false, 404, 'This record does not exist');

    return this.validationMessage(true);
  }

  run(collection) {
    const validation = this.validate(collection);

    if(!validation.success) 
      throw new TypeError('Item does not pass validation');

    const item = _.findWhere(collection, {id: this.data.body.id});
    const updated_item = Object.assign({}, item, this.data.body);
    const idx = _.findIndex(collection, r => r.id === item.id);
    
    collection[idx] = updated_item;

    return collection;
  }

  static deserialize(data) {
    return new EditAction(data.body);
  }
}

module.exports = EditAction; 