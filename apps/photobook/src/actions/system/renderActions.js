import { UPDATE_COVER_MATERIAL, UPDATE_INNER_MATERIAL } from '../../contants/actionTypes';

/**
 * 更新使用在封面上的效果图
 */
export const updateCoverMaterial = (data) => {
  return {
    type: UPDATE_COVER_MATERIAL,
    data
  };
};

/**
 * 更新使用在内页上的效果图
 */
export const updateInnerMaterial = (data) => {
  return {
    type: UPDATE_INNER_MATERIAL,
    data
  };
};

