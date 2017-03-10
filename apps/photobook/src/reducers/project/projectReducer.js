import Immutable from 'immutable';
import {
  isEmpty,
  isNumber,
  isUndefined,
  merge,
  pick,
  some,
  get
} from 'lodash';
import undoable, { includeAction } from 'redux-undo';

import * as types from '../../contants/actionTypes';
import * as apiUrl from '../../contants/apiUrl';

import specParser from '../../../../common/utils/specParser';
import projectParser from '../../../../common/utils/projectParser';
import { getPxByInch, getPxByPt, guid } from '../../../../common/utils/math';
import { convertObjIn } from '../../../../common/utils/typeConverter';

import {
  elementTypes,
  productTypes,
  coverTypes,
  pageTypes
} from '../../contants/strings';

import { getQueryStingObj } from '../../utils/url';
import { getSpineWidth } from '../../utils/sizeCalculator';
import { getCropOptions } from '../../utils/crop';
import {
  generatePageArray,
  generatePage,
  generateCover,
  generateSheet,
  generateContainer
} from '../../utils/projectGenerator';

const queryStringObj = getQueryStingObj();
const settingObj = pick(
  queryStringObj,
  [
    'size', 'paperThickness', 'gilding',
    'paper', 'product', 'cover', 'leatherColor',
    'cameo', 'cameoShape'
  ]
);
const initGuid = queryStringObj.initGuid;

const defaultBookSetting = {
  autoLayout: true,
  background: {
    color: '#FFFFFF'
  },
  font: {
    fontSize: 23,
    color: '#000000',
    fontFamilyId: 'roboto',
    fontId: 'roboto'
  },

  // 是否自动应用全局的边框设置到所有的图片元素.
  borderFrame: true,

  // 全局边框的默认值.
  border: {
    color: '#000000',
    size: 0,
    opacity: 100
  }
};

const initialState = Immutable.fromJS({
  projectId: +initGuid || -1,
  encProjectIdString: +initGuid ? '' : (initGuid || ''),
  title: queryStringObj.title,
  webClientId: queryStringObj.webClientId,
  setting: merge({}, settingObj, { client: 'h5' }),
  isProjectLoadCompleted: false,
  isProjectEdited: false,
  isParentBook: queryStringObj.isParentBook,
  createdDate: new Date(),
  cover: {},
  pageArray: [],
  elementArray: [],
  imageArray: [],
  imageUsedCountMap: {},
  decorationUsedCountMap: {},
  bookSetting: defaultBookSetting
});

const affectedCoverSettingKeys = [
  'cover', 'leatherColor'
];

const containersPathArr = ['cover', 'containers'];

const convertParametersUnit = (parameterMap) => {
  if (!isEmpty(parameterMap)) {
    const { bookBaseSize } = parameterMap;
    const outObj = merge({}, parameterMap);
    outObj.bookBaseSize = {
      height: getPxByInch(bookBaseSize.heightInInch),
      width: getPxByInch(bookBaseSize.widthInInch)
    };
    return outObj;
  }
  return null;
};

const addElementIdIfHasNoId = (elements) => {
  const outArray = [];
  elements.forEach((element) => {
    if (element) {
      if (typeof element.id !== 'undefined') {
        outArray.push(element);
      } else {
        outArray.push(merge({}, element, { id: guid() }));
      }
    }
  });
  return outArray;
};

const computeDataBySetting = (
  configurableOptionArray,
  parameterArray,
  variableArray,
  { needDefaultSetting, currentSetting, newSetting, bgColor }
) => {
  let setting = null;
  if (needDefaultSetting) {
    setting = projectParser.getDefaultProjectSetting(
      currentSetting, configurableOptionArray
    );
  } else {
    setting = projectParser.getNewProjectSetting(
      currentSetting,
      newSetting,
      configurableOptionArray
    );
  }

  const parameterMap = projectParser.getParameters(
    setting,
    parameterArray
  );

  const convertedParameterMap = convertParametersUnit(parameterMap);

  const pageArray = generatePageArray(
    setting.product, convertedParameterMap, bgColor
  );

  const variableMap = projectParser.getVariables(
    setting,
    variableArray
  );

  const cover = generateCover(
    setting.cover,
    convertedParameterMap,
    variableMap,
    bgColor
  );

  return {
    setting,
    cover,
    pageArray,
    variableMap,
    parameterMap: convertedParameterMap
  };
};

