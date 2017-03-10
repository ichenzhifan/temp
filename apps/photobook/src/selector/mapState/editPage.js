import { get, merge, forIn } from 'lodash';
import { createSelector } from 'reselect';
import Immutable from 'immutable';
import { spreadTypes, elementTypes, pageTypes, cameoPaddingsRatio, smallViewWidthInArrangePages } from '../../contants/strings';
import { getRenderSize,
  getRenderPosition,
  getRenderPagination,
  getRenderPaginationSpread,
  computedRatioForSpecialView,
  computedSizeForSpecialView,
  getRenderAllSpreads } from '../../utils/sizeCalculator';

// 用于测试
const undoData = (state) => get(state, 'test.undoData');

// 用于项目中
const env = (state) => get(state, 'system.env');
const project = state => get(state, 'project.data.present');
const allDecorations = state => get(state, 'project.decorationArray');
const ratios = state => get(state, 'system.global.ratio');
const pagination = state => get(state, 'system.global.pagination');
const materials = state => get(state, 'system.global.material');
const template = state => get(state, 'system.template');
const snipping = state => get(state, 'system.global.snipping');

/*-----------private function----------------*/


const getImagePaddingRatio = (materials) => {
  const ratio = {
    cover: {
      top: 0,
      left: 0
    },
    inner: {
      top: 0,
      left: 0
    }
  };

  const data = materials.toJS();

  const coverImageSize = get(data, 'cover.size');
  const innerImageSize = get(data, 'inner.size');

  if (coverImageSize && coverImageSize.width) {
    ratio.cover = {
      top: ((coverImageSize.height - coverImageSize.innerHeight) / 2) / coverImageSize.height,
      left: ((coverImageSize.width - coverImageSize.innerWidth) / 2) / coverImageSize.width,
    };
  }

  if (innerImageSize && innerImageSize.width) {
    ratio.inner = {
      top: ((innerImageSize.height - innerImageSize.innerHeight) / 2) / innerImageSize.height,
      left: ((innerImageSize.width - innerImageSize.innerWidth) / 2) / innerImageSize.width,
    };
  }

  return ratio;
};


/*-------------------------------------------*/

/*---------------------selector functions-----------------------------------*/
/**
 * 创建具有可记忆的selector
 */
const getUndoData = createSelector(undoData, items => items);
const getEnvData = createSelector(env, items => items);
const getRatiosData = createSelector(ratios, items => {
  const obj = merge({}, items.toJS(), cameoPaddingsRatio);

  return obj;

});
const getProjectData = createSelector(project, project => project);

// 获取所有size: spread原始宽高, workspace宽高.
const getUrls = createSelector(getEnvData, env => {
  return get(env, 'urls').toJS();
});

// 获取所有spreads
const getAllPages = createSelector(getProjectData, project => project.get('pageArray'));

// 获取翻页相关的信息.
const getPagination = createSelector(pagination, getAllPages, (pagination, allPages) => {
  return getRenderPagination(pagination, allPages);
});

// 获取所有elements
const getAllElements = createSelector(getProjectData, project => project.get('elementArray'));

// 获取所有decorations
const getAllDecorations = createSelector(allDecorations, decorations => decorations);

// 获取所有images
const getAllImages = createSelector(getProjectData, project => project.get('imageArray'));

// 获取所有cover, inner的渲染效果的素材.
const getAllMaterials = createSelector(materials, materials => materials);

// 获取所有与项目有关系的参数..
const getAllParameters = createSelector(getProjectData, project => project.get('parameterMap'));

// 获取封面sheet
const getCoverSpread = createSelector(getProjectData, project => project.get('cover'));

// 获取所有variables
const getAllVariables = createSelector(getProjectData, project => project.get('variableMap'));

const getTemplate = createSelector(template, items => items);

const getSnipping = createSelector(snipping, items => items);

