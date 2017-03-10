import { merge } from 'lodash';

/**
 * 获取右键弹框的列表数据.
 */
export const getMenuList = (that, element) => {
  const { contextMenuActions } = that;
  const { t } = that.props;
  const computed = element.get('computed');
  const hasImage = computed.get('imgUrl');

  // 如果有图片, 就使用有图片的弹框列表选项
  if (hasImage) {
    return [{
      label: t('EDIT'),
      onClick: e => contextMenuActions.onEditImage(element, e)
    }, {
      label: t('ROTATE'),
      onClick: e => contextMenuActions.onRotateImage(element, e)
    }, {
      label: t('FLIP'),
      onClick: e => contextMenuActions.onFlipImage(element, e)
    }, {
      label: t('EXPAND'),
      sub: [{
        label: t('EXPAND_TO_FULL_SHEET'),
        onClick: e => contextMenuActions.onExpandToFullSheet(element, e)
      }, {
        label: t('EXPAND_TO_LEFT_PAGE'),
        onClick: e => contextMenuActions.onExpandToLeftPage(element, e)
      }, {
        label: t('EXPAND_TO_RIGHT_SHEET'),
        onClick: e => contextMenuActions.onExpandToRightPage(element, e)
      }, ]
    }, {
      label: t('REMOVE'),
      onClick: e => contextMenuActions.onRemoveImage(element, e)
    }];
  } else {
    // 否则使用无图片的弹框列表.
    return [{
      label: t('UPLOAD_IMAGE'),
      onClick: e => contextMenuActions.onUploadImage(element, e)
    }, {
      label: t('REMOVE'),
      onClick: e => contextMenuActions.onRemoveImage(element, e)
    }];
  }
};

/**
 * 显示右键弹框
 */
export const showPopup = (that, ev) => {
  const event = ev || window.event;
  const contextMenuData = that.state.contextMenuData;

  that.setState({
    contextMenuData: merge({}, contextMenuData, {
      offset: {
        top: event.clientY - 15,
        left: event.clientX + 15
      },
      isShow: true
    })
  });
};

/**
 * 隐藏右键弹框
 */
export const hidePopup = (that) => {
  const contextMenuData = that.state.contextMenuData;

  if (contextMenuData.isShow) {
    that.setState({
      contextMenuData: merge({}, contextMenuData, {
        isShow: false
      })
    });
  }
};
