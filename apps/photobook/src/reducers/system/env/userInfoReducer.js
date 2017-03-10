import { Map } from 'immutable';
import { API_SUCCESS } from '../../../contants/actionTypes';
import { GET_SESSION_USER_INFO } from '../../../contants/apiUrl';
import { convertObjIn } from '../../../../../common/utils/typeConverter';

const initialState = Map({
  id: -1
});

const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case API_SUCCESS:
      if (action.apiPattern.name === GET_SESSION_USER_INFO) {
        const result = action.response;
        const user = result.userSessionData.user;
        if (user.id) {
          return state.merge(convertObjIn(user));
        }
        return state.merge(convertObjIn(user), {
          id: -1
        });
      }
      return state;
    default:
      return state;
  }
};

export default userInfo;
