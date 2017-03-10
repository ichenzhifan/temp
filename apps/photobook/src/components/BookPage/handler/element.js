import Immutable from 'immutable';
import { template, merge, get } from 'lodash';
import { getScale } from '../../../utils/scale';
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
const MIN_PHOTO_HEIGHT = 180;
const MIN_PHOTO_WIDTH = 180;
const MIN_TEXT_HEIGHT = 140;
const MIN_TEXT_WIDTH = 140;

// 计算缩放比例
export const getCurrentScale = (that, element) => {
  const { data } = that.props;
  const { urls, page, images } = data;
  let scale;
  const {
    imgRot,
    width,
    height,
    cropLUX,
    cropLUY,
    cropRLX,
    cropRLY,
    imageid,
    encImgId
  } = element.toJS();
  const imageDetail = images.get(encImgId);
  if (imageDetail) {
    scale = getScale({
      imgRot,
      imageDetail,
      width,
      height,
      cropRLX,
      cropLUX,
      cropRLY,
      cropLUY
    });
  } else {
    scale = 0;
  }
  return scale;
};

/**
 * 计算element的显示时的宽高和left,top值.
 * @param  {object} that BookPage的this指向
 * @param  {object} element 原始数据
 * @param  {number} ratio 原始值与显示值的缩放比
 */
export const computedElementOptions = (that, element, workspaceRatio) => {
  const { data, t } = that.props;
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
  const pageWidth = page.get('width');
  const pageHeight = page.get('height');

  // 计算element的显示宽高.
  obj.width = Math.round(pageWidth * element.get('pw') * ratio);
  obj.height = Math.round(pageHeight * element.get('ph') * ratio);

  // 计算element的left和top值
  obj.left = pageWidth * element.get('px') * ratio;
  obj.top = pageHeight * element.get('py') * ratio;

  // 计算获取裁剪图片的地址.
  const encImgId = element.get('encImgId');

  switch (element.get('type')) {
    case elementTypes.text:
      {
        const text = element.get('text');
        const fontSizePercent = element.get('fontSize');
        const originalFontSize = fontSizePercent * page.get('height');
        const scale = 1 / ratio;

        obj.imgUrl = template(TEXT_SRC)({
          text: window.encodeURIComponent(text),
          fontSize: originalFontSize / scale,
          fontColor: hexString2Number(element.get('fontColor')),
          fontFamily: window.encodeURIComponent(element.get('fontFamily')),
          width: obj.width,
          height: obj.height,
          originalWidth: element.get('width'),
          originalHeight: element.get('height'),
          originalFontSize,
          fontBaseUrl: urls.productBaseURL,
          textAlign: element.get('textAlign'),
          verticalTextAlign: element.get('textVAlign')
        });

        obj.minHeight = MIN_TEXT_HEIGHT * ratio;
        obj.minWidth = MIN_TEXT_WIDTH * ratio;
        break;
      }
    case elementTypes.decoration:
      {
        obj.imgUrl = template(STICKER_SRC)({
          stickerThumbnailPrefix: urls.stickerThumbnailPrefix,
          guid: element.get('decorationid')
        });
        obj.keepRatio = true;
        obj.minHeight = MIN_PHOTO_HEIGHT * ratio;
        obj.minWidth = MIN_PHOTO_WIDTH * ratio;
        break;
      }
    case elementTypes.cameo:
    case elementTypes.photo:
      {
        obj.keepRatio = false;
        obj.minHeight = MIN_PHOTO_HEIGHT * ratio;
        obj.minWidth = MIN_PHOTO_WIDTH * ratio;
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

            obj.imgUrl = template(`${IMAGES_API}${IMAGES_FILTER_PARAMS}`)(merge({}, cropOptions, filterOptions, {
              encImgId,
              imgFlip,
              shape,
              rotation: imageRotate,
              baseUrl: urls.baseUrl
            }));

            obj.corpApiTemplate = template(IMAGES_CROPPER)({
              baseUrl: urls.baseUrl
            }) + IMAGES_CROPPER_PARAMS;
            obj.filterApiTemplate = template(IMAGES_API)({
              baseUrl: urls.baseUrl
            }) + IMAGES_FILTER_PARAMS;
            obj.scale = getCurrentScale(that, element);
          }
        }
        break;
      }
    default:
  }

  return Immutable.Map(obj);
};
