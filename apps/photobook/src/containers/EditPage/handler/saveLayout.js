import X2JS from 'x2js';
import { forEach, get } from 'lodash';
import { fromJS, List } from 'immutable';
import { pageTypes, spreadTypes, CcSheetTypeArray, layoutSheetType, elementTypes, elType } from '../../../contants/strings';
import { hexString2Number } from '../../../../../common/utils/colorConverter';
import { convertObjIn } from '../../../../../common/utils/typeConverter';
import { checkIsSupportImageInCover, checkIsSupportFullImageInCover, checkIsSupportHalfImageInCover } from '../../../utils/cover';
import { convertResultToJson, formatTemplateInstance, filterCoverTemplates } from '../../../utils/template';
import { updateElementsByTemplate } from '../../../utils/autoLayoutHepler';

export const getPageElementIds = (pageId, pages) => {
  let halfPageTemplate = '';
  let pageElementIds;
  let bgColor;
  pages.forEach((item) => {
    if (pageId === item.id) {
      // page type:
      // - page: 半页
      // - sheet: 全页
      halfPageTemplate = item.type === pageTypes.page;
      pageElementIds = item.elements;
      bgColor = item.bgColor;
    }
  });
  return {
    halfPageTemplate,
    pageElementIds,
    bgColor
  };
};

export const getMapSheetType = (cover) => {
  let sheetType;
  sheetType = CcSheetTypeArray.indexOf(cover) > -1 ? layoutSheetType.CC : layoutSheetType.HC;
  return sheetType;
};

export const getTemplateData = (that) => {
  const {
    pagination,
    paginationSpread,
    project,
    boundAlertModalActions,
    t
  } = that.props;
  let frameTotalNum = 0;
  let frameHorizonNum = 0;
  let frameVertialNum = 0;
  let frameSquareNum = 0;
  const cover = project.get('setting').get('cover');
  const { pageId } = pagination;
  const pages = paginationSpread.get('pages').toJS();
  const elements = paginationSpread.get('elements').toJS();
  const summary = paginationSpread.get('summary').toJS();
  const pageDetails = getPageElementIds(pageId, pages);
  const { pageElementIds, halfPageTemplate, bgColor } = pageDetails;
  const sheetType = summary.isCover ? getMapSheetType(cover) : layoutSheetType.INNER;
  const pageType = halfPageTemplate ? 'half' : 'full';
  const pagePositon = summary.isCover ? spreadTypes.coverPage : spreadTypes.innerPage;
  const elementArray = [];
  const pageBgColor = bgColor || '#FFFFFF';

  // 如果该页中没有一个元素框的话会弹出提示框不继续保存。
  if (!Object.getOwnPropertyNames(elements).length) {
    boundAlertModalActions.showAlertModal({
      title: t('SAVE_EMPTY_LAYOUT_ERROR'),
      message: t('SAVE_EMPTY_LAYOUT_MESSAGE')
    });
    return 'blankPage';
  }

  // 获取当前页的 elements 的 json 格式。
  forEach(elements, (value, key) => {
    if (pageElementIds.indexOf(key) > -1 && value.elType === elType.image) {
      frameTotalNum += 1;
      const WHRatio = value.width / value.height;
      if (WHRatio > 1) {
        frameHorizonNum += 1;
      } else if (WHRatio < 1) {
        frameVertialNum += 1;
      } else {
        frameSquareNum += 1;
      }
      elementArray.push({ _type: elementTypes.photo, _x: value.x, _y: value.y, _width: value.width, _height: value.height, _px: value.px, _py: value.py, _pw: value.pw, _ph: value.ph, _rot: value.rot, _dep: value.dep });
    }
  });

  //  定义 xmlViewData 的数据结构。
  const templateJson = {
    templateView: {
      spread: {
        _type: pagePositon,
        _bgColor: hexString2Number(pageBgColor),
        elements: {
          element: elementArray
        }
      }
    }
  };
  const x2jsInstance = new X2JS({
    escapeMode: false
  });
  // 将 json 结构的 xmlViewData 转化为 xml 字符串。
  const xmlViewData = x2jsInstance.js2xml(templateJson);
  return {
    sheetType,
    pageType,
    frameTotalNum,
    frameHorizonNum,
    frameVertialNum,
    frameSquareNum,
    xmlViewData
  };
};

export const getParams = (that) => {
  const { env, project } = that.props;
  const user = env.userInfo;
  const userId = user.get('id').toString();
  const size = project.get('setting').get('size');
  const templateData = getTemplateData(that);
  if (templateData === 'blankPage') return 'blankPage';
  return {
    customerId: userId,
    name: new Date().getTime(),
    size,
    pageType: templateData.pageType,
    sheetType: templateData.sheetType,
    frameTotalNum: templateData.frameTotalNum.toString(),
    frameHorizonNum: templateData.frameHorizonNum.toString(),
    frameVertialNum: templateData.frameVertialNum.toString(),
    frameSquareNum: templateData.frameSquareNum.toString(),
    xmlViewData: templateData.xmlViewData
  };
};

export const handleSaveTemplate = (that) => {
  const {
    boundTemplateActions,
    boundNotificationActions,
    boundProjectActions,
    // boundPageLoadingModalActions,
    t,
    pagination
  } = that.props;
  const saveLayout = boundTemplateActions.saveLayout;
  const addTemplate = boundTemplateActions.addTemplate;
  const addNotification = boundNotificationActions.addNotification;
  const params = getParams(that);
  if (params === 'blankPage') return;
  that.setState({
    isSavingLayout: true
  });
  // boundPageLoadingModalActions.showPageLoadingModal('Saving');
  saveLayout(params).then((res) => {
    // boundPageLoadingModalActions.hidePageLoadingModal();
    if (res.result.state === 'success') {
      addTemplate(convertObjIn(res.result.template)).then((template) => {
        const { pageId } = pagination;

        if(pageId){
          boundProjectActions.updatePageTemplateId(pageId, template.guid);
        }
      });

      addNotification({
        message: t('SAVE_LAYOUT_SUCCESSFULLY_MESSAGE'),
        level: t('SAVE_LAYOUT_SUCCESSFULLY_LEVEL'),
        autoDismiss: 2
      });
    } else if (res.result.state === 'fail') {
      addNotification({
        message: t('SAVE_LAYOUT_FAIL_MESSAGE'),
        level: t('SAVE_LAYOUT_FAIL_LEVEL'),
        autoDismiss: 0
      });
    }
    that.setState({
      isSavingLayout: false
    });
  });
};
