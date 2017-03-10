import { merge } from 'lodash';

import { API_SUCCESS, ADD_TEMPLATE } from '../../../contants/actionTypes';
import { productTypes } from '../../../contants/strings';
import { GET_TEMPLATE_LIST } from '../../../contants/apiUrl';
import { convertObjIn } from '../../../../../common/utils/typeConverter';

const templateList = (state = [], action) => {
  switch (action.type) {
    case API_SUCCESS:
      switch (action.apiPattern.name) {
        case GET_TEMPLATE_LIST:
          const { response } = action;
          const productType = action.apiPattern.productType;
          const pageType = productType.indexOf(productTypes.PS)>=0 ? 'half' : 'full';

          // 模版中的 pressBookSheet 有值的模版表示老的 pressbook 的模版，将此模版过滤掉。
          const resTemplateList = convertObjIn(response.result.list.template);
          let fliteredList = (resTemplateList instanceof Array) && resTemplateList.filter(item => !item.pressBookSheet);
          fliteredList = fliteredList.filter(item => {
            if (item.sheetType.toLowerCase() !== 'inner') {
              return true;
            } else {
              if (item.pageType===pageType) {
                return true;
              }
            }
          });
          return merge([], fliteredList);
        default:
          return state;
      }
    case ADD_TEMPLATE: {
      const { params } = action;
      const copyState = merge([], state);
      copyState.push(params);
      return copyState;
    }
    default:
      return state;
  }
};

export default templateList;
