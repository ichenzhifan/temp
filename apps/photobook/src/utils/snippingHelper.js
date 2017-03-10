import { html2canvas } from '../../../common/utils/html2Canvas/core';

/**
 * 把指定的节点转成canvas
 * @param  {[HTMLElement]} node HTML节点.
 * @param  [Function]
 */
export const toCanvas = (node, canvasWidth, options, done) => {
  if (node) {
    // 计算需要的小图尺寸.
    const oWidth = node.clientWidth;
    const oHeight = node.clientHeight;

    if (oWidth && oHeight) {
      const width = canvasWidth || oWidth;
      const height = width * oHeight / oWidth;

      html2canvas(node, options).then(canvas => {
        if (canvas) {
          // 缩放到指定大小.
          const newCanvas = document.createElement('canvas');
          newCanvas.width = width;
          newCanvas.height = height;
          const newCtx = newCanvas.getContext('2d');
          newCtx.drawImage(canvas, 0, 0, oWidth, oHeight, 0, 0, width, height);

          done && done(newCanvas.toDataURL());
        }
      });
    }
  }
};
