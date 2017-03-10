import qs from 'qs';
import {
  merge,
  get,
  set,
  pick,
  forEach,
  isEmpty,
  mapValues,
  findIndex,
  isArray,
  isUndefined,
  isObject,
  some
} from 'lodash';
import {
  API_SUCCESS,
  CHANGE_PROJECT_SETTING,
  INIT_SPREAD_ARRAY,
  INIT_IMAGE_ARRAY,
  INIT_IMAGE_USED_COUNT_MAP,
  UPDATE_IMAGE_USED_COUNT_MAP,
  CREATE_ELEMENT,
  UPDATE_ELEMENT,
  DELETE_ELEMENT,
  UPLOAD_COMPLETE,
  DELETE_PROJECT_IMAGE,
  PROJECT_LOAD_COMPLETED
} from '../contants/actionTypes';
import {
  GET_PROJECT_DATA,
  GET_SPEC_DATA,
  NEW_PROJECT,
  SAVE_PROJECT
} from '../contants/apiUrl';

import { getPxByMM, guid } from '../../../common/utils/math';
import {
  generateSpreadArray,
  generateSpread
} from '../../src/utils/projectGenerator';
import { convertObjIn } from '../../../common/utils/typeConverter';
import projectParser from '../../../common/utils/projectParser';
import specParser from '../../../common/utils/specParser';

// 从url附加的参数信息中获取用户project的一些初始属性
const queryStringObj = qs.parse(window.location.search.substr(1));
const settingObj = pick(queryStringObj, ['title', 'size', 'product']);
settingObj.type = queryStringObj.insidePanel;
settingObj.spineThickness = queryStringObj.spine;
settingObj.paper = 'EP';

const initGuid = queryStringObj.initGuid;

const initialState = {
  projectId: +initGuid || -1,
  encProjectIdString: +initGuid ? '' : (initGuid || ''),
  setting: settingObj,
  spreadArray: [],
  imageArray: [],
  imageUsedCountMap: {},
  isProjectLoadCompleted: false,
  isProjectEdited: false,
  createdDate: new Date()
};

const affectedDrawSettingKeys = ['size', 'type'];

