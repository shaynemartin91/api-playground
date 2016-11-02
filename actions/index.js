const PostAction = require('./base/PostAction');
const EditAction = require('./base/EditAction');
const DeleteAction = require('./base/DeleteAction');
const UserActions = require('./user');

const BaseActions = {
  PostAction,
  EditAction,
  DeleteAction,
};

module.exports = Object.assign({}, BaseActions, UserActions);
