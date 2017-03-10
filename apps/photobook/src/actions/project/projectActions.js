import { get } from 'lodash';
import Immutable from 'immutable';
import qs from 'qs';

import { CALL_API } from '../../middlewares/api';
import * as apiUrl from '../../contants/apiUrl';
import * as types from '../../contants/actionTypes';

import { getRandomNum, guid } from '../../../../common/utils/math';
import { generateProject, generateSku } from '../../utils/projectGenerator';

/**
 * 处理获取到的project的返回值.
 * @param res
 * @param dispatch
 */
const handleProjectData = (res, dispatch) => {
  const projectObj = res.project;

  dispatch({
    type: types.INIT_PROJECT_SETTING,
    setting: projectObj.spec
  });

  const addedSheetNumber = projectObj.summary.pageAdded / 2;

  dispatch({
    type: types.INIT_COVER,
    cover: projectObj.cover,
    addedSheetNumber
  });

  dispatch({
    type: types.INIT_PAGE_ARRAY,
    pages: projectObj.pages
  });

  dispatch({
    type: types.INIT_IMAGE_ARRAY,
    images: projectObj.images
  });

  dispatch({
    type: types.INIT_DECORATION_ARRAY,
    decorations: projectObj.decorations
  });
};

export function getProjectData(userId, projectId, isParentBook, webClientId) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;
    const autoRandomNum = getRandomNum();

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.GET_PROJECT_DATA,
          params: {
            baseUrl,
            userId,
            projectId,
            isParentBook,
            webClientId,
            autoRandomNum
          }
        }
      }
    }).then((res) => {
      handleProjectData(res, dispatch);
    });
  };
}

export function getPreviewProjectData(projectId) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const uploadBaseUrl = urls.uploadBaseUrl;
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.GET_PREVIEW_PROJECT_DATA,
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

export function getProjectTitle(userId, projectId) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.GET_PROJECT_TITLE,
          params: {
            baseUrl,
            userId,
            projectId
          }
        }
      }
    });
  };
}

export function changeProjectSetting(setting) {
  return (dispatch, getState) => {
    dispatch({
      type: types.CHANGE_PROJECT_SETTING,
      setting
    });
    return Promise.resolve();
  };
}

export function changeBookSetting(bookSetting) {
  return {
    type: types.CHANGE_BOOK_SETTING,
    bookSetting
  };
}

export function projectLoadCompleted() {
  return {
    type: types.PROJECT_LOAD_COMPLETED
  };
}

export function deleteProjectImage(encImgId) {
  return {
    type: types.DELETE_PROJECT_IMAGE,
    encImgId
  };
}

export function saveProject(project, userInfo, specVersion, newTitle = '') {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;

    const projectId = project.get('projectId');
    const projectType = project.getIn(['setting', 'product']);
    const userId = userInfo.get('id');

    const projectObj = generateProject(project, userInfo, specVersion);
    const skuObj = generateSku(projectObj);

    const isSaveNewProject = Boolean(newTitle);

    let requestApiUrl = null;
    let projectTitle = project.get('title');

    if (projectId === -1) {
      requestApiUrl = apiUrl.NEW_PROJECT;
    } else {
      requestApiUrl = apiUrl.SAVE_PROJECT;
    }

    if (isSaveNewProject) {
      delete projectObj.guid;

      requestApiUrl = apiUrl.NEW_PROJECT;
      projectTitle = newTitle;
    }

    const requestKeyArray = [
      'web-h5', '1', 'JSON', project.getIn(['setting', 'product']),
      specVersion, Date.now()
    ];

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: requestApiUrl,
          params: { baseUrl, userId, projectId, projectType }
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify({
            title: projectTitle,
            projectJson: JSON.stringify(projectObj),
            skuJson: JSON.stringify(skuObj),
            requestKey: requestKeyArray.join('|')
          })
        }
      }
    });
  };
}

export function cloneProject(project, userInfo, specVersion, newTitle) {
  return saveProject(project, userInfo, specVersion, newTitle);
}

export function updateProjectId(projectId) {
  return {
    type: types.UPDATE_PROJECT_ID,
    projectId
  };
}

export function createContainer(containerType, width, height, bleed) {
  return {
    type: types.CREATE_CONTAINER,
    containerType,
    width,
    height,
    bleed
  };
}

export function deleteContainer(containerId) {
  return {
    type: types.DELETE_CONTAINER,
    containerId
  };
}

export function createDualPage(insertIndex) {
  return (dispatch, getState) => {
    dispatch({
      type: types.CREATE_DUAL_PAGE,
      insertIndex,
      n: 1
    });

    return Promise.resolve();
  };
}

export function createMultipleDualPage(insertIndex, n) {
  return (dispatch, getState) => {
    dispatch({
      type: types.CREATE_MULTIPLE_DUAL_PAGE,
      insertIndex,
      n
    });

    return Promise.resolve();
  };
}

export function deleteDualPage(leftPageId, rightPageId) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DELETE_DUAL_PAGE,
      dualPageIdList: [
        {
          leftPageId,
          rightPageId
        }
      ]
    });

    return Promise.resolve();
  };
}

