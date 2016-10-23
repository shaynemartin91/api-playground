const _ = require('underscore');
const BaseAction = require('./baseAction');

class DeleteAction extends BaseAction {
  constructor(id) {
    super();
    this.data.id = id;
  }

  validate(collection) {
    const item = _.findWhere(collection, {id: this.data.id});

    if(item === undefined || item.deleted) {
      return this.validationMessage(false, 404, 'This record does not exist', {id: this.data.id});
    }

    return this.validationMessage(true);
  }

  run(collection) {
    if(!this.validate(collection)) 
      throw new TypeError('Item does not exist in the collection');
    
    const item = _.findWhere(collection, {id: this.data.id});
    const index = _.findIndex(collection, r => r.id === this.data.id);
    const deleted_item = Object.assign({}, item, {deleted: true});

    return collection.slice(0, index).concat([deleted_item]).concat(collection.slice(index+1))
  }

  static deserialize(data) {
    return new DeleteAction(data.id);
  }
}

module.exports = DeleteAction; 