import {
  GET_TEMPLATE,
  GET_SPREAD,
  SAVE_TEMPLATE,
  PUBLISH_TEMPLATE,
  COPY_TEMPLATE,
  GET_STYLE_LIST,
  GET_TEST_IMAGE_URL,
  GET_LIVE_IMAGE_URL } from '../constants/apiUrl';
import { elementTypes } from '../constants/strings';
import {
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
import { innerSafeZong } from '../constants/safeZong';
import { CALL_API } from '../middlewares/api';
import { generateTemplate } from '../utils/templateGenerator';
import { getBoxLimit } from '../utils/window';

import { get, merge, template, pick } from 'lodash';

import { guid } from '../../../common/utils/math';
import { getUrlParam } from '../../../common/utils/url';
import { convertObjIn } from '../../../common/utils/typeConverter';

import x2jsInstance from '../../../common/utils/xml2js';
import qs from 'qs';

//记录elements的临时状态
let tempElements = [];
let tempSpread = {};

const handleProjectData = (data, dispatch) => {
  let { sheetType, frameHorizonNum, textFrameHorizonNum } = data;
  const { xmlViewData } = data;
  if (xmlViewData==null) {
    let i = 0;
    dispatch({
      type: INIT_SPREAD,
      spread: {
        type: sheetType,
        bgColor: 16777215
      }
    });
    while(frameHorizonNum--) {
      tempElements.push(createElement(i++));
    }
    while(textFrameHorizonNum--) {
      tempElements.push(createElement(i++, elementTypes.text));
    }
  } else {
    const xmlData = x2jsInstance.xml2js(get(data, `xmlViewData`));
    tempSpread = xmlData.templateView.spread;
  }

}

const createElement = (dep, type = elementTypes.photo) => {
  const element = {
    id: guid(),
    type,
    x: 20 * dep,
    y: 10 * dep,
    width: 500,
    height: 600,
    rot: 0,
    dep: dep,
    isLock: false,
    keepRatio: false
  };
  if (type === elementTypes.text) {
    return merge({}, element, {
      text: 'Double click to edit text',
      color: 0,
      fontSize: 95.8,
      textAlign: 'center',
      fontWeight: 'normal',
      fontFamily: 'Roboto',
      textVAlign: 'middle'
    });
  }
  return element;
}

const getSafeZone = (type, size) => {
  const currentType = innerSafeZong.filter(item => {
    return (item.type.indexOf(type) >= 0);
  });
  if (currentType.length) {
    if (currentType.length===1) {
      return currentType[0].safeZone;
    } else {
      const currentSize = currentType.filter(item => {
        return (item.size.indexOf(size) >= 0);
      });
      return currentSize[0].safeZone;
    }
  } else {
    return {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
  }
}

/**
 * 处理面板信息接口返回的信息
 */
const handleSpreadData = (res, dispatch, state) => {
  const book = get(res, 'book');
  const size = get(state, `project.setting.size`);
  const type = get(state, `project.setting.sheetType`);
  const viewData = get(state, `project.setting.xmlViewData`);
  const { bookWidth, bookHeight, bleedingPixelTop, bleedingPixelBottom, bleedingPixelLeft, bleedingPixelRight } = book;
  const boxLimit = getBoxLimit(bookWidth, bookHeight);
  const { ratio, width, height } = boxLimit;
  const safeZone = getSafeZone(type, size);
  const isSidebarShow = false;
  // 初始化面板尺寸
  dispatch({
    type: INIT_SPREAD_SETTING,
    options: {
      oriWidth: bookWidth,
      oriHeight: bookHeight,
      bleed: {
        top: bleedingPixelTop,
        left: bleedingPixelLeft,
        right: bleedingPixelRight,
        bottom: bleedingPixelBottom
      },
      safeZone: {
        top: safeZone.top,
        left: safeZone.left,
        right: safeZone.right,
        bottom: safeZone.bottom
      },
      isSidebarShow,
      ratio,
      width,
      height
    }
  });
  const spread = merge({}, tempSpread);
  dispatch({
    type: INIT_SPREAD,
    spread
  });
  tempSpread = {};
  if (!viewData) {
    // 未保存过 计算初始px,py,pw,ph
    const newElements = tempElements.map(item=> {
      let element = merge({}, item, {
        px: item.x / bookWidth,
        py: item.y / bookHeight,
        pw: item.width / bookWidth,
        ph: item.height / bookHeight,
      });
      if (item.type===elementTypes.text) {
        element.fontSize = item.fontSize / bookHeight;
      }
      return element;
    });

    dispatch({
      type: INIT_ELEMENTS,
      elements: convertObjIn(newElements),
      bookWidth,
      bookHeight
    });

    tempElements = [];
  } else if (spread) {
    dispatch({
      type: INIT_ELEMENTS,
      elements: convertObjIn(spread.elements.element),
      bookWidth,
      bookHeight
    });
  }
}

export function getSpreadInfomation() {
  return (dispatch, getState) => {
    const state = getState();
    const belongProductId = get(state, 'project.__originalData__.belongProductId');
    dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_SPREAD,
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify({
            belongProductId
          })
        }
      }
    }).then((res) => {
      handleSpreadData(res, dispatch, state);
    });
  }
}