const convertParametersUnit = (parameterMap) => {
  const {
    baseWidth,
    baseHeight,
    innerBaseWidth,
    innerBaseHeight,
    innerWrapSize,
    spineSize,
    wrapSize,
    bleedSize
  } = parameterMap;

  const outObj = {
    baseWidth,
    baseHeight,
    innerBaseWidth,
    innerBaseHeight,
    wrapSize,
    innerWrapSize,
    bleedSize,
    width: spineSize + (2 * (baseWidth + wrapSize + bleedSize)),
    height: baseHeight + (2 * (wrapSize + bleedSize)),
    innerWidth: innerBaseWidth + (2 * (innerWrapSize + bleedSize)),
    innerHeight: innerBaseHeight + (2 * (innerWrapSize + bleedSize)),
    spineThickness: spineSize
  };

  return mapValues(outObj, v => getPxByMM(v));
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

const convertElements = (elements) => {
  const xmlTextKey = '__text';
  const outArray = [];
  elements.forEach((element) => {
    let outElement = merge({}, element);
    if (element[xmlTextKey]) {
      outElement = merge(outElement, {
        text: element[xmlTextKey]
      });
    }

    delete outElement[xmlTextKey];
    delete outElement.toString;

    outArray.push(outElement);
  });

  return outArray;
};

const convertSpreads = (spreads, parameterMap) => {
  const outArray = [];
  const spreadArray = isArray(spreads.spread)
    ? [...spreads.spread]
    : [spreads.spread];

  spreadArray.forEach((spread) => {
    const newSpread = generateSpread(
      spread.type,
      parameterMap,
      spread.pageNumber
    );
    const overwriteSpreadObj = pick(
      newSpread,
      [
        'w', 'h', 'bleedTop', 'bleedBottom', 'bleedLeft', 'bleedRight',
        'spineThicknessWidth', 'wrapSize'
      ]
    );
    const mergedSpread = merge({}, spread, overwriteSpreadObj);

    const outObj = {};
    forEach(mergedSpread, (value, key) => {
      if (key === 'elements') {
        const { element } = value;
        const elements = isArray(element) ? [...element] : [element];
        outObj.elements = addElementIdIfHasNoId(convertElements(elements));
      } else {
        outObj[key] = value;
      }
    });
    outArray.push(outObj);
  });

  return outArray;
};

const convertImages = (images) => {
  if (images) {
    return isArray(images.image) ? [...images.image] : [images.image];
  }

  return [];
};

const calculateCoverThumbnail = (parameterMap) => {
  const {
    baseWidth,
    baseHeight,
    bleedSize,
    wrapSize,
    spineThickness,
    width,
    height
  } = parameterMap;

  const pixelThumbnail = {
    x: bleedSize + wrapSize + baseWidth + spineThickness,
    y: bleedSize + wrapSize,
    width: baseWidth,
    height: baseHeight
  };

  return {
    x: pixelThumbnail.x / width,
    y: pixelThumbnail.y / height,
    width: pixelThumbnail.width / width,
    height: pixelThumbnail.height / height
  };
};

const getImageUsedCountMap = (obj) => {
  const outObj = {};
  forEach(obj, (value, key) => {
    if (key === 'imageid') {
      outObj[value] = 1;
    }
    if (isObject(value)) {
      const resultMap = getImageUsedCountMap(value);
      forEach(resultMap, (v, k) => {
        if (isUndefined(outObj[k])) {
          outObj[k] = resultMap[k];
        } else {
          outObj[k] += resultMap[k];
        }
      });
    }
  });
  return outObj;
};

const project = (state = initialState, action) => {
  switch (action.type) {
    case API_SUCCESS: {
      switch (action.apiPattern.name) {
        case GET_PROJECT_DATA: {
          const xmlObj = action.response;
          const projectObj = xmlObj.project;

          return merge({}, state, {
            __originalData__: projectObj,
            createdDate: new Date(projectObj.createdDate)
          });
        }
        case GET_SPEC_DATA: {
          const specObj = get(action, 'response.product-spec');

          const configurableOptionArray = specParser
            .prepareConfigurableOptionMap(specObj);
          const allOptionMap = specParser.prepareOptionGroup(specObj);
          const parameterArray = specParser.prepareParameters(specObj);

          const setting = projectParser
            .getDefaultProjectSetting(state.setting, configurableOptionArray);

          const availableOptionMap = projectParser.getAvailableOptionMap(
            setting, configurableOptionArray, allOptionMap
          );

          const parameterMap = projectParser.getParameters(
            setting,
            parameterArray
          );

          const convertedParameterMap = convertParametersUnit(parameterMap);
          const spreadArray = generateSpreadArray(
            setting.type, convertedParameterMap
          );

          const coverThumbnail = calculateCoverThumbnail(convertedParameterMap);

          return merge({}, state, {
            configurableOptionArray,
            setting,
            availableOptionMap,
            allOptionMap,
            parameterArray,
            spreadArray,
            coverThumbnail,
            parameterMap: convertedParameterMap
          });
        }
        case NEW_PROJECT: {
          return merge({}, state, {
            projectId: +get(action.response, 'resultData.project.guid') || -1,
            isProjectEdited: false
          });
        }
        case SAVE_PROJECT: {
          return merge({}, state, {
            isProjectEdited: false
          });
        }
        default:
          return state;
      }
    }
    case CHANGE_PROJECT_SETTING: {
      const newSetting = action.setting;
      if (!isEmpty(newSetting)) {
        const { configurableOptionArray, allOptionMap, parameterArray } = state;
        const isSpecDataLoaded = configurableOptionArray;
        const hasAffectedDrawSettingKey = some(
          Object.keys(newSetting),
          (key) => {
            return affectedDrawSettingKeys.indexOf(key) !== -1;
          }
        );
        if (isSpecDataLoaded && hasAffectedDrawSettingKey) {
          const setting = projectParser.getNewProjectSetting(
            state.setting,
            newSetting,
            configurableOptionArray
          );

          const availableOptionMap = projectParser.getAvailableOptionMap(
            setting,
            configurableOptionArray,
            allOptionMap
          );

          const parameterMap = projectParser.getParameters(
            setting,
            parameterArray
          );

          const convertedParameterMap = convertParametersUnit(parameterMap);
          const spreadArray = generateSpreadArray(
            setting.type, convertedParameterMap
          );

          const coverThumbnail = calculateCoverThumbnail(convertedParameterMap);

          const newState = merge({}, state, {
            setting,
            parameterMap: convertedParameterMap
          });

          const imageUsedCountMap = getImageUsedCountMap(
            convertObjIn(spreadArray)
          );

          set(newState, 'spreadArray', spreadArray);
          set(newState, 'coverThumbnail', coverThumbnail);
          set(newState, 'availableOptionMap', availableOptionMap);
          set(newState, 'imageUsedCountMap', imageUsedCountMap);
          set(newState, 'isProjectEdited', true);

          return newState;
        }

        return merge({}, state, {
          setting: newSetting,
          isProjectEdited: true
        });
      }
      return state;
    }
    case INIT_SPREAD_ARRAY: {
      const { spreads } = action;
      const { parameterMap } = state;
      return merge({}, state, {
        spreadArray: convertObjIn(convertSpreads(spreads, parameterMap))
      });
    }
    case INIT_IMAGE_ARRAY: {
      const { images } = action;
      return merge({}, state, {
        imageArray: convertObjIn(convertImages(images))
      });
    }
    case INIT_IMAGE_USED_COUNT_MAP:
    case UPDATE_IMAGE_USED_COUNT_MAP: {
      const { spreads } = action;
      const newState = merge({}, state);
      return set(
        newState,
        'imageUsedCountMap',
        getImageUsedCountMap(convertObjIn(spreads))
      );
    }
    case CREATE_ELEMENT: {
      const { spreadArray } = state;
      const { spreadId, element } = action;
      const currentSpreadIndex = findIndex(spreadArray, s => (s.id === spreadId));
      if (currentSpreadIndex !== -1) {
        const currentSpread = spreadArray[currentSpreadIndex];

        const newElement = merge({}, element, { id: guid() });

        return set(
          merge({}, state, { isProjectEdited: true }),
          `spreadArray[${currentSpreadIndex}].elements`,
          [...currentSpread.elements, newElement]
        );
      }
      return state;
    }
    case UPDATE_ELEMENT: {
      const { spreadArray } = state;
      const { spreadId, elementId, newAttribute } = action;
      const currentSpreadIndex = findIndex(spreadArray, s => (s.id === spreadId));
      if (currentSpreadIndex !== -1) {
        const currentSpread = spreadArray[currentSpreadIndex];
        const currentElementIndex = findIndex(
          currentSpread.elements,
          (element) => {
            return element.id === elementId;
          }
        );
        const currentElement = currentSpread.elements[currentElementIndex];

        return set(
          merge({}, state, { isProjectEdited: true }),
          `spreadArray[${currentSpreadIndex}].elements[${currentElementIndex}]`,
          merge({}, currentElement, newAttribute)
        );
      }

      return state;
    }
    case DELETE_ELEMENT: {
      const { spreadArray } = state;
      const { spreadId, elementId } = action;
      const currentSpreadIndex = findIndex(spreadArray, s => (s.id === spreadId));
      if (currentSpreadIndex !== -1) {
        const currentSpread = spreadArray[currentSpreadIndex];
        const { elements } = currentSpread;
        const currentElementIndex = findIndex(elements, (element) => {
          return element.id === elementId;
        });

        return set(
          merge({}, state, { isProjectEdited: true }),
          `spreadArray[${currentSpreadIndex}].elements`,
          [
            ...elements.slice(0, currentElementIndex),
            ...elements.slice(currentElementIndex + 1)
          ]
        );
      }

      return state;
    }
    case UPLOAD_COMPLETE: {
      const { imageArray } = state;
      const { fields } = action;
      const imageObj = {
        id: fields.imageId,
        guid: fields.guid,
        encImgId: fields.encImgId,
        name: fields.name,
        height: fields.height,
        width: fields.width,
        createTime: fields.createTime,
        order: imageArray.length,
        shotTime: ''
      };
      return merge({}, state, {
        imageArray: [...imageArray, convertObjIn(imageObj)],
        isProjectEdited: true
      });
    }
    case DELETE_PROJECT_IMAGE: {
      const { imageArray } = state;
      const { imageId } = action;
      const currentImageIndex = findIndex(
        imageArray,
        i => i.id === imageId
      );
      return set(
        merge({}, state, { isProjectEdited: true }),
        'imageArray',
        [
          ...imageArray.slice(0, currentImageIndex),
          ...imageArray.slice(currentImageIndex + 1)
        ]
      );
    }
    case PROJECT_LOAD_COMPLETED: {
      return merge({}, state, {
        isProjectLoadCompleted: true,
        isProjectEdited: false
      });
    }
    default:
      return state;
  }
};


export default project;
