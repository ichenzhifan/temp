//  计算缩放比例
export function getScale(params) {
  const { imgRot, imageDetail, width, height, cropRLX, cropLUX, cropRLY, cropLUY } = params;
  let cropLength, origLength;
  if (imgRot % 180 === 0) {
    cropLength = imageDetail.width * Math.abs(cropRLX - cropLUX);
    origLength = width;
  } else {
    cropLength = imageDetail.height * Math.abs(cropRLY - cropLUY);
    origLength = height;
  }
  return cropLength < origLength
          ? Math.round((origLength - cropLength) * 100 / origLength)
          : 0;
}
