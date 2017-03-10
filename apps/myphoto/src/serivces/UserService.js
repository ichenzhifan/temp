import request from '../middlewares/api';
import { webClientId } from '../constants/string';
import { getRandomNum } from '../../../common/utils/math';

export function loadSessionUserInfo({baseUrl}) {
  return request(`${baseUrl}BigPhotoBookServlet/getSessionUserInfo?webClientId=${webClientId}&autoRandomNum=${getRandomNum()}`)
    .then(res => res.userSessionData)
    .catch(res => fakeData());
}

function fakeData() {
  return {
    "user": {
      "firstName": "roger",
      "email": "415413233@qq.com",
      "timestamp": "1489043855932",
      "authToken": "34fce512848cea6f63563fe81e3356d70355ee3c",
      "isProCustomer": "false",
      "canDesignService": "false",
      "id": "253061"
    },
    "status": {
      "code": "200",
      "message": "success"
    }
  }
}