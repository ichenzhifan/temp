import { combineReducers } from 'redux';
import ratio from './ratioReducer';
import pagination from './paginationReducer';
import material from './materialReducer';
import snipping from './snippingReducer';

// reducer合成器, 用于分别处理不同的reducer.
export default combineReducers({
  ratio,
  pagination,
  material,
  snipping
});
