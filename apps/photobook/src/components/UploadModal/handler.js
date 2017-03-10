import { merge, get, set, isEqual, template } from 'lodash';

import x2jsInstance from '../../utils/xml2js';
import request from '../../utils/ajax';
import { combine } from '../../utils/url';
import { getCropOptions, getCropLRByOptions } from '../../utils/crop';
import { Element } from '../../../../common/utils/entry';
import {convertObjIn} from '../../../../common/utils/typeConverter';

import { PENDING, DONE, PROGRESS, FAIL } from '../../contants/uploadStatus';
import { UPLOAD_BASE, GET_IMAGE_IDS, UPLOAD_IMAGES, IMAGE_SRC } from '../../contants/apiUrl';

// 需要上传的图片总数
let uploadCount = 0;

// 所有待上传图片
let filesNeedUpload = [];

// 所有图片的上传Id
let allImageIds = [];

// 单个队列同时的最大上传数
let countPerQueue = 2;

let count = 0;

// 是否正在上传
let isUploading = false;

export const receiveProps = (that, nextProps) => {
  const oldImages = that.props.uploadingImages;
  const newImages = nextProps.uploadingImages;
  const newAddedImages = [];

  if (!isEqual(oldImages, newImages)) {
    const allImages = that.state.allImages;
    const syncedGuids = that.state.syncedGuids;
    newImages.map(item => {
      if (syncedGuids.indexOf(item.file.guid)==-1) {
        item.file.percent = 0;
        item.file.status = '';
        allImages.push(item.file);
        syncedGuids.push(item.file.guid);
        newAddedImages.push(item.file);
      }
    });

    that.setState({
      allImages,
      syncedGuids
    }, () => {
      if (newAddedImages.length) {
        if (isUploading) {
          // 有上传失败的
          if (filesNeedUpload.length === 0) {
            isUploading = false;
            uploadFiles(that, newAddedImages);
          }
        } else {
          uploadFiles(that, newAddedImages);
        }
        filesNeedUpload = filesNeedUpload.concat(newAddedImages);
        uploadCount += newAddedImages.length;
      }
    });
  }
}

export const handleUploadModalClosed = (that, isManuClick) => {
  const { toggleModal, uploadingImages, t, addTracker, saveProject } = that.props;
  const { allImages } = that.state;
  const failedLength = allImages.filter(item => {
    return item.status === FAIL;
  }).length;
  if (allImages.length && failedLength !== allImages.length) {
      if (window.confirm(t('CLOSE_PROMPT'))) {
        allImages.map((item) => {
          item.xhr && item.xhr.abort();
        });
      } else {
        return false;
      }
  }
  that.setState({
    allImages: [],
    successUploaded: 0,
    errorUploaded: 0
  }, () => {
    // 如果是手动关闭重置isUploading为false
    if (isManuClick) {
      isUploading = false;
      addTracker('PhotosUploadFailed,' + failedLength);
    }
    uploadCount = 0;
    filesNeedUpload = [];
    allImageIds = [];
    countPerQueue = 2;
    count = 0;
  });
  toggleModal('upload', false);
  saveProject();
};

export const onUploadMoreClick = (that) => {
  that.setState({
    addMore: true
  });
}

/**
 * 上传图片
 * @param  {array} files 待上传图片列表
 */
const uploadFiles = (that, files) => {
  const { env } = that.props;
  const { addMore } = that.state;
  if (addMore) {
    that.setState({
      addMore: false
    });
  } else {
    that.setState({
      successUploaded: 0,
      errorUploaded: 0
    });
  }
  request({
    url: template(GET_IMAGE_IDS)({
      baseUrl: env.urls.get('baseUrl'),
      imageIdCount: files.length
    }),
    success: (result) => {
      if (result) {
        let ids = [];

        try{
          ids = JSON.parse(result).imageIds;
        }catch(ex){
          const xmlData = x2jsInstance.xml2js(result);
          ids = xmlData.imageIds.id;
        }finally{
          if (Array.isArray(ids)) {
            allImageIds = allImageIds.concat(ids);
          } else {
            allImageIds.push(ids);
          }
          if (!isUploading) {
            uploadFileInQueue(that);
          }
        }
      }
    }
  })
}

