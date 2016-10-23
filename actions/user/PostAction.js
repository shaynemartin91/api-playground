const PostAction = require('../base/PostAction');

class UserPostAction extends PostAction {
  constructor(body) {super(body)}
};

UserPostAction.required_properties = ['first_name', 'last_name', 'email'];

module.exports = UserPostAction;