function updateSpineContainerWidth(state, type = 'add') {
  const containers = state.getIn(containersPathArr);
  const parameterMap = state.get('parameterMap');
  const spineContainerIndex = containers.findIndex((container) => {
    return container.get('type') === 'Spine';
  });

  let newState = state;
  if (spineContainerIndex !== -1) {
    const spineContainer = containers.get(spineContainerIndex);
    const addtionalValue = parameterMap.getIn(
      ['spineWidth', 'addtionalValue']
    );
    let newWidth = spineContainer.get('width');
    switch (type) {
      case 'add':
        newWidth += addtionalValue;
        break;
      case 'subtract':
        newWidth -= addtionalValue;
        break;
      default:
    }

    newState = newState.setIn(
      containersPathArr.concat([String(spineContainerIndex)]),
      spineContainer.set(
        'width',
        newWidth
      )
    );
  }

  return newState;
}

function countSpecifyKeyInObject(immutableObj, specifyKey) {
  let outObj = Immutable.Map();

  immutableObj.forEach((value, key) => {
    if (key === specifyKey && value) {
      outObj = outObj.set(String(value), 1);
    }
    if (value && value.size) {
      const resultMap = countSpecifyKeyInObject(value, specifyKey);
      resultMap.forEach((v, k) => {
        const stringKey = String(k);
        if (isUndefined(outObj.get(k))) {
          outObj = outObj.set(stringKey, resultMap.get(k));
        } else {
          outObj = outObj.set(
            stringKey,
            outObj.get(stringKey) + resultMap.get(stringKey)
          );
        }
      });
    }
  });
  return outObj;
}

function getImageUsedCountMap(immutableObj) {
  return countSpecifyKeyInObject(immutableObj, 'encImgId');
}

function getDecorationUsedCountMap(immutableObj) {
  return countSpecifyKeyInObject(immutableObj, 'decorationid');
}

const clamp = (n, min, max) => Math.max(Math.min(n, max), min);

function transformPageArray(existsPageArray, newPageArray, newParameterMap) {
  const firstNewPage = newPageArray.first();
  const minSheetNumber = newParameterMap.getIn(['sheetNumberRange', 'min']);
  const maxSheetNumber = newParameterMap.getIn(['sheetNumberRange', 'max']);
  const maxPageNumber = maxSheetNumber * 2;
  const minPageNumber = minSheetNumber * 2;

  let resultPageArray = existsPageArray.map((page) => {
    return page.merge({
      width: firstNewPage.get('width'),
      height: firstNewPage.get('height'),
      bleed: firstNewPage.get('bleed')
    });
  }).slice(0, maxPageNumber);

  if (resultPageArray.size < minPageNumber) {
    resultPageArray = resultPageArray.concat(
      newPageArray.slice(resultPageArray.size)
    );
  }

  return resultPageArray;
}

function transformTextElement(element, pageWidth, pageHeight) {
  const MIN_FONT_SIZE = 4;
  const MAX_FONT_SIZE = 120;

  const newFontSize = clamp(
    element.get('fontSize'),
    getPxByPt(MIN_FONT_SIZE) / pageHeight,
    getPxByPt(MAX_FONT_SIZE) / pageHeight
  );

  return element.merge({
    x: element.get('px') * pageWidth,
    y: element.get('py') * pageHeight,
    fontSize: newFontSize
  });
}

function transformDecorationElement(element, pageWidth, pageHeight) {
  const ratio = element.get('width') / element.get('height');

  const newWidth = element.get('pw') * pageWidth;
  const newHeight = newWidth / ratio;

  return element.merge({
    x: element.get('px') * pageWidth,
    y: element.get('py') * pageHeight,
    width: newWidth,
    height: newHeight,
    ph: newHeight / pageHeight
  });
}

function transformPhotoElement(element, imageArray, pageWidth, pageHeight) {
  const newWidth = element.get('pw') * pageWidth;
  const newHeight = element.get('ph') * pageHeight;

  const newX = element.get('px') * pageWidth;
  const newY = element.get('py') * pageHeight;

  const imageDetail = imageArray.find((item) => {
    return item.get('encImgId') === element.get('encImgId');
  });

  let elementOptions = {
    width: newWidth,
    height: newHeight,
    x: newX,
    y: newY
  };

  if (imageDetail) {
    const options = getCropOptions(
      imageDetail.get('width'),
      imageDetail.get('height'),
      newWidth,
      newHeight,
      element.get('imgRot')
    );
    const { cropLUX, cropLUY, cropRLX, cropRLY } = options;
    elementOptions = merge({}, elementOptions, {
      cropLUX,
      cropLUY,
      cropRLX,
      cropRLY
    });
  }

  return element.merge(elementOptions);
}

