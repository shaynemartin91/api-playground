const BaseAction = require('./baseAction');

class PostAction extends BaseAction {
  constructor(body) {
    super();
    this.data.body = body;
  }

  validate() {
    
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

    return this.validationMessage(true);
  }

  run(collection) {
    const validation = this.validate(collection);
    if(!validation.success) 
      throw new Error(validation.messages)
    
    const new_item = Object.assign({}, this.data.body, {id: this.ActionHelper.getNextId(collection)}); 
    const new_collection = [...collection, new_item];
    new_collection.deleted = collection.deleted;
    return new_collection;
  }

  static deserialize(data) {
    return new PostAction(data.body);
  }
}
module.exports = PostAction; 