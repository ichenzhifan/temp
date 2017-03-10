import { get, isArray } from 'lodash';
import { convertObjIn } from '../../../../../common/utils/typeConverter';
import { numberToHex } from '../../../../../common/utils/colorConverter';
import { fixTemplateFontSize } from '../../../utils/fontSizeFixer';
import { elementTypes } from '../../../contants/strings';
import { autoLayoutByElements } from '../../../utils/autoLayout';
import { updateElementsByTemplate } from '../../../utils/autoLayoutHepler';
import { checkIsSupportImageInCover, checkIsSupportFullImageInCover, checkIsSupportHalfImageInCover } from '../../../utils/cover';
import { convertResultToJson, formatTemplateInstance, filterCoverTemplates } from '../../../utils/template';

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
    const firstElementDep = sortedElements.getIn(['0','dep']);

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
const doApplyTemplate = (that, template, nextProps) => {
  const { data, actions } = nextProps || that.props;
  const { boundProjectActions } = actions;
  const { elements, images, page, summary, ratio } = data;
  const pageWidth = page.get('width') * ratio.workspace;
  const pageHeight = page.get('height') * ratio.workspace;
  const iImages = [];
  const isHalfCover = summary.get('isCrystal') || summary.get('isMetal');

  let iElements = [];
  let newElements;

  const textOrPhotoElements = elements.filterNot(ele => ele.get('type') === elementTypes.decoration);
  const stickersElements = elements.filter(ele => ele.get('type') === elementTypes.decoration);

  // 解构处理的images是一个Immutable.Map对象. 需要把它转成数组.
  images.forEach((image) => {
    iImages.push(image.toJS());
  });

  textOrPhotoElements.forEach((element) => {
    iElements.push(element);
  });

  let templateElements = template.elements;
  const textInTemplate = templateElements.filter((element) => {
    return element.type === elementTypes.text;
  });

  templateElements = templateElements.map((tmpl) => {
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
    const textElementIds = textElements.map((element) => {
      return element.get('id');
    });

    boundProjectActions.deleteElements(page.get('id'), textElementIds).then(() => {
      // 根据模板信息, 更新页面上的所有元素.
      newElements = updateElementsByTemplate(page, iElements, iImages, template, isHalfCover);

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
        boundProjectActions.applyTemplate(page.get('id'), template.id, newElements);
      }
    });
  } else {
    // 根据模板信息, 更新页面上的所有元素.
    newElements = updateElementsByTemplate(page, iElements, iImages, template, isHalfCover);

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
      boundProjectActions.applyTemplate(page.get('id'), template.id, newElements);
    }
  }
};

export const doAutoLayout = (that, props) => {
  const { data, actions } = props || that.props;
  const { settings, page, summary, pagination, template, elements } = data;

  // 解构一些变量.
  const isEnableAutoLayout = get(settings, 'bookSetting.autoLayout');
  const coverType = get(settings, 'spec.cover');

  // 判断autolayout是否开启.
  if (isEnableAutoLayout && elements.size) {
    const projectSize = get(settings, 'spec.size');
    let allTemplatesList = get(template, 'list') || [];
    const templateDetails = get(template, 'details');

    // 根据cover/inner 筛选模板
    const isCover = summary.get('isCover');
    const isSupportImageInCover = checkIsSupportImageInCover(coverType);

    if (page.get('enabled')) {
      if (isCover) {
        allTemplatesList = filterCoverTemplates(allTemplatesList, coverType);
      } else {
        allTemplatesList = allTemplatesList.filter((item) => {
          return item.sheetType.toLowerCase().indexOf('inner') >= 0;
        });
      }
    } else {
      allTemplatesList = [];
    }

    // 根据页面元素和模板列表, 选出符合条件的模板.
    const templateOverView = autoLayoutByElements(elements, allTemplatesList);

    // 如果找到模板.
    if (templateOverView) {
      const guid = templateOverView.guid;

      // 下载后的模板信息,会缓存到store上, 键以:<guid>_<size>两部分构成.
      const templateId = `${guid}_${projectSize}`;

      // 如果在store上找不到当前id的模板信息,说明该模板还没有下载
      if (!templateDetails[templateId]) {
        const { boundTemplateActions } = actions;

        boundTemplateActions.getTemplateInfo(guid, projectSize).then((response) => {
          // 把请求返回值中的xml转成json.
          const results = convertResultToJson(response);

          // 格式化template的原始数据, 使它可以在app中可以使用的格式
          const newTemplates = formatTemplateInstance(results, [guid], projectSize);

          if (newTemplates && newTemplates.length) {
            doApplyTemplate(that, newTemplates[0][templateId], props);
          }
        });
      } else {
        // 直接使用已经下载了的模板.
        doApplyTemplate(that, templateDetails[templateId], props);
      }
    }
  }
};
