import { get } from 'lodash';
import { API_SUCCESS } from '../constants/actionTypes';
import { GET_ENV } from '../constants/apiUrl';


/**
 * cookies的reducer, 把新获取的cookie更新到store.
 * @param state
 * @param action
 */
export const urls = (state = {}, action) => {
  switch (action.type) {
    case API_SUCCESS:
      if (action.apiPattern.name === GET_ENV) {
        const result = action.response;
        return result.env || {};
      }
    default:
      return state;
  }
};
