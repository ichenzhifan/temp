import React from 'react';
import Immutable, { fromJS } from 'immutable';
import { merge, isEqual, template, get, isArray } from 'lodash';
import Element from '../../../utils/entries/element';
import { guid } from '../../../../../common/utils/math';
import { numberToHex } from '../../../../../common/utils/colorConverter';
import { convertObjIn } from '../../../../../common/utils/typeConverter';
import { elementTypes } from '../../../contants/strings';
import { TEMPLATE_SRC } from '../../../contants/apiUrl';
import { checkIsSupportImageInCover, checkIsSupportFullImageInCover, checkIsSupportHalfImageInCover } from '../../../utils/cover';
import { updateElementsByTemplate } from '../../../utils/autoLayoutHepler';
import { checkIsEnablePage } from '../../../utils/sizeCalculator';
import { fixTemplateFontSize } from '../../../utils/fontSizeFixer';
import { convertResultToJson, formatTemplateInstance, filterCoverTemplates } from '../../../utils/template';

const filterTemplate = (that, templateList, pagination, setting) => {
  let filters = [];
  let newList = [];
  const isCover = pagination.get('sheetIndex') == '0';
  const coverType = setting.get('cover');

  const isSupportImageInCover = checkIsSupportImageInCover(coverType);
  const isSupportFullImageInCover = checkIsSupportFullImageInCover(coverType);
  const isSupportHalfImageInCover = checkIsSupportHalfImageInCover(coverType);

  const pageEnabled = checkIsEnablePage(pagination.get('total'), pagination.get('sheetIndex'), pagination.get('pageIndex'), setting.get('product'), setting.get('cover'), isCover);
  if (pageEnabled) {
    if (isCover) {
      newList = filterCoverTemplates(templateList, coverType);
    } else {
      newList = templateList.filter(item => {
        return item.sheetType.toLowerCase().indexOf('inner') >= 0;
      });
    }
  } else {
    newList = [];
  }
  newList = newList.filter(item => {
    return !(item.imageNum === 0 && item.textFrameNum === 0);
  });
  return newList;
};

const getCurrentFilterTag = (that, list, page) => {
  let currentFilterTag = that.state.currentFilterTag;

  if (page && page.get('template')) {
    const selectedTemplateId = page.getIn(['template', 'tplGuid']);

    const currentTemplate = list.find((item) => {
      return item.guid === selectedTemplateId;
    });

    const top20 = list.slice(0, 20);
    if (currentTemplate) {
      const index = top20.findIndex((item) => {
        return item.guid === currentTemplate.guid;
      });

      if (['my', 'top'].indexOf(currentFilterTag) === -1 || index === -1) {
        currentFilterTag = 'top';
        if (currentTemplate.customerId) {
          currentFilterTag = 'my';
        } else if (currentTemplate.imageNum < 9) {
          currentFilterTag = '' + currentTemplate.imageNum;
        } else {
          currentFilterTag = '9+';
        }
      }
    }
  }

  return currentFilterTag;
};

const getFilterTemplateList = (that, list, pagination, setting) => {
  let newList = filterTemplate(that, list, pagination, setting);

  // 按照使用频次排序
  newList = newList.sort((prev, next) => {
    return next.spread - prev.spread;
  });

  return newList;
};

// handlers write here
export const receiveProps = (that, nextProps) => {
  const { pageSize } = that.state;
  const oldList = that.props.data.template.list;
  let newList = nextProps.data.template.list;

  const oldPage = that.props.data.paginationSpread.get('page');
  const newPage = nextProps.data.paginationSpread.get('page');

  if (!Immutable.is(Immutable.List(oldList), Immutable.List(newList)) ||
    !Immutable.is(Immutable.Map(oldPage), Immutable.Map(newPage))) {
    const pagination = get(nextProps, 'data.pagination');
    const setting = get(nextProps, 'data.setting');

    // 获取过滤好的模板列表.
    newList = getFilterTemplateList(that, newList, pagination, setting);

    // 计算layout选项卡中,选中的选项卡的名称.
    const currentFilterTag = getCurrentFilterTag(that, newList, newPage);

    that.setState({
      currentFilterTag,
      templateList: newList
    });
  }
};

export const didMount = (that) => {
  let newList = get(that.props, 'data.template.list');
  const pagination = get(that.props, 'data.pagination');
  const setting = get(that.props, 'data.setting');
  const paginationSpread = get(that.props, 'data.paginationSpread');
  const newPage = paginationSpread.get('page');

  // 获取过滤好的模板列表.
  newList = getFilterTemplateList(that, newList, pagination, setting);

  // 计算layout选项卡中,选中的选项卡的名称.
  const currentFilterTag = getCurrentFilterTag(that, newList, newPage);

  that.setState({
    currentFilterTag,
    templateList: newList
  });
};

