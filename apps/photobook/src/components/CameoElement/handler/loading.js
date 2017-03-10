import Immutable from 'immutable';
import { merge } from 'lodash';

import { computedCameoElementOptions } from '../../../utils/cameo';
import { getCropOptions, getCropLRByOptions } from '../../../utils/crop';
import { limitImagesLoading } from '../../../contants/strings';
/**
 * 检测是否要显示loading
 */
export const check = (that, nextProps) => {
  const {data} = that.props;
  const { element } = data;
  const cameoImg = element.getIn(['computed', 'imgUrl']);
  const hasImage = !!element.get('encImgId');
  that.setState({
    isImgLoading: hasImage
  });
};

/**
 * 隐藏loading
 */
export const hide = that => {
  that.setState({
    isImgLoading: false
  });
};

export const checkByNextProps = (that, nextProps) => {
  const oldImgUrl = that.props.data.element.getIn(['computed', 'imgUrl']);
  const newImgUrl = nextProps.data.element.getIn(['computed', 'imgUrl']);
  const oldParameters = that.props.data.parameters;
  const newParameters = nextProps.data.parameters;
  const oldCameoActionBarShow = that.props.data.isCameoActionBarShow;
  const newCameoActionBarShow = nextProps.data.isCameoActionBarShow;
  if (oldImgUrl !== newImgUrl) {
    if (!newImgUrl) {
      return;
    }

    // 显示loading
    that.setState({
      isImgLoading: true
    });
  }

  // 添加显示actionbar
  if (oldCameoActionBarShow !== newCameoActionBarShow) {
    if (newCameoActionBarShow) {
      that.setState({
        isShowActionBar: true
      });
      // 重置状态
      nextProps.actions.hideCameoActionBar();
    }
  }

  if (!Immutable.is(oldParameters, newParameters)) {
    const { data, actions } = nextProps;
    const { paginationSpread, element, ratio, size, page } = data;
    const { boundProjectActions } = actions;

    const images = paginationSpread.get('images');
    const imageDetail = images.get(element.get('encImgId'));

    const cameoSize = newParameters.get('cameoSize');
    const cameoBleed = newParameters.get('cameoBleed');

    // 天窗的尺寸: 基础宽高加上出血.
    const width = cameoSize.get('width') + cameoBleed.get('left') + cameoBleed.get('right');
    const height = cameoSize.get('height') + cameoBleed.get('top') + cameoBleed.get('top');

    // 计算新的天窗的基本属性: { x, y, px, py, pw, ph }
    const options = computedCameoElementOptions(size.coverSpreadSize, cameoSize, cameoBleed, size.spineSize);

    if (imageDetail) {
      const elementWidth = width * ratio.workspace;
      const elementHeight = height * ratio.workspace;

      const cropOptions = getCropOptions(imageDetail.get('width'), imageDetail.get('height'), elementWidth, elementHeight, element.get('imgRot'));
      const { cropLUX, cropLUY, cropRLX, cropRLY } = cropOptions;

      boundProjectActions.updateElement(merge({}, options, {
        id: element.get('id'),
        cropLUX,
        cropLUY,
        cropRLX,
        cropRLY,
        width,
        height
      }));
    } else {
      boundProjectActions.updateElement(merge({}, options, {
        id: element.get('id'),
        width,
        height
      }));
    }
  }
};

export const lazyLoadingImage = (that, imgUrl) => {
  const imagePool = initImagePool(limitImagesLoading);

  that.setState({
    isImgLoading: true
  });
  imagePool.load(imgUrl, {
    success: src => {
      that.setState({
        src,
        isImgLoading: false
      });
    },
    error: src => {
      that.setState({
        isImgLoading: false
      });
    }
  });
};
