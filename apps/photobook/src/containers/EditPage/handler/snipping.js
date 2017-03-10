import {get } from 'lodash';
import { smallViewWidthInMyProjects } from '../../../contants/strings';
import { checkIsSetCoverAsInnerBg } from '../../../utils/cover';
import { toCanvas } from '../../../utils/snippingHelper';
import { getImageDataByBase64, imageDataHRevert, getBase64ByImageData } from '../../../../../common/utils/draw';

let timer = null;

export const doSnipping = (that) => {
  const { boundSnippingActions, settings } = that.props;

  clearTimeout(timer);

  timer = setTimeout(() => {
    // 截小图.
    const bookCoverNode = document.querySelector('.spreads-list');

    // 把指定的html节点转成canvas, 更更新store上的数据.
    toCanvas(bookCoverNode, smallViewWidthInMyProjects, null, data => {
      // 更新store上的截图.
      if (data) {
        boundSnippingActions.updateSnippingThumbnail({
          type: 'thumbnail',
          base64: data.replace('data:image/png;base64,', '')
        });
      }
    });

    // 如果封面上支持放置用户的图片. 那就要把用户放置的图片截取下来
    // 把coversheet节点截下来. 截取下来的图片会放到内页作为背景.
    const coverType = get(settings, 'spec.cover');
    const isSetCoverAsInnerBg = checkIsSetCoverAsInnerBg(coverType);

    if (isSetCoverAsInnerBg) {
      const coverSheetNode = document.querySelector('.cover-sheet');

      toCanvas(coverSheetNode, null, { isManualIgnore: true }, data => {
        // 横向翻转图片
        getImageDataByBase64(data).then((imgData) => {
          const hRevertedData = imageDataHRevert(imgData);
          const newBase64Data = getBase64ByImageData(hRevertedData);
          boundSnippingActions.updateSnippingThumbnail({
            type: 'cover',
            base64: newBase64Data
          });
        });
      });
    }
  }, 300);
};
