import qs from 'qs';
import { merge, isArray, forEach, pick, set } from 'lodash';
import { guid } from '../../../common/utils/math';
import { convertObjIn } from '../../../common/utils/typeConverter';
import {
  API_SUCCESS,
  INIT_SPREAD,
  INIT_SPREAD_SETTING,
  INIT_ELEMENTS,
  UPDATE_ELEMENT,
  UPDATE_SETTING,
  UPDATE_SELECT_ELEMENT_INDEX,
  UPDATE_MULTI_ELEMENT,
  DELETE_ELEMENT,
  UPDATE_ELEMENT_DEPTH,
  TOGGLE_SIDEBAR,
  CHANGE_SPREAD_SETTING  } from '../constants/actionTypes';
import { GET_TEMPLATE } from '../constants/apiUrl';

const queryStringObj = qs.parse(window.location.search.substr(1));
const uidPk = queryStringObj.uidPk;

const initialState = {
  uidPk: +uidPk || -1,
  selectedElementIndex: 0,
  setting: {},
  spread: {},
  spreadOptions: {}
};

const updateMultiElement = (state, newElementArray) => {
  let newState = merge({}, state);
  const { spread, spreadOptions } = state;
  const { oriWidth, oriHeight } = spreadOptions;
  let copyElement = [];

  newElementArray.map((element) => {
    if (element) {
      const currentElementIndex = spread.elements.element.findIndex((item) => {
        return item.id === element.id;
      });
      copyElement = merge({}, element);
      if (element.x) {
        copyElement = merge({}, copyElement, {
          px: element.x / oriWidth
        });
      }
      if (element.y) {
        copyElement = merge({}, copyElement, {
          py: element.y / oriHeight
        });
      }
      if (element.width) {
        copyElement = merge({}, copyElement, {
          pw: element.width / oriWidth
        });
      }
      if (element.height) {
        copyElement = merge({}, copyElement, {
          ph: element.height / oriHeight
        });
      }
      const currentElement = spread.elements.element[currentElementIndex];
      newState = set(
        merge({}, newState),
        `spread.elements.element[${currentElementIndex}]`,
        merge({}, currentElement, copyElement)
      );
    }
  });
  return newState;
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

const convertSpread = (spread) => {
  const outObj = {};
  forEach(spread, (value, key) => {
    if (key === 'elements') {
      const { element } = value;
      const elements = isArray(element) ? [...element] : [element];
      outObj.elements = convertElements(elements);
    } else {
      outObj[key] = value;
    }
  });
  return outObj;
}

const convertElements = (elements) => {
  const xmlTextKey = '__text';
  const outElement = {};
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

    outArray.push(convertObjIn(outElement));
  });

  outElement.element = addElementIdIfHasNoId(outArray);

  return outElement;
};

const getNeededKey = () => {
  return [
    "setId", "layoutId", "size","coverDefault",  "sheetType", "ratio", "frameTotalNum", "frameHorizonNum", "frameVertialNum", "frameSquareNum", "status", "styleGuid", "uidPk", "orientation", "usePosition", "isCrossPage", "xmlViewData", "xmlViewDataPublish", "textFrameTotalNum", "textFrameHorizonNum", "textFrameVertialNum", "pressBookSheet", "isCoverDefault", "bestChosen", "model", "shareFlag"
  ];
}

const project = (state = initialState, action) => {
  switch (action.type) {
    case API_SUCCESS: {
      switch (action.apiPattern.name) {
        case  GET_TEMPLATE: {
          const needed = getNeededKey();
          const xmlObj = action.response;
          const projectObj = xmlObj.data;
          let obj = pick(projectObj, needed);
          obj.isCoverDefault = obj.coverDefault;
          delete obj.coverDefault;
          return merge({}, state, {
            __originalData__: projectObj,
            setting: obj
          });
        }
        default:
          return state;
      }
  }
  case INIT_SPREAD: {
    return merge({}, state, {
      spread: convertSpread(action.spread)
    });
  }
  case INIT_SPREAD_SETTING: {
    return merge({}, state, {
      spreadOptions: convertObjIn(action.options)
    })
  }
  case CHANGE_SPREAD_SETTING: {
    return merge({}, state, {
      spreadOptions: merge({}, state.spreadOptions, {
        bgUrl: action.bgUrl
      })
    })
  }
  case INIT_ELEMENTS: {
    const { elements, bookWidth, bookHeight } = action;

    const convertedElements = elements.map((element) => {
      return merge({}, element, {
        x: element.px * bookWidth,
        y: element.py * bookHeight,
        width: element.pw * bookWidth,
        height: element.ph * bookHeight
      });
    });

    return merge({}, state, {
      spread: merge({}, state.spread, {
        elements: merge({}, state.spread.elements, {
          element: convertedElements
        })
      })
    })
  }
  case UPDATE_ELEMENT: {
    const { spread, spreadOptions } = state;
    const { elementId, newAttribute } = action;
    const { oriWidth, oriHeight } = spreadOptions;
    const currentElementIndex = spread.elements.element.findIndex((item) => {
      return item.id === elementId;
    });
    const currentElement = spread.elements.element[currentElementIndex];
    let copyAttribute = merge({}, newAttribute);
    if(newAttribute.x) {
      copyAttribute = merge({}, copyAttribute, {
        px: newAttribute.x / oriWidth
      })
    }
    if(newAttribute.y) {
      copyAttribute = merge({}, copyAttribute, {
        py: newAttribute.y / oriHeight
      })
    }
    if(newAttribute.width) {
      copyAttribute = merge({}, copyAttribute, {
        pw: newAttribute.width / oriWidth
      })
    }
    if(newAttribute.height) {
      copyAttribute = merge({}, copyAttribute, {
        ph: newAttribute.height / oriHeight
      })
    }
    return set(
      merge({}, state),
      `spread.elements.element[${currentElementIndex}]`,
      merge({}, currentElement, copyAttribute)
    );
  }
  case UPDATE_SETTING: {
    return merge({}, state, {
      setting: merge({}, state.setting, action.newSetting)
    });
  }
  case UPDATE_SELECT_ELEMENT_INDEX: {
    return merge({}, state, {
      selectedElementIndex: action.elementId
    });
  }
  case UPDATE_MULTI_ELEMENT: {
    const { newElementArray } = action;
    return updateMultiElement(state, newElementArray);
  }
  case UPDATE_ELEMENT_DEPTH: {
    const { newElementArray } = action;
    return updateMultiElement(state, newElementArray);
  }
  case DELETE_ELEMENT: {
    const { spread } = state;
    const { elementId } = action;
    const currentElementIndex = spread.elements.element.findIndex((item) => {
      return item.id === elementId;
    });
    const elements = spread.elements.element;
    const newElements = [...elements.slice(0,currentElementIndex),...elements.slice(currentElementIndex+1)];
    return set(
      merge({}, state),
      `spread.elements.element`,
      newElements
    );
  }
  case TOGGLE_SIDEBAR: {
    return merge({}, state, {
      spreadOptions: merge({}, state.spreadOptions, {
        isSidebarShow: action.status
      })
    });
  }
  default:
   return state;
  }
}

export default project;
