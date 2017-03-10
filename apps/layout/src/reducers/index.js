import { combineReducers } from 'redux';

import project from './projectReducer';
import system from './systemReducer';

export default combineReducers({
  project,
  system
});
