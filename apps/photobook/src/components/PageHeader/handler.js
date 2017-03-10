/**
 * 点击clone按钮时的处理函数
 * @param that 组件的this指向.
 */
import React from 'react';
import { template } from 'lodash';
import { orderType, productTypes } from '../../contants/strings';
import { errors } from '../../contants/errorMessage';
import { FAQ_ADDRESS, ORDER_PATH } from '../../contants/apiUrl';
import { reviewPhotoBook } from '../../utils/reviewPhotoBook';

export const onClone = (that) => {
  const { actions } = that.props;
  const { boundCloneModalActions } = actions;
  boundCloneModalActions.showCloneModal();
};

/**
 * 点击help按钮时的处理函数
 * @param that 组件的this指向.
 */
export const onHelp = (that) => {
  // todo
};

/**
 * 点击preview按钮时的处理函数
 * @param that 组件的this指向.
 */
export const onPreview = (that) => {
  const { actions } = that.props;
  const { boundPreviewModalActions } = actions;
  boundPreviewModalActions.show();
};

/**
 * 点击save按钮时的处理函数
 * @param that 组件的this指向.
 */
export const onSave = (that, onSaveSuccessed, onSaveFailed) => {
  const { actions, data } = that.props;
  const { onSaveProject, boundTrackerActions, boundNotificationActions, boundCloneModalActions } = actions;
  const { project } = data;
  const projectInfo = project.get('info');
  const isInCartOrOrdered = projectInfo && (projectInfo.get('cart') || projectInfo.get('order'));
  // 点击 save 的埋点;
  boundTrackerActions.addTracker('ClickSave');
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

/**
 * 点击share按钮时的处理函数
 * @param that 组件的this指向.
 */
export const onShare = (that) => {
  const { actions } = that.props;
  const { boundShareProjectActions, onSaveProject } = actions;
  boundShareProjectActions.showShareProjectModal();
  onSaveProject(() => {});
};


/**
 * 点击order按钮时的处理函数
 * @param that 组件的this指向.
 */
export const onOrder = (that) => {
  const { actions, data, t } = that.props;
  const {
    boundConfirmModalActions,
    boundPaginationActions,
    boundTrackerActions,
    boundCloneModalActions,
    boundNotificationActions,
    boundApprovalPageActions
  } = actions;
  const { project } = data;
  const reviewResult = reviewPhotoBook(project.toJS());

  // 如果当前的状态是 在购物车中或者订单状态，直接提示 clone。
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
  // 点击 order 的时候先埋点。
  boundTrackerActions.addTracker('ClickOrder');

  const isCoverBlank = reviewResult.cover.length ? true : false;
  if (isCoverBlank && reviewResult['cover'][0].errorMessage === errors.blankCameo) {
    boundConfirmModalActions.showConfirm({
      confirmTitle: t('ORDER_ERROR_TITLE'),
      confirmMessage: t('ORDER_ERROR_EMPTYCAMEO_MESSAGE'),
      onOkClick: () => {
        boundPaginationActions.switchSheet(0);
      },
      okButtonText: t('ORDER_ERROR_EMPTYCAMEO_BUTTONTEXT')
    });
    return;
  }
  boundApprovalPageActions.showApprovalPage({ reviewResult });
};

export const directToFAQ = (that) => {
  const { actions } = that.props;
  const { boundTrackerActions } = actions;
  boundTrackerActions.addTracker('ClickFAQ');
  window.open(FAQ_ADDRESS, '_blank');
};