function transformElementArray(existsElementArray, transformedPageArray, imageArray) {
  let transformedElementArray = Immutable.List();

  transformedPageArray.forEach((page) => {
    const willTransformElementIds = page.get('elements');
    const pageWidth = page.get('width');
    const pageHeight = page.get('height');
    if (willTransformElementIds && willTransformElementIds.size) {
      existsElementArray.forEach((element) => {
        if (willTransformElementIds.indexOf(element.get('id')) !== -1) {
          let transformedElement = null;
          switch (element.get('type')) {
            case elementTypes.text:
              transformedElement = transformTextElement(
                element, pageWidth, pageHeight
              );
              break;
            case elementTypes.decoration:
              transformedElement = transformDecorationElement(
                element, pageWidth, pageHeight
              );
              break;
            case elementTypes.photo:
              transformedElement = transformPhotoElement(
                element, imageArray, pageWidth, pageHeight
              );
              break;
            default: {
              transformedElement = element.merge({
                x: element.get('px') * pageWidth,
                y: element.get('py') * pageHeight,
                width: element.get('pw') * pageWidth,
                height: element.get('ph') * pageHeight
              });
            }
          }

          transformedElementArray = transformedElementArray.push(
            transformedElement
          );
        }
      });
    }
  });

  return transformedElementArray;
}

function transformCover(newCover, newParameterMap, transformedPageArray) {
  const currentSheetNumber = transformedPageArray.size / 2;
  const minSheetNumber = newParameterMap.getIn(['sheetNumberRange', 'min']);
  const addedSheetNumber = currentSheetNumber - minSheetNumber;

  const coverPageBleed = newParameterMap.get('coverPageBleed');

  const spineWidth = getSpineWidth(
    newParameterMap.get('spineWidth').toJS(),
    addedSheetNumber
  ) + coverPageBleed.get('left') + coverPageBleed.get('right');

  const newContainers = newCover.get('containers');
  const newSpineContainerIndex = newContainers.findIndex((container) => {
    return container.get('type') === 'Spine';
  });

  return newCover.setIn(
    ['containers', String(newSpineContainerIndex), 'width'],
    spineWidth
  );
}


export let configurableOptionArray = null;
export let disableOptionArray = null;
export let allOptionMap = null;
export let parameterArray = null;
export let variableArray = null;

