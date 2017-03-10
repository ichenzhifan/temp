import { get, isUndefined, merge } from 'lodash';
import qs from 'qs';
import { CALL_API } from '../middlewares/api';
import x2jsInstance from '../../../common/utils/xml2js';
import { getDefaultCropLRXY } from '../../../common/utils/crop';
import { Element } from '../../../common/utils/entry';
import { convertObjIn } from '../../../common/utils/typeConverter';
import { combine } from '../utils/url';
import { generateProject } from '../../src/utils/projectGenerator';

import {
  GET_PROJECT_DATA,
  GET_PREVIEW_PROJECT_DATA,
  SAVE_PROJECT,
  NEW_PROJECT,
  GET_MAIN_PROJECT_IMAGE,
  GET_ENCODE_IMAGE_IDS
} from '../contants/apiUrl';
import {
  CHANGE_PROJECT_SETTING,
  INIT_SPREAD_ARRAY,
  INIT_IMAGE_ARRAY,
  INIT_IMAGE_USED_COUNT_MAP,
  UPDATE_IMAGE_USED_COUNT_MAP,
  CREATE_ELEMENT,
  UPDATE_ELEMENT,
  DELETE_ELEMENT,
  DELETE_PROJECT_IMAGE,
  PROJECT_LOAD_COMPLETED,
  AUTO_ADD_PHOTO_TO_CANVAS
} from '../contants/actionTypes';
import { DONE } from '../contants/uploadStatus';
import { IMAGE_SRC } from '../contants/apiUrl';

const handleProjectData = (res, dispatch) => {
  const serverOptions = get(res, 'project.imageBox.spec.option');
  const newSetting = {
    title: get(res, 'project.title')
  };
  serverOptions.forEach((option) => {
    // 兼容老数据
    if (option.id === 'thickness') {
      newSetting.spineThickness = option.value;
    } else {
      newSetting[option.id] = option.value;
    }
  });

  dispatch({
    type: CHANGE_PROJECT_SETTING,
    setting: newSetting
  });

  const serverSpreads = get(res, 'project.imageBox.spreads');
  dispatch({
    type: INIT_SPREAD_ARRAY,
    spreads: serverSpreads
  });

  dispatch({
    type: INIT_IMAGE_USED_COUNT_MAP,
    spreads: serverSpreads
  });

  const serverImages = get(res, 'project.images');
  dispatch({
    type: INIT_IMAGE_ARRAY,
    images: serverImages
  });

};

export function getProjectData(userId, projectId) {
  return (dispatch, getState) => {
    const state = getState();
    const baseUrl = get(state, 'system.env.urls.baseUrl');
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_PROJECT_DATA,
          params: { baseUrl, userId, projectId }
        }
      }
    }).then((res) => {
      handleProjectData(res, dispatch);
    });
  };
}

export function getPreviewProjectData(projectId) {
  return (dispatch, getState) => {
    const state = getState();
    const uploadBaseUrl = get(state, 'system.env.urls.uploadBaseUrl');
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_PREVIEW_PROJECT_DATA,
          params: {
            uploadBaseUrl,
            projectId: encodeURIComponent(projectId)
          }
        }
      }
    }).then((res) => {
      handleProjectData(res, dispatch);
    });
  };
}

export function projectLoadCompleted() {
  return {
    type: PROJECT_LOAD_COMPLETED
  };
}


export function changeProjectSetting(setting) {
  return {
    type: CHANGE_PROJECT_SETTING,
    setting
  };
}

export function saveProject(
  projectId,
  userId,
  setting,
  spreadArray,
  imageArray,
  createdDate,
  coverThumbnail,
  mainProjectUid) {
  return (dispatch, getState) => {
    const baseUrl = get(getState(), 'system.env.urls.baseUrl');
    const projectXmlString = generateProject(
      projectId,
      userId,
      setting,
      spreadArray,
      imageArray,
      createdDate
    );

    let outObj = {
      projectXml: projectXmlString,
      thumbnailPX: coverThumbnail.x,
      thumbnailPY: coverThumbnail.y,
      thumbnailPW: coverThumbnail.width,
      thumbnailPH: coverThumbnail.height,
      requestKey: Date.now()
    };

    if (mainProjectUid) {
      outObj = Object.assign({}, outObj, {
        crossSell: 'cart',
        mainProjectUid
      });
    }

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: projectId ? SAVE_PROJECT : NEW_PROJECT,
          params: { baseUrl, userId, projectId }
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify(outObj)
        }
      }
    });
  };
}

export function createElement(spreadId, element) {
  return (dispatch, getState) => {
    dispatch({
      type: CREATE_ELEMENT,
      spreadId,
      element
    });

    if (!isUndefined(element.imageid)) {
      dispatch({
        type: UPDATE_IMAGE_USED_COUNT_MAP,
        spreads: getState().project.spreadArray
      });
    }
  };
}

export function updateElement(spreadId, elementId, newAttribute) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_ELEMENT,
      spreadId,
      elementId,
      newAttribute
    });

    if (!isUndefined(newAttribute.imageid)) {
      dispatch({
        type: UPDATE_IMAGE_USED_COUNT_MAP,
        spreads: getState().project.spreadArray
      });
    }
  };
}