/**
 * 是否全部成功上传
 */
const checkIfAllIsSuccesslyUploaded = (that) => {
  const { addTracker } = that.props;
  if (that.state.successUploaded && that.state.successUploaded === uploadCount) {
    // 图片全部上传成功时自动关闭上传框的 埋点。
    addTracker('PhotosUploadComplete,' + allImageIds.length);
    handleUploadModalClosed(that);
  }
}

/**
 * 更新图片上传状态
 * @param  that
 * @param  index 图片索引
 * @param  ops 更新参数值
 */
const updateStatus = (that, guid, ops) => {
  const index = that.state.allImages.findIndex(item => {
    return item.guid === guid;
  });
  const status = get(that.state.allImages, index);
  // file对象上自定义属性
  for (var key in ops) {
    if (ops.hasOwnProperty(key)) {
      status[key] = ops[key];
    }
  }

  const allImages = set(that.state.allImages, index, status);

  that.setState({
    allImages
  });
}

/**
 * 将上传成功的图片从列表中移除
 */
const removeSucceed = (that, guid) => {
  let { allImages } = that.state;
  const currentIndex = allImages.findIndex(item => {
    return item.guid === guid;
  });
  allImages.splice(currentIndex, 1);
  that.setState({
    allImages
  });
}

/**
 * 累加上传成功的图片个数
 */
const addSuccessCount = (that) => {
  that.setState({
    successUploaded: that.state.successUploaded+1
  });
  isUploading = false;
}

/**
 * 累加上传失败的图片个数
 */
const addErrorCount = (that) => {
  that.setState({
    errorUploaded: that.state.errorUploaded+1
  });
  isUploading = false;
}

/**
 * 队列上传图片
 * @param  that
 * @param  {array} files 待上传图片列表
 * @param  {array} ids  所有图片的id列表
 */
const uploadFileInQueue = (that) => {
  if (filesNeedUpload.length) {
    if (!isUploading) {
      const items = filesNeedUpload.splice(0, countPerQueue);
      items.map(item => {
        doUpload(that, item);
      });
      isUploading = true;
    } else {
      const topItem = filesNeedUpload.shift();
      doUpload(that, topItem);
    }
  } else {
    isUploading = false;
  }
}

/**
 * 创建formData
 * @param {object} params 属性列表
 */
const createFormData = (params) => {
  let formData = new FormData();
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      formData.append(key, params[key]);
    }
  }
  return formData;
}

/**
 * 上传失败处理
 * @param that
 * @param file 当前上传的file对象
 * @param message 错误信息
 */
const errHandler = (that, file, message) => {
  // 更新失败状态
  updateStatus(that, file.guid, {
    status: FAIL,
    percent: message,
    info: message,
  });
  addErrorCount(that);
  uploadFileInQueue(that);
}

/**
 * 队列上传图片
 * @param  that
 * @param {object} file 当前需要上传的图片
 */
