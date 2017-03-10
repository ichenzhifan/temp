import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import { translate } from 'react-translate';
import { merge, get } from 'lodash';
import classNames from 'classnames';

// 导入组件
import XLoading from '../../../../common/ZNOComponents/XLoading';
import XWarnTip from '../../../../common/ZNOComponents/XWarnTip';
import Element from '../Element';

import { loadImgWithBase64 } from '../../utils/image';

// 导入处理函数
import * as events from './handler/events';
import * as handler from './handler';

const WARNTIP_LEFT = 8;
const WARNTIP_BOTTOM = 8;

import './index.scss';

class PhotoElement extends Component {
  constructor(props) {
    super(props);

    // 处理函数
    this.handleDragOver = (event) => handler.handleDragOver(this, event);
    this.onDrop = (event) => handler.onDrop(this, event);
    this.toggleActionBar = (data, event) => handler.toggleActionBar(this, data, event);

    // 内部state
    this.state = {
      isImgLoading: false,
      src: null,
      isShowActionBar: true,
      resizeLimit: 50
    };

    this.hideLoading = ()=>{
      this.setState({
        isImgLoading: false
      });
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(Immutable.is(this.props.data.element, nextProps.data.element) &&
      this.state.isImgLoading === nextState.isImgLoading &&
      this.state.img === nextState.img &&
      this.state.src === nextState.src){
      return false;
    }

    return true;
  }

  componentWillReceiveProps(nextProps) {
    events.componentWillReceiveProps(this, nextProps);
  }

  componentWillMount() {
    const { data } = this.props;
    const { element } = data;
    const imgUrl = element.getIn(['computed', 'imgUrl']);

    if(imgUrl){
      events.lazyLoadingImage(this, imgUrl);
    }
  }

  render() {

    const { t, actions, data } = this.props;
    const { doSnipping } = actions;
    const { element, ratio, page, isPreview, isCover } = data;
    const pageWidth = page.get('width') * ratio.workspace;
    const pageHeight = page.get('height') * ratio.workspace;
    const bleedLeft = page.getIn(['bleed', 'left']) * ratio.workspace;
    const bleedTop = page.getIn(['bleed', 'top']) * ratio.workspace;
    const computed = element.get('computed');
    const imgUrl = element.getIn(['computed', 'imgUrl']);
    const scale = element.getIn(['computed', 'scale']);

    // element 容器的样式.
    const containerBorder = (!!imgUrl || element.get('isSelected')) ? 'none' : '1px solid #dfdfdf';

    let left = computed.get('left');
    let top = computed.get('top');
    let width = computed.get('width');
    let height = computed.get('height');

    const containerStyle = {
      zIndex: element.get('dep') + 100,
      width: width,
      height: height,
      left: left,
      top: top,
      transform: `rotate(${element.get('rot')}deg)`,
      boxSizing: 'border-box',
      border: containerBorder
    };
    const handlerStyle = {
      position: 'absolute',
      width: computed.get('width') + 'px',
      height: computed.get('height') + 'px',
      top: 0,
      left: 0
    };
    const imgOpacity = (!!imgUrl) ? 1 : 0;
    const imgStyle = merge({}, handlerStyle, { opacity: imgOpacity });
    const layerImageStyle = {
       width: computed.get('width') + 'px',
       height: computed.get('height') + 'px'
    };

    // element
    const elementActions = merge({}, actions, {
      handleDrop: this.onDrop,
      handleClick: this.toggleActionBar,
      handleDragOver: this.handleDragOver
    });

    const elementData = merge({}, data, {
      className: classNames('photo-element', {
        'has-image': !!imgUrl,
        selected: element.get('isSelected')
      }),
      style: containerStyle,
      handlerStyle,
      pageWidth,
      pageHeight
    });

    const { isImgLoading, src } = this.state;
    // warntip 边缘检测
    //left
    let warntipLeft = WARNTIP_LEFT;
    let warntipBottom = WARNTIP_BOTTOM;
    if (computed.get('left') < bleedLeft) {
      warntipLeft -= computed.get('left') - bleedLeft;
    }
    // top
    if (computed.get('top') + computed.get('height') < bleedTop + 15) {
      warntipBottom = -(WARNTIP_BOTTOM + bleedTop);
    }
    // right
    if (computed.get('left') > pageWidth - bleedLeft - 15) {
      warntipLeft = -(WARNTIP_BOTTOM + bleedLeft);
    }
    // bottom
    if (computed.get('top') + computed.get('height') > pageHeight - bleedTop) {
      warntipBottom += computed.get('top') + computed.get('height') - pageHeight + bleedTop;
    }
    //整图左侧拖出，不在可视区域内显示warntip
    if (computed.get('left') + computed.get('width') < 0) {
      warntipLeft = WARNTIP_LEFT;
      warntipBottom = WARNTIP_BOTTOM;
    }
    //整图下方拖出，不在可视区域内显示warntip
    if (computed.get('top')>pageHeight) {
      warntipLeft = WARNTIP_LEFT;
      warntipBottom = WARNTIP_BOTTOM;
    }

    const warntipStyle = {
      left: warntipLeft,
      bottom: warntipBottom,
    };

    const doCoverSnipping = () => {
      if (isCover && (typeof doSnipping === 'function')) {
        doSnipping();
      }
    };

    return (
      <Element actions={elementActions} data={elementData}>
        <div className="layer-image" style={layerImageStyle}>
          <XLoading isShown={isImgLoading} />
          {
            imgUrl
            ? null
            : (<div className="photoBackground" data-html2canvas-ignore="true"></div>)
          }
          <img
            className="photo-img"
            src={src}
            style={imgStyle}
            onLoad={doCoverSnipping}
          />
          {
            isPreview ? null :
              (<XWarnTip scale={scale}
                  ratio={ratio}
                  style={warntipStyle}
                  limit={this.state.resizeLimit}/>)
          }
        </div>
      </Element>
    );
  }
}

PhotoElement.propTypes = {
};

export default translate('PhotoElement')(PhotoElement);
