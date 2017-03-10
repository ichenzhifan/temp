import { combineReducers } from 'redux';

import env from './envReducer';

// reducer合成器, 用于分别处理不同的reducer.
export default combineReducers({
  env
});
