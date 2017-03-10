import { coverTypes } from '../contants/strings';
import * as materials from '../contants/material';

/**
 * 根据指定的cover类型, 获取存放该素材的文件夹的名称.
 * @param coverType
 */
const mapToMaterialsFolderName = (coverType) => {
  let name = '';

  switch (coverType) {
    case coverTypes.CC:
    case coverTypes.GC: {
      name = 'crystal';
      break;
    }
    case coverTypes.HC:
    case coverTypes.PSHC:
    case coverTypes.LFHC: {
      name = 'hard';
      break;
    }
    // 软壳现在使用两个名称：FMA和Layflat中为Paper Cover，Press Book中为Soft Cover
    // Photo Cover: Photo Cover是LBB小黑书，封面为白色背景时的封面名称
    // 已经禁用, 但为了兼容老数据, 且与paper cover类似.
    case coverTypes.FMPAC:
    case coverTypes.LFPAC:
    case coverTypes.LBB:
    case coverTypes.LBPC:
    case coverTypes.PSSC: {
      name = 'paper';
      break;
    }
    case coverTypes.LC:
    case coverTypes.GL:
    case coverTypes.LFLC:
    case coverTypes.LFGL:
    case coverTypes.PSLC:
    case coverTypes.LFBC:
    case coverTypes.BC: {
      name = 'genuine';
      break;
    }
    case coverTypes.NC:
    case coverTypes.LFNC:
    case coverTypes.PSNC: {
      name = 'linen';
      break;
    }
    case coverTypes.MC:
    case coverTypes.GM: {
      name = 'metal';
      break;
    }
    case coverTypes.LFPC: {
      name = 'padded';
      break;
    }
    default:
      break;
  }

  return name;
};

/**
 * 根据指定的cover类型, 获取该cover的所有素材的路径.
 * @param coverType 封面类型.
 * @param isCover true: 获取封面的素材, false: 获取内页的素材.
 */
export const getMaterialsByCoverType = (coverType, isCover = true) => {
  const name = mapToMaterialsFolderName(coverType);
  const allMaterials = materials[name];
  let obj = null;
  if (allMaterials) {
    obj = isCover ? allMaterials.cover : allMaterials.inner;
  }

  return obj;
};
