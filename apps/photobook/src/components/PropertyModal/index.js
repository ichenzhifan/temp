import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import { isEqual, merge, template } from 'lodash';
import { translate } from 'react-translate';

import { getCropOptions, getCropLRByOptions, getCropOptionsByLR } from '../../utils/crop';
import { getDefaultCrop } from '../../../../common/utils/crop';

import XModal from '../../../../common/ZNOComponents/XModal';
import XSlider from '../../../../common/ZNOComponents/XSlider';
import XButton from '../../../../common/ZNOComponents/XButton';
import XLoading from '../../../../common/ZNOComponents/XLoading';

import * as handler from './handler.js';

import './index.scss';

// 最小宽高
const MIN_PHOTO_HEIGHT = 180;
const MIN_PHOTO_WIDTH = 180;

// 缩略图最大宽高
const THUMB_WIDTH = 150;
const THUMB_HEIGHT = 150;

let opacityTimer = null;
let effectTimer = null;

class PropertyModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lockDimension: false,
      element: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      filterMap: {
        no: 0,
        bw: 1,
        sepia: 2,
        mono: 3,
        paint: 4,
        spread: 5
      },
      opacity: 100,
      effectId: 0,
      isImgLoading: false,
      showOpacity: false,
      thumbnail: {
        width: THUMB_WIDTH,
        height: THUMB_HEIGHT
      }
    }

    this.toggleLockDimension = this.toggleLockDimension.bind(this);
    this.opacityChange = this.opacityChange.bind(this);
    this.widthInput = this.widthInput.bind(this);
    this.heightInput = this.heightInput.bind(this);
    this.xInput = this.xInput.bind(this);
    this.yInput = this.yInput.bind(this);
    this.opacityInput = this.opacityInput.bind(this);
    this.handlePropertyModalClose = this.handlePropertyModalClose.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleDoneClick = this.handleDoneClick.bind(this);
    this.handleBeforeChange = this.handleBeforeChange.bind(this);
    this.handleAfterChange = this.handleAfterChange.bind(this);
    this.getImage = this.getImage.bind(this);

    this.hideLoading = ()=>{
      this.setState({
        isImgLoading: false
      });
    };

    this.onImageLoaded = this.onImageLoaded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.propertyModal.isShown, nextProps.propertyModal.isShown) && nextProps.propertyModal.isShown) {
      const { propertyModal } = nextProps;
      let { element } = propertyModal;
      if (!element.style) {
        element.style = {
          opacity: 100,
          effectId: 0
        };
      }
      this.setState({
        element,
        opacity: element.style.opacity,
        effectId: element.style.effectId
      });
      const oldUrl = this.props.propertyModal.element ? this.props.propertyModal.element.computed.imgUrl : null;
      const currentUrl = nextProps.propertyModal.element.computed.imgUrl;
      if (oldUrl === currentUrl) {
        this.setState({
          isImgLoading: false
        });
      }
    }
  }

  onImageLoaded(event){
    this.hideLoading();

    let width = event.target.naturalWidth;
    let height = event.target.naturalHeight;

    if(width >= height){
      if(width < THUMB_WIDTH){
        height = (THUMB_WIDTH * height) / width;
        width = THUMB_WIDTH;
      }
    }else{
      if(height < THUMB_HEIGHT){
        width = (THUMB_HEIGHT * width) / height;
        height = THUMB_HEIGHT;
      }
    }

    this.setState({
      thumbnail: {width, height}
    });
  }

  toggleLockDimension(event) {
    this.setState({
      lockDimension: !this.state.lockDimension
    });
    event.preventDefault();
    event.stopPropagation();
  }

  opacityChange(opacity) {
    this.setState({
      opacity: opacity
    });
    if (opacityTimer) {
      clearTimeout(opacityTimer);
    }
    opacityTimer = setTimeout(() => {
      this.setState({
        element: merge({}, this.state.element, {
          style: merge({}, this.state.element.style, {
            opacity: opacity
          })
        }),
        isImgLoading: true
      });
    }, 500);
  }

  widthInput(event) {
    const { propertyModal } = this.props;
    const { element } = this.state;
    const { encImgId, imgRot } = element;
    const r = propertyModal.ratio;
    let options;
    let width = parseFloat(event.target.value);
    if (width<MIN_PHOTO_WIDTH) {
      width = MIN_PHOTO_WIDTH;
    }
    width *= r;
    const image = this.getImage(encImgId);
    if (this.state.lockDimension) {
      const ratio = width / this.state.element.width;
      const height = this.state.element.height * ratio;
      options = getCropOptions(image.get('width'), image.get('height'), width, height, imgRot);
      this.setState({
        element: merge({}, this.state.element, {
          width : width / r,
          height: height / r,
          cropLUX: options.cropLUX,
          cropLUY: options.cropLUY,
          cropRLX: options.cropRLX,
          cropRLY: options.cropRLY,
          computed: merge({}, this.state.element.computed, {
            width,
            height
          })
        })
      });
    } else {
      options = getCropOptions(image.get('width'), image.get('height'), width, this.state.element.computed.height, imgRot);
      this.setState({
        element: merge({}, this.state.element, {
          width : width / r,
          cropLUX: options.cropLUX,
          cropLUY: options.cropLUY,
          cropRLX: options.cropRLX,
          cropRLY: options.cropRLY,
          computed: merge({}, this.state.element.computed, {
            width
          })
        })
      });
    }
  }

  heightInput(event) {
    const { propertyModal } = this.props;
    const { element } = this.state;
    const { encImgId, imgRot } = element;
    const r = propertyModal.ratio;
    let options;
    let height = parseFloat(event.target.value);
    if (height<=MIN_PHOTO_HEIGHT) {
      height = MIN_PHOTO_HEIGHT;
    }
    height *= r;
    const image = this.getImage(encImgId);
    if (this.state.lockDimension) {
      const ratio = height / this.state.element.height;
      const width = this.state.element.width * ratio;
      options = getCropOptions(image.get('width'), image.get('height'), width, height, imgRot);
      this.setState({
        element: merge({}, this.state.element, {
          width : width / r,
          height: height / r,
          cropLUX: options.cropLUX,
          cropLUY: options.cropLUY,
          cropRLX: options.cropRLX,
          cropRLY: options.cropRLY,
          computed: merge({}, this.state.element.computed, {
            width,
            height
          })
        })
      });
    } else {
      options = getCropOptions(image.get('width'), image.get('height'), this.state.element.computed.width, height, imgRot);
      this.setState({
        element: merge({}, this.state.element, {
          height: height / r,
          cropLUX: options.cropLUX,
          cropLUY: options.cropLUY,
          cropRLX: options.cropRLX,
          cropRLY: options.cropRLY,
          computed: merge({}, this.state.element.computed, {
            height
          })
        })
      });
    }
  }

  xInput(event) {
    const x = parseFloat(event.target.value);
    this.setState({
      element: merge({}, this.state.element, {
        x
      })
    });
  }

  yInput(event) {
    const y = parseFloat(event.target.value);
    this.setState({
      element: merge({}, this.state.element, {
        y
      })
    });
  }

  opacityInput(event) {
    let opacity = parseFloat(event.target.value);
    if (opacity<=0) {
      opacity = 0;
    } else if(opacity>=100) {
      opacity = 100;
    }
    this.opacityChange(opacity);
  }

  changeFilter(filterTag) {
    this.setState({
      element: merge({}, this.state.element, {
        style: merge({}, this.state.element.style, {
          effectId: this.state.filterMap[filterTag]
        })
      }),
      isImgLoading: true
    });
  }

  handlePropertyModalClose() {
    const { closePropertyModal } = this.props;
    closePropertyModal();
  }

  handleCancelClick() {
    this.handlePropertyModalClose();
  }

  handleDoneClick() {
    const { propertyModal, boundProjectActions, page } = this.props;
    const { id, imgWidth, imgHeight, ratio } = propertyModal;
    const pageWidth = page.get('width');
    const pageHeight = page.get('height');
    const { element } = this.state;
    const { imgRot, computed, x, y } = element;
    const { width, height } = computed
    const computedElementWidth = width / ratio;
    const computedElementHeight = height / ratio;

    let elementProps = merge({}, element, {
      px: x / pageWidth,
      py: y / pageHeight,
      pw: computedElementWidth / pageWidth,
      ph: computedElementHeight / pageHeight
    });

    boundProjectActions.updateElement(elementProps);
    this.handlePropertyModalClose();
  }

  handleBeforeChange() {
    this.setState({
      showOpacity: true
    });
  }

  handleAfterChange() {
    this.setState({
      showOpacity: false
    });
  }

  getImage(encImgId) {
    const { allImages} = this.props;
    return allImages.find(image => {
      return image.get('encImgId') === encImgId;
    });
  }

  render() {
    const { propertyModal, allImages, t } = this.props;
    const { isShown, filename, imgWidth, imgHeight, ratio } = propertyModal;
    const { element } = this.state;
    let { x, y, computed, imgRot, encImgId, imgFlip, cropRLX, cropRLY, cropLUY, cropLUX } = element;
    let { width, height } = computed || {};

    const elementWidth = element.width;
    const elementHeight = element.height;

    const cropOptions = getCropOptionsByLR(cropLUX, cropLUY,cropRLX, cropRLY, width, height, 150);

    const opacity = element.style ? element.style.opacity : 100;
    const effectId = element.style ? element.style.effectId : 0;
    const dimensionClass = classNames('', {
      'unlock': !this.state.lockDimension
    });

    const imageDetail =  allImages.find(image => {
      return image.get('encImgId') === encImgId;
    });

    const imgUrl = element.computed ? template(element.computed.filterApiTemplate)({
      px: cropOptions.px,
      py: cropOptions.py,
      pw: cropOptions.pw,
      ph: cropOptions.ph,
      encImgId,
      effectId,
      opacity,
      imgFlip,
      width: cropOptions.width,
      height: cropOptions.height,
      rotation: imgRot,
      shape: 'rect',
    }) : "";
    const { isImgLoading } = this.state;
    let showOpacityStyle = {
      left: 170 * this.state.opacity / 100 + 52 + 'px',
      display: this.state.showOpacity ? 'block' : 'none'
    };

    const imgStyle = {
      width: this.state.thumbnail.width + 'px',
      height: this.state.thumbnail.height + 'px'
    };

    return (
      <XModal
        className="property-modal"
        onClosed={this.handlePropertyModalClose}
        opened={isShown}
      >
        <h2 className="modal-title">Properties</h2>
        <h3 className="sub-title">{filename}</h3>
        <div className="modal-content">
          <div className="info-container">
            <div className="img">
              <XLoading isShown={isImgLoading} />
              <a>
                <img style={imgStyle}
                  src={imgUrl}
                  onLoad={this.onImageLoaded}
                  onError={this.hideLoading} />
              </a>
            </div>
            <div className="params">
              <ul>
                <li>
                  <label htmlFor="x">{t('X')}</label>
                  <input type="number" id="x" value={Math.round(x)} onChange={this.xInput} />
                </li>
                <li>
                  <label htmlFor="w">{t('W')}</label>
                  <input type="number" id="w"  value={Math.round(elementWidth)} onChange={this.widthInput} />
                </li>
                <li>
                  <label htmlFor="y">{t('Y')}</label>
                  <input type="number" id="y"  value={Math.round(y)} onChange={this.yInput} />
                </li>
                <li>
                  <label htmlFor="h">{t('H')}</label>
                  <input type="number" id="h"  value={Math.round(elementHeight)} onChange={this.heightInput} />
                </li>
              </ul>
              <div className="lock-dimension">
                <a href="javascript:void(0);" className={dimensionClass} onClick={this.toggleLockDimension}></a>
              </div>
            </div>
          </div>
          <div className="clear"></div>
          <div className="filter-container">
            <h3>{t('FILTER')}</h3>
            <ul className="filter-content">
              <li>
                <input type="radio" name="filter" id="f1" checked={effectId===0?true:false} onClick={this.changeFilter.bind(this, 'no')} /> <label htmlFor="f1">No Filter</label>
              </li>
              <li>
                <input type="radio" name="filter" id="f2" checked={effectId===1?true:false} onClick={this.changeFilter.bind(this, 'bw')} /> <label htmlFor="f2">Black & White</label>
              </li>
              <li>
                <input type="radio" name="filter" id="f3" checked={effectId===2?true:false}  onClick={this.changeFilter.bind(this, 'sepia')} /> <label htmlFor="f3">Sepia</label>
              </li>

              {/* TODO: 后台出图模糊. 暂时先屏蔽.
                <li>
                  <input type="radio" name="filter" id="f4" checked={effectId===3?true:false} onClick={this.changeFilter.bind(this, 'mono')} /> <label htmlFor="f4">Mono Chrome</label>
                </li>
                <li>
                  <input type="radio" name="filter" id="f5" checked={effectId===4?true:false} onClick={this.changeFilter.bind(this, 'paint')} /> <label htmlFor="f5">Paint</label>
                </li>
                <li>
                  <input type="radio" name="filter" id="f6" checked={effectId===5?true:false} onClick={this.changeFilter.bind(this, 'spread')} /> <label htmlFor="f6">Spread</label>
                </li>
              */}
            </ul>
          </div>
          <div className="balence-container">
            <h3>{t('BALANCE')}</h3>
            <div className="balence-content">
              <label>{t('OPACITY')}</label>
              <XSlider
                value={this.state.opacity}
                min={0}
                max={100}
                step={1}
                handleSliderChange={this.opacityChange}
                handleAfterChange={this.handleAfterChange}
                handleBeforeChange={this.handleBeforeChange}
              />
              <input type='number' value={`${this.state.opacity}`} onChange={this.opacityInput} />
              <div className="show-opacity" style={showOpacityStyle}>{`${this.state.opacity}%`}</div>
            </div>
          </div>
          <div className="button-container">
              <XButton
                className="white"
                onClicked={this.handleCancelClick}
              >{t('CANCEL')}</XButton>
              <XButton
                onClicked={this.handleDoneClick}
              >{t('DONE')}</XButton>
          </div>
        </div>
      </XModal>
    );
  }
}

PropertyModal.proptype = {
  isShown: PropTypes.bool
}

export default translate('PropertyModal')(PropertyModal);
