import { get } from 'lodash';
import { CALL_API } from '../../middlewares/api';
import { GET_SPEC_VERSION_DATA } from '../../contants/apiUrl';
import { GET_SPEC_DATA } from '../../contants/actionTypes';

import devSpecData from 'raw!../../sources/spec.xml';
import x2jsInstance from '../../../../common/utils/xml2js';

export function getSpecData() {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls');
    const productBaseURL = urls.get('productBaseURL');

    // 获取spec的版本信息.
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_SPEC_VERSION_DATA,
          params: { productBaseURL }
        }
      }
    }).then(() => {
      // TODO: 在上线之前, 请使用下面这行代码.
      // const state = getState();
      // const specUrl = get(state, 'spec.version.availableVersionPath');
      // if (specUrl) {
      //   dispatch({
      //     [CALL_API]: {
      //       apiPattern: {
      //         name: specUrl
      //       }
      //     }
      //   }).then((response) => {
      //     dispatch({
      //       type: GET_SPEC_DATA,
      //       response
      //     });
      //   });
      // }

      const specObj = x2jsInstance.xml2js(devSpecData);
      dispatch({
        type: GET_SPEC_DATA,
        response: specObj
      });
    });
  };
}