/**
 * 根据模板的guid和size, 下载指定模板详细信息.
 */
export const applyTemplate = (that, guid) => {
  const { actions, data } = that.props;
  const { setting, template } = data;
  const { boundTrackerActions, boundTemplateActions } = actions;
  const templateDetails = template.details;
  const size = setting.get('size');

  // 应用模版时 的 埋点。
  boundTrackerActions.addTracker('SelectLayout,' + guid);
  boundTemplateActions.changeApplyTemplateStatus(true);

  // 下载后的模板信息,会缓存到store上, 键以:<guid>_<size>两部分构成.
  const templateId = `${guid}_${size}`;

  // 如果在store上找不到当前id的模板信息,说明该模板还没有下载
  if (!templateDetails[templateId]) {
    boundTemplateActions.getTemplateInfo(guid, size).then((response) => {
      // 把请求返回值中的xml转成json.
      const results = convertResultToJson(response);

      // 格式化template的原始数据, 使它可以在app中可以使用的格式
      const newTemplates = formatTemplateInstance(results, [guid], size);

      if (newTemplates && newTemplates.length) {
        doApplyTemplate(that, newTemplates[0][templateId]).then(() => {
          boundTemplateActions.changeApplyTemplateStatus(false);
        });
      }
    });
  } else {
    // 直接使用已经下载了的模板.
    doApplyTemplate(that, templateDetails[templateId]).then(() => {
      boundTemplateActions.changeApplyTemplateStatus(false);
    });
  }

  that.setState({
    selectedTemplateId: guid
  });
}

/**
 * 把模板根据模板的图片数量分组.
 */
