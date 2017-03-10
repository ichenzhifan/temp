import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from "react-translate";
import { template, merge, isEqual, get } from 'lodash';
import Immutable, { List } from 'immutable';

import * as handler from './handler.js';

import XButton from '../../../../common/ZNOComponents/XButton';


import './index.scss';

class StickerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStickerId: '',
      numTemplate: {},
      stickerList: [],
      pageSize: 8,
      page: 1,
      getMoreShow: false,
      currentFilterTag: 'top'
    };
    this.getMore = () => handler.getMore(this);
    this.onDragStarted = (stickerObj, index, event) => handler.onDragStarted(this, stickerObj, index, event);
    this.receiveProps = (nextProps) => handler.receiveProps(this, nextProps);
    this.willMount = () => handler.willMount(this);
    this.getStickerHTML = () => handler.getStickerHTML(this);
  }

  componentWillReceiveProps(nextProps) {
    this.receiveProps(nextProps);
  }

  componentWillMount() {
    this.willMount();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const oldList = List(get(this.props, 'data.stickerList'));
    const newList = List(get(nextProps, 'data.stickerList'));
    const oldCountMap = get(this.props, 'data.decorationUsedCountMap');
    const newCountMap = get(nextProps, 'data.decorationUsedCountMap');
    if (Immutable.is(oldList, newList) && Immutable.is(oldCountMap, newCountMap)) {
      return false;
    }
    return true;
  }

  render() {
    const { stickerList, getMoreShow } = this.state;
    const { t } = this.props;
    const buttonClass = classNames('white', {
      'hide': getMoreShow
    });
    return (
      <div className="sticker-list">
        {
          stickerList.length ?
            this.getStickerHTML()
             : <span className="no-stickers">{ t('NO_STICKERS') }</span>
        }
      </div>
    );
  }
}

StickerList.proptype = {

}

export default translate('StickerList')(StickerList);
