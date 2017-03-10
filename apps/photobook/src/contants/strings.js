// web  client id
export const webClientId = 1;

// web clientType
export const clientType = 'H5';

// 缩放的主体类型.
export const ratioType = {
  coverWorkspace: 'coverWorkspace',
  innerWorkspace: 'innerWorkspace',

  // preview
  previewCoverWorkspace: 'previewCoverWorkspace',
  previewInnerWorkspace: 'previewInnerWorkspace',

  // order page
  orderCoverWorkspace: 'orderCoverWorkspace',
  orderInnerWorkspace: 'orderInnerWorkspace',

  screen: 'screen',

  // 渲染效果图与封面workspace大小的比例
  coverRenderWidth: 'coverRenderWidth',
  coverRenderHeight: 'coverRenderHeight',

  // 渲染效果图与内页workspace大小的比例
  innerRenderWidth: 'innerRenderWidth',
  innerRenderHeight: 'innerRenderHeight',

  // 里层.
  coverRenderPaddingLeft: 'coverRenderPaddingLeft',
  coverRenderPaddingTop: 'coverRenderPaddingTop',
  innerRenderPaddingLeft: 'innerRenderPaddingLeft',
  innerRenderPaddingTop: 'innerRenderPaddingTop',
  coverSheetPaddingLeft: 'coverSheetPaddingLeft',
  coverSheetPaddingTop: 'coverSheetPaddingTop',
  innerSheetPaddingLeft: 'innerSheetPaddingLeft',
  innerSheetPaddingTop: 'innerSheetPaddingTop',

  // 外层.
  coverRenderOutPaddingLeft: 'coverRenderOutPaddingLeft',
  coverRenderOutPaddingTop: 'coverRenderOutPaddingTop',
  innerRenderOutPaddingLeft: 'innerRenderOutPaddingLeft',
  innerRenderOutPaddingTop: 'innerRenderOutPaddingTop',
  coverSheetOutPaddingLeft: 'coverSheetOutPaddingLeft',
  coverSheetOutPaddingTop: 'coverSheetOutPaddingTop',
  innerSheetOutPaddingLeft: 'innerSheetOutPaddingLeft',
  innerSheetOutPaddingTop: 'innerSheetOutPaddingTop',

  // arrange pages
  coverWorkspaceForArrangePages: 'coverWorkspaceForArrangePages',
  innerWorkspaceForArrangePages: 'innerWorkspaceForArrangePages'
};

// 缩放的主体类型.
export const spreadTypes = {
  coverPage: 'coverPage',
  innerPage: 'innerPage'
};

// 定义封面类型.
export const coverTypes = {
  // Crystal
  CC: 'CC',
  GC: 'GC',

  // Leatherette
  LC: 'LC',
  GL: 'GL',
  LFLC: 'LFLC',
  LFGL: 'LFGL',
  PSLC: 'PSLC',

  // Bling Cover
  LFBC: 'LFBC',
  BC: 'BC',

  // hard cover
  HC: 'HC',
  LFHC: 'LFHC',
  PSHC: 'PSHC',

  // linen cover
  NC: 'NC',
  LFNC: 'LFNC',
  PSNC: 'PSNC',

  // metal cover
  MC: 'MC',
  GM: 'GM',

  // Soft Cover
  // 软壳现在使用两个名称：FMA和Layflat中为Paper Cover，Press Book中为Soft Cover
  PSSC: 'PSSC',

  // Paper Cover
  // 软壳现在使用两个名称：FMA和Layflat中为Paper Cover，Press Book中为Soft Cover
  FMPAC: 'FMPAC',
  LFPAC: 'LFPAC',

  // Black Cover
  // 已经禁用了.
  LBB: 'LBB',

  // Photo Cover
  // 已经禁用, 但为了兼容老数据..
  LBPC: 'LBPC',

  // padded cover
  LFPC: 'LFPC'
};

// 保存自定义模版时的 sheetType 类型;
export const layoutSheetType = {
  CC: 'CC',
  HC: 'HC',
  INNER: 'INNER'
};