export function getStyleList() {
  return (dispatch, getState) => {
    const state = getState();
    const styleType = getUrlParam('format');
    const styleSize = get(state, 'project.setting.size');
    dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_STYLE_LIST,
          params: {
            styleType,
            styleSize
          }
        }
      }
    }).then((res) => {
      handleStyleList(res, dispatch, state);
    });
  };
}

const handleStyleList = (res, dispatch, state) => {
  const list = get(res, 'data');
  const usePosition = get(state, 'project.setting.usePosition');
  const positionMap = { 'front': '0', 'back': '1', 'inside': '2'};
  const position = positionMap[usePosition];
  const styleId = getUrlParam('styleId');
  let bgUrl = '';
  if (list.length) {
    const currentStyle = list.filter(item => {
      return item.uidPk == styleId;
    });
    const guid = currentStyle[0].guid;
    if (/portal.zno.com\//.test(location.href)) {
      bgUrl = template(GET_LIVE_IMAGE_URL)({guid, position});
    } else {
      bgUrl = template(GET_TEST_IMAGE_URL)({guid, position});
    }
    dispatch({
      type: CHANGE_SPREAD_SETTING,
      bgUrl
    });
  }
}

export function saveProject(ops={isPublish:false}) {
  return (dispatch, getState) => {
    const state = getState();
    const { project } = state;
    const { spread, setting, spreadOptions } = project;
    const { oriWidth, oriHeight } = spreadOptions;

    let photoH = 0, photoV = 0, photoQ = 0, textH = 0, textV = 0;

    spread.elements.element.map(element => {
      const ratio = element.width / element.height;
      element.px = element.x / oriWidth;
      element.pw = element.width / oriWidth;
      element.py = element.y / oriHeight;
      element.ph = element.height / oriHeight;
      const type = element.type;
      if (ratio>1) {
        if (type===elementTypes.photo) {
          photoH++;
        } else {
          textH++;
        }
      } else if (ratio<1) {
        if (type===elementTypes.photo) {
          photoV++;
        } else {
          textV++;
        }
      } else {
        if (type===elementTypes.photo) {
          photoQ ++;
        }
      }
    });

    const templateXmlString = generateTemplate(spread);
    const copySetting = merge({}, setting, {
      frameHorizonNum: photoH,
      frameVertialNum: photoV,
      frameSquareNum: photoQ,
      textFrameHorizonNum: textH,
      textFrameVertialNum: textV
    });
    let bodyParams = merge({}, copySetting, {
      xmlViewData: templateXmlString,
      xmlViewDataPublish: templateXmlString
    });
    if (ops.isPublish) {
      bodyParams = merge({}, bodyParams, {
        status: 'Review'
      });
    }
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: ops.isPublish ? PUBLISH_TEMPLATE : SAVE_TEMPLATE
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify(bodyParams)
        }
      }
    }).then((res) => {
      const type = ops.isPublish ? "Publish" : "Save";
      if (res.errorCode===0) {
        alert(`${type} Successful!`);
      } else {
        alert(`${type} Failed!`);
      }
    });
  };
}

