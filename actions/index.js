const BaseActions = {
  PostAction: require('./base/PostAction'),
  EditAction: require('./base/EditAction'),
  DeleteAction: require('./base/DeleteAction')
};

const UserActions = require('./user');

module.exports = Object.assign({}, 
BaseActions,
UserActions);