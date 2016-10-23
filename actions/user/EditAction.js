const EditAction = require('../base/EditAction');

class UserEditAction extends EditAction {}

UserEditAction.required_fields = ['id'];

module.exports = UserEditAction;