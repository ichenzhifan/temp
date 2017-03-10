/**
 * 计算缩放比例
 * @param {object} params
 * params = {
 *   imgRot 旋转角度
 *   imageDetail 图片信息
 *   width 元素宽
 *   height 元素高
 *   cropRLX，cropLUX，cropRLY，cropLUY
 * }
 */
export function getScale(params) {
  const { imgRot, imageDetail, width, height, cropRLX, cropLUX, cropRLY, cropLUY } = params;
  let cropLength, origLength;
  if (imgRot % 180 === 0) {
    cropLength = imageDetail.get('width') * Math.abs(cropRLX - cropLUX);
    origLength = width;
  } else {
    cropLength = imageDetail.get('height') * Math.abs(cropRLY - cropLUY);
    origLength = height;
  }
  return cropLength < origLength
          ? Math.round((origLength - cropLength) * 100 / origLength)
          : 0;
}
