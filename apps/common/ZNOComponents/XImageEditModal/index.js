import React, { Component, PropTypes } from 'react';
import { merge, template, mapValues, isEqual } from 'lodash';

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { getDefaultCrop } from '../../utils/crop';
import { convertObjIn } from '../../utils/typeConverter';

import XModal from '../XModal';
import XButton from '../XButton';
import XLoading from '../XLoading';

import './index.scss';

const convertCropIn = (cropLUX, cropLUY, cropRLX, cropRLY) => {
  return mapValues({
    x: cropLUX,
    y: cropLUY,
    width: cropRLX - cropLUX,
    height: cropRLY - cropLUY
  }, o => o * 100);
};

const convertCropOut = (x, y, width, height) => {
  return mapValues({
    cropLUX: x,
    cropLUY: y,
    cropRLX: width + x,
    cropRLY: height + y
  }, o => o / 100);
};

const getCropParams = (imageWidth, imageHeight,
  elementWidth, elementHeight) => {
  const cropObj = getDefaultCrop(
    imageWidth, imageHeight,
    elementWidth, elementHeight
  );
  return {
    x: cropObj.px * 100,
    y: cropObj.py * 100,
    width: cropObj.pw * 100,
    height: cropObj.ph * 100
  };
};

const getCropParamsReverse = (imageWidth, imageHeight,
  elementWidth, elementHeight) => {
  return getCropParams(imageHeight, imageWidth, elementWidth, elementHeight);
};

class XImageEditModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imgSrc: '',
      rotate: 0,
      outCrop: null,
      initCrop: {},
      needInitCropOnRotate: false,
      isShowCropComponent: false
    };

    this.onCropChange = this.onCropChange.bind(this);
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const oldEncImgId = this.props.encImgId;
    const oldImgId = this.props.imageId;
    const oldRotation = this.props.rotation;

    const {
      imageEditApiTemplate,
      defaultImageEditParams,
      encImgId,
      imageId,
      rotation,
      crop,
      imageWidth,
      imageHeight,
      elementWidth,
      elementHeight
    } = nextProps;

    if (oldEncImgId !== encImgId || oldImgId !== imageId ||
      oldRotation !== rotation) {
      const newImgSrc = template(imageEditApiTemplate)(
        merge({}, defaultImageEditParams, {
          encImgId: encodeURIComponent(encImgId),
          imageId,
          rotation
        })
      );

      if (newImgSrc !== this.state.imgSrc) {
        this.setState({
          isShowCropComponent: false
        });
      }

      this.setState({
        imgSrc: newImgSrc,
        rotate: rotation,
        needInitCropOnRotate: false
      });
    }

    const oldCrop = this.props.crop;
    if (!isEqual(oldCrop, crop)) {
      let newInitCrop = {
        aspect: elementWidth / elementHeight
      };
      if (crop) {
        newInitCrop = merge({}, newInitCrop, convertCropIn(
          crop.cropLUX,
          crop.cropLUY,
          crop.cropRLX,
          crop.cropRLY
        ));
      }
      this.setState({
        initCrop: newInitCrop,
        outCrop: newInitCrop
      });
    }
  }

  onCropChange(crop, pixelCrop) {
    this.setState({
      outCrop: crop
    });
  }

  onImageLoaded(crop, image, pixelCrop) {
    const { needInitCropOnRotate } = this.state;
    if (needInitCropOnRotate) {
      const {
        imageWidth,
        imageHeight,
        elementWidth,
        elementHeight
      } = this.props;

      const { rotate } = this.state;

      const isPortrait = (Math.abs(rotate) === 90);

      let cropParams = {};

      if (isPortrait) {
        cropParams = getCropParamsReverse(
          imageWidth, imageHeight,
          elementWidth, elementHeight
        );
      } else {
        cropParams = getCropParams(
          imageWidth, imageHeight,
          elementWidth, elementHeight
        );
      }

      const newInitCrop = convertObjIn(merge({}, cropParams, {
        aspect: elementWidth / elementHeight
      }));

      this.setState({
        outCrop: newInitCrop,
        initCrop: newInitCrop
      });
    } else {
      this.setState({
        outCrop: crop
      });
    }
    this.setState({
      isShowCropComponent: true
    });
  }

  onSubmit() {
    const { encImgId, onDoneClick, onCancelClick } = this.props;
    const { outCrop, rotate } = this.state;

    const convertedCrop = convertCropOut(
      outCrop.x, outCrop.y, outCrop.width, outCrop.height
    );

    onDoneClick(encImgId, convertedCrop, rotate);
    onCancelClick();
  }

  rotate(degree) {
    const {
      imageEditApiTemplate,
      defaultImageEditParams,
      encImgId,
      imageId,
    } = this.props;

    const { rotate } = this.state;

    let newRotate = 0;
    if (degree > 0) {
      if (rotate === 180) {
        newRotate = -90;
      } else {
        newRotate = rotate + degree;
      }
    } else {
      if (rotate === -90) {
        newRotate = 180;
      } else {
        newRotate = rotate + degree;
      }
    }

    const newImgSrc = template(imageEditApiTemplate)(
      merge({}, defaultImageEditParams, {
        imageId,
        encImgId: encodeURIComponent(encImgId),
        rotation: newRotate
      })
    );

    this.setState({
      imgSrc: newImgSrc,
      rotate: newRotate,
      needInitCropOnRotate: true,
      isShowCropComponent: false
    });
  }

  render() {
    const {
      isShown,
      imageName,
      onCancelClick
    } = this.props;

    const { imgSrc, initCrop, isShowCropComponent } = this.state;

    return (
      <XModal
        className="image-edit-modal"
        opened={isShown}
        onClosed={onCancelClick}
      >
        <h3 className="modal-title">Set Image</h3>
        <div className="image-name">{imageName}</div>

        <div className="cropper-area">
          <XLoading isShown={!isShowCropComponent} />
          <ReactCrop
            src={imgSrc}
            crop={initCrop}
            onChange={this.onCropChange}
            onImageLoaded={this.onImageLoaded}
          />
        </div>

        <div className="rotate-controls">
          <div className="left-control">
            <button
              className="left-button"
              onClick={this.rotate.bind(this, -90)}
            />
            <p className="description">-90&deg;</p>
          </div>
          <div className="right-control">
            <button
              className="right-button"
              onClick={this.rotate.bind(this, 90)}
            />
            <p className="description">+90&deg;</p>
          </div>
        </div>

        <p className="modal-foot">
          <XButton
            onClicked={this.onSubmit}
          >
            Done
          </XButton>
        </p>
      </XModal>
    );
  }
}

XImageEditModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  imageName: PropTypes.string.isRequired,
  imageEditApiTemplate: PropTypes.string.isRequired,
  encImgId: PropTypes.string.isRequired,
  onDoneClick: PropTypes.func.isRequired,
  imageWidth: PropTypes.number.isRequired,
  imageHeight: PropTypes.number.isRequired,
  elementWidth: PropTypes.number.isRequired,
  elementHeight: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired,
  crop: PropTypes.shape({
    cropLUX: PropTypes.number,
    cropLUY: PropTypes.number,
    cropRLX: PropTypes.number,
    cropRLY: PropTypes.number
  }).isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

XImageEditModal.defaultProps = {
  defaultImageEditParams: {
    px: 0,
    py: 0,
    pw: 1,
    ph: 1,
    width: 480,
    height: 310,
    rotation: 0
  },
  rotation: 0
};


export default XImageEditModal;