const project = (state = initialState, action) => {
  switch (action.type) {
    case types.API_SUCCESS: {
      switch (action.apiPattern.name) {
        case apiUrl.GET_PROJECT_DATA: {
          const projectObj = action.response.project;
          const bookSetting = state.get('bookSetting');

          return state.merge(Immutable.fromJS({
            createdDate: new Date(projectObj.createdDate),

            // border frame的设置是后面才加上的, 为了兼容以前新建的项目.
            // 打开老项目时后, 合并默认的bookSetting设置.
            bookSetting: bookSetting.merge(projectObj.summary.editorSetting)
          }));
        }
        case apiUrl.GET_PROJECT_TITLE: {
          return state.merge({
            title: action.response.projectName
          });
        }
        case apiUrl.CHECK_PROJECT_INFO: {
          return state.merge({
            info: Immutable.fromJS(action.response)
          });
        }
        case apiUrl.NEW_PROJECT:
        case apiUrl.SAVE_PROJECT: {
          return state.merge({
            isProjectEdited: false
          });
        }
        default: {
          return state;
        }
      }
    }
    case types.GET_SPEC_DATA: {
      const specObj = action.response['product-spec'];
      configurableOptionArray = specParser
        .prepareConfigurableOptionMap(specObj);
      allOptionMap = specParser.prepareOptionGroup(specObj);
      parameterArray = specParser.prepareParameters(specObj);
      variableArray = specParser.prepareVariables(specObj);
      disableOptionArray = specParser.prepareDisableOptionMap(specObj);


      const currentSetting = state.get('setting').toJS();

      const projectId = state.get('projectId');

      // TODO: 项目创建后，重新打开后，cover数据会重新生成，导致currentPage为空
      if (projectId !== -1) {
        return state;
      }

      return state.merge(
        Immutable.fromJS(
          computeDataBySetting(
            configurableOptionArray,
            parameterArray,
            variableArray,
            {
              needDefaultSetting: true,
              currentSetting,
              bgColor: state.getIn(['bookSetting', 'background', 'color'])
            }
          )
        )
      );
    }
    case types.INIT_PROJECT_SETTING:
    case types.CHANGE_PROJECT_SETTING: {
      const newSetting = action.setting;
      const hasAffectedCoverSettingKeys = some(
        Object.keys(newSetting),
        (key) => {
          return affectedCoverSettingKeys.indexOf(key) !== -1;
        }
      );

      if (!isEmpty(newSetting)) {
        const currentSetting = state.get('setting').toJS();

        const oldProduct = state.getIn(['setting', 'product']);

        const result = Immutable.fromJS(
          computeDataBySetting(
            configurableOptionArray,
            parameterArray,
            variableArray,
            {
              needDefaultSetting: false,
              bgColor: state.getIn(['bookSetting', 'background', 'color']),
              currentSetting,
              newSetting,
            }
          )
        );


        if ((oldProduct === productTypes.PS && newSetting.product) ||
        newSetting.product === productTypes.PS) {
          return state.merge(result, Immutable.fromJS({
            elementArray: [],
            imageUsedCountMap: {},
            decorationUsedCountMap: {}
          }));
        }

        if (newSetting.size || newSetting.product ||
          newSetting.paperThickness) {
          if (action.type === types.CHANGE_PROJECT_SETTING) {
            const pageArray = state.get('pageArray');
            const elementArray = state.get('elementArray');
            const imageArray = state.get('imageArray');

            const transformedPageArray = transformPageArray(
              pageArray, result.get('pageArray'), result.get('parameterMap')
            );

            const transformedElementArray = transformElementArray(
              elementArray, transformedPageArray, imageArray
            );

            const transformedCover = transformCover(
              result.get('cover'),
              result.get('parameterMap'),
              transformedPageArray
            );

            return state.merge(result, Immutable.fromJS({

              cover: transformedCover,
              pageArray: transformedPageArray,
              elementArray: transformedElementArray,
              imageUsedCountMap: getImageUsedCountMap(transformedElementArray),
              decorationUsedCountMap: getDecorationUsedCountMap(
                transformedElementArray
              )
            }));
          }

          // 初始化服务器获取的setting数据时，不渲染cover数据
          return state.merge({
            setting: result.get('setting'),
            pageArray: result.get('pageArray'),
            variableMap: result.get('variableMap'),
            parameterMap: result.get('parameterMap')
          });
        }

        // 当更改的setting会影响cover数据时，重新生成cover数据
        if (hasAffectedCoverSettingKeys) {
          const elementArray = state.get('elementArray');
          const containers = state.getIn(containersPathArr);

          let willDeleteElementIds = Immutable.List();
          containers.forEach((container) => {
            willDeleteElementIds = willDeleteElementIds.concat(
              container.get('elements')
            );
          });

          const newElementArray = elementArray.filter((element) => {
            return willDeleteElementIds.indexOf(element.get('id')) === -1;
          });

          return state.merge({
            setting: result.get('setting'),
            variableMap: result.get('variableMap'),
            parameterMap: result.get('parameterMap'),
            cover: result.get('cover'),
            elementArray: newElementArray,
            imageUsedCountMap: getImageUsedCountMap(newElementArray),
            decorationUsedCountMap: getDecorationUsedCountMap(newElementArray)
          });
        }

        return state.merge({
          setting: result.get('setting'),
          variableMap: result.get('variableMap'),
          parameterMap: result.get('parameterMap')
        });
      }

      return state;
    }
    case types.INIT_COVER: {
      const { cover, addedSheetNumber } = action;

      const bgColor = state.getIn(['bookSetting', 'background', 'color']);

      const newCover = generateCover(
        state.getIn(['setting', 'cover']),
        state.get('parameterMap').toJS(),
        state.get('variableMap').toJS(),
        bgColor,
        addedSheetNumber
      );

      const overwriteCoverObj = pick(newCover, [
        'width', 'height', 'bleed', 'bgColor', 'bgImageUrl',
      ]);

      const newFullContainer = newCover.containers.find((container) => {
        return container.type === 'Full';
      });
      const newSpineContainer = newCover.containers.find((container) => {
        return container.type === 'Spine';
      });

      const mergedCover = merge({}, convertObjIn(cover), overwriteCoverObj);

      const newContainers = [];
      let newElementArray = [];
      mergedCover.containers.forEach((container) => {
        const fixedElements = addElementIdIfHasNoId(container.elements);
        const mergedElements = fixedElements.map(ele => {
          return merge({}, {
            border: defaultBookSetting.border
          }, ele);
        });

        newElementArray = newElementArray.concat(mergedElements);

        const detachedContainer = merge({}, container, {
          elements: mergedElements.map(e => e.id)
        });

        switch (detachedContainer.type) {
          case 'Full': {
            const overwriteContainerObj = pick(newFullContainer, [
              'width', 'height', 'bleed'
            ]);
            newContainers.push(
              merge({}, detachedContainer, overwriteContainerObj)
            );
            break;
          }
          case 'Spine': {
            const overwriteContainerObj = pick(newSpineContainer, [
              'width', 'height', 'bleed'
            ]);
            newContainers.push(
              merge({}, detachedContainer, overwriteContainerObj)
            );
            break;
          }
          default:
            newContainers.push(detachedContainer);
        }
      });

      mergedCover.containers = newContainers;

      return state.merge({
        cover: mergedCover,
        elementArray: Immutable.fromJS(newElementArray)
      });
    }
    case types.INIT_PAGE_ARRAY: {
      const { pages } = action;
      const elementArray = state.get('elementArray');
      const setting = state.get('setting');

      const newPageArray = generatePageArray(
        setting.get('product'),
        state.get('parameterMap').toJS()
      );

      const detachedPageArray = [];
      let newElements = [];
      pages.forEach((page, index) => {
        const fixedElements = addElementIdIfHasNoId(page.elements);
        const mergedElements = fixedElements.map(ele => {
          return merge({}, {
            border: defaultBookSetting.border
          }, ele);
        });

        newElements = newElements.concat(mergedElements);

        const overwritePageObj = pick(newPageArray[index], [
          'width', 'height', 'bleed'
        ]);
        const detachedPage = merge({}, page, {
          elements: mergedElements.map(e => e.id)
        }, overwritePageObj);

        detachedPageArray.push(detachedPage);
      });

      const newElementArray = elementArray.concat(
        Immutable.fromJS(newElements)
      );

      return state.merge({
        pageArray: Immutable.fromJS(convertObjIn(detachedPageArray)),
        elementArray: newElementArray,
        imageUsedCountMap: getImageUsedCountMap(newElementArray),
        decorationUsedCountMap: getDecorationUsedCountMap(newElementArray)
      });
    }
    case types.INIT_IMAGE_ARRAY: {
      const { images } = action;

      return state.merge({
        imageArray: Immutable.fromJS(convertObjIn(images))
      });
    }
    case types.INIT_DECORATION_ARRAY: {
      const { decorations } = action;

      return state.merge({
        decorationArray: Immutable.fromJS(convertObjIn(decorations))
      });
    }
    case types.PROJECT_LOAD_COMPLETED: {
      return state.merge({
        isProjectLoadCompleted: true,
        isProjectEdited: false
      });
    }
    case types.UPLOAD_COMPLETE: {
      const imageArray = state.get('imageArray');
      const { fields } = action;
      const imageObj = {
        id: fields.imageId,
        guid: fields.guid,
        encImgId: fields.encImgId,
        name: fields.name,
        height: fields.height,
        width: fields.width,
        uploadTime: fields.uploadTime,
        order: imageArray.size,
        shotTime: fields.shotTime
      };

      return state.merge({
        imageArray: imageArray.push(Immutable.Map(convertObjIn(imageObj)))
      });
    }
    case types.DELETE_PROJECT_IMAGE: {
      const imageArray = state.get('imageArray');
      const { encImgId } = action;
      const currentImageIndex = imageArray.findIndex((o) => {
        return o.get('encImgId') === encImgId;
      });

      return state.deleteIn(['imageArray', String(currentImageIndex)]);
    }
    case types.CREATE_CONTAINER: {
      const { containerType, width, height, bleed } = action;
      const newContainer = Immutable.Map(generateContainer(
        containerType, width, height, bleed
      ));

      const containers = state.getIn(containersPathArr);

      return state.setIn(
        containersPathArr, containers.push(newContainer)
      );
    }
    case types.DELETE_CONTAINER: {
      const { containerId } = action;
      const containers = state.getIn(containersPathArr);
      const elementArray = state.get('elementArray');
      const willDeleteContainerIndex = containers.findIndex((container) => {
        return container.get('id') === containerId;
      });
      const willDeleteContainer = containers.get(willDeleteContainerIndex);
      const willDeleteElementIds = willDeleteContainer.get('elements');

      const newElementArray = elementArray.filter((element) => {
        return willDeleteElementIds.indexOf(element.get('id')) === -1;
      });

      let newState = state.setIn(
        containersPathArr, containers.delete(willDeleteContainerIndex)
      );
      newState = newState.set('elementArray', newElementArray);
      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );

      return newState;
    }
    case types.CREATE_DUAL_PAGE:
    case types.CREATE_MULTIPLE_DUAL_PAGE: {
      const { insertIndex, n } = action;

      let newState = state;
      const parameterMapObj = state.get('parameterMap').toJS();
      const product = state.getIn(['setting', 'product']);
      const bgColor = state.getIn(['bookSetting', 'background', 'color']);

      const isPressBook = (product === productTypes.PS);

      for (let i = 0; i < n; i += 1) {
        const pageArray = newState.get('pageArray');

        const length = pageArray.size;

        let leftPage = null;
        let rightPage = null;

        if (isPressBook) {
          leftPage = generatePage(product, parameterMapObj, length, bgColor);
          rightPage = generatePage(
            product, parameterMapObj, length + 1, bgColor
          );
        } else {
          leftPage = generateSheet(parameterMapObj, length, bgColor);
          rightPage = generatePage(
            product, parameterMapObj, length + 1, bgColor
          );
          rightPage.backend.isPrint = false;
        }

        let newPageArray;
        // PressBook不能插入到最后
        let index = isPressBook ? length - 2 : length;
        if (isNumber(insertIndex)) {
          index = insertIndex;
        }
        newPageArray = pageArray.insert(index, Immutable.fromJS(leftPage));
        newPageArray = newPageArray.insert(
          index + 1,
          Immutable.fromJS(rightPage)
        );

        newState = newState.set('pageArray', newPageArray);
        newState = updateSpineContainerWidth(newState, 'add');
      }

      return newState;
    }
    case types.DELETE_DUAL_PAGE:
    case types.DELETE_MULTIPLE_DUAL_PAGE: {
      const dualPageIdList = Immutable.fromJS(action.dualPageIdList);

      const pageArray = state.get('pageArray');
      const elementArray = state.get('elementArray');

      let willDeleteElementIds = Immutable.List();
      let newState = state;
      let newPageArray = pageArray;

      dualPageIdList.forEach((dualPageIdObj) => {
        const leftPageId = dualPageIdObj.get('leftPageId');
        const rightPageId = dualPageIdObj.get('rightPageId');

        let willDeleteLeftPage = null;
        let willDeleteRightPage = null;

        newPageArray.forEach((page) => {
          const pageId = page.get('id');
          if (pageId === leftPageId) {
            willDeleteLeftPage = page;
          }

          if (pageId === rightPageId) {
            willDeleteRightPage = page;
          }
        });

        willDeleteElementIds = willDeleteElementIds.concat(
          willDeleteLeftPage.get('elements')
        );
        willDeleteElementIds = willDeleteElementIds.concat(
          willDeleteRightPage.get('elements')
        );

        newPageArray = newPageArray.filter((page) => {
          const pageId = page.get('id');
          return pageId !== leftPageId && pageId !== rightPageId;
        });

        newState = newState.set('pageArray', newPageArray);
        newState = updateSpineContainerWidth(newState, 'subtract');
      });

      const newElementArray = elementArray.filter((element) => {
        return willDeleteElementIds.indexOf(element.get('id')) === -1;
      });

      newState = newState.set('elementArray', newElementArray);
      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );

      return newState;
    }
    case types.CREATE_ELEMENT:
    case types.CREATE_ELEMENTS: {
      const containers = state.getIn(containersPathArr);
      const pageArray = state.get('pageArray');
      const elementArray = state.get('elementArray');
      const { pageId } = action;

      const elements = Immutable.fromJS(action.elements || [action.element]);

      const elementIdArray = elements.map((element) => {
        return element.get('id');
      });

      const containerIndex = containers.findIndex((container) => {
        return container.get('id') === pageId;
      });
      const pageIndex = pageArray.findIndex((page) => {
        return page.get('id') === pageId;
      });

      const newElementArray = elementArray.concat(elements);
      let newState = null;
      if (containerIndex !== -1) {
        const oldElements = state.getIn(
          containersPathArr.concat([String(containerIndex), 'elements'])
        );
        newState = state.setIn(
          containersPathArr.concat([String(containerIndex), 'elements']),
          oldElements.concat(elementIdArray)
        );
      } else if (pageIndex !== -1) {
        const oldElements = state.getIn(
          ['pageArray', String(pageIndex), 'elements']
        );

        newState = state.setIn(
          ['pageArray', String(pageIndex), 'elements'],
          oldElements.concat(elementIdArray)
        );
      }

      newState = newState.set('elementArray', newElementArray);

      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );

      return newState;
    }
    case types.DELETE_ELEMENT:
    case types.DELETE_ELEMENTS: {
      const { pageId } = action;
      const elementIds = action.elementIds || [action.elementId];

      const containers = state.getIn(containersPathArr);
      const pageArray = state.get('pageArray');
      const elementArray = state.get('elementArray');

      const containerIndex = containers.findIndex((container) => {
        return container.get('id') === pageId;
      });
      const pageIndex = pageArray.findIndex((page) => {
        return page.get('id') === pageId;
      });

      let newState = state;
      if (containerIndex !== -1) {
        const oldElements = newState.getIn(
          containersPathArr.concat([String(containerIndex), 'elements'])
        );
        newState = newState.setIn(
          containersPathArr.concat([String(containerIndex), 'elements']),
          oldElements.filter(id => elementIds.indexOf(id) === -1)
        );
      } else if (pageIndex !== -1) {
        const oldElements = newState.getIn(
          ['pageArray', String(pageIndex), 'elements']
        );
        newState = newState.setIn(
          ['pageArray', String(pageIndex), 'elements'],
          oldElements.filter(id => elementIds.indexOf(id) === -1)
        );
      }

      const newElementArray = elementArray.filter((element) => {
        return elementIds.indexOf(element.get('id')) === -1;
      });

      newState = newState.set('elementArray', newElementArray);

      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );

      return newState;
    }
    case types.DELETE_ALL: {
      const containers = state.getIn(containersPathArr);
      const pageArray = state.get('pageArray');
      const elementArray = state.get('elementArray');

      const typeList = [
        elementTypes.photo,
        elementTypes.text,
        elementTypes.decoration,
        elementTypes.paintedText
      ];

      const setting = state.get('setting');
      const product = setting.get('product');
      const cover = setting.get('cover');

      const needCameoCoverTypes = [coverTypes.PSNC, coverTypes.PSLC];

      if (product !== productTypes.PS ||
      needCameoCoverTypes.indexOf(cover) === -1) {
        typeList.push(elementTypes.cameo);
      }

      const newElementArray = elementArray.filter((element) => {
        return typeList.indexOf(element.get('type')) === -1;
      });
      const newElementIds = newElementArray.map(element => element.get('id'));

      let newState = state;
      containers.forEach((container, index) => {
        const oldElements = newState.getIn(
          containersPathArr.concat([String(index), 'elements'])
        );
        newState = newState.setIn(
          containersPathArr.concat([String(index), 'elements']),
          oldElements.filter((id) => {
            return newElementIds.indexOf(id) !== -1;
          })
        );
      });

      pageArray.forEach((page, index) => {
        const oldElements = newState.getIn(
          ['pageArray', String(index), 'elements']
        );

        newState = newState.setIn(
          ['pageArray', String(index), 'elements'],
          oldElements.filter((id) => {
            return newElementIds.indexOf(id) !== -1;
          })
        );
      });

      newState = newState.set('elementArray', newElementArray);
      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );
      return newState;
    }
    case types.UPDATE_ELEMENT:
    case types.UPDATE_ELEMENTS: {
      const elements = Immutable.fromJS(action.elements || [action.element]);

      const elementArray = state.get('elementArray');
      let newElementArray = Immutable.List();

      elementArray.forEach((element) => {
        const eId = element.get('id');
        const theElement = elements.find(e => e.get('id') === eId);
        if (theElement) {
          newElementArray = newElementArray.push(
            element.merge(theElement)
          );
        } else {
          newElementArray = newElementArray.push(element);
        }
      });

      let newState = state.set('elementArray', newElementArray);
      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );

      return newState;
    }
    case types.CHANGE_BOOK_SETTING: {
      const { bookSetting } = action;

      let newState = state.merge({
        bookSetting
      });

      // 获取新的背景色.
      const backgroundColor = get(bookSetting, 'background.color');

      if (backgroundColor) {
        const pageArray = newState.get('pageArray');
        pageArray.forEach((page, index) => {
          newState = newState.setIn(
            ['pageArray', String(index), 'bgColor'],
            backgroundColor
          );
        });

        const containers = newState.getIn(containersPathArr);

        containers.forEach((container, index) => {
          newState = newState.setIn(
            containersPathArr.concat([String(index), 'bgColor']),
            backgroundColor
          );
        });
      }

      // 获取自动应用全局的边框设置开关的值.
      const borderFrame = get(bookSetting, 'borderFrame');

      // 获取全局的边框信息.
      const border = get(bookSetting, 'border');

      // 如果自动应用全局的边框设置开关设置为true.
      // 就更新所有page下的所有图片框的border设置.
      if(borderFrame){
        const elementArray = newState.get('elementArray');

        elementArray.forEach((element, index) => {
          newState = newState.setIn(
            ['elementArray', String(index), 'border'],
            border
          );
        });
      }

      return newState;
    }
    case types.APPLY_TEMPLATE_TO_PAGES:
    case types.APPLY_TEMPLATE: {
      const { templateDataArray } = action;

      let newState = state;

      templateDataArray.forEach((templateData) => {
        const elements = templateData.get('elements');
        const pageId = templateData.get('pageId');
        const templateId = templateData.get('templateId');

        const containers = newState.getIn(containersPathArr);
        const pageArray = newState.get('pageArray');
        const elementArray = newState.get('elementArray');

        const containerIndex = containers.findIndex((container) => {
          return container.get('id') === pageId;
        });
        const pageIndex = pageArray.findIndex((page) => {
          return page.get('id') === pageId;
        });

        let oldElementIds = null;
        if (containerIndex !== -1) {
          newState = newState.setIn(
            containersPathArr.concat(
              [String(containerIndex), 'template', 'tplGuid']
            ),
            templateId
          );
          oldElementIds = newState.getIn(
            containersPathArr.concat([String(containerIndex), 'elements'])
          );
          newState = newState.setIn(
            containersPathArr.concat([String(containerIndex), 'elements']),
            elements.map(element => element.get('id'))
          );
        } else if (pageIndex !== -1) {
          newState = newState.setIn(
            ['pageArray', String(pageIndex), 'template', 'tplGuid'],
            templateId
          );
          oldElementIds = newState.getIn(
            ['pageArray', String(pageIndex), 'elements']
          );
          newState = newState.setIn(
            ['pageArray', String(pageIndex), 'elements'],
            elements.map(element => element.get('id'))
          );
        }

        let newElementArray = elementArray.filter((element) => {
          return oldElementIds.indexOf(element.get('id')) === -1;
        });

        newElementArray = newElementArray.concat(elements);

        newState = newState.set('elementArray', newElementArray);
      });

      const newElementArray = newState.get('elementArray');

      newState = newState.set(
        'imageUsedCountMap',
        getImageUsedCountMap(newElementArray)
      );
      newState = newState.set(
        'decorationUsedCountMap',
        getDecorationUsedCountMap(newElementArray)
      );

      return newState;
    }
    case types.CHANGE_PAGE_BGCOLOR: {
      const pageId = action.pageId;

      let newState = state;

      // 根据pageid查找对应的page.
      const containers = newState.getIn(containersPathArr);
      const pageArray = newState.get('pageArray');
      const containerIndex = containers.findIndex((container) => {
        return container.get('id') === pageId;
      });
      const pageIndex = pageArray.findIndex((page) => {
        return page.get('id') === pageId;
      });

      const bgColor = action.bgColor;
      if (containerIndex !== -1) {
        containers.forEach((container, index) => {
          newState = newState.setIn(
            containersPathArr.concat(
              [String(index), 'bgColor']
            ),
            bgColor
          );
        });
      } else if (pageIndex !== -1) {
        newState = newState.setIn(
          ['pageArray', String(pageIndex), 'bgColor'],
          bgColor
        );
      }
      return newState;
    }
    case types.UPDATE_PAGE_TEMPLATE_ID: {
      const pageId = action.pageId;
      const templateId = action.templateId;

      let newState = state;

      // 根据pageid查找对应的page.
      const containers = newState.getIn(containersPathArr);
      const pageArray = newState.get('pageArray');
      const containerIndex = containers.findIndex((container) => {
        return container.get('id') === pageId;
      });
      const pageIndex = pageArray.findIndex((page) => {
        return page.get('id') === pageId;
      });

      if (containerIndex !== -1) {
        containers.forEach((container, index) => {
          newState = newState.setIn(
            containersPathArr.concat(
              [String(index), 'template', 'tplGuid']
            ),
            templateId
          );
        });
      } else if (pageIndex !== -1) {
        newState = newState.setIn(
          ['pageArray', String(pageIndex), 'template', 'tplGuid'],
          templateId
        );
      }
      return newState;
    }
    case types.MOVE_PAGE_BEFORE: {
      const { pageId, beforePageId } = action;
      const pageArray = state.get('pageArray');

      let pageIndex = -1;
      let beforePageIndex = -1;

      pageArray.forEach((page, index) => {
        const pId = page.get('id');
        if (pId === pageId) {
          pageIndex = index;
        }

        if (pId === beforePageId) {
          beforePageIndex = index;
        }
      });

      const thePage = pageArray.get(pageIndex);
      let newPageArray = pageArray;

      if (pageIndex !== -1 && beforePageIndex !== -1) {
        if (thePage.get('type') === pageTypes.sheet) {
          const blankPageIndex = pageIndex + 1;
          const blankPage = pageArray.get(pageIndex + 1);

          newPageArray = newPageArray.filter((page, index) => {
            return index !== pageIndex && index !== blankPageIndex;
          });

          newPageArray = newPageArray.slice(0, beforePageIndex)
            .concat(Immutable.List([thePage, blankPage]))
            .concat(newPageArray.slice(beforePageIndex));
        } else {
          newPageArray = newPageArray.delete(pageIndex);

          newPageArray = newPageArray.slice(0, 1)
            .concat(newPageArray.slice(1, beforePageIndex))
            .concat(Immutable.List([thePage]))
            .concat(newPageArray.slice(beforePageIndex));

          newPageArray.forEach((page, index) => {
            if (index % 2 === 0) {
              newPageArray = newPageArray.setIn(
                [String(index), 'pageAlign'], 'Left'
              );
            } else {
              newPageArray = newPageArray.setIn(
                [String(index), 'pageAlign'], 'Right'
              );
            }
          });
        }
        return state.set('pageArray', newPageArray);
      }

      return state;
    }
    case types.UPDATE_PROJECT_ID: {
      return state.merge({
        projectId: action.projectId
      });
    }
    case types.CHANGE_PROJECT_TITLE: {
      return state.merge({
        title: action.title
      });
    }
    case types.RESET_PROJECT_INFO: {
      return state.merge(Immutable.fromJS({
        info: {
          cart: 0,
          order: 0
        }
      }));
    }
    default:
      return state;
  }
};

const undoableProject = undoable(project, {
  filter: includeAction([]),
  limit: 10
});

export default undoableProject;