// 获取spain的宽.
const getSpineSize = createSelector(getCoverSpread, coverSpread => {
  const size = {
    width: 0,
    height: 0,
    bleed:{
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  };

  // 查找容器里面的spine page. 并返回它的宽高.
  const containers = coverSpread.get('containers');
  if (containers) {
    const spinePage = containers.find(page => page.get('type') === pageTypes.spine);

    if (spinePage) {
      size.width = spinePage.get('width');
      size.height = spinePage.get('height');
      size.bleed = {
        top: spinePage.getIn(['bleed', 'top']),
        right: spinePage.getIn(['bleed', 'right']),
        bottom: spinePage.getIn(['bleed', 'bottom']),
        left: spinePage.getIn(['bleed', 'left'])
      };
    }
  }

  return size;
});

// 获取spain的压线.
const getSpainExpandingSize = createSelector(getAllParameters, (parameters) => {
  let size = {
    expandingOverBackcover: 0,
    expandingOverFrontcover: 0
  };

  if(parameters){
    size = parameters.get('spineExpanding').toJS();
  }

  return size;
});

// 获取所有设置
const getAllSettings = createSelector(getProjectData, project => {
  const uiSetting = project.getIn(['uiSetting', 'templateStrip']);
  return {
    spec: project.get('setting').toJS(),
    uiSetting: uiSetting ? uiSetting.toJS() : {},
    bookSetting: project.get('bookSetting').toJS()
  };
});

// 获取所有size: spread原始宽高, workspace宽高.
const getSize = createSelector(project,
  getRatiosData,
  getSpineSize,
  getSpainExpandingSize,
  getAllParameters,
  getAllMaterials,
  (project, ratios, spineSize, spainExpanding, parameters, materials) => {
    return getRenderSize(project, ratios, spineSize, spainExpanding, parameters, materials);
  });

// 计算渲染效果和sheet相对于workspace时, 白边需要调整的距离.
const getPosition = createSelector(getSize,
  getRatiosData,
  (size, ratios) => {
    return getRenderPosition(size, ratios);
  });

/*
 * 获取翻页后的spreads, 只返回3个spreads:
 * - 如果当前页为第一页: 那么返回1,2,3页
 * - 如果当前页为最后一页: 那么返回倒数3页.
 * - 否则返回当前页, 前一页和后一页.
 * - 如果spreads的总数小于3, 那么返回所有.
 */
const getPaginationSpread = createSelector(getAllPages,
  getCoverSpread,
  getAllElements,
  getAllDecorations,
  getAllImages,
  getAllSettings,
  getPagination,
  (allPages, coverSpread, allElements, allDecorations, allImages, settings, pagination) => {
    return getRenderPaginationSpread(allPages, coverSpread, allElements, allDecorations, allImages, settings, pagination);
  });

/*
 * 获取翻页后的spreads, 只返回3个spreads:
 * - 如果当前页为第一页: 那么返回1,2,3页
 * - 如果当前页为最后一页: 那么返回倒数3页.
 * - 否则返回当前页, 前一页和后一页.
 * - 如果spreads的总数小于3, 那么返回所有.
 */
const getPaginationSpreadForCover = createSelector(getAllPages,
  getCoverSpread,
  getAllElements,
  getAllDecorations,
  getAllImages,
  getAllSettings,
  getPagination,
  (allPages, coverSpread, allElements, allDecorations, allImages, settings, pagination) => {
    return getRenderPaginationSpread(allPages, coverSpread, allElements, allDecorations, allImages, settings, pagination, true);
  });

/**
 * 创建bookoptions页面所需要的数据.
 */
const getBookOptions = createSelector(getUrls,
  getSize,
  getRatiosData,
  getPosition,
  getAllMaterials,
  getAllVariables,
  getPagination,
  getPaginationSpreadForCover,
  getAllSettings,
  (urls, size, ratios, position, materials, variables, pagination, paginationSpread, settings)=>{
    return Immutable.fromJS({
      isPreview: true,
      urls,
      size,
      ratios,
      position: position.cover,
      materials,
      variables,
      pagination,
      paginationSpread,
      settings
    });
  });

const getArrangePagesSize = createSelector(getSize, getRatiosData, getAllParameters, (size, ratios, parameters) => {
  const obj = computedSizeForSpecialView(size, ratios, parameters, smallViewWidthInArrangePages);

  return obj;
});

/*
 * 获取翻页后的spreads, 只返回3个spreads:
 * - 如果当前页为第一页: 那么返回1,2,3页
 * - 如果当前页为最后一页: 那么返回倒数3页.
 * - 否则返回当前页, 前一页和后一页.
 * - 如果spreads的总数小于3, 那么返回所有.
 */
const getAllSpreads = createSelector(getAllPages,
  getCoverSpread,
  getAllElements,
  getAllDecorations,
  getAllImages,
  getAllSettings,
  (allPages, coverSpread, allElements, allDecorations, allImages, settings) => {
    return getRenderAllSpreads(allPages, coverSpread, allElements, allDecorations, allImages, settings);
  });

const getArrangePagesRatios = createSelector(getSize, getRatiosData, (size, ratios)=>{
  return computedRatioForSpecialView(size, ratios, smallViewWidthInArrangePages);
});

// 计算渲染效果和sheet相对于workspace时, 白边需要调整的距离.
const getArrangePagesPosition = createSelector(getArrangePagesSize,
  getArrangePagesRatios,
  (size, ratios) => {
    return getRenderPosition(size, ratios);
  });
/*---------------------end selector-----------------------------------*/

// 包装 component ，注入 dispatch 和 state 到其默认的 connect(select)(App) 中；
export const mapStateToProps = state => ({
  // 用于测试
  undoData: getUndoData(state),

  // 用于项目中
  env: getEnvData(state),
  urls: getUrls(state),
  ratios: getRatiosData(state),
  project: getProjectData(state),
  allElements: getAllElements(state),
  allDecorations: getAllDecorations(state),
  allImages: getAllImages(state),
  settings: getAllSettings(state),
  template: getTemplate(state),
  snipping: getSnipping(state),

  // cover, inner的渲染效果的素材.
  materials: getAllMaterials(state),
  size: getSize(state),
  position: getPosition(state),
  variables: getAllVariables(state),
  parameters: getAllParameters(state),
  pagination: getPagination(state),
  paginationSpread: getPaginationSpread(state),
  paginationSpreadForCover: getPaginationSpreadForCover(state),
  bookOptionsData: getBookOptions(state),

  // arrange pages
  arrangePagesRatios: getArrangePagesRatios(state),
  arrangePagesSize: getArrangePagesSize(state),
  arrangePagesPosition: getArrangePagesPosition(state),
  allSheets: getAllSpreads(state)
});