const doUpload = (that, file) => {
  const { env, project, boundUploadedImagesActions, boundProjectActions, autoAddPhotoToCanvas, t } = that.props;

  const { userInfo } = env;
  const uid = userInfo.get('id');
  const timestamp = userInfo.get('timestamp');
  const token = userInfo.get('authToken');
  const albumId = env.albumId;
  const projectTitle = project.getIn(['setting', 'title']);

  const currentId = allImageIds[count++];

  let locked = false;
  isUploading = true;

  // 更新当前图片的上传id
  updateStatus(that, file.guid, {
    imageId: currentId,
    percent: 0,
    info: ''
  });

  if (['image/jpeg','image/jpg','image/png','image/x-png'].indexOf(file.type) !== -1) {
    // 生成formData
    const formData = createFormData({
      uid,
      timestamp,
      token,
      albumId,
      albumName: projectTitle,
      Filename: file.name.replace(/[\&\/\_]+/g, ''),
      filename: file
    });

    // 更新上传状态并开始上传
    updateStatus(that, file.guid, {
      status: PROGRESS
    });

    const xhr = request({
      url: template(UPLOAD_IMAGES)({
        uploadBaseUrl: get(env, 'urls').get('uploadBaseUrl'),
        imageId: currentId
      }),
      method: 'post',
      data: formData,

      // 接口请求成功处理
      success: (res) => {
        if (res) {
          const xmlRes = x2jsInstance.xml2js(res);

          switch (get(xmlRes, 'resultData.state')) {
            case 'success': {
              // 更新成功状态
              updateStatus(that, file.guid, {
                status: DONE,
                percent: 'Done'
              });

              const fileInfo = {
                name: file.name.replace(/[\&\/\_]+/g, ''),
                url: combine(get(env, 'urls.uploadBaseUrl'), IMAGE_SRC, {
                  qaulityLevel: 0,
                  puid: get(xmlRes, 'resultData.img.encImgId')
                }),
                usedCount: 0,
                imageId: currentId,
                totalSize: get(xmlRes, 'resultData.img.size'),
                guid: get(xmlRes, 'resultData.img.guid'),
                uploadTime: new Date(get(xmlRes, 'resultData.img.insertTime')).getTime(),
                shotTime: get(xmlRes, 'resultData.img.shotTime'),
                encImgId: get(xmlRes, 'resultData.img.encImgId'),
                width: get(xmlRes, 'resultData.img.width'),
                height: get(xmlRes, 'resultData.img.height'),
                createTime: file.lastModified
              };

              boundUploadedImagesActions.uploadComplete(fileInfo);

              // 判断是否需要自动添加到画布中.
              if (autoAddPhotoToCanvas && autoAddPhotoToCanvas.status && !locked) {
                const { elementId, elementHeight, elementWidth, imgRot } = autoAddPhotoToCanvas;
                locked = true;
                let newData = convertObjIn(merge({}, fileInfo, { imageid: fileInfo.imageId }));

                const options = getCropOptions(newData.width, newData.height, elementWidth, elementHeight, imgRot);
                const lrOptions = getCropLRByOptions(options.px, options.py, options.pw, options.ph);
                // 获取图片的裁剪参数.
                const element = merge({}, lrOptions, {
                  id: elementId,
                  encImgId: get(xmlRes, 'resultData.img.encImgId'),
                  imageid: currentId
                });

                boundProjectActions.updateElement(element);

                // 关闭自动添加的功能, 只有在需要的时候再开启.
                boundUploadedImagesActions.autoAddPhotoToCanvas({
                  status: false,
                  elementWidth: 0,
                  elementHeight: 0
                });
              }
              addSuccessCount(that);
              removeSucceed(that, file.guid);
              checkIfAllIsSuccesslyUploaded(that);
              uploadFileInQueue(that);
              break;
            }
            case 'fail': {
              errHandler(that, file, xmlRes.resultData.errorInfo);
              break;
            }
          }
        }
      },

      // 上传进度处理
      progress: (data) => {
        updateStatus(that, file.guid, {
          percent: Math.floor(data.loaded / data.total * 100)
        });
      },

      // 超时处理
      timeout: function() {
        errHandler(that, file, t('TIMEOUT'));
      },

      // 接口请求错误处理
      error: (err) => {
        errHandler(that, file, t('ERROR'));
      }
    });
    //更新xhr
    updateStatus(that, file.guid, {
      xhr: xhr
    });
  } else {
    errHandler(that, file, t('TYPE_CONFLICT'));
  }
}
