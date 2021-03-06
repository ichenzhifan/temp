import { combineReducers } from 'redux';
import { merge, get, set, pick, forEach, isEmpty } from 'lodash';
import { guid } from '../../../../../common/utils/math';
import { PENDING, DONE, PROGRESS, FAIL } from '../../../contants/uploadStatus';
import { ADD_IMAGES, UPDATE_IMAGEID, UPDATE_PERCENT, UPDATE_FIELDS, CLEAR_IMAGES, DELETE_IMAGE, ERROR_TO_FIRST, SORT_IMAGE, DELETE_UPLOADED_IMAGE, UPDATE_IMAGE_USED_COUNT } from '../../../contants/actionTypes';

/**
 * 处理上传中的图片信息.
 * @param state
 * @param action
 * @returns {*}
 */
const uploading = (state = [], action) => {
  switch (action.type) {
    case ADD_IMAGES :
      const files = Array.from(action.files);
      const newState = files.map((file)=>{
        file.guid = guid();
        return {
          file
        }
      })
      return [
        ...state,
        ...newState
      ];
    case UPDATE_FIELDS:
      const index = state.findIndex((item)=>{
        return item.imageId==action.imageId
      });

      return set(merge([], state), `${index}`,merge({}, state[index], action.fields));
    case UPDATE_IMAGEID :
      return set(merge([], state), `${action.index}.imageId`,action.imageId);
    case UPDATE_PERCENT :
      var index = state.findIndex((item)=>{
        return item.imageId==action.imageId
      });
      action.percent = action.percent == 100 ? 99 : action.percent;
      return set(merge([], state), `${index}.percent`,action.percent);
    case CLEAR_IMAGES:
        return [];
    case DELETE_IMAGE:
        var index = state.findIndex((item)=>{
          return item.imageId==action.imageId
        });
        return [
          ...state.slice(0,index),
          ...state.slice(index+1)
        ];
    case ERROR_TO_FIRST:
        var index = state.findIndex((item)=>{
          return item.imageId==action.imageId
        });
        const copyState = merge([],state);
        const errorItem = copyState.splice(index,1);
        copyState.unshift(errorItem[0]);
        return copyState;
    default :
      return state;
  }
}

export default uploading;

