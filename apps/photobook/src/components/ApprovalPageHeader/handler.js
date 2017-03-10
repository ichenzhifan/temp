import React from 'react';
import { template } from 'lodash';
import { ORDER_PATH } from '../../contants/apiUrl';
import { orderType, productTypes } from '../../contants/strings';

export const onSave = (that, onSaveSuccessed, onSaveFailed) => {
  const { actions, data } = that.props;
  const {
    onSaveProject,
    boundNotificationActions,
    boundCloneModalActions
  } = actions;
  const { project } = data;
  const projectInfo = project.get('info');
  const isInCartOrOrdered = projectInfo && (projectInfo.get('cart') || projectInfo.get('order'));
  if (isInCartOrOrdered) {
    const errorMessage =
          (
            <div>
              Your current project has ordered or is in the cart.
              You need to <a onClick={boundCloneModalActions.showCloneModal}>clone</a> it to
              save your additional changes
            </div>
          );
    boundNotificationActions.addNotification({
      children: errorMessage,
      level: 'error',
      autoDismiss: 0
    });
    return;
  }
  onSaveProject(onSaveSuccessed, onSaveFailed);
};

export const onCancelClick = (that) => {
  const { actions } = that.props;
  const { closeApprovalPage } = actions;
  closeApprovalPage();
};

export const onApproveClick = (that) => {
  if (that.isOrdering) {
    return '';
  }
  that.isOrdering = true;
  const { actions, data, t } = that.props;
  const {
      boundConfirmModalActions,
      onSaveProject,
      boundTrackerActions
    } = actions;
  const { project, reviewResult } = data;
  const projectId = project.get('projectId');
  const orderPath = template(ORDER_PATH)({
    orderType,
    projectId
  });
  const isCoverBlank = reviewResult.get('cover').size ? true : false;
  const blankPageNum = reviewResult.get('emptyPageArray').size;
  const blankSheetNum = reviewResult.get('pages').size;
  let preMessage;
  let trackerBlankNum = 0;
  if (isCoverBlank || blankPageNum || blankSheetNum) {
    if (project.get('setting').get('product') !== productTypes.PS) {
      trackerBlankNum = blankSheetNum;
      if (isCoverBlank && !blankSheetNum) {
        preMessage = t('ORDER_ERROR_EMPTYCOVER_MESSAGE');
      } else if (isCoverBlank && blankSheetNum) {
        preMessage = blankSheetNum > 1 ? t('ORDER_ERROR_EMPTYCOVER_EMPTYSHEETS_MESSAGE', { blankSheetNum }) : t('ORDER_ERROR_EMPTYCOVER_1EMPTYSHEET_MESSAGE');
      } else if (!isCoverBlank && blankSheetNum) {
        preMessage = blankSheetNum > 1 ? t('ORDER_ERROR_EMPTYSHEETS_MESSAGE', { blankSheetNum }) : t('ORDER_ERROR_1EMPTYSHEET_MESSAGE');
      }
    } else {
      trackerBlankNum = blankPageNum;
      if (isCoverBlank && !blankPageNum) {
        preMessage = t('ORDER_ERROR_EMPTYCOVER_MESSAGE');
      } else if (isCoverBlank && blankPageNum) {
        preMessage = blankPageNum > 1 ? t('PS_ORDER_ERROR_EMPTYCOVER_EMPTYPAGES_MESSAGE', { blankPageNum }) : t('PS_ORDER_ERROR_EMPTYCOVER_1EMPTYPAGE_MESSAGE');
      } else if (!isCoverBlank && blankPageNum) {
        preMessage = blankPageNum > 1 ? t('PS_ORDER_ERROR_EMPTYPAGES_MESSAGE', { blankPageNum }) : t('PS_ORDER_ERROR_1EMPTYPAGE_MESSAGE');
      }
    }
    const message = t('FULL_ERROR_MESSAGE', { preMessage });
    boundConfirmModalActions.showConfirm({
      confirmMessage: message,
      onOkClick: () => {
        that.isOrdering = false;
      },
      xCloseFun: () => {
        that.isOrdering = false;
      },
      onCancelClick: () => {
        // order 时提示有空白页 仍点击 continue 的埋点;
        boundTrackerActions.addTracker(`ClickOrderAndContinue,${trackerBlankNum}`);
        onSaveProject(() => {
          that.isOrdering = false;
          // order 时提示有空白页 仍点击 continue 且 成功加入购物车 的 埋点;
          boundTrackerActions.addTracker(`ClickOrderAndContinueThenSuccess,${trackerBlankNum}`);
          window.onbeforeunload = null;
          window.location = orderPath;
        }, () => {
          that.isOrdering = false;
        });
      },
      okButtonText: t('CANCEL'),
      cancelButtonText: t('CONTINUE')
    });
  } else {
    onSaveProject(() => {
      that.isOrdering = false;
      // 项目保存成功后成功进入购物车 的埋点;
      boundTrackerActions.addTracker('OrderSuccessful');
      window.onbeforeunload = null;
      window.location = orderPath;
    }, () => {
      that.isOrdering = false;
    });
  }
};
