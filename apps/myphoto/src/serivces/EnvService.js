import request from '../middlewares/api';

import { webClientId } from '../constants/string';
import { getRandomNum } from '../../../common/utils/math';

export function loadDomainUrls() {
  return request(`/userid/getEnv?webClientId=${webClientId}&autoRandomNum=${getRandomNum()}`)
    .then(res => res.env);
}
