import {
  ADD_IMAGES,
  UPDATE_IMAGEID,
  UPDATE_PERCENT,
  UPLOAD_COMPLETE,
  UPDATE_FIELDS,
  CLEAR_IMAGES,
  DELETE_IMAGE,
  RETRY_IMAGE,
  ERROR_TO_FIRST,
  SORT_IMAGE,
  DELETE_UPLOADED_IMAGE,
  UPDATE_IMAGE_USED_COUNT,
  CREATE_ELEMENT,
  AUTO_ADD_PHOTO_TO_CANVAS,
  UPDATE_IMAGE_USED_COUNT_MAP,
  UPDATE_ELEMENT
} from '../../contants/actionTypes';
import { PENDING, DONE, PROGRESS, FAIL } from '../../contants/uploadStatus';
import { UPLOAD_BASE, GET_IMAGE_IDS, UPLOAD_IMAGES, IMAGE_SRC } from '../../contants/apiUrl';

import { set, get, template, merge } from 'lodash';

import x2jsInstance from '../../utils/xml2js';
import request from '../../utils/ajax';
import { combine } from '../../utils/url';

import { getCropOptions, getCropLRByOptions } from '../../utils/crop';
import { Element } from '../../../../common/utils/entry';
import {convertObjIn} from '../../../../common/utils/typeConverter';

export function addImages(files) {
  return (dispatch, getState) => {
    const state = getState();
    const { system, project } = state;
    const { uploading, autoAddPhotoToCanvas } = system.images;
    const { env, workspace } = system;
    //未登录不上传
    if (!system.env.userInfo) {
      return false;
    }

    // 将格式不对的图片排到前面
    files.sort(item => {
  		return ['image/jpeg','image/jpg','image/png','image/x-png'].indexOf(item.type) !== -1 ? true : false;
  	});

    dispatch({ type: ADD_IMAGES, files });

    // uploadFiles(files, dispatch, uploading, autoAddPhotoToCanvas, state);
  }
}

export function uploadComplete(fields) {
  return {
    type: UPLOAD_COMPLETE,
    fields
  }
}

/*
 * 用于设置, 在图片上传完成后, 自动添加到画布中去.
 * @param {boolean} status true: 自动添加到画布, false: 不需要添加
 * @param {string} spreadId
 * @param targetWidth 当前容器, 或画布的宽, 用于图片裁剪
 * @param targetHeight 当前容器, 或画布的高, 用于图片裁剪
 * @returns {{type, status: *, spreadId: *, targetWidth: *, targetHeight: *}}
 */
export function autoAddPhotoToCanvas(params) {
  return {
    type: AUTO_ADD_PHOTO_TO_CANVAS,
    params
  };
}

