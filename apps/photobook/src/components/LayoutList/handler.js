import React from 'react';
import { Map, List, fromJS, is } from 'immutable';
import { merge, isEqual, template, get, isArray } from 'lodash';

import Element from '../../utils/entries/element';
import { guid } from '../../../../common/utils/math';
import { TEMPLATE_SRC } from '../../contants/apiUrl';
import { elementTypes } from '../../contants/strings';
import { numberToHex } from '../../../../common/utils/colorConverter';
import { convertObjIn } from '../../../../common/utils/typeConverter';
import { updateElementsByTemplate } from '../../utils/autoLayoutHepler';
import classNames from 'classnames';

import LayoutItem from '../LayoutItem';
import LazyLoad from 'react-lazy-load';

const getSize = (setting) => {
  let size = '8X8';

  // 所有尺寸为方形的使用8X8的图片
  if (setting) {
    size = setting.get('size');

    const sizeArr = size.split('X');
    if (sizeArr.length === 2 && sizeArr[0]===sizeArr[1]) {
      size = '8X8';
    }
  }

  return size;
};

export const getTemplateHTML = (that) => {
  const { data, actions, t } = that.props;
  const { applyTemplate } = actions;
  const { baseUrls, setting, paginationSpread, page } = data;
  const { templateList } = that.state;

  if (setting) {
    // 所有尺寸为方形的使用8X8的图片
    let size = getSize(setting);

    const templateThumbnailPrefx = baseUrls.get('templateThumbnailPrefx');
    let selectedTemplateId = paginationSpread.getIn(['page', 'template', 'tplGuid']);

    // 如果当前page没有元素则没有选中模板
    if (paginationSpread.get('page') && paginationSpread.getIn(['page', 'elements']).size === 0) {
      selectedTemplateId = 0;
    }

    return templateList.map((templt, key) => {
      const { guid } = templt;
      const templateUrl = template(TEMPLATE_SRC)({
        templateThumbnailPrefx,
        size,
        guid
      });
      const templateObj = merge({}, templt, {
        templateUrl
      });
      const isSelected = selectedTemplateId === guid;

      // layout data and actions
      const layoutItemData = fromJS({
        template: templateObj,
        isSelected
      });
      const layoutItemActions = {applyTemplate};

      const pageType = get(templateObj, ['pageType']);

      const itemClass = classNames('lazy-item', {
        'col-2': pageType === 'full',
        'col-4': pageType === 'half',
        'selected': isSelected
      });

      return (
        <div className={itemClass}>
          <LazyLoad height={90} offset={0}>
            <LayoutItem
              actions={layoutItemActions}
              key={key}
              data={layoutItemData}
            />
          </LazyLoad>
        </div>
      );
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
  const { numTemplate } = that.state;
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
  that.setState({
    templateList: newList
  });
};
