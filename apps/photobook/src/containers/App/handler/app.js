import React from 'react';
import qs from 'qs';
import { get } from 'lodash';
import { loginPath } from '../../../contants/strings';
/**
 * 做app的初始化.
 * @param that app组件的this指向.
 */
export const doPrepare = (that) => {
  const {
    // bound actions
    boundEnvActions,
    boundSpecActions,
    boundQueryStringActions,
    boundStickerActions,
    boundFontActions,
    boundProjectActions,
    project
  } = that.props;

  // 获取query string并转换成object对象.
  boundQueryStringActions.parser();

  boundEnvActions.getEnv().then(() => {
    const { env } = that.props;
    const isPreview = env.qs.get('isPreview');
    if (!isPreview) {
      boundStickerActions.getStickerList();
      boundFontActions.getFontList();
    }

    const encProjectIdString = project.get('encProjectIdString');

    if (encProjectIdString) {
      boundSpecActions.getSpecData().then(() => {
        boundProjectActions.getPreviewProjectData(encProjectIdString).then(() => {
          boundProjectActions.projectLoadCompleted();
        });
      });
    } else {
      boundSpecActions.getSpecData().then(() => {
        boundEnvActions.getUserInfo();
      });
    }
  });
};

export const toggleModal = (boundUploadImagesActions, type, status) => {
  boundUploadImagesActions.toggleUpload(status);
};

export function doUserThings(that, nextProps) {
  const oldUserInfo = that.props.env.userInfo;
  const newUserInfo = nextProps.env.userInfo;
  const newUserId = newUserInfo.get('id');

  const {
    boundProjectActions,
    boundEnvActions,
    boundTemplateActions,
    boundPriceActions,
    boundTrackerActions,
    project
  } = that.props;

  const projectId = project.get('projectId');
  const title = project.get('title');
  const isParentBook = project.get('isParentBook');
  const webClientId = project.get('webClientId');
  const setting = project.get('setting');

  if (oldUserInfo !== newUserInfo) {
    if (newUserId === -1) {
      window.onbeforeunload = null;
      window.location = '/sign-in.html';
      return;
    }

    if (projectId !== -1) {
      Promise.all([
        boundProjectActions.getProjectData(
          newUserId, projectId, isParentBook, webClientId
        ),
        boundProjectActions.getProjectTitle(
          newUserId, projectId
        ),
        boundProjectActions.checkProjectInfo(projectId)
      ]).then(() => {
        boundProjectActions.projectLoadCompleted();
        boundTrackerActions.addTracker('BookLoadComplete');
      });
    } else {
      if (title) {
        boundEnvActions.addAlbum(newUserId, title).then(() => {
          boundEnvActions.getAlbumId(newUserId, title).then(() => {
            boundProjectActions.projectLoadCompleted();
          });
        });
      }
      boundTemplateActions.getTemplateList(
        newUserInfo.get('id'),
        setting.get('size'),
        setting.get('cover'),
        setting.get('product')
      );
      boundPriceActions.getProductPrice(setting.toJS());
      boundTrackerActions.addTracker('BookLoadComplete');
    }
  }

  const oldProjectTitle = title;
  const newProjectTitle = nextProps.project.get('title');
  if (oldProjectTitle !== newProjectTitle) {
    boundEnvActions.getAlbumId(newUserId, newProjectTitle);
  }
}

export function openLoginPage() {
  window.onbeforeunload = null;
  window.open(loginPath, 'newwindow');
  setTimeout(() => {
    window.onbeforeunload = () => 'Unsaved changes(If any) will be discarded. Are you sure to exit?';
  }, 0);
}

export function onSaveProject(that, onSaveSuccessed, onSaveFailed) {
  const {
    boundProjectActions,
    boundNotificationActions,
    boundAlertModalActions,
    boundCloneModalActions,
    boundTrackerActions,
    project,
    env,
    spec
  } = that.props;
  const { userInfo } = env;
  const specVersion = spec.get('version');

  boundProjectActions.saveProject(
    project, userInfo, specVersion
  ).then((res) => {
    const isRequestSuccess = (get(res, 'status') === 'success');

    if (isRequestSuccess) {
      //  保存成功时 埋点;
      boundTrackerActions.addTracker('SaveComplete,success');

      const guid = +get(res, 'data.guid');

      if (project.get('projectId') === -1 && guid) {
        boundProjectActions.updateProjectId(guid);

        window.history.replaceState({}, 'PhotoBook', `?${qs.stringify({
          initGuid: guid
        })}`);
      }
      if (guid) {
        boundProjectActions.uploadCoverImage(guid).then(() => {
          if (onSaveSuccessed) {
            onSaveSuccessed();
          } else {
            boundNotificationActions.addNotification({
              message: 'Project saved successfully!',
              level: 'success',
              autoDismiss: 2
            });
          }
        });
      }
    } else {
      //  保存失败时 埋点;
      boundTrackerActions.addTracker('SaveComplete,failed');

      onSaveFailed && onSaveFailed();

      if (project.get('projectId') === -1) {
        boundAlertModalActions.showAlertModal({
          title: 'Error',
          message: 'We are so apologize that something error occurred,' +
            ' please try again later',
          escapeClose: false,
          isHideIcon: true,
          onButtonClick: () => {
            window.onbeforeunload = null;
            window.location = '/create.html';
          }
        });
      } else {
        const errorCode = +get(res, 'errorCode');
        let errorMessage = 'Project save failed! Please try again later.';

        if (errorCode === -108) {
          errorMessage = (
            <div>
              Your current project has ordered or is in the cart.
              You need to <a onClick={boundCloneModalActions.showCloneModal}>clone</a> it to
              save your additional changes
            </div>
          );
        }

        if (errorCode === -100) {
          errorMessage = (
            <div>
              Your session has timed out.
              You must log in again to continue.
              Clicking <a onClick={openLoginPage}>log in</a> will open a new window.
              Once successfully log in, you may return to this window to continue editing.
            </div>
          );
        }

        boundNotificationActions.addNotification({
          children: errorMessage,
          level: 'error',
          autoDismiss: 0
        });
      }
    }
  });
}

export function onCloneProject(that, newTitle, onCloneSuccessed) {
  const {
    boundProjectActions,
    boundNotificationActions,
    project,
    env,
    spec
  } = that.props;
  const { userInfo } = env;
  const specVersion = spec.get('version');

  boundProjectActions.cloneProject(
    project, userInfo, specVersion, newTitle
  ).then((res) => {
    const isRequestSuccess = (get(res, 'status') === 'success');

    if (isRequestSuccess) {
      const guid = +get(res, 'data.guid');
      if (guid) {
        boundProjectActions.updateProjectId(guid);
        boundProjectActions.changeProjectTitle(newTitle);
        boundProjectActions.resetProjectInfo();

        // TODO: 需要更新albumId
        window.history.replaceState({}, 'PhotoBook', `?${qs.stringify({
          initGuid: guid
        })}`);

        boundProjectActions.uploadCoverImage(guid).then(() => {
          if (onCloneSuccessed) {
            onCloneSuccessed();
          } else {
            boundNotificationActions.addNotification({
              message: 'Project cloned successfully!',
              level: 'success',
              autoDismiss: 2
            });
          }
        });
      }
    } else {
      boundNotificationActions.addNotification({
        message: 'Project clone failed! Please try again later.',
        level: 'error',
        autoDismiss: 0
      });
    }
  });
}

export const checkIsEditPage = () => {
  const href = window.location.href;

  return (/editpage/i.test(href) || !/#\//i.test(href));
};
