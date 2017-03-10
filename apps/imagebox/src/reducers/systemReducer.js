import { combineReducers } from 'redux';

import alerts from './alertsReducer';
import env from './envReducer';
import images from './imagesReducer';
import notifyData from './notifyReducer';
import confirmData from './confirmReducer';
import price from './priceReducer';
import imageEditModalData from '././imageEditModalReducer';
import loadingData from './loadingReducer';
import workspace from './workspaceReducer';

// reducer合成器, 用于分别处理不同的reducer.
export default combineReducers({
  alerts,
  env,
  images,
  price,
  imageEditModalData,
  notifyData,
  confirmData,
  loadingData,
  workspace
});
