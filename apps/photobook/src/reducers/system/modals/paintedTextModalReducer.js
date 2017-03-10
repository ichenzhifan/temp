import Immutable from 'immutable';
import * as types from '../../../contants/actionTypes';

const initialState = Immutable.fromJS({
  isShown: false,
  front: {},
  back: {},
  spine: {}
});

const paintedTextModal = (state = initialState, action) => {
  switch (action.type) {
    case types.SHOW_PAINTED_TEXT_MODAL:
      return state.merge({ isShown: true });
    case types.HIDE_PAINTED_TEXT_MODAL:
      return state.merge({ isShown: false });
    case types.SAVE_PAINTED_TEXT_MODAL_INPUT:
      return state.merge(action.data);
    case types.CLEAR_PAINTED_TEXT_FORM:
      return initialState;
    default:
      return state;
  }
};

export default paintedTextModal;
