import { get } from 'lodash';
import { CALL_API } from '../middlewares/api';
import { GET_PRODUCT_PRICE } from '../contants/apiUrl';

export function getProductPrice(setting) {
  return (dispatch, getState) => {
    const options = [
      setting.paper,
      setting.size,
      setting.type,
      setting.spineThickness
    ].join(',');
    const baseUrl = get(getState(), 'system.env.urls.baseUrl');
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_PRODUCT_PRICE,
          params: {
            baseUrl,
            options,
            product: setting.product
          }
        }
      }
    });
  };
}
