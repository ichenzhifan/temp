import { elementTypes } from '../../../contants/strings';
import { getCropOptions, getCropLRByOptions } from '../../../utils/crop';

const clamp = (n, min, max) => Math.max(Math.min(n, max), min);

export const onResizeStart = (that, e) => {
  that.startResizePosition = {
    x: e.pageX,
    y: e.pageY
  };
};

export const onResize = (that, dir, e, resizeData) => {
  const { elementArray } = that.state;

  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));

  const theElement = selectedElementArray.first();
  const theElementIndex = elementArray.findIndex((o) => {
    return o.get('id') === theElement.get('id');
  });

  const curX = e.pageX;
  const curY = e.pageY;
  const deltaX = curX - that.startResizePosition.x;
  const deltaY = curY - that.startResizePosition.y;

  that.startResizePosition = {
    x: curX,
    y: curY
  };


  const computed = theElement.get('computed');
  const keepRatio = computed.get('keepRatio');
  const width = computed.get('width');
  const height = computed.get('height');
  const x = computed.get('left');
  const y = computed.get('top');
  const ratio = height / width;

  let maxHeight = computed.get('maxHeight');
  let minHeight = computed.get('minHeight');
  let maxWidth = computed.get('maxWidth');
  let minWidth = computed.get('minWidth');

  const needKeepRatio = keepRatio || /[A-Z]/.test(dir); /* 四个角等比缩放 */

  if (needKeepRatio) {
    if (!maxWidth && maxHeight) {
      maxWidth = maxHeight / ratio;
    }
    if (!minWidth && minHeight) {
      minWidth = minHeight / ratio;
    }
    if (!maxHeight && maxWidth) {
      maxHeight = maxWidth * ratio;
    }
    if (!minHeight && minWidth) {
      minHeight = minWidth * ratio;
    }
  }

  let newWidth = width;
  let newHeight = height;
  let newX = x;
  let newY = y;

  if (/right/i.test(dir)) {
    newWidth = width + deltaX;
    const min = (minWidth < 0 || typeof minWidth === 'undefined') ? 0 : minWidth;
    const max = (maxWidth < 0 || typeof maxWidth === 'undefined') ? newWidth : maxWidth;
    newWidth = clamp(newWidth, min, max);
  }

  if (/left/i.test(dir)) {
    newWidth = width - deltaX;
    const min = (minWidth < 0 || typeof minWidth === 'undefined') ? 0 : minWidth;
    const max = (maxWidth < 0 || typeof maxWidth === 'undefined') ? newWidth : maxWidth;
    newWidth = clamp(newWidth, min, max);
  }

  if (/bottom/i.test(dir)) {
    newHeight = height + deltaY;
    const min = (minHeight < 0 || typeof minHeight === 'undefined') ? 0 : minHeight;
    const max = (maxHeight < 0 || typeof maxHeight === 'undefined') ? newHeight : maxHeight;
    newHeight = clamp(newHeight, min, max);
  }

  if (/top/i.test(dir)) {
    newHeight = height - deltaY;
    const min = (minHeight < 0 || typeof minHeight === 'undefined') ? 0 : minHeight;
    const max = (maxHeight < 0 || typeof maxHeight === 'undefined') ? newHeight : maxHeight;
    newHeight = clamp(newHeight, min, max);
  }

  if (needKeepRatio) {
    const deltaWidth = Math.abs(newWidth - width);
    const deltaHeight = Math.abs(newHeight - height);
    if (newHeight === minHeight || deltaWidth < deltaHeight) {
      newWidth = newHeight / ratio;
    } else {
      newHeight = newWidth * ratio;
    }
  }

  if (/left/i.test(dir)) {
    newX = x - (newWidth - width);
  }
  if (/top/i.test(dir)) {
    newY = y - (newHeight - height);
  }

  const newElement = theElement.set('computed', computed.merge({
    width: newWidth,
    height: newHeight,
    left: newX,
    top: newY
  }));

  that.setState({
    elementArray: elementArray.set(theElementIndex, newElement)
  });
};

export const onResizeStop = (that, e) => {
  const { actions } = that.props;
  const { boundProjectActions } = actions;
  const { ratio, page, images } = that.props.data;

  const { elementArray } = that.state;
  const selectedElementArray = elementArray.filter(o => o.get('isSelected'));

  const updateObjectArray = [];

  if (selectedElementArray.size) {
    selectedElementArray.forEach((element) => {
      const computed = element.get('computed');
      const width = computed.get('width') / ratio.workspace;
      const height = computed.get('height') / ratio.workspace;
      const x = computed.get('left') / ratio.workspace;
      const y = computed.get('top') / ratio.workspace;

      const updateObject = {
        id: element.get('id'),
        x,
        y,
        width,
        height,
        px: x / page.get('width'),
        py: y / page.get('height'),
        pw: width / page.get('width'),
        ph: height / page.get('height')
      };

      if (element.get('type') === elementTypes.photo) {
        const imageDetail = images.get(element.get('encImgId'));
        if (imageDetail) {
          const options = getCropOptions(
            imageDetail.get('width'), imageDetail.get('height'),
            computed.get('width'), computed.get('height'), element.get('imgRot')
          );
          const { px, py, pw, ph } = options;
          const lrOptions = getCropLRByOptions(px, py, pw, ph);
          const { cropLUX, cropLUY, cropRLX, cropRLY } = lrOptions;
          updateObject.cropLUX = cropLUX;
          updateObject.cropLUY = cropLUY;
          updateObject.cropRLX = cropRLX;
          updateObject.cropRLY = cropRLY;
        }
      }

      updateObjectArray.push(updateObject);
    });
  }

  boundProjectActions.updateElements(updateObjectArray);
};
