import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import { merge, get } from 'lodash';

import projectParser from '../../../../common/utils/projectParser';
import { addEventListener, removeEventListener } from '../../../../common/utils/events';
import { getScale } from '../../utils/scale';

import { cameoShapeTypes, cameoPaddings, cameoSizeTypes, coverTypes, productTypes } from '../../contants/strings';
import { configurableOptionArray, allOptionMap, variableArray } from '../../reducers/project/projectReducer';

// 导入处理函数
import * as cameoHandler from './handler/cameo';
import * as loadingHandler from './handler/loading';

// 导入组件
import Element from '../Element';
import XLoading from '../../../../common/ZNOComponents/XLoading';
import CameoActionBar from '../CameoActionBar';
import XWarnTip from '../../../../common/ZNOComponents/XWarnTip';

import './index.scss';

const WARNTIP_LEFT = 10;
const WARNTIP_BOTTOM = 10;
const FULL_ACTION_BAR_WIDTH = 450;

class CameoElement extends Component {
  constructor(props) {
    super(props);

    const { data } = this.props;
    this.state = {
      isShowActionBar: data.isPreview ? false : false,
      src: '',
      isImgLoading: false,
      width: 0,
      height: 0,
      resizeLimit: 50
    };

    this.getCameoBackgroundImage = cameoShape => cameoHandler.getCameoBackgroundImage(cameoShape);

    // action bar的处理函数
    this.actionBarHandler = {
      onCrop: (event)=> cameoHandler.onCrop(this, event),
      onRotate: (event)=> cameoHandler.onRotate(this, event),
      onFlip: (event)=> cameoHandler.onFlip(this, event),
      onRect: (event)=> cameoHandler.onRect(this, event),
      onRound: (event)=> cameoHandler.onRound(this, event),
      onSmall: (event)=> cameoHandler.onSmall(this, event),
      onMedium: (event)=> cameoHandler.onMedium(this, event),
      onLarge: (event)=> cameoHandler.onLarge(this, event),
      onClear: (event)=> cameoHandler.onClear(this, event)
    };

    this.onDrop = (event) => cameoHandler.onDrop(this, event);
    this.handleDragOver = (event) => cameoHandler.handleDragOver(this, event);
    this.getOffset = (el) => cameoHandler.getOffset(el);

    // show or hide action bar
    this.showActionBar = (event) => cameoHandler.showActionBar(this, event);
    this.hideActionBar = (event) => cameoHandler.hideActionBar(this, event);
    this.toggleActionBar = (element, event) => cameoHandler.toggleActionBar(this, element, event);

    this.isInTypes = (type, availTypes) => cameoHandler.isInTypes(type, availTypes);

    // 隐藏loading
    this.hideLoading = () => loadingHandler.hide(this);
    this.checkLoading = () => loadingHandler.check(this);
    this.checkByNextProps = (props) => loadingHandler.checkByNextProps(this, props);
    this.lazyLoadingImage = (imgUrl) => loadingHandler.lazyLoadingImage(this, imgUrl);
    this.handleCameoImageLoaded = () => cameoHandler.handleCameoImageLoaded(this);
  }

  componentDidMount() {
    // 检查是否要显示img的loading
    this.checkLoading();

    addEventListener(window, 'click', this.hideActionBar);
  }

  componentWillReceiveProps(nextProps) {
    this.checkByNextProps(nextProps);

    // 懒加载图片.
    const oldElement = this.props.data.element;
    const newElement = nextProps.data.element;

    const oldImgUrl = oldElement.getIn(['computed', 'imgUrl']);
    const newImgUrl = newElement.getIn(['computed', 'imgUrl']);
    if(oldImgUrl !== newImgUrl && newImgUrl){
      this.lazyLoadingImage(newImgUrl);
    } else if (!newImgUrl) {
      this.setState({
        src: ''
      });
    }
  }

  componentWillMount() {
    const element = this.props.data.element;
    const imgUrl = element.getIn(['computed', 'imgUrl']);
    if (imgUrl) {
      this.lazyLoadingImage(imgUrl);
    }
  }

  componentWillUnmount() {
    removeEventListener(window, 'click', this.hideActionBar);
  }