// 保存自定义模版时属于 sheetType 为 CC 的  cover 集合;
export const CcSheetTypeArray = ['MC', 'GM', 'CC', 'GC'];

// 百分比.
export const percent = {
  lg: 0.95,
  big: 0.9,
  normal: 0.75,
  sm: 0.5,
  xs: 0.4
};

/**
 * elType 类型
 */

export const elType = {
  cameo: 'cameo',
  image: 'image',
  text: 'text'
};

// element类型.
export const elementTypes = {
  background: 'BackgroundElement',
  cameo: 'CameoElement',
  paintedText: 'PaintedTextElement',
  photo: 'PhotoElement',
  decoration: 'DecorationElement',
  text: 'TextElement',
  spine: 'SpineElement',
  sticker: 'sticker'
};

export const pageTypes = {
  // 针对封面
  full: 'Full',
  front: 'Front',
  back: 'Back',
  spine: 'Spine',

  // 针对内页
  page: 'Page',
  sheet: 'Sheet'
};

/**
 * 天窗形状
 */
export const cameoShapeTypes = {
  rect: 'Rect',
  round: 'Round',
  oval: 'Oval'
};

/**
 * 天窗大小
 */
export const cameoSizeTypes = {
  small: 'S',
  middle: 'M',
  large: 'L'
};

/**
 * 天窗效果图的白边大小
 */
export const cameoPaddings = {
  top: 10,
  left: 10
};

export const cameoPaddingsRatio = {
  rectCameoPaddingTop: 15 / 420,
  rectCameoPaddingLeft: 15 / 420,
  roundCameoPaddingTop: 9 / 432,
  roundCameoPaddingLeft: 9 / 432
};

// 书脊在渲染效果图中, 顶部突出部分的比例.
export const spineExpandingTopRatio = 30 / 800;

// 在arrange pages中, 每一页workspace的宽度.
export const smallViewWidthInArrangePages = 290;

// 在my project中使用的缩略图的尺寸.
export const smallViewWidthInMyProjects = 400;

// 产品类型.
export const productTypes = {
  LF: 'LF',
  FM: 'FM',
  LB: 'LB',
  PS: 'PS'
};

// 内页sheet的shadow图片的原始大小.
export const shadowBaseSize = {
  LF: {
    left: { width: 789, height: 789 },
    middle: { width: 3, height: 789 },
    right: { width: 789, height: 789 }
  },
  FM: {
    left: { width: 789, height: 789 },
    middle: { width: 3, height: 789 },
    right: { width: 789, height: 789 }
  },
  PS: {
    left: { width: 789, height: 789 },
    middle: { width: 470, height: 789 },
    right: { width: 789, height: 789 }
  }
};

// 每一sheet包含的page数量.
export const pageStep = 2;

// 组件zindex的定义.
export const zIndex = {
  notification: 99999,
  modal: 50000,
  actionBar: 40000,
  shadow: 30000,
  elementBase: 100
};

export const orderType = 'commonProduct';

export const FREE = 'FREE!';

// 定义图片的形状.
export const imageShapeTypes = {
  rect: 'Rect',
  round: 'Round',
  oval: 'Oval'
};

// 天窗的方向类型.
export const cameoDirectionTypes = {
  S: 'Square',
  H: 'Horizontal',
  V: 'Vertical'
};

// 图片加载的并发数.
export const limitImagesLoading = 10;

// 支持半页模板的封面上, 允许的最大图片数.
export const limitImageNumberInHalfPageTemplate = 2;

// 登录页面的路由
export const loginPath = '/sign-in.html';

// crop 图片的最大尺寸；
export const cropLimitedSize = 1500;

// 拖拽页面时, 设置拖拽元素的缩略图的节点选择器.
export const dragPageSelector = {
  targetPage: '.book-page-thumbnail',
  clonedPage: 'book-page-thumbnail-cloned'
};

// product名称, 简写与全称的对应关系.
export const productNames = {
  LF: 'Layflat Photo Book',
  FM: 'Flush Mount Album',
  LB: 'Little Black Book',
  PS: 'Press Book'
};
