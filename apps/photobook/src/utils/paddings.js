class Paddings {
  constructor(top = 0, left = 0, right = 0, bottom = 0) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }
}

// Crystal
const crystal = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), //37, 38
  cover: new Paddings(50, 0, 50, 50),

  // 里层
  left: new Paddings(60, 70, 0, 59),
  right: new Paddings(60, 0, 60, 59),

  // 外层
  outLeft: new Paddings(50, 50, 0, 50),
  outRight: new Paddings(50, 0, 50, 50)
};

// paper
const paperCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), //37, 38
  cover: new Paddings(50, 0, 50, 50),

  // 里层
  left: new Paddings(51, 53, 56, 51), //top = 0, left = 0, right = 0, bottom = 0
  right: new Paddings(0, 0, 0, 0),

  // 外层
  outLeft: new Paddings(50, 52, 54, 50),
  outRight: new Paddings(0, 0, 0, 0)
};

// hard cover
const hardCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), // new Paddings(35, 37);
  cover: new Paddings(50, 0, 50, 50),

  // 里层
  left: new Paddings(48, 55, 0, 49),
  right: new Paddings(48, 0, 55, 49),

  // 外层
  outLeft: new Paddings(40, 40, 0, 40),
  outRight: new Paddings(40, 0, 40, 40)
};

// leatherette cover
const leatheretteCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), // new Paddings(34, 34)
  cover: new Paddings(50, 0, 50, 50), // //top = 0, left = 0, right = 0, bottom = 0

  // 里层
  left: new Paddings(58, 70, 0, 60),
  right: new Paddings(58, 0, 60, 60),

  // 外层
  outLeft: new Paddings(50, 50, 0, 50),
  outRight: new Paddings(50, 0, 50, 50)
};

// linen cover
const linenCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), // //new Paddings(34, 26);
  cover: new Paddings(50, 0, 50, 50),

  // 里层
  left: new Paddings(59, 70, 0, 60),
  right: new Paddings(59, 0, 60, 60),

  // 外层
  outLeft: new Paddings(50, 50, 0, 50),
  outRight: new Paddings(50, 0, 50, 50)
};

// metal cover
const metalCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), //  new Paddings(37, 38);
  cover: new Paddings(50, 0, 50, 50),//top = 0, left = 0, right = 0, bottom = 0

  // 里层
  left: new Paddings(60, 70, 0, 59),
  right: new Paddings(60, 0, 60, 59),

  // 外层
  outLeft: new Paddings(50, 50, 0, 50),
  outRight: new Paddings(50, 0, 50, 50)
};

// padded cover
const paddedCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), // new Paddings(38, 40);
  cover: new Paddings(50, 0, 50, 50),

  // 里层
  left: new Paddings(48, 55, 0, 49),
  right: new Paddings(48, 0, 55, 49),

  // 外层
  outLeft: new Paddings(40, 40, 0, 40),
  outRight: new Paddings(40, 0, 40, 40)
};

// default
const defaultCover = {
  back: new Paddings(50, 50, 0, 50),
  spain: new Paddings(50, 0, 0, 50), //  new Paddings(35, 35);
  cover: new Paddings(50, 0, 50, 50),

  // 里层
  left: new Paddings(50, 50, 0, 50),
  right: new Paddings(50, 0, 50, 50),

  // 外层
  outLeft: new Paddings(50, 50, 0, 50),
  outRight: new Paddings(50, 0, 50, 50)
};

/**
 * 定义不同封面素材对应的四周的白边的尺寸.
 * @type {Object}
 */
const coverPaddings = {
  // Crystal
  CC: crystal,
  GC: crystal,

  // hard cover与padded cover使用相同的素材.
  HC: hardCover,
  PSHC: hardCover,
  LFHC: hardCover,

  // paper cover
  FMPAC: paperCover,
  LFPAC: paperCover,
  LBB: paperCover,
  LBPC: paperCover,
  PSSC: paperCover,

  // leathertte
  LC: leatheretteCover,
  GL: leatheretteCover,
  LFLC: leatheretteCover,
  LFGL: leatheretteCover,
  PSLC: leatheretteCover,
  LFBC: leatheretteCover,
  BC: leatheretteCover,

  // linen cover
  NC: linenCover,
  LFNC: linenCover,
  PSNC: linenCover,

  // metal cover
  MC: metalCover,
  GM: metalCover,

  // padded cover
  LFPC: paddedCover,

  // 默认值.
  _default: defaultCover
};

/**
 * 定义不同封面素材对应的四周的白边的尺寸.
 * @type {Object}
 */
