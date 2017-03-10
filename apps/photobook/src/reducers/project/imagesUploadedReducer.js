import { List } from 'immutable';
import { findIndex } from 'lodash';
import * as types from '../../contants/actionTypes';
import { convertObjIn } from '../../../../common/utils/typeConverter';

const initialState = List([]);

const imageArray = (state = initialState, action) => {
  switch (action.type) {
    case types.UPLOAD_COMPLETE: {
      const { fields } = action;
      const imageObj = {
        id: fields.imageId,
        guid: fields.guid,
        encImgId: fields.encImgId,
        name: fields.name,
        height: fields.height,
        width: fields.width,
        createTime: fields.createTime,
        order: imageArray.length,
        shotTime: ''
      };
      return state.push(convertObjIn(imageObj));
    }
    case types.DELETE_PROJECT_IMAGE: {
      const { imageId } = action;
      const currentImageIndex = state.findIndex((item) => {
        return item.id === imageId;
      });
      return state.splice(currentImageIndex, 1);
    }
    default:
      return state;
  }
};

export default imageArray;
