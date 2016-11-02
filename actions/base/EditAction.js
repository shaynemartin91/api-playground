const _ = require('underscore');
const BaseAction = require('./BaseAction');

class EditAction extends BaseAction {
  constructor(body) {
    super();
    this.data.body = body;
  }

  validate(collection) {
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

    const record = _.findWhere(collection, { id: this.data.body.id });

    if (record === undefined || record.deleted) {
      return this.validationMessage(false, 404, 'This record does not exist');
    }

    return this.validationMessage(true);
  }

  run(collection) {
    const validation = this.validate(collection);

    if (!validation.success) {
      throw new TypeError('Item does not pass validation');
    }

    const item = _.findWhere(collection, { id: this.data.body.id });
    const updatedItem = Object.assign({}, item, this.data.body);
    const index = _.findIndex(collection, r => r.id === item.id);

    return collection
      .slice(0, index)
      .concat([updatedItem])
      .concat(collection.slice(index + 1));
  }

  static deserialize(data) {
    return new EditAction(data.body);
  }
}

module.exports = EditAction;
