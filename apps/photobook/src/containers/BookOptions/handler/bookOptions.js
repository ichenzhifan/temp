import Immutable from 'immutable';
import { merge, get } from 'lodash';
import { generateCover } from '../../../utils/projectGenerator';
import { computedWorkSpaceRatio } from '../../../utils/screen';
import { getRenderCoverSheetSize, getRenderPosition, convertCoverSummaryPages } from '../../../utils/sizeCalculator';
import { computedCameoElementOptions } from '../../../utils/cameo';
import { checkIsSupportHalfImageInCover } from '../../../utils/cover';
import { percent, pageTypes, elementTypes, cameoPaddingsRatio } from '../../../contants/strings';
import projectParser from '../../../../../common/utils/projectParser';
import { getPxByInch } from '../../../../../common/utils/math';
import { variableArray, parameterArray } from '../../../reducers/project/projectReducer';
import { makeCoverImage, makeInnerImage } from '../../../utils/renderGenerator';

/**
 * 根据新的封面信息, 更新原来封面上的元素.
 */
const updateCameoElements = (elements, coverObject, size) => {
  let newElements = elements;
  if (elements) {
    elements.forEach((element, key) => {
      if (element.get('type') === elementTypes.cameo) {
        const cameoSize = Immutable.Map({
          width: element.get('width'),
          height: element.get('height')
        });
        const options = computedCameoElementOptions(size.coverSpreadSize, cameoSize, size.spineSize);

        newElements = elements.set(key, element.merge(options));
      }
    });
  }

  return newElements;
};

/**
 * 从属性中解构这些对象:
 * isPreview, urls, size, ratios, position, materials, variables, pagination, paginationSpread, settings
 */
export const destructorObject = (that, nextProps) => {
  const { bookOptionsData } = nextProps || that.props;

  const urls = bookOptionsData.get('urls') ? bookOptionsData.get('urls').toJS() : {};
  const size = bookOptionsData.get('size') ? bookOptionsData.get('size').toJS() : {};
  const ratios = bookOptionsData.get('ratios') ? bookOptionsData.get('ratios').toJS() : {};
  const position = bookOptionsData.get('position') ? bookOptionsData.get('position').toJS() : {};
  const pagination = bookOptionsData.get('pagination') ? bookOptionsData.get('pagination').toJS() : {};
  const settings = bookOptionsData.get('settings') ? bookOptionsData.get('settings').toJS() : {};
  const materials = bookOptionsData.get('materials');
  const variables = bookOptionsData.get('variables');
  const paginationSpread = bookOptionsData.get('paginationSpread');
  const isPreview = bookOptionsData.get('isPreview');

  return {
    isPreview,
    urls,
    size,
    ratios,
    position,
    materials,
    variables,
    pagination,
    paginationSpread,
    settings
  };
};

/**
 * 生成封面上的渲染效果图.
 */
const getCoverImage = (size, coverType, done) => {
  if (size && size.renderCoverSheetSizeWithoutBleed && size.renderCoverSheetSizeWithoutBleed.width) {
    makeCoverImage(coverType, {
        width: size.renderCoverSheetSizeWithoutBleed.width,
        height: size.renderCoverSheetSizeWithoutBleed.height
      },
      size.renderSpainWidthWithoutBleed,
      (data) => {
        const { coverWorkspaceSize } = size;

        const paddingLeft = (data.size.width - data.size.innerWidth) / 2;
        const paddingTop = (data.size.height - data.size.innerHeight) / 2;

        done && done({
          img: data.img,
          size: data.size,
          outPaddings: data.outPaddings,
          paddings: data.paddings,
          ratio: {
            coverRenderPaddingLeft: paddingLeft / data.size.width,
            coverRenderPaddingTop: paddingTop / data.size.height,
            coverRenderWidth: data.size.width / coverWorkspaceSize.width,
            coverRenderHeight: data.size.height / coverWorkspaceSize.height
          }
        });
      });
  }
};

/**
 * 根据新选中的属性, 重新生成新的product cover对象.
 */
