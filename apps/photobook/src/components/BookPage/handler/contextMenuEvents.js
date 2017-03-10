import { getCropOptions, getCropLRByOptions } from '../../../utils/crop';
import { findDOMNode } from 'react-dom';
import { merge } from 'lodash';
/**
 * 获取当前element下的image的宽高信息.
 */
const getImage = (element, images) => {
  let image = null;
  const encImgId = element.get('encImgId');

  if (images.size && encImgId) {
    image = images.find(img => img.encImgId === encImgId);
  }
  return image;
};

/**
 * 根据指定的坐标和宽高来展开元素
 * @param  {object} element 待展开的元素
 * @param  {number} x  展开后的左上角的x坐标
 * @param  {number} y 展开后的左上角的y坐标
 * @param  {number} elementWidth   展开后的元素的宽
 * @param  {number} elementHeight   展开后的元素的高
 */
const expand = (that, element, x, y, elementWidth, elementHeight) => {
  const { data, actions } = that.props;
  const { boundProjectActions } = actions;
  const { page, images } = data;

  // 获取图片的原始大小.
  const image = getImage(element, images);

  if (!image) {
    return;
  }

  // 获取页面的宽高.
  const pageWidth = page.get('width');
  const pageHeight = page.get('height');

  // 获取展开后图片裁剪的参数.
  const imgCropOptions = getCropOptions(
    image.width,
    image.height,
    elementWidth,
    elementHeight,
    element.get('imgRot'));

  const { cropLUX, cropLUY, cropRLX, cropRLY } = imgCropOptions;

  boundProjectActions.updateElement({
    id: element.get('id'),
    x,
    y,
    // 重置图片框的旋转
    rot: 0,
    px: x / pageWidth,
    py: y / pageHeight,
    pw: elementWidth / pageWidth,
    ph: elementHeight / pageHeight,
    cropLUX,
    cropLUY,
    cropRLX,
    cropRLY,
    width: elementWidth,
    height: elementHeight
  });
};

/**
 * 编辑图片
 */
export const onEditImage = (that, element, e) => {
  const { data, actions } = that.props;
  const { boundImageEditModalActions, boundProjectActions } = actions;
  const { images } = data;
  // 计算element的显示宽高.
  const elementWidth = element.get('width');
  const elementHeight = element.get('height');

  const { computed, encImgId, imgRot, imageid, cropLUX, cropLUY, cropRLX, cropRLY} = element.toJS();

  const imageDetail = images.get(encImgId).toJS();
  let { width, height, name } = imageDetail;
  // if (Math.abs(imgRot)===90) {
  //   let tmp = width;
  //   width = height;
  //   height = tmp;
  // }
  boundImageEditModalActions.showImageEditModal({
    imageEditApiTemplate: computed.corpApiTemplate,
    encImgId,
    imageId: encImgId ? 0 : imageid,
    rotation: imgRot,
    imageWidth: width,
    imageHeight: height,
    imageName: name,
    elementWidth,
    elementHeight,
    crop: {
      cropLUX,
      cropLUY,
      cropRLX,
      cropRLY
    },
    onDoneClick: (encImgId, crop, rotate) => {
      boundProjectActions.updateElement(merge({}, crop, { imgRot: rotate, id: element.get('id') }));
    }
  });
};

/**
 * 旋转图片
 */
export const onRotateImage = (that, element, e) => {
  const { data, actions } = that.props;
  const changeMap = {
    '0': 90,
    '90' : 180,
    '180': -90,
    '-90': 0
  };

  const { boundProjectActions } = actions;
  const { page, ratio, images } = data;

  const { imgRot, encImgId } = element.toJS();

  const imageDetail = images.get(encImgId).toJS();

  const elementWidth = element.get('pw') * page.get('width') * ratio.workspace;
  const elementHeight = element.get('ph') * page.get('height') * ratio.workspace;

  const { width, height } = imageDetail;
  const changeRot = changeMap[imgRot];

  const options = getCropOptions(width, height, elementWidth, elementHeight, changeRot);
  const lrOptions = getCropLRByOptions(options.px, options.py, options.pw, options.ph);

  boundProjectActions.updateElement({
    id: element.get('id'),
    imgRot: changeRot,
    cropLUX: lrOptions.cropLUX,
    cropLUY: lrOptions.cropLUY,
    cropRLX: lrOptions.cropRLX,
    cropRLY: lrOptions.cropRLY
  });
};

/**
 * 图片镜像切换
 */
export const onFlipImage = (that, element, e) => {
  // todo
};

/**
 * 展开图片到整页
 */
export const onExpandToFullSheet = (that, element, e) => {
  const { data } = that.props;
  const { page } = data;

  // 计算展开后的尺寸.
  const elementWidth = page.get('width');
  const elementHeight = page.get('height');

  // 展开元素到指定的位置和宽高.
  expand(that, element, 0, 0, elementWidth, elementHeight);
};

/**
 * 展开图片到左半页
 */
export const onExpandToLeftPage = (that, element, e) => {
  const { data } = that.props;
  const { page } = data;

  // 计算展开后的尺寸.
  const elementWidth = page.get('width') / 2;
  const elementHeight = page.get('height');

  // 展开元素到指定的位置和宽高.
  expand(that, element, 0, 0, elementWidth, elementHeight);
};

/**
 * 展开图片到右半页
 */
export const onExpandToRightPage = (that, element, e) => {
  const { data } = that.props;
  const { page } = data;

  // 计算展开后的尺寸.
  const elementWidth = page.get('width') / 2;
  const elementHeight = page.get('height');

  // 展开元素到指定的位置和宽高.
  expand(that, element, page.get('width') / 2, 0, elementWidth, elementHeight);
};

/**
 * 删除图片
 */
export const onRemoveImage = (that, element, e) => {
  const { data, actions } = that.props;
  const { page } = data;
  const { boundProjectActions } = actions;
  boundProjectActions.updateElement({
    id: element.get('id'),
    encImgId: '',
    imageid: '',
    cropLUX: 0,
    cropLUY: 0,
    cropRLX: 0,
    cropLUY: 0,
    imgRot: 0
  });
};

/**
 * 上传图片
 */
export const onUploadImage = (that, element, e) => {
  const { data, actions } = that.props;
  const { fileUpload } = that.refs;
  findDOMNode(fileUpload).click();
  const { boundImagesActions } = actions;
  const { page, ratio } = data;

  const elementWidth = element.get('pw') * page.get('width') * ratio.workspace;
  const elementHeight = element.get('ph') * page.get('height') * ratio.workspace;

  const elementId = element.get('id');
  const imgRot = element.get('imgRot');

  boundImagesActions.autoAddPhotoToCanvas({
    status: true,
    elementId,
    elementWidth,
    elementHeight,
    imgRot
  });
};

export const toggleModal = (that, type, status) => {
  const { actions } = that.props;
  const { boundUploadImagesActions } = actions;
  boundUploadImagesActions.toggleUpload(status);
};
