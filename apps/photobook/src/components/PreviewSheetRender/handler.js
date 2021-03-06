import {get, merge } from 'lodash';
import Immutable from 'immutable';
import { smallViewWidthInMyProjects } from '../../contants/strings';
import { checkIsSetCoverAsInnerBg } from '../../utils/cover';
import { toCanvas } from '../../utils/snippingHelper';
import { getImageDataByBase64, imageDataHRevert, getBase64ByImageData } from '../../../../common/utils/draw';

let timer = null;

// handlers write here
export const onClosePreviewModal = (that) => {
  const { actions } = that.props;
  const { closePreviewModal } = actions;
  closePreviewModal && closePreviewModal();
};

/**
 * 更新组件的state
 */
export const updatePaginationSpreadInState = (that, props, sheetIndex) => {
  const allSheets = props ? props.data.allSheets : that.props.data.allSheets;
  const newSheet = allSheets.get(sheetIndex);

  if (sheetIndex < allSheets.size) {
    that.setState({
      paginationSpread: newSheet
    });
  }
};

export const updatePaginationInState = (that, props, sheetIndex) => {
  const { pagination } = that.state;
  const paginationInProps = props.data.pagination || that.props.data.pagination;

  that.setState({
    pagination: {
      prevSheetIndex: pagination.sheetIndex,
      sheetIndex: sheetIndex,
      total: paginationInProps.get('total')
    }
  });
};

/**
 * 预览时的翻页.
 */
export const switchSheet = (that, param) => {
  const { actions = {} } = that.props;
  const { onSwitchSheet } = actions;
  const { current } = param;

  updatePaginationSpreadInState(that, that.props, current);
  updatePaginationInState(that, that.props, current);

  const newPagination = merge({}, that.state.pagination, {
    sheetIndex: current
  });
  onSwitchSheet && onSwitchSheet(newPagination);
};

export const doSnipping = (that) => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    const { actions, data } = that.props;
    const { settings } = data;
    const { snipping } = that.state;

    // 如果封面上支持放置用户的图片. 那就要把用户放置的图片截取下来
    // 把coversheet节点截下来. 截取下来的图片会放到内页作为背景.
    const coverType = get(settings, 'spec.cover');
    const isSetCoverAsInnerBg = checkIsSetCoverAsInnerBg(coverType);

    if (isSetCoverAsInnerBg) {
      const coverSheetNode = document.querySelector('.cover-sheet');

      toCanvas(coverSheetNode, null, { isManualIgnore: true }, (result) => {
        // 横向翻转图片
        getImageDataByBase64(result).then((imgData) => {
          const hRevertedData = imageDataHRevert(imgData);
          const newBase64Data = getBase64ByImageData(hRevertedData);

          that.setState({
            snipping: snipping.set('cover', newBase64Data)
          });
        });
      });
    }
  }, 300);
};
