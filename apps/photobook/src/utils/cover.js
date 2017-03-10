import { coverTypes } from '../contants/strings';

/**
 * 检查指定的cover类型是否支持添加用户的照片
 * @param  {string} coverType 待检查的cover类型
 */
export const checkIsSupportImageInCover = coverType => {
  // 支持添加图片的封面类型有:
  // Paper Cover or Soft Cover、Hard Cover、Padded Cover
  // Crystal和Metal
  switch (coverType) {
    // Crystal
    case coverTypes.CC:
    case coverTypes.GC:

      // Metal
    case coverTypes.MC:
    case coverTypes.GM:

      // Paper Cover or Soft Cover
    case coverTypes.PSSC:
    case coverTypes.FMPAC:
    case coverTypes.LFPAC:

      // Hard Cover
    case coverTypes.HC:
    case coverTypes.LFHC:
    case coverTypes.PSHC:

      // Padded Cover
    case coverTypes.LFPC:
      return true;
    default:
      return false;
  }
};

/**
 * 检查指定的cover类型是否支持用户添加的照片铺满整个封面
 * @param  {string} coverType 待检查的cover类型
 */
export const checkIsSupportFullImageInCover = coverType => {
  // 支持用户添加的照片铺满整个封面类型有:
  // Paper Cover or Soft Cover、Hard Cover、Padded Cover
  switch (coverType) {
    // Paper Cover or Soft Cover
    case coverTypes.PSSC:
    case coverTypes.FMPAC:
    case coverTypes.LFPAC:

      // Hard Cover
    case coverTypes.HC:
    case coverTypes.LFHC:
    case coverTypes.PSHC:

      // Padded Cover
    case coverTypes.LFPC:
      return true;
    default:
      return false;
  }
};

/**
 * 检查指定的cover类型是否支持用户添加的照片铺满封面的正面(front)
 * @param  {string} coverType 待检查的cover类型
 */
export const checkIsSupportHalfImageInCover = coverType => {
  // 支持添加图片的封面类型有:
  // Crystal和Metal
  switch (coverType) {
    // Crystal
    case coverTypes.CC:
    case coverTypes.GC:

      // Metal
    case coverTypes.MC:
    case coverTypes.GM:
      return true;

    default:
      return false;
  }
};

/**
 * 检查是否需要把封面的用户照片设为内页的背景.
 * @param  {string} coverType coverType 待检查的cover类型
 * @return {boolean}
 */
export const checkIsSetCoverAsInnerBg = coverType => {
  // 只有hard cover和padded cover需要把封面的截图设为内页的背景.
  switch (coverType) {
    // Hard Cover
    case coverTypes.HC:
    case coverTypes.LFHC:
    case coverTypes.PSHC:

    // Padded Cover
    case coverTypes.LFPC:
      return true;
    default:
      return false;
  }
};
