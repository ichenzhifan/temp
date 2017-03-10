import React, { Component, PropTypes } from 'react';
import { get } from 'lodash';
import * as handler from './handler.js';
import classNames from 'classnames';
import './index.scss';

class StickerItem extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const oldImgUrl = get(this.props, 'sticker.stickerUrl');
    const newImgUrl = get(nextProps, 'sticker.stickerUrl');
    const oldSelected = get(this.props, 'isSelected');
    const newSelected = get(nextProps, 'isSelected');
    if (oldImgUrl === newImgUrl && oldSelected === newSelected) {
      return false;
    }
    return true;
  }

  render() {
    const { sticker, isSelected } = this.props;
    const { stickerUrl } = sticker;
    const itemClass = classNames('sticker-item', {
      'selected': isSelected
    });
    return (
      <div className={itemClass}>
        <img src={stickerUrl}/>
      </div>
    );
  }
}

StickerItem.proptype = {

}

export default StickerItem;
