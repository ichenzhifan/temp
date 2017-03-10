import { template, merge, get } from 'lodash';
import Immutable from 'immutable';
import { elementTypes, imageShapeTypes } from '../../../contants/strings';
import { hexString2Number } from '../../../../../common/utils/colorConverter';
import { getPxByPt } from '../../../../../common/utils/math';


import {
  IMAGES_CROPPER_PARAMS,
  IMAGES_CROPPER,
  IMAGES_API,
  IMAGES_FILTER_PARAMS,
  TEXT_SRC,
  STICKER_SRC
} from '../../../contants/apiUrl';

import { getCropOptions, getCropOptionsByLR } from '../../../utils/crop';

const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 120;

/**
 * 计算element的显示时的宽高和left,top值.
 * @param  {object} that BookPage的this指向
 * @param  {object} element 原始数据
 * @param  {number} ratio 原始值与显示值的缩放比
 */
export const computedElementOptions = (that, element, workspaceRatio) => {
  const { data } = that.props;
  const { urls, page, images, settings } = data;
  const ratio = workspaceRatio || data.ratio.workspace;

  // 天窗形状.
  const cameShape = get(settings, 'spec.cameoShape');

  const obj = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    imgUrl: ''
  };

  const imageRotate = element.get('imgRot');
  const imgFlip = element.get('imgFlip');

  // 计算element的显示宽高.
  obj.width = Math.round(element.get('width') * ratio);
  obj.height = Math.round(element.get('height') * ratio);

  // 计算element的left和top值
  obj.left = element.get('x') * ratio;
  obj.top = element.get('y') * ratio;

  // 计算获取裁剪图片的地址.
  const encImgId = element.get('encImgId');

  switch (element.get('type')) {
    case elementTypes.text: {
      const fontSizePercent = element.get('fontSize');
      const fontSize = fontSizePercent * page.get('height');

      obj.imgUrl = template(TEXT_SRC)({
        fontBaseUrl: urls.productBaseURL,
        text: window.encodeURIComponent(element.get('text')),
        fontColor: hexString2Number(element.get('fontColor')),
        fontFamily: window.encodeURIComponent(element.get('fontFamily')),
        textAlign: window.encodeURIComponent(element.get('textAlign')),
        ratio,
        fontSize
      });
      obj.keepRatio = true;
      obj.maxHeight = getPxByPt(MAX_FONT_SIZE) * ratio;
      obj.minHeight = getPxByPt(MIN_FONT_SIZE) * ratio;
      break;
    }
    case elementTypes.decoration : {
      obj.imgUrl = template(STICKER_SRC)({
        stickerThumbnailPrefix: urls.stickerThumbnailPrefix,
        guid: element.get('decorationid')
      });
      obj.keepRatio = true;
      break;
    }
    case elementTypes.cameo :
    case elementTypes.photo: {
      if (encImgId) {
        let cropOptions = null;
        // 如果cropRLY为0, 表示新增的.
        if (!element.get('cropRLY')) {
          const image = images ? images.get('encImgId') : null;
          if (image) {
            cropOptions = getCropOptions(
              image.width,
              image.height,
              obj.width,
              obj.height,
              imageRotate
            );
          }
        } else {
          cropOptions = getCropOptionsByLR(
            element.get('cropLUX'),
            element.get('cropLUY'),
            element.get('cropRLX'),
            element.get('cropRLY'),
            obj.width,
            obj.height
          );
        }

        if (cropOptions) {
          // const shape = element.get('type') === elementTypes.cameo ?
          //   (cameShape === imageShapeTypes.rect ? 'rect' : 'oval') : 'rect';
          const shape = 'rect';

          let filterOptions = {
            effectId: 0,
            opacity: 100
          };
          if (element.get('style')) {
            filterOptions = element.get('style').toJS();
          }
          obj.imgUrl = template(`${IMAGES_API}${IMAGES_FILTER_PARAMS}`)(merge(
            {}, cropOptions, filterOptions, {
              encImgId,
              imgFlip,
              shape,
              rotation: imageRotate,
              baseUrl: urls.baseUrl
            }
          ));
          obj.keepRatio = false;


          obj.corpApiTemplate = template(IMAGES_CROPPER)({
            baseUrl: urls.baseUrl
          }) + IMAGES_CROPPER_PARAMS;
          obj.filterApiTemplate = template(IMAGES_API)({
            baseUrl: urls.baseUrl
          }) + IMAGES_FILTER_PARAMS;
        }
      }
      break;
    }
    default:
  }

  return Immutable.Map(obj);
};
