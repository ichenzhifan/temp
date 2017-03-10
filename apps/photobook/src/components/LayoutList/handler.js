import React from 'react';
import { Map, List, fromJS, is } from 'immutable';
import { merge, isEqual, template, get, isArray } from 'lodash';

import Element from '../../utils/entries/element';
import { guid } from '../../../../common/utils/math';
import { TEMPLATE_SRC } from '../../contants/apiUrl';
import { elementTypes, layoutRenderRules } from '../../contants/strings';
import { numberToHex } from '../../../../common/utils/colorConverter';
import { convertObjIn } from '../../../../common/utils/typeConverter';
import { updateElementsByTemplate } from '../../utils/autoLayoutHepler';
import { loadImg } from '../../utils/image';
import classNames from 'classnames';

import LayoutItem from '../LayoutItem';
import LazyLoad from 'react-lazy-load';

const getSize = (setting) => {
  let size = '8X8';

  // 所有尺寸为方形的使用8X8的图片
  if (setting) {
    size = setting.get('size');

    const sizeArr = size ? size.split('X') : [];
    if (sizeArr.length === 2 && sizeArr[0] === sizeArr[1]) {
      size = '8X8';
    }
  }

  return size;
};

const calcImageSizeByRule = (originalImageSize) => {
  let { width = 0, height = 0 } = originalImageSize;
  let baseWidth = 0;

  // 每行显示的个数.
  let colNumber = 0;

  // 计算原始图片的宽高比.
  const WHRatio = height ? (width / height) : 0;

  // 获取排列规则.
  // 一排2个
  if(WHRatio > 1.5) {
    baseWidth = 190;
    colNumber = 2;
  }else if(WHRatio <= 1.5 && WHRatio >=  1 / 1.5){
    // 一排3个
    baseWidth = 120;
    colNumber = 3;
  }else{
    // 一排4个
    baseWidth = 85;
    colNumber = 4;
  }

  return {
    width: baseWidth,
    height: WHRatio ? (baseWidth / WHRatio) : 0,
    colNumber
  };
};

const setNewImageSizeInState = (that, list) => {
  const download = (index) => {
    if(index >= list.length){
      return;
    }

    const template = list[index];
    loadImg(template.templateUrl).then((result) => {
      if(result.img){
          const newObj = calcImageSizeByRule({
            width: result.img.width,
            height: result.img.height
          });

          that.setState({
            imageSize: {
              width: newObj.width,
              height: newObj.height
            },
            colNumber: newObj.colNumber
          });
      }else{
        const nextIndex = index + 1;
        download(nextIndex);
      }
    }, (error) => {
        const nextIndex = index + 1;
        download(nextIndex);
    });
  };

  if(list && list.length){
    download(0);
  }
};

/**
 * 把一维数组转换成二维数组.
 * @param  {Array} list        [description]
 * @param  {number} numInColumn 二维数组中, 子数组的长度.
 */
const toTwoDimensionalArray = (list, numInColumn) => {
  let twoDimenArr = [list];

  // 根据每行显示layout的个数, 把templateList转成一个2维数据.
  if(numInColumn && list && list.length) {
    twoDimenArr = [];
    let tempArr = [];

    list.forEach((t) => {
      if(tempArr.length === numInColumn){
        twoDimenArr.push(tempArr);
        tempArr = [];
      }

      tempArr.push(t);
    });

    if (tempArr.length) {
      twoDimenArr.push(tempArr);
      tempArr = [];
    }
  }

  return twoDimenArr;
};

export const getTemplateHTML = (that) => {
  const { data, actions, t } = that.props;
  const { applyTemplate } = actions;
  const { baseUrls, setting, paginationSpread, page } = data;
  const { templateList, imageSize, colNumber } = that.state;

  if (setting) {
    // 所有尺寸为方形的使用8X8的图片
    // let size = getSize(setting);

    // const templateThumbnailPrefx = baseUrls.get('templateThumbnailPrefx');
    let selectedTemplateId = paginationSpread.getIn(['page', 'template', 'tplGuid']);

    // 如果当前page没有元素则没有选中模板
    if (paginationSpread.get('page') && paginationSpread.getIn(['page', 'elements']).size === 0) {
      selectedTemplateId = 0;
    }

    // 根据每行显示layout的个数, 把templateList转成一个2维数据.
    let newTemplateList = toTwoDimensionalArray(templateList, colNumber);

    const layoutRowStyle = {
      // 所有layout的width + layout之间的margin值.
      width: imageSize.width * colNumber + (colNumber - 1) * 20 + 'px'
    };

    return newTemplateList.map((list, i) => {
      const itemList = [];

      list.forEach((templt, key) => {
        const isSelected = selectedTemplateId === templt.guid;

        // layout data and actions
        const layoutItemData = fromJS({
          template: templt,
          imageSize,
          isSelected
        });
        const layoutItemActions = {applyTemplate};
        const itemClass = classNames('lazy-item', {
          'selected': isSelected
        });

        itemList.push(
          <div className={itemClass}>
            <LazyLoad height={imageSize.height} offset={0} once>
              <LayoutItem
                actions={layoutItemActions}
                key={`${i}-${key}`}
                data={layoutItemData}
              />
            </LazyLoad>
          </div>
        );
      });

      return (<div style={layoutRowStyle}
                  className="layout-row clearfix">
                    {itemList}
              </div>);
    });
  } else {
    return [];
  }
};

/**
 * 把模板根据模板的图片数量分组.
 */
export const groupTemplateByNum = (list) => {
  let numTemplate = {};
  let copyList = merge([], list);
  copyList.sort((prev, next) => {
    return next.spread - prev.spread;
  });
  copyList.map((item) => {
    let num = item.imageNum;
    if (num >= 9) {
      num = '9+';
    }
    if (!numTemplate[num]) {
      numTemplate[num] = [];
    }
    numTemplate[num].push(item);
  });
  return numTemplate;
};


export const doFilter = (that, tag, list) => {
  const { data, actions } = that.props;
  const { boundTrackerActions } = actions;
  const {baseUrls, setting} = data;
  const { numTemplate } = that.state;

  const templateThumbnailPrefx = baseUrls.get('templateThumbnailPrefx');
  let size = getSize(setting);

  // 筛选模版时的埋点
  boundTrackerActions.addTracker(`FiltLayouts,${tag}`);
  let newList = [];
  switch (tag) {
    case 'top':
      newList = merge([], list);
      newList.sort((prev, next) => {
        return next.spread - prev.spread;
      });
      newList = newList.splice(0, 20);
      break;
    case 'my':
      newList = list.filter((template) => {
        return !!template.customerId;
      });
      break;
    default:
      newList = numTemplate[tag] || list;
      break;
  }

  if(newList.length){
    newList = newList.map(item => {
      const templateUrl = template(TEMPLATE_SRC)({
        templateThumbnailPrefx,
        size,
        guid: item.guid
      });

      return merge({}, item, {
        templateUrl
      });
    });
  }

  // 更新新的layout图片的大小.
  setNewImageSizeInState(that, newList);

  that.setState({
    templateList: newList
  });
};
