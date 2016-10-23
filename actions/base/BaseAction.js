"use strict";

const ActionHelper = require('./ActionHelper');

class NotImplementedError extends Error {
  constructor(type, method) {
    super(`Type '${type}'' does not implement method '${method}''`);
  }
}

class BaseAction {
  constructor(data = {}){
    this.data = data;
    this.ActionHelper = ActionHelper;
  }

  validate() {
    throw new NotImplementedError(this.getType(), `validate`);
  }

  run() {
    throw new NotImplementedError(this.getType(), `run`);
  }

  getType() {
    return this.constructor.name;
  }

  serialize(stringify = true) {
    const serialized = {
      type: this.getType(),
      data: this.data
    };

    if(stringify)
      return JSON.stringify(serialized);
    else
      return serialized;
  }

  validationMessage(success, status, message = [], meta = null) {
    return {
      success,
      status,
      messages: Array.isArray(message) ? message : [message],
      meta
    }
  }

  static deserialize() {
    throw new NotImplementedError(this.getType(), `deserialize`);
  }
}

module.exports = BaseAction;