export function deleteMultipleDualPage(dualPageIdList) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DELETE_MULTIPLE_DUAL_PAGE,
      dualPageIdList
    });

    return Promise.resolve();
  };
}


export function createElement(pageId, element) {
  return (dispatch, getState) => {
    const newElementId = guid();
    const newElement = Immutable.Map(element).merge({ id: newElementId });
    dispatch({
      type: types.CREATE_ELEMENT,
      pageId,
      element: newElement
    });

    return Promise.resolve(newElement);
  };
}

export function createElements(pageId, elements) {
  return (dispatch, getState) => {
    let newElements = Immutable.List();

    elements.forEach((element) => {
      const newElement = Immutable.Map(element).merge({ id: guid() });

      newElements = newElements.push(newElement);
    });

    dispatch({
      type: types.CREATE_ELEMENTS,
      pageId,
      elements: newElements
    });

    return Promise.resolve(newElements);
  };
}


export function deleteElement(pageId, elementId) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DELETE_ELEMENT,
      pageId,
      elementId
    });

    return Promise.resolve({
      pageId,
      elementId
    });
  };
}

export function deleteElements(pageId, elementIds) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DELETE_ELEMENTS,
      pageId,
      elementIds
    });

    return Promise.resolve({
      pageId,
      elementIds
    });
  };
}

export function deleteAll() {
  return (dispatch, getState) => {
    dispatch({
      type: types.DELETE_ALL
    });

    return Promise.resolve();
  };
}

export function updateElement(element) {
  return (dispatch, getState) => {
    dispatch({
      type: types.UPDATE_ELEMENT,
      element
    });
    return Promise.resolve();
  };
}

export function updateElements(elements) {
  return (dispatch, getState) => {
    dispatch({
      type: types.UPDATE_ELEMENTS,
      elements
    });
    return Promise.resolve();
  };
}

export function saveProjectTitle(userId, projectId, projectTitle) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.SAVE_PROJECT_TITLE,
          params: {
            baseUrl,
            userId,
            projectId,
            projectName: projectTitle
          }
        }
      }
    });
  };
}

export function changeProjectTitle(title) {
  return {
    type: types.CHANGE_PROJECT_TITLE,
    title
  };
}

export function applyTemplate(pageId, templateId, elements) {
  return (dispatch, getState) => {
    const templateDataArray = Immutable.fromJS([{
      pageId,
      templateId,
      elements
    }]);

    dispatch({
      type: types.APPLY_TEMPLATE,
      templateDataArray
    });

    return Promise.resolve({
      data: templateDataArray
    });
  };
}

export function applyTemplateToPages(templateDataArray) {
  return (dispatch, getState) => {
    dispatch({
      type: types.APPLY_TEMPLATE_TO_PAGES,
      templateDataArray
    });

    return Promise.resolve({
      data: templateDataArray
    });
  };
}

export function checkProjectTitle(paramsObj) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.CHECK_PROJECT_TITLE,
          params: {
            baseUrl
          }
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify(paramsObj)
        }
      }
    });
  };
}

export function uploadCoverImage(projectId) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const uploadBaseUrl = urls.uploadBaseUrl;
    const encodeimage = get(getState(), 'system.global.snipping').get('thumbnail');
    const project = get(getState(), 'project.data.present');
    const projectid = projectId || project.get('projectId');
    const projectType = project.getIn(['setting', 'product']);
    if (!encodeimage || (typeof encodeimage === 'string' && encodeimage.substring(0, 50).length < 50)) {
      return Promise.resolve();
    }

    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.UPLOAD_COVER_IMAGE,
          params: {
            uploadBaseUrl
          }
        },
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: qs.stringify({
            projectid,
            encodeimage,
            projectType
          })
        }
      }
    });
  };
}

export function checkProjectInfo(projectid) {
  return (dispatch, getState) => {
    const urls = get(getState(), 'system.env.urls').toJS();
    const baseUrl = urls.baseUrl;
    const autoRandomNum = getRandomNum();
    return dispatch({
      [CALL_API]: {
        apiPattern: {
          name: apiUrl.CHECK_PROJECT_INFO,
          params: {
            baseUrl,
            projectid,
            autoRandomNum
          }
        }
      }
    });
  };
}

export function resetProjectInfo() {
  return {
    type: types.RESET_PROJECT_INFO
  };
}

export function changePageBgColor(pageId, bgColor) {
  return {
    type: types.CHANGE_PAGE_BGCOLOR,
    pageId,
    bgColor
  };
}

export function updatePageTemplateId(pageId, templateId = '') {
  return {
    type: types.UPDATE_PAGE_TEMPLATE_ID,
    pageId,
    templateId
  };
}

/**
 * 把指定的page插入到特定的page前面.
 * @param  {string} pageId 正在移动的page id
 * @param  {string} beforePageId 插入到指定page的前面的page id.
 */
export function movePageBefore(pageId, beforePageId) {
  return {
    type: types.MOVE_PAGE_BEFORE,
    pageId,
    beforePageId
  };
}