  render() {
    const { t, actions, data } = this.props;
    const { summary, element, ratio, page, setting, parameters, isPreview, paginationSpread } = data;
    const { width, height } = this.state;

    const images = paginationSpread.get('images');
    const imageDetail = images.get(element.get('encImgId'));

    const availableOptionMap = projectParser.getAvailableOptionMap(setting, configurableOptionArray, allOptionMap);
    const availCameoShapeTypes = availableOptionMap.cameoShape;
    const availCameoSizeTypes = availableOptionMap.cameo;

    // 封面容器的位置
    const containerPosition = this.getOffset(document.querySelector('.cover-sheet'));

    const cameoShape = summary.get('cameoShape');

    // 获取天窗的出血.
    const cameoBleed = parameters.get('cameoBleed');
    const cameoBleedByComputed = {
      top: cameoBleed.get('top') * ratio.workspace,
      right: cameoBleed.get('right') * ratio.workspace,
      bottom: cameoBleed.get('bottom') * ratio.workspace,
      left: cameoBleed.get('left') * ratio.workspace
    };

    // 天窗的大小(包含出血部分)
    const cameoSize = {
      width: element.get('pw') * page.get('width') * ratio.workspace,
      height: element.get('ph') * page.get('height') * ratio.workspace
    };

    // 天窗的偏移量.
    const cameoPosition = {
      left: element.get('px') * page.get('width') * ratio.workspace,
      top: element.get('py') * page.get('height') * ratio.workspace
    };

    const cameoSizeWithoutBleed = {
      width: (cameoSize.width - (cameoBleedByComputed.left + cameoBleedByComputed.right)),
      height: (cameoSize.height - (cameoBleedByComputed.top + cameoBleedByComputed.bottom))
    };

    const cameoEffectPaddings = {
      left: cameoSizeWithoutBleed.width * ratio.cameoLeft,
      top: cameoSizeWithoutBleed.width * ratio.cameoTop,
      right: cameoSizeWithoutBleed.width * ratio.cameoLeft,
      bottom:cameoSizeWithoutBleed.width * ratio.cameoTop
    };

    const wrapStyle = {
      width: cameoSize.width + 'px',
      height: cameoSize.height + 'px',
      top: cameoPosition.top + 'px',
      left: cameoPosition.left + 'px'
    };

    // cameo-item
    const itemStyle = {
      top: cameoBleedByComputed.top + 'px',
      left: cameoBleedByComputed.left + 'px',
      width: cameoSizeWithoutBleed.width + 'px',
      height: cameoSizeWithoutBleed.height + 'px',
      borderRadius: cameoShape === cameoShapeTypes.rect ? 0 : `${cameoSizeWithoutBleed.width / 2}px/${cameoSizeWithoutBleed.height / 2}px`
    };
    const cameWithBleedStyle = {
      top: -cameoBleedByComputed.top + 'px',
      left: -cameoBleedByComputed.left + 'px',
      width: cameoSize.width + 'px',
      height: cameoSize.height + 'px'
    };

    // cameo-effect
    const renderStyle = {
      top: (cameoBleedByComputed.top - cameoEffectPaddings.top) + 'px',
      left: (cameoBleedByComputed.left - cameoEffectPaddings.left) + 'px',
      height: (cameoSizeWithoutBleed.height + cameoEffectPaddings.top + cameoEffectPaddings.bottom) + 'px',
      width: (cameoSizeWithoutBleed.width + cameoEffectPaddings.left + cameoEffectPaddings.right) + 'px'
    };

    const handlerStyle = {
      top: cameoBleedByComputed.top + 'px',
      left: cameoBleedByComputed.left + 'px',
      width: cameoSizeWithoutBleed.width + 'px',
      height: cameoSizeWithoutBleed.height + 'px'
    };

    let scale = 0;
    // 计算图片缩放比
    if (imageDetail) {
      scale = getScale({
        imgRot: element.get('imgRot'),
        imageDetail,
        width: element.get('width'),
        height: element.get('height'),
        cropLUX: element.get('cropLUX'),
        cropRLX: element.get('cropRLX'),
        cropRLY: element.get('cropRLY'),
        cropLUY: element.get('cropLUY')
      });
    }

    let rectDisable =  !this.isInTypes(cameoShapeTypes.rect, availCameoShapeTypes);
    let roundDisable = !this.isInTypes(cameoShapeTypes.round, availCameoShapeTypes) && !this.isInTypes(cameoShapeTypes.oval, availCameoShapeTypes);
    let sDisable = !this.isInTypes(cameoSizeTypes.small, availCameoSizeTypes);
    let mDisable = !this.isInTypes(cameoSizeTypes.middle, availCameoSizeTypes);
    let lDisable = !this.isInTypes(cameoSizeTypes.large, availCameoSizeTypes);
    let removeDisable = false;

    // 如果为PressBook，且Cover为Linen cover和Leatherette自动添加天窗
    if (get(setting,'product') === productTypes.PS && [coverTypes.PSNC, coverTypes.PSLC].indexOf(get(setting,'cover'))>=0) {
      rectDisable = roundDisable = sDisable = mDisable = lDisable = removeDisable = true;
    }

    // 根据disable的button数计算需要减去的宽度
    const removeWidth = (+rectDisable + +roundDisable + +sDisable + +mDisable + +lDisable + +removeDisable) * 50;

    const cameoImg = element.getIn(['computed', 'imgUrl']);
    const hasImage = !!element.get('encImgId');

    // 天窗的actionbar
    const cameoActionBarStyle = {
      display: this.state.isShowActionBar ? 'block' : 'none',
      position: 'fixed',
      top: `${cameoPosition.top + containerPosition.top + cameoSize.height}px`,
      width: FULL_ACTION_BAR_WIDTH - removeWidth + 'px',
      left: `${cameoPosition.left + containerPosition.left + (cameoSize.width - FULL_ACTION_BAR_WIDTH + removeWidth) / 2}px`
    };

    const cameoActionBarActions = this.actionBarHandler;

    const cameoActionBarData = {
      style: cameoActionBarStyle,
      highlightIcons:{
        // todo
        largeHightlight: setting.cameo === cameoSizeTypes.large || false,
        mediumHightlight: setting.cameo === cameoSizeTypes.middle || false,
        smallHightlight: setting.cameo === cameoSizeTypes.small || false,
        rectHightlight: setting.cameoShape === cameoShapeTypes.rect || false,
        roundHightlight: setting.cameoShape === cameoShapeTypes.round || setting.cameoShape === cameoShapeTypes.oval || false
      },
      roundLabel: this.isInTypes(cameoShapeTypes.round, availCameoShapeTypes) ? cameoShapeTypes.round : cameoShapeTypes.oval,
      disabledIcons: {
        cropDisable: !hasImage,
        rotateDisable: !hasImage,
        flipDisable: !hasImage,
        rectDisable,
        roundDisable,
        sDisable,
        mDisable,
        lDisable,
        removeDisable
      }
    };

    // element
    const elementActions = {
      handleClick: this.toggleActionBar,
      handleDrop: this.onDrop,
      handleDragOver: this.handleDragOver
    };
    const elementData = merge({}, data, { className: 'cameo-element', style: cameWithBleedStyle, handlerStyle });

    // 图片警告图标.
    const warntipStyle = {
      left: `${WARNTIP_LEFT}px`,
      bottom: `${WARNTIP_BOTTOM}px`,
    };

    return (
      <div className="cameo-wrap absolute" style={wrapStyle}>
        <div className="cameo-effect absolute" style={renderStyle}>
          <img className="effect-img" src={this.getCameoBackgroundImage(summary.get('cameoShape'))} />
        </div>
        <div className="cameo-item absolute" style={itemStyle}>
          {
            (isPreview || hasImage) ? null : (
              <div className="tip absolute" data-html2canvas-ignore="true">{ t('DRAG_AND_DROP_TIP')}</div>
            )
          }

          <div className="cameo-item-with-bleed absolute" style={cameWithBleedStyle}>
            <Element actions={elementActions} data={elementData}>
              <div>
                <div className="layer-image">
                  <XLoading isShown={this.state.isImgLoading} />
                </div>

                {
                 this.state.src
                 ? (
                   <img
                     className="cameo-img"
                     src={this.state.src}
                     onLoad={this.handleCameoImageLoaded}
                     onError={this.hideLoading}
                   />
                  )
                 : null
                }

                {
                  isPreview
                  ? null
                  : (
                    <XWarnTip
                      scale={scale}
                      ratio={ratio}
                      style={warntipStyle}
                      limit={this.state.resizeLimit}
                    />
                  )
                }
              </div>
            </Element>
          </div>
        </div>

        {/* 天窗的action bar */}
        <CameoActionBar actions={cameoActionBarActions} data={cameoActionBarData}/>
      </div>
    );
  }
}

CameoElement.propTypes = {
};

CameoElement.defaultProps = {
};

export default translate('CameoElement')(CameoElement);

