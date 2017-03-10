import { merge, get } from 'lodash';
import classNames from 'classnames';
import { elementTypes, productTypes } from '../../../contants/strings';
/**
 * 显示右键弹框
 */
export const showActionBar = (that, element) => {
  const actionBarData = that.state.actionBarData;
  const { data } = that.props;
  const { ratio } = data;
  that.setState({
    actionBarData: merge({}, actionBarData, {
      offset: {
        top: element.getIn(['computed', 'top']),
        left: element.getIn(['computed', 'left']),
        width: element.getIn(['computed', 'width']),
        height: element.getIn(['computed', 'height'])
      },
      hasImage: !!element.get('encImgId'),
      rotate: element.get('rot'),
      elementId: element.get('id'),
    })
  });
};

/**
 * 隐藏右键弹框
 */
export const hideActionBar = (that) => {
  const actionBarData = that.state.actionBarData;

  if (actionBarData.isShow) {
    that.setState({
      actionBarData: merge({}, actionBarData, {
        isShow: false,
        guid: ''
      })
    });
  }
};


export const getMenuList = (that, element) => {
  const { actionbarActions } = that;
  const { t, actions, data } = that.props;
  const { settings, summary } = data;
  const { boundTrackerActions } = actions;
  const computed = element.get('computed');
  const hasImage = computed.get('imgUrl');

  const isCover = summary.get('isCover');
  const isPressBook = summary.get('isPressBook');
  const isSupportHalfImageInCover = summary.get('isSupportHalfImageInCover');

  const expandSubItems = [
    {
      subfix: 'expand-full',
      label: t('EXPAND_TO_FULLPAGE'),
      onClick: (e) => {
        boundTrackerActions.addTracker('ClickExpandToFullSheet');
        actionbarActions.onExpandToFullSheet(element, e);
      }
    },
    {
      subfix: 'expand-left',
      label: t('EXPAND_TO_LEFTPAGE'),
      onClick: (e) => {
        boundTrackerActions.addTracker('ClickExpandToLeftPage');
        actionbarActions.onExpandToLeftPage(element, e)
      }
    },
    {
      subfix: 'expand-right',
      label: t('EXPAND_TO_RIGHTPAGE'),
      onClick: (e) => {
        boundTrackerActions.addTracker('ClickExpandToRightPage');
        actionbarActions.onExpandToRightPage(element, e)
      }
    }
  ];

  // 是以下两种情况的, expand left和expand right不需要.
  // - 如果是封面并且封面类型是crsytal或metal
  // - 如果是内页并且是pressbook.
  if (isCover && isSupportHalfImageInCover || !isCover && isPressBook) {
    expandSubItems.splice(1, 2);
  }

  if (element.get('type') === elementTypes.photo) {
    if (hasImage) {
      return [
        {
          subfix: 'crop',
          label: t('CROP_ITEM'),
          onClick: (e) => {
            boundTrackerActions.addTracker('ClickCropImage');
            actionbarActions.onEditImage(element, e);
          }
        },
        {
          subfix: 'rotate',
          label: t('ROTATE_ITEM'),
          onClick: (e) => {
            boundTrackerActions.addTracker('ClickRotateImage');
            actionbarActions.onRotateImage(element, e);
          }
        },
        {
          subfix: 'flip',
          label: t('FLIP_ITEM'),
          onClick: (e) => {
            boundTrackerActions.addTracker('ClickFlipImage');
            actionbarActions.onFlipImage(element, e);
          }
        },
        {
          subfix: 'expand',
          label: t('EXPAND_ITEM'),
          sub: expandSubItems
        },
        {
          subfix: 'layer',
          type: 'text',
          label: t('LAYER_ITEM'),
          sub: [
            {
              subfix: 'to-front',
              label: t('BRING_TO_FRONT'),
              onClick: e => actionbarActions.onBringToFront(element, e)
            },
            {
              subfix: 'to-back',
              label: t('SEND_TO_BACK'),
              onClick: e => actionbarActions.onSendToback(element, e)
            },
            {
              subfix: 'forward',
              label: t('BRING_FORWARD'),
              onClick: e => actionbarActions.onBringForward(element, e)
            },
            {
              subfix: 'backward',
              label: t('SEND_BACKWARD'),
              onClick: e => actionbarActions.onSendBackward(element, e)
            },
          ]
        },
        {
          subfix: 'property',
          label: t('FILTER_ITEM'),
          onClick: (e) => {
            boundTrackerActions.addTracker('ClickProperty');
            actionbarActions.onFilter(element, e);
          }
        },
        {
          subfix: 'clear',
          label: t('CLEAR_ITEM'),
          onClick: e => actionbarActions.onRemoveImage(element, e)
        }
      ];
    }
    return [
      {
        subfix: 'upload',
        label: t('UPLOAD_FILES'),
        onClick: e => actionbarActions.onUploadImage(element, e)
      },
      {
        subfix: 'clear',
        label: t('CLEAR_ITEM'),
        onClick: e => actionbarActions.onRemoveImage(element, e)
      },
    ];
  } else if (element.get('type') === elementTypes.text) {
    return [
      {
        subfix: 'edit',
        label: t('EDIT_TEXT'),
        onClick: e => actionbarActions.onEditText(element, e)
      },
      {
        subfix: 'layer',
        type: 'text',
        label: t('LAYER_ITEM'),
        sub: [
          {
            subfix: 'to-front',
            label: t('BRING_TO_FRONT'),
            onClick: e => actionbarActions.onBringToFront(element, e)
          },
          {
            subfix: 'to-back',
            label: t('SEND_TO_BACK'),
            onClick: e => actionbarActions.onSendToback(element, e)
          },
          {
            subfix: 'forward',
            label: t('BRING_FORWARD'),
            onClick: e => actionbarActions.onBringForward(element, e)
          },
          {
            subfix: 'backward',
            label: t('SEND_BACKWARD'),
            onClick: e => actionbarActions.onSendBackward(element, e)
          },
        ]
      },
      {
        subfix: 'clear',
        label: t('CLEAR_TEXT'),
        onClick: e => actionbarActions.onRemoveImage(element, e)
      }
    ];
  } else if (element.get('type') === elementTypes.decoration) {
    return [
      {
        subfix: 'layer',
        type: 'text',
        label: t('LAYER_ITEM'),
        sub: [
          {
            subfix: 'to-front',
            label: t('BRING_TO_FRONT'),
            onClick: e => actionbarActions.onBringToFront(element, e)
          },
          {
            subfix: 'to-back',
            label: t('SEND_TO_BACK'),
            onClick: e => actionbarActions.onSendToback(element, e)
          },
          {
            subfix: 'forward',
            label: t('BRING_FORWARD'),
            onClick: e => actionbarActions.onBringForward(element, e)
          },
          {
            subfix: 'backward',
            label: t('SEND_BACKWARD'),
            onClick: e => actionbarActions.onSendBackward(element, e)
          },
        ]
      },
      {
        subfix: 'clear',
        label: t('CLEAR_ITEM'),
        onClick: e => actionbarActions.onRemoveImage(element, e)
      }
    ];
  }
};
