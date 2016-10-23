import * as ActionTypes from '../constants/ActionTypes';

export const SaveUser = user => {
  return {
    type: ActionTypes.SAVE_USER,
    user
  };
};

export const RemoveUser = id => {
  return {
    type: ActionTypes.REMOVE_USER,
    id
  }
};