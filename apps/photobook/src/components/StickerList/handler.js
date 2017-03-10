import { template, merge, isEqual } from 'lodash';
import React from 'react';
import {setTransferData} from '../../../../common/utils/drag';
import StickerItem from '../StickerItem';
import XDrag from '../../../../common/ZNOComponents/XDrag/';
import XButton from '../../../../common/ZNOComponents/XButton';
import { STICKER_SRC } from '../../contants/apiUrl';
import { elementTypes } from '../../contants/strings';
// handlers write here
export const getMore = (that) => {
  let { page } = that.state;
  const { pageSize, stickerList } = that.state;
  const totalPages = Math.ceil(stickerList.length / pageSize);
  if (page<totalPages) {
    page ++;
    const getMoreShow = (page===totalPages) ? true : false;
    that.setState({
      page,
      getMoreShow
    });
  }
}

export const receiveProps = (that, nextProps) => {
  const oldList = that.props.data.stickerList;
  const newList = nextProps.data.stickerList;
  const { pageSize } = that.state;
  if (!isEqual(oldList, newList)) {
    let getMoreShow = true;
    if (newList.length>pageSize) {
      getMoreShow = false;
    }
    that.setState({
      stickerList: newList,
      getMoreShow
    });
  }
}

export const willMount = (that) => {
  const { pageSize } = that.state;
  const stickerList = that.props.data.stickerList;
  let getMoreShow = true;
  if (stickerList.length>pageSize) {
    getMoreShow = false;
  }
  that.setState({
    stickerList,
    getMoreShow
  });
}

export const getStickerHTML = (that) => {
  const { data } = that.props;
  const { baseUrls, setting, decorationUsedCountMap } = data;
  const { stickerList, pageSize, page } = that.state;
  const currentSize = pageSize * page;
  const stickerThumbnailPrefix = baseUrls.get('stickerThumbnailPrefix');
  return stickerList.map((sticker, index) => {
    const { guid } = sticker;

    const stickerUrl = template(STICKER_SRC)({
      stickerThumbnailPrefix,
      guid
    });
    const stickerObj = merge({}, sticker, {
      stickerUrl
    });

    const usedCount = decorationUsedCountMap.get(guid) || 0;
    const isSelected = that.state.selectedStickerId === guid;


    return (
      <XDrag
        key={guid}
        onDragStarted={that.onDragStarted.bind(that, stickerObj, index)}
      >
        <StickerItem sticker={stickerObj} isSelected={isSelected} />
        {
          usedCount ?
            <span className="count">{usedCount}</span> :
            null
        }
      </XDrag>
    );
  });
};

export const onDragStarted = (that, stickerObj, index, event) => {
  const { data } = that.props;
  const { ratio } = data;

  // 使用左侧显示视图宽高作为添加元素的宽高
  const elementDom = document.querySelectorAll('.sticker-item>img')[index];
  const sticker = merge({}, stickerObj, {
    width: parseFloat(elementDom.offsetWidth) / ratio.workspace,
    height: parseFloat(elementDom.offsetHeight) / ratio.workspace
  });

  setTransferData(event, sticker);
};
