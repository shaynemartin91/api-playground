const BaseAction = require('./BaseAction');

class PostAction extends BaseAction {
  constructor(body) {
    super();
    this.data.body = body;
  }

  validate() {
    if (this.data.body === undefined || this.data.body === null) {
      return this.validationMessage(false, 400, 'Request body is missing');
    }

    if (this.constructor.required_properties) {
      const missingProps = this.constructor.required_properties
        .filter(prop => !this.data.body.hasOwnProperty(prop));

      if (missingProps.length) {
        return this.validationMessage(false, 400, `The following required fields are missing: ${missingProps.join(', ')}`, {
          type: 'missing_fields',
          data: missingProps,
        });
      }
    }

    return this.validationMessage(true);
  }

  run(collection) {
    const validation = this.validate(collection);
    if (!validation.success) {
      throw new Error(validation.messages);
    }

    const id = this.ActionHelper.getNextId(collection);
    const newItem = Object.assign({}, this.data.body, { id });
    const newCollection = [...collection, newItem];
    newCollection.deleted = collection.deleted;
    return newCollection;
  }

  static deserialize(data) {
    return new PostAction(data.body);
  }
}
module.exports = PostAction;
