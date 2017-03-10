import { merge } from 'lodash';
import { List } from 'immutable';
import { findDOMNode } from 'react-dom';
import { getCropOptions, getCropLRByOptions } from '../../../utils/crop';
import { elementTypes } from '../../../contants/strings';
import { collision } from '../../../utils/collision';
/**
 * 获取当前element下的image的宽高信息.
 */
const getImage = (element, images) => {
  let image = null;
  const encImgId = element.get('encImgId');

  if (images.size && encImgId) {
    image = images.find(img => img.get('encImgId') === encImgId);
  }
  return image.toJS();
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
  const { page, images, ratio } = data;

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
    elementWidth * ratio.workspace,
    elementHeight * ratio.workspace,
    element.get('imgRot'));

  const { px, py, pw, ph } = imgCropOptions;

  const cropLrOptions = getCropLRByOptions(px, py, pw, ph);

  const { cropLUX, cropLUY, cropRLX, cropRLY } = cropLrOptions;

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
  const { images, elements, ratio } = data;
  const { actionBarData } = that.state;
  // 计算element的显示宽高.
  const elementWidth = element.get('width');
  const elementHeight = element.get('height');

  let { computed, encImgId, imgRot, imageid, cropLUX, cropLUY, cropRLX, cropRLY } = element.toJS();

  const eWidth = computed.width;
  const eHeight = computed.height;

  const imageDetail = images.get(encImgId);
  let { width, height, name } = imageDetail.toJS();

  // 如果元素宽高还没更新
  if (Math.round(elementWidth * ratio.workspace) !==eWidth || Math.round(elementHeight * ratio.workspace) !== eHeight) {
    const options = getCropOptions(width, height, eWidth, eHeight, imgRot);
    cropLUX = options.cropLUX;
    cropLUY = options.cropLUY;
    cropRLX = options.cropRLX;
    cropRLY = options.cropRLY;
  }

  boundImageEditModalActions.showImageEditModal({
    imageEditApiTemplate: computed.corpApiTemplate,
    encImgId,
    imageId: encImgId ? 0 : imageid,
    rotation: imgRot,
    imageWidth: width,
    imageHeight: height,
    imageName: name,
    elementWidth: eWidth / ratio.workspace,
    elementHeight: eHeight / ratio.workspace,
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
  that.hideActionBar(that);
};

/**
 * 旋转图片
 */
export const onRotateImage = (that, element, e) => {
  const { data, actions } = that.props;
  const { actionBarData } = that.state;
  const changeMap = {
    '0': 90,
    '90': 180,
    '180': -90,
    '-90': 0
  };

  const { boundProjectActions } = actions;
  const { page, ratio, images } = data;

  const { imgRot, encImgId } = element.toJS();

  const imageDetail = images.get(encImgId);

  const elementWidth = element.getIn(['computed', 'width']);
  const elementHeight = element.getIn(['computed', 'height']);

  const { width, height } = imageDetail.toJS();
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
  that.hideActionBar(that);
};

/**
 * 图片镜像切换
 */
export const onFlipImage = (that, element, e) => {
  const { actions } = that.props;
  const { boundProjectActions } = actions;
  const imgFlip = element.get('imgFlip');
  boundProjectActions.updateElement({
    id: element.get('id'),
    imgFlip: !imgFlip
  });
};

/**
 * 展开图片到整页
 */
export const onExpandToFullSheet = (that, element, e) => {
  const { data } = that.props;
  const { page } = data;
  const { actionBarData } = that.state;

  // 计算展开后的尺寸.
  const elementWidth = page.get('width');
  const elementHeight = page.get('height');

  // 展开元素到指定的位置和宽高.
  expand(that, element, 0, 0, elementWidth, elementHeight);
  that.hideActionBar(that);
};

/**
 * 展开图片到左半页
 */
export const onExpandToLeftPage = (that, element, e) => {
  const { data } = that.props;
  const { page } = data;
  const { actionBarData } = that.state;

  // 计算展开后的尺寸.
  const elementWidth = page.get('width') / 2;
  const elementHeight = page.get('height');

  // 展开元素到指定的位置和宽高.
  expand(that, element, 0, 0, elementWidth, elementHeight);
  that.hideActionBar(that);
};

/**
 * 展开图片到右半页
 */
export const onExpandToRightPage = (that, element, e) => {
  const { data } = that.props;
  const { page } = data;
  const { actionBarData } = that.state;
  // 计算展开后的尺寸.
  const elementWidth = page.get('width') / 2;
  const elementHeight = page.get('height');

  // 展开元素到指定的位置和宽高.
  expand(that, element, page.get('width') / 2, 0, elementWidth, elementHeight);
  that.hideActionBar(that);
};

export const onFilter = (that, element, e) => {
  const { data, actions } = that.props;
  const { images, page, ratio } = data;
  const computed = element.get('computed');
  const { boundPropertyModalActions } = actions;
  const imageDetail = images.get(element.get('encImgId')).toJS();
  const filename = imageDetail.name.split('.')[0];
  boundPropertyModalActions.showPropertyModal({
    isShown: true,
    imgWidth: imageDetail.width,
    imgHeight: imageDetail.height,
    element: element.toJS(),
    ratio: ratio.workspace,
    filename
  });
};

/**
 * 删除图片
 */
export const onRemoveImage = (that, element, e) => {
  const { data, actions } = that.props;
  const { page } = data;
  const { actionBarData } = that.state;
  const { boundProjectActions } = actions;
  if (element.get('type') === elementTypes.photo) {
    if (element.get('encImgId')) {
      boundProjectActions.updateElement({
        id: element.get('id'),
        encImgId: '',
        imageid: '',
        cropLUX: 0,
        cropLUY: 0,
        cropRLX: 0,
        cropRLY: 0,
        imgRot: 0
      });
    } else {
      boundProjectActions.deleteElement(page.get('id'), element.get('id')).then(() => {
        // that.doAutoLayout();
      });
    }
  } else {
    boundProjectActions.deleteElement(page.get('id'), element.get('id'));
  }

  that.hideActionBar(that);
};

/**
 * 上传图片
 */
export const onUploadImage = (that, element, e) => {
  const { data, actions } = that.props;
  const { fileUpload } = that.refs;
  const { actionBarData } = that.state;
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
  that.hideActionBar(that);
};

export const onBringToFront = (that, element, e) => {
  const { data, actions } = that.props;
  const { boundProjectActions } = actions;
  const { elements } = data;
  const nearest = elements.maxBy((item) => {
    return item.get('dep');
  });
  if (nearest) {
    boundProjectActions.updateElement({
      id: element.get('id'),
      dep: nearest.get('dep') + 1
    });
  }
  that.hideActionBar(that);
};

export const onSendToback = (that, element, e) => {
  const { data, actions } = that.props;
  const { boundProjectActions } = actions;
  const { elements } = data;
  const nearest = elements.minBy((item) => {
    return item.get('dep');
  });
  if (nearest) {
    boundProjectActions.updateElement({
      id: element.get('id'),
      dep: nearest.get('dep') - 1
    });
  }
  that.hideActionBar(that);
};

export const onBringForward = (that, element, e) => {
  const { data, actions } = that.props;
  const { elements } = data;
  const { boundProjectActions } = actions;
  // 层级高于当前元素的元素
  const elementsUp = elements.filter((item) => {
    return item.get('dep') > element.get('dep');
  });
  const mixed = findMixed(elementsUp, element);
  const nearest = mixed.minBy((item) => {
    return item.get('dep');
  });
  if (nearest) {
    boundProjectActions.updateElements([{
      id: element.get('id'),
      dep: nearest.get('dep')
    }, {
      id: nearest.get('id'),
      dep: element.get('dep')
    }]);
  }
  that.hideActionBar(that);
};

export const onSendBackward = (that, element, e) => {
  const { data, actions } = that.props;
  const { elements } = data;
  const { boundProjectActions } = actions;
  // 层级低于当前元素的元素
  const elementsDown = elements.filter((item) => {
    return item.get('dep') < element.get('dep');
  });
  const mixed = findMixed(elementsDown, element);
  const nearest = mixed.maxBy((item) => {
    return item.get('dep');
  });
  if (nearest) {
    boundProjectActions.updateElements([{
      id: element.get('id'),
      dep: nearest.get('dep')
    }, {
      id: nearest.get('id'),
      dep: element.get('dep')
    }]);
  }
  that.hideActionBar(that);
};

export const onEditText = (that, element, e) => {
  const { actions, data } = that.props;
  const { page, ratio } = data;
  const { boundTextEditModalActions } = actions;

  const computed = element.get('computed');

  const fontSizePercent = element.get('fontSize');
  const fontSize = fontSizePercent * page.get('height');

  const originalHeight = element.get('height') * ratio.workspace;
  const fontRatio = originalHeight / fontSize;
  const fontSizeInPx = computed.get('height') / fontRatio;
  const copyElement = merge({}, element.toJS(), {
    fontSize: fontSizeInPx / page.get('height')
  });
  boundTextEditModalActions.showTextEditModal({ element: copyElement });
};

export const toggleModal = (that, type, status) => {
  const { actions } = that.props;
  const { boundUploadImagesActions } = actions;
  boundUploadImagesActions.toggleUpload(status);
};

const findMixed = (elements, element) => {
  let mixed = List([]);
  const source = {
    x: element.get('x'),
    y: element.get('y'),
    width: element.get('width'),
    height: element.get('height')
  };
  elements.forEach((item) => {
    const target = {
      x: item.get('x'),
      y: item.get('y'),
      width: item.get('width'),
      height: item.get('height')
    };
    const isCollapsed = collision(source, target);
    if (item.get('id') !== element.get('id') && isCollapsed) {
      mixed = mixed.push(item);
    }
  });
  return mixed;
};