export const groupTemplateByNum = (list) => {
  let numTemplate = {};
  list.map(item => {
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
}

export const onSelectFilter = (that, tag) => {
  that.setState({
    currentFilterTag: tag
  });
};

/**
 * 更新装饰元素的dep值, 使所有的sticker的dep不小于基础值.
 * @param  {Number} baseDep  基础值的dep值.
 * @param  {Array} elements stickers集合.
 * @return {Array}      更新后的stickers集合
 */
const updateStickersDep = (baseDep, elements) => {
  // 更加dep, 从小到大排序.
  let sortedElements = elements.sort((first, second) => {
    return first.get('dep') - second.get('dep');
  });

  if (baseDep && sortedElements && sortedElements.size) {
    const firstElementDep = sortedElements.getIn(['0', 'dep']);

    if (firstElementDep > baseDep) {
      return sortedElements;
    } else {
      const step = baseDep - firstElementDep + 1;

      sortedElements = sortedElements.map(ele => ele.set('dep', ele.get('dep') + step));

      return sortedElements;
    }
  }

  return [];
};

/**
 * 根据模板详细信息, 应用该模板到当前工作的page上.
 * @param  {object} template 模板详细信息, 结构为: {bgColor, type, elements: []}
 */
const doApplyTemplate = (that, template) => {
  const { data, actions } = that.props;
  const { boundProjectActions } = actions;
  const { paginationSpread, uploadedImages, ratio } = data;
  const setting = get(that.props, 'data.setting');
  const coverType = setting.get('cover');
  const isHalfCover = checkIsSupportHalfImageInCover(coverType);

  let iElements = [];
  let newElements = [];

  // 获取当前page上的基本信息和所有的elements
  const page = paginationSpread.get('page');
  const pageHeight = page.get('height') * ratio.workspace;
  const pageWidth = page.get('width') * ratio.workspace;
  const pageElements = fromJS(paginationSpread.get('elements'));

  const textOrPhotoElements = pageElements.filterNot(ele => ele.get('type') === elementTypes.decoration);
  const stickersElements = pageElements.filter(ele => ele.get('type') === elementTypes.decoration);

  textOrPhotoElements.forEach(element => {
    iElements.push(element);
  });

  let templateElements = template.elements;
  const textInTemplate = templateElements.filter(element => {
    return element.type === elementTypes.text;
  });

  templateElements = templateElements.map(tmpl => {
    if (tmpl.type === elementTypes.text) {
      const fixedFontSize = fixTemplateFontSize(tmpl.pw * pageWidth, pageHeight);
      tmpl.fontSize = fixedFontSize;
    }
    return tmpl;
  });

  // 如果模板中包含tetxElement，先清除所有的textElement
  if (textInTemplate.length) {
    iElements = iElements.filter(ele => ele.get('type') === elementTypes.photo);
    const textElements = textOrPhotoElements.filter(element => element.get('type') === elementTypes.text);
    const textElementIds = textElements.map(element => {
      return element.get('id');
    });

    return boundProjectActions.deleteElements(page.get('id'), textElementIds).then(() => {
      // 根据模板信息, 更新页面上的所有元素.
      newElements = updateElementsByTemplate(page, iElements, uploadedImages, template, isHalfCover);

      // 调整sticker的dep, 使它始终在图片和文字的最上面.
      const maxDepElement = newElements.maxBy(ele => ele.get('dep'));
      const maxDep = maxDepElement ? maxDepElement.get('dep') : 0;

      const newStickerElemnets = updateStickersDep(maxDep, stickersElements);

      // 更新sticker.
      if (newStickerElemnets && newStickerElemnets.size) {
        newElements = newElements.concat(newStickerElemnets);
      }
      // 应用模板, 更新store上的page和page上的elements.
      if (newElements && newElements.size) {
        return boundProjectActions.applyTemplate(page.get('id'), template.id, newElements);
      }

      return Promise.resolve();
    });
  } else {
    // 根据模板信息, 更新页面上的所有元素.
    newElements = updateElementsByTemplate(page, iElements, uploadedImages, template, isHalfCover);

    // 调整sticker的dep, 使它始终在图片和文字的最上面.
    const maxDepElement = newElements.maxBy(ele => ele.get('dep'));
    const maxDep = maxDepElement ? maxDepElement.get('dep') : 0;

    const newStickerElemnets = updateStickersDep(maxDep, stickersElements);

    // 更新sticker.
    if (newStickerElemnets && newStickerElemnets.size) {
      newElements = newElements.concat(newStickerElemnets);
    }

    // 应用模板, 更新store上的page和page上的elements.
    if (newElements && newElements.size) {
      return boundProjectActions.applyTemplate(page.get('id'), template.id, newElements);
    }

    return Promise.resolve();
  }
};

const shiftTemplateSuitImage = (himage, vimage, width, height) => {
  var imageObject = null;
  if (width > height) {
    imageObject = vimage.shift();
  } else {
    imageObject = himage.shift();
  }
  if (typeof(imageObject) == "undefined") {
    if (width > height) {
      imageObject = himage.shift();
    } else {
      imageObject = vimage.shift();
    }
  }
  if (typeof(imageObject) == "undefined") {
    imageObject = null;
  }
  return imageObject;
}

const getTemplateBySize = (size) => {
  const { data } = that.props;
  const { template } = data;
  const templateList = template.list;
  let tpls = [];
  for (var i = 0; i < templateList.length; i++) {
    let item = templateList[i];
    if (item.designSize === size) {
      tpls.push(item);
    }
  }
  return tpls;
}

const getTemplateByGuid = (guid) => {
  const { data } = that.props;
  const { template } = data;
  const templateList = template.list;

  for (var i = 0; i < templateList.length; i++) {
    let item = templateList[i];
    if (item.guid === guid) {
      return item;
    }
  }
}

const getFitTemplate = (imgsNum, hImgNum, vImgNum) => {
  const { setting } = data;
  let size = setting.get('size');
  let rotated = false,
    tpls = [],
    fitTpls = [],
    optionalTpls = [];
  if (rotated) {
    size = size.split('X')[1] + 'X' + size.split('X')[0];
  }
  tpls = getTemplateBySize(size);
  if (tpls.length > 0) {
    for (var index in tpls) {
      let item = tpls[index];
      if (item.imageNum == imgsNum && item.isCoverDefault && item.isCoverDefault === 'true') {
        return item;
      }
    }
  }
  tpls.map(tpl => {
    if (imgsNum == tpl.imageNum) {
      if (hImgNum == tpl.horizontalNum) {
        fitTpls.push(tpl);
      } else if (vImgNum == tpl.verticalNum) {
        fitTpls.push(tpl);
      } else {
        optionalTpls.push(tpl);
      }
    }
  });
  if (fitTpls.length) {
    if (fitTpls.length === 1) {
      return fitTpls[0];
    } else {
      let rindex = Math.floor(Math.random() * fitTpls.length);
      return fitTpls[rindex];
    }
  } else {
    if (optionalTpls.length) {
      let rindex = Math.floor(Math.random() * optionalTpls.length);
      return optionalTpls[rindex];
    }
  }
}

const autoLayout = () => {
  const templateElements = spread.elements;
  if (autoLayout) {
    let imgParams = [],
      imgNums = 0,
      hImgNum = 0,
      vImgNum = 0,
      fitTpl;
    templateElements.map(item => {
      if (item.elType === 'image') {
        imgParams.push(item);
        if (item.width > item.height) {
          hImgNum++;
        } else {
          vImgNum++;
        }
      }
    });
    imgNums = imgParams.length;
    fitTpl = getFitTemplate(imgNums, hImgNum, vImgNum);
    if (fitTpl) {
      applyTemplate(fitTpl.guid, fitTpl.designSize);
    }
  }
}
