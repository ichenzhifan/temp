import { cameoShapeTypes } from '../../contants/strings';
import { cameo } from '../../contants/material';
import { limitImagesLoading } from '../../contants/strings';

/**
 * 获取天窗背景图的路径
 * @param  {string} cameoShape 天窗的形状.
 */
export const getCameoBackgroundImage = (cameoShape) => {
  let image = '';
  if (cameoShape === cameoShapeTypes.rect) {
    image = cameo.rect;
  } else {
    image = cameo.round;
  }

  return image;
};

export const hideLoading = (that) => {
  that.setState({
    isImgLoading: false
  });
};

export const lazyLoadingImage = (that, imgUrl) => {
  const imagePool = initImagePool(limitImagesLoading);

  that.setState({
    isImgLoading: true
  });

  imagePool.load(imgUrl, {
    success: (src) => {
      that.setState({
        src,
        isImgLoading: false
      });
    },
    error: (src) => {
      that.setState({
        isImgLoading: false
      });
    }
  });
};