const innerPaddings = {
  // Crystal, metal cover使用相同的内页素材.
  CC: crystal,
  GC: crystal,
  MC: crystal,
  GM: crystal,

  // hard cover与padded cover使用相同的内页素材.
  HC: hardCover,
  LFHC: hardCover,
  PSHC: hardCover,
  LFPC: hardCover, // padded cover

  // paper cover
  FMPAC: paperCover,
  LFPAC: paperCover,
  LBB: paperCover,
  LBPC: paperCover,
  PSSC: paperCover,

  // leathertte
  LC: leatheretteCover,
  GL: leatheretteCover,
  LFLC: leatheretteCover,
  LFGL: leatheretteCover,
  PSLC: leatheretteCover,
  LFBC: leatheretteCover,
  BC: leatheretteCover,

  // linen cover
  NC: linenCover,
  LFNC: linenCover,
  PSNC: linenCover,

  // 默认值.
  _default: defaultCover
};


/*定义不同素材效果图对应的四周的效果尺寸的大小.*/
// top = 0, left = 0, right = 0, bottom = 0
const innerSheetCrystalEffectRatio = new Paddings(10/945, 25/1726, 20/1726, 8/945);
const innerSheetHardCoverEffectRatio = new Paddings(8/925, 26/1706, 22/1706, 9/925);
const innerSheetLeatheretteCoverEffectRatio = new Paddings(8/945, 27/1726, 20/1726, 10/945);
const innerSheetLinenCoverEffectRatio = new Paddings(9/945, 27/1726, 23/1726, 10/945);
const innerSheetMetalCoverEffectRatio = new Paddings(10/945, 25/1726, 20/1726, 8/945);
const innerSheetPaddedCoverEffectRatio = new Paddings(8/925, 26/1706, 22/1706, 9/925);
const innerSheetDefaultCoverEffectRatio = new Paddings(10/945, 25/1726, 20/1726, 8/945);

/**
 * 定义不同素材效果图对应的四周的效果尺寸的大小.
 * 效果图包括工作区域和围绕四周的效果.
 * @type {Object}
 */
const innerSheetPaddingsEffectRatio = {
  // Crystal
  CC: innerSheetCrystalEffectRatio,
  GC: innerSheetCrystalEffectRatio,

  // hard cover与paper cover使用相同的素材.
  HC: innerSheetHardCoverEffectRatio,
  LFHC: innerSheetHardCoverEffectRatio,
  PSHC: innerSheetHardCoverEffectRatio,
  FMPAC: innerSheetHardCoverEffectRatio,
  LFPAC: innerSheetHardCoverEffectRatio,
  LBB: innerSheetHardCoverEffectRatio,
  LBPC: innerSheetHardCoverEffectRatio,
  PSSC: innerSheetHardCoverEffectRatio,

  // leathertte
  LC: innerSheetLeatheretteCoverEffectRatio,
  GL: innerSheetLeatheretteCoverEffectRatio,
  LFLC: innerSheetLeatheretteCoverEffectRatio,
  LFGL: innerSheetLeatheretteCoverEffectRatio,
  PSLC: innerSheetLeatheretteCoverEffectRatio,
  LFBC: innerSheetLeatheretteCoverEffectRatio,
  BC: innerSheetLeatheretteCoverEffectRatio,

  // linen cover
  NC: innerSheetLinenCoverEffectRatio,
  LFNC: innerSheetLinenCoverEffectRatio,
  PSNC: innerSheetLinenCoverEffectRatio,

  // metal cover
  MC: innerSheetMetalCoverEffectRatio,
  GM: innerSheetMetalCoverEffectRatio,

  // padded cover
  LFPC: innerSheetPaddedCoverEffectRatio,

  // 默认值.
  _default: innerSheetDefaultCoverEffectRatio
};

/**
 * 根据cover id, 查找对应的cover在render时, 对应白边的大小.
 * @param  {string} coverType cover id比如: CC,GC,NC,HC等.
 * @return {object} 白边的大小, 结构为: {top, right, bottom, left}
 */
export const getCoverPaddings = (coverType) => {
  const paddings = coverPaddings[coverType] || coverPaddings['_default'];

  return paddings;
};

/**
 * 根据cover id, 查找对应的cover在render时, 对应白边的大小.
 * @param  {string} coverType cover id比如: CC,GC,NC,HC等.
 * @return {object} 白边的大小, 结构为: {top, right, bottom, left}
 */
export const getInnerPaddings = (coverType) => {
  const paddings = innerPaddings[coverType] || innerPaddings['_default'];

  return paddings;
};

/**
 * 根据cover id, 获取不同素材效果图对应的四周的效果尺寸的大小.效果图包括工作区域和围绕四周的效果.
 * @param  {string} coverType cover id比如: CC,GC,NC,HC等.
 * @return {object} 白边的大小, 结构为: {top, right, bottom, left}
 */
export const getInnerSheetPaddingsEffectRatio = (coverType) => {
  const paddings = innerSheetPaddingsEffectRatio[coverType] || innerSheetPaddingsEffectRatio['_default'];

  return paddings;
};