export const updateBookOptionsData = (that, settings, selectMap) => {
  const oldSetting = Immutable.fromJS(that.state.setting);
  const newSetting = Immutable.fromJS(settings);

  // 如果设置没有变化, 就直接返回.
  if(Immutable.is(oldSetting, newSetting)){
    return;
  }

  // 只有当product, size, cover, leatherColor发生改变. 才进行重新计算.
  // 如果改变的是Paper、Thickness等就不需要重新计算.
  if(oldSetting.get('size') === newSetting.get('size') &&
    oldSetting.get('product') === newSetting.get('product') &&
    oldSetting.get('cover') === newSetting.get('cover') &&
    oldSetting.get('leatherColor') === newSetting.get('leatherColor')){
    // 更改后的值在changesetting的方法中, 以及更新到state.
    // 这里就不需要重复更新state了. 直接返回即可.
    return;
  }

  // 显示页面loading.
  that.setState({
    isLoading: true
  });

  // 根据新的设置获取对应的paramter和variables
  const parameterMap = projectParser.getParameters(settings, parameterArray);
  const variableMap = projectParser.getVariables(settings, variableArray);

  // parmater中获取到的是bookBaseSize是英寸. 使用时要转成像素.
  const { bookBaseSize } = parameterMap;
  parameterMap.bookBaseSize = {
    height: getPxByInch(bookBaseSize.heightInInch),
    width: getPxByInch(bookBaseSize.widthInInch)
  };

  const { project } = that.props;
  const bgColor = project.getIn(['bookSetting', 'background', 'color']);
  // 根据过滤好的paramters和variables, 生成临时的cover数据.
  const tempCoverObject = generateCover(settings.cover, parameterMap, variableMap, bgColor);

  // 根据临时的cover数据, 计算该设置下的cover spread的size
  const coverSpreadSize = {
    width: tempCoverObject.width,
    height: tempCoverObject.height
  };

  // 根据临时的cover数据, 计算该设置下的ratio
  const coverWorkspaceRatio = computedWorkSpaceRatio(coverSpreadSize, {
    top: 160,
    right: 0,
    bottom: 160,
    left: 480
  }, percent.big);

  // 根据临时的cover数据, 计算该设置下的cover workspace的size
  const coverWorkspaceSize = {
    width: Math.ceil(tempCoverObject.width * coverWorkspaceRatio),
    height: Math.ceil(tempCoverObject.height * coverWorkspaceRatio)
  };

  // 渲染书脊时的实际宽度: 书脊宽度.
  const spainElement = tempCoverObject.containers.find(c => c.type === pageTypes.spine)
  const spineSize = spainElement ? {
    width: spainElement.width,
    height: spainElement.height
  } : { width: 0, height: 0 };

  // 书脊压线
  const spainExpanding = parameterMap.spineExpanding;

  // 渲染book时, cover sheet的实际大小: 整个spread的大小减去出血.
  const renderCoverSheetSize = getRenderCoverSheetSize(coverSpreadSize, Immutable.fromJS({
    coverPageBleed: tempCoverObject.bleed
  }), coverWorkspaceRatio);

  // 根据新的设置, 生成的所有cover上的ratios的集合.
  const coverRenderPaddingTop = tempCoverObject.bleed.top / tempCoverObject.height;
  const coverRenderPaddingLeft = tempCoverObject.bleed.left / tempCoverObject.width;
  let ratios = merge({}, that.state.ratios, cameoPaddingsRatio, {
    coverWorkspace: coverWorkspaceRatio,
    coverRenderPaddingTop,
    coverRenderPaddingLeft,
    coverSheetPaddingTop: coverRenderPaddingTop,
    coverSheetPaddingLeft: coverRenderPaddingLeft
  });

  // 根据新的设置, 生成的所有cover上的各种尺寸的集合.
  const size = {
    coverSpreadSize,
    spineSize,
    spainExpanding,
    coverWorkspaceSize,
    renderCoverSize: {
      width: Math.ceil(coverWorkspaceSize.width * ratios.coverRenderWidth),
      height: Math.ceil(coverWorkspaceSize.height * ratios.coverRenderHeight)
    },
    renderSpainWidth: Math.ceil(spineSize.width * coverWorkspaceRatio),
    renderSpainWidthWithoutBleed: Math.ceil((spineSize.width - (spainElement.bleed.left + spainElement.bleed.right)) * coverWorkspaceRatio),

    // 渲染book时, sheet的实际大小.
    renderCoverSheetSize: renderCoverSheetSize.container,
    renderCoverSheetSizeWithoutBleed: renderCoverSheetSize.sheet,

    // 不关心内页的尺寸, 计算尺寸的其它接口会使用这个值. 为避免程序出错, 就添加一个默认值.
    innerWorkspaceSize: { width: 0, height: 0 }
  };

  // 更新元素信息.
  //const newElements = updateCameoElements(that.state.paginationSpread.get('elements'), tempCoverObject, size);
  const formatedCoverData = convertCoverSummaryPages(Immutable.fromJS(tempCoverObject), { spec: settings }, {total:0});

  const newElements = Immutable.Map({});
  const paginationSpread = that.state.paginationSpread.merge({
    elements: newElements,
    pages: formatedCoverData.pages,
    summary: formatedCoverData.summary.merge({
      isCover: true,
      isSupportHalfImageInCover: checkIsSupportHalfImageInCover(settings.cover)
    })
  });

  // 重新生成封面效果图.
  getCoverImage(size, settings.cover, data => {
    let materials = that.state.materials;
    materials = materials.setIn(['cover', 'img'], data.img);

    // 更新ratios
    const paddingLeft = (data.size.width - data.size.innerWidth) / 2;
    const paddingTop = (data.size.height - data.size.innerHeight) / 2;

    ratios = merge({}, ratios, {
      'coverRenderPaddingLeft': paddingLeft / coverWorkspaceSize.width,
      'coverRenderPaddingTop': paddingTop / coverWorkspaceSize.height,
      'coverRenderOutPaddingLeft' : data.outPaddings.left / coverWorkspaceSize.width,
      'coverRenderOutPaddingTop': data.outPaddings.top / coverWorkspaceSize.width,
      'coverRenderWidth': data.size.width / coverWorkspaceSize.width,
      'coverRenderHeight': data.size.height / coverWorkspaceSize.height
    });

    size.renderCoverSize = {
      width: Math.ceil(coverWorkspaceSize.width * ratios.coverRenderWidth),
      height: Math.ceil(coverWorkspaceSize.height * ratios.coverRenderHeight)
    };

    // 根据新的设置, 生成的所有cover上的position的集合.
    const position = getRenderPosition(size, ratios).cover;

    // 更新spec的setting.
    let newSettings = get(that.state, 'settings');
    newSettings.spec = settings;

    // 更新state
    that.setState({
      materials,
      size,
      ratios,
      position,
      settings: newSettings,
      variables: Immutable.fromJS(variableMap),
      paginationSpread,

      // 隐藏页面loading.
      isLoading: false
    });
  });
};
