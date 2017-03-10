import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import { translate } from 'react-translate';
import { merge, get } from 'lodash';
import classNames from 'classnames';

// 导入组件
import XLoading from '../../../../common/ZNOComponents/XLoading';
import Element from '../Element';

// 导入处理函数
import * as events from './handler/events';

import './index.scss';

class PhotoElementThumbnail extends Component {
  constructor(props) {
    super(props);

    // 内部state
    this.state = {
      isImgLoading: false,
      src: null,
      isShowActionBar: true
    };

    this.hideLoading = ()=>{
      this.setState({
        isImgLoading: false
      });
    };
  }

  componentWillMount() {
    const {data} = this.props;
    const { element } = data;
    const computed = element.get('computed');
    const imgUrl = element.getIn(['computed', 'imgUrl']);

    if(imgUrl){
      events.lazyLoadingImage(this, imgUrl);
    }
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

  render() {

    const { t, actions, data } = this.props;
    const { element } = data;
    const computed = element.get('computed');
    const imgUrl = element.getIn(['computed', 'imgUrl']);

    // element 容器的样式.
    const containerStyle = {
      zIndex: element.get('dep') + 100,
      width: computed.get('width'),
      height: computed.get('height'),
      left: computed.get('left'),
      top: computed.get('top'),
      transform: `rotate(${element.get('rot')}deg)`
    };
    const handlerStyle = {
      position: 'absolute',
      width: computed.get('width') + 'px',
      height: computed.get('height') + 'px',
      top: 0,
      left: 0
    };
    const imgStyle = handlerStyle;
    const layerImageStyle = {
      width: computed.get('width') + 'px',
      height: computed.get('height') + 'px'
    };

    // element
    const elementActions = merge({}, actions);

    const elementData = merge({}, data, {
      className: classNames('photo-element-thumbnail', {
        'has-image': !!imgUrl
      }),
      style: containerStyle,
      handlerStyle
    });

    const { isImgLoading, src } = this.state;

    return (
      <Element actions={elementActions} data={elementData}>
        <div className="layer-image" style={layerImageStyle}>
          <XLoading isShown={isImgLoading} />
          <img
            className="photo-img"
            src={src}
            style={imgStyle}
          />
        </div>
      </Element>
    );
  }
}

PhotoElementThumbnail.propTypes = {
};

export default translate('PhotoElement')(PhotoElementThumbnail);
