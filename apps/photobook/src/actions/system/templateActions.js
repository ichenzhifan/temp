import qs from 'qs';
import { get, isArray } from 'lodash';
import { CALL_API } from '../../middlewares/api';
import { GET_TEMPLATE_LIST, APPLY_LAYOUT, SAVE_TEMPLATE } from '../../contants/apiUrl';
import { productTypes } from '../../contants/strings';
import { ADD_TEMPLATE, IS_IN_APPLY_TEMPLATE } from '../../contants/actionTypes';

const coverMap = {
  CC: ['CC', 'GC'],
  HC: ['HC', 'LFHC', 'PSHC']
};

export function getTemplateList(customerId, size, cover, productType) {
  let designSize = size;
  return (dispatch, getState) => {
    const state = getState();
    const baseUrl = get(state, 'system.env.urls').get('baseUrl');
    const pageType = productType.indexOf(productTypes.PS)>=0 ? 'half' : 'full';
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_TEMPLATE_LIST,
          params: {
            baseUrl,
            designSize,
            customerId,
            cover: mapConver(cover),
            pageType,
            autoRandomNum: new Date().getTime()
          },
          productType
        }
      }
    });
  };
}

export function getTemplateInfo(templateId, size) {
  return (dispatch, getState) => {
    const baseUrl = get(getState(), 'system.env.urls').get('baseUrl');

    const templateIds = isArray(templateId) ? templateId : [templateId];

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: APPLY_LAYOUT,
          params: {
            baseUrl,
            templateIds,
            size
          }
        },
        options: {
          method: 'POST',
          body: JSON.stringify({
            templates: templateIds,
            size
          })
        }
      }
    });
  };
}

export function addTemplate(template) {
  return (dispatch, getState) => {
    dispatch({
      type: ADD_TEMPLATE,
      params: template
    });
    return Promise.resolve(template);
  };
}


const mapConver = (cover) => {
  let resCover;
  for (var key in coverMap) {
    if (coverMap.hasOwnProperty(key)) {
      var item = coverMap[key];
      if (item.indexOf(cover)>=0) {
        resCover = key;
        break;
      }
    }
  }
  return resCover ? resCover : 'NONE';
};

// 保存自定义模版的 action
export function saveLayout(paramsObj) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: SAVE_TEMPLATE,
          params: {
            baseUrl,
            ...paramsObj
          }
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify(paramsObj)
        }
      }
    });
  };
}

export function changeApplyTemplateStatus(value = false) {
  return {
    type: IS_IN_APPLY_TEMPLATE,
    value
  };
}