export function copyProject() {
  return (dispatch, getState) => {
    const state = getState();
    var uidPk = get(state, `project.uidPk`);
  	var parentUidpk = get(state, `project.__originalData__.parentUidpk`);
  	if(parentUidpk != 0){
  		alert('This is not original template');
  		return;
  	}
  	if(uidPk == "" || uidPk == 0){
  		alert('uidpk is error');
  	}else{
  		window.open(template(COPY_TEMPLATE)({uidPk}));
  	}
  };
}

export function deleteElement(elementId) {
  return (dispatch, getState) => {
    dispatch({
      type: DELETE_ELEMENT,
      elementId
    });
  }
}

export function updateElement(elementId, newAttribute) {
  return (dispatch, getState) => {
    const state = getState();
    const elements = get(state, `project.spread.elements.element`);
    const currentElement = elements.filter(item => {
      return item.id === elementId;
    });
    if (typeof newAttribute.isLock === 'undefined' && currentElement[0].isLock) {
      return false;
    }
    dispatch({
      type: UPDATE_ELEMENT,
      elementId,
      newAttribute
    });
  };
}

export function updateMultiElement(newElementArray) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_MULTI_ELEMENT,
      newElementArray
    });
  };
}

export function updateSetting(newSetting) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_SETTING,
      newSetting
    });
  };
}

export function elementToFront(elementId) {
  let i = 0;
  return (dispatch, getState) => {
    const state = getState();
    const elements = get(state, `project.spread.elements.element`);
    // 获取当前选中元素的索引
    const elementIndex = elements.findIndex(item => {
      return item.id === elementId;
    });
     // 更新当前选中的元素索引
    dispatch({
      type: UPDATE_SELECT_ELEMENT_INDEX,
      elementId: elementIndex
    });
    const currentElement = elements[elementIndex];
    if (currentElement.isLock) {
      return false;
    }
    let newElementArray = elements.map(item=> {
      if (item.id !== elementId) {
        return {
          dep: item.dep,
          id: item.id
        };
      } else {
        return {
          dep: elements.length,
          id: item.id
        }
      }
    });

    newElementArray.sort((a, b)=>{
      return a.dep > b.dep;
    });

    newElementArray = newElementArray.map(item=> {
      if (elementId!=item.id) {
        return merge({}, item, {
          dep: i++
        });
      } else  {
        return item;
      }
    });

    dispatch({
      type: UPDATE_ELEMENT_DEPTH,
      newElementArray
    });
    dispatch({
      type: TOGGLE_SIDEBAR,
      status: true
    });
  };
}

export function elementToBack(elementId) {
  let i = 1;
  return (dispatch, getState) => {
    const state = getState();
    const elements = get(state, `project.spread.elements.element`);
    const newElementArray = elements.map(item=> {
      if (item.id !== elementId) {
        return {
          dep: i++,
          id: item.id
        };
      } else {
        return {
          dep: 0,
          id: item.id
        }
      }
    });
    dispatch({
      type: UPDATE_ELEMENT_DEPTH,
      newElementArray
    });
  };
}

export function toggleSideBar(status=true) {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_SIDEBAR,
      status
    });
  };
}

export function getProjectData(uidPk) {
  return (dispatch, getState) => {
    const state = getState();
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_TEMPLATE,
          params: {
            uidPk
          }
        }
      }
    }).then((res) => {
      const { data } = res;
      handleProjectData(data, dispatch);
    });
  };
}