export function deleteElement(spreadId, elementId) {
  return (dispatch, getState) => {
    dispatch({
      type: DELETE_ELEMENT,
      spreadId,
      elementId
    });

    dispatch({
      type: UPDATE_IMAGE_USED_COUNT_MAP,
      spreads: getState().project.spreadArray
    });
  };
}

export function deleteProjectImage(imageId) {
  return {
    type: DELETE_PROJECT_IMAGE,
    imageId
  };
}

// 获取主工程图片列表，并把符合encImgId的图片应用到cover上面，仅在新项目创建的时候会被触发
export function loadMainProjectImages(mainProjectUid, encImgId) {
  return async (dispatch, getState) => {
    const state = getState();
    const baseUrl = get(state, 'system.env.urls.baseUrl');
    const autoRandomNum = 123;

    // 获取主工程图片列表
    let {errorCode, data: mainProjectImages} = await dispatch({
      [CALL_API]: {
        apiPattern: {
          name: GET_MAIN_PROJECT_IMAGE,
          params: { baseUrl, mainProjectUid, autoRandomNum }
        }
      }
    });
    
    if (mainProjectImages && errorCode === '1') {
      // 把拿到的encImgId中的空格全部替换成加号(加号被浏览器主动编码)
      encImgId = encImgId.replace(/\s+/g, '+');
      try {
        // 新的H5 books数据是json
        mainProjectImages = JSON.parse(mainProjectImages);

      } catch(e) {
        mainProjectImages = get(x2jsInstance.xml2js(mainProjectImages), 'images.image');

        const imageIds = getImageIdsString(mainProjectImages);

        let encImgIds = await dispatch({
          [CALL_API]: {
            apiPattern: {
              name: GET_ENCODE_IMAGE_IDS,
              params: { baseUrl, imageIds }
            },
            options: {
              method: 'POST'
            }
          }
        });

        mainProjectImages = mappingEncImgIdToMainProjectImages(mainProjectImages, get(encImgIds, 'result.images.image'));
      } finally {

        const orginalImages = get(state, 'project.imageArray');
        const imageArray = {
          image: [
            ...(orginalImages ? orginalImages : []),
            ...(mainProjectImages ? mainProjectImages : [])
          ]
        }

        // 刷新图片列表
        dispatch({
          type: INIT_IMAGE_ARRAY,
          images: imageArray
        });

        // 选出封面图片
        const autoAddedFile = imageArray.image.filter(image => image.encImgId === encodeURIComponent(encImgId))[0];

        if(autoAddedFile) {
          // 自动载入封面图片到currentSpread上面
          autoAddPhotoToCanvas(getState, dispatch, autoAddedFile)
        }
      }
    }

  };
}

function getImageIdsString(mainProjectImages) {
  return mainProjectImages.reduce(
    (imageIdsStr, mainProjectImage) => `${imageIdsStr},${mainProjectImage.id}`,
    ''
  ).replace(/^\,/, '');
}

function mappingEncImgIdToMainProjectImages(mainProjectImages, encImgIds) {
  return mainProjectImages.map((mainProjectImage) => {
    const encImage = encImgIds.filter(encImgId => encImgId.id === mainProjectImage.id)[0];
    mainProjectImage.encImgId = encImage.encImgId;

    return mainProjectImage;
  });
}

function getFileInfo(getState, autoAddedFile) {
  const state = getState();
  const env = get(state, 'system.env')
  return {
    name: autoAddedFile.name,
    url: combine(get(env, 'urls.uploadBaseUrl'), IMAGE_SRC, {
      qaulityLevel: 0,
      puid: autoAddedFile.encImgId
    }),
    usedCount: 0,
    status: DONE,
    imageId: autoAddedFile.id,
    totalSize: autoAddedFile.size,
    guid: autoAddedFile.guid,
    uploadTime: new Date(autoAddedFile.insertTime).getTime(),
    encImgId: autoAddedFile.encImgId,
    width: autoAddedFile.width,
    height: autoAddedFile.height,
    createTime: autoAddedFile.lastModified
  };
}

function autoAddPhotoToCanvas(getState, dispatch, autoAddedFile) {
  const state = getState();
  const {id: spreadId, h: targetHeight, w: targetWidth} = get(state, 'system.workspace.currentSpread.spreadOptions');
  const fileInfo = getFileInfo(getState, autoAddedFile);

  let newData = convertObjIn(merge({}, fileInfo, { imageid: fileInfo.imageId }));

  // 获取图片的裁剪参数.
  let element = new Element(merge(newData, getDefaultCropLRXY(newData.width, newData.height, targetWidth, targetHeight), {
    width: targetWidth,
    height: targetHeight
  }));
  
  // 新增一个element.
  dispatch({
    type: CREATE_ELEMENT,
    spreadId,
    element
  });

  // 更新图片的使用次数
  dispatch({
    type: UPDATE_IMAGE_USED_COUNT_MAP,
    spreads: getState().project.spreadArray
  });

  // 关闭自动添加的功能, 只有在需要的时候再开启.
  dispatch({
    type: AUTO_ADD_PHOTO_TO_CANVAS,
    status: false,
    spreadId: '',
    targetWidth: 0,
    targetHeight: 0
  });
}