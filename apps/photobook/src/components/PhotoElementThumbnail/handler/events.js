import Immutable from 'immutable';
import { loadImgWithBase64 } from '../../../utils/image';
import { limitImagesLoading } from '../../../contants/strings';

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

export const componentWillReceiveProps = (that, nextProps) => {
  const oldImgUrl = that.props.data.element.getIn(['computed', 'imgUrl']);
  const newImgUrl = nextProps.data.element.getIn(['computed', 'imgUrl']);
  if (oldImgUrl !== newImgUrl) {
    lazyLoadingImage(that, newImgUrl);
  }
};
