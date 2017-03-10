// api的根路径.
export const API_BASE = __DEVELOPMENT__ ? 'http://www.zno.com.dd/' : '/';

// 获取todo列表的api接口
export const GET_TODO_LIST = '../../imagebox/src/sources/data.json';

export const GET_SPEC_DATA = '<%=baseUrl%>frontPages/getProductSpec/ImageBox';

export const GET_PROJECT_DATA = '<%=baseUrl%>userid/<%=userId%>/project/<%=projectId%>';

export const GET_PREVIEW_PROJECT_DATA = '<%=uploadBaseUrl%>upload/Preview/GetPhotobookXmlByProjectId?projectId=<%=projectId%>';

export const GET_FONTS = './fonts.xml';

export const GET_BOX_SPEC = '<%=baseUrl%>template-resources/h5Client/data/<%=size%>SPEC_<%=type%>_<%=spineThickness%>.zip';

export const NEW_PROJECT = '<%=baseUrl%>general/<%=userId%>/project/IB';

export const SAVE_PROJECT = '<%=baseUrl%>general/<%=userId%>/project/<%=projectId%>/IB';

// 登录接口
export const LOGIN = '<%=baseUrl%>phone/nativeLogin.ep?username=<%=username%>&password=<%=password%>';

export const ORDER = '<%=baseUrl%>image-box/addShoppingCart.html?projectGUID=<%=projectId%>';

// 上传前获取imageids接口
export const GET_IMAGE_IDS = '<%=uploadBaseUrl%>upload/UploadServer/GetBatchImageIds';

// 图片上传接口
export const UPLOAD_IMAGES = '<%=uploadBaseUrl%>upload/UploadServer/uploadImg';

// 图片裁剪接口
export const IMAGES_CROPPER = '<%=baseUrl%>imageBox/liveUpdateCropImage.ep';
export const IMAGES_CROPPER_PARAMS = '?encImgId=<%=encImgId%>&px=<%=px%>&py=<%=py%>&pw=<%=pw%>&ph=<%=ph%>&width=<%=width%>&height=<%=height%>&rotation=<%=rotation%>';

// 获取接口的base url.
export const GET_ENV = '<%=baseUrl%>userid/getEnv';

// 获取用户的会话信息.
export const GET_SESSION_USER_INFO = '<%=baseUrl%>BigPhotoBookServlet/getSessionUserInfo?webClientId=<%=webClientId%>&autoRandomNum=<%=autoRandomNum%>';

export const HEART_BEAT = '<%=baseUrl%>userid/<%=userId%>/heartbeat';

// 获取用户的album id.
export const GET_USER_ALBUM_ID = '<%=baseUrl%>userid/<%=userId%>/getAlbumId?albumName=<%=albumName%>';

export const ADD_ALBUM = '<%=baseUrl%>userid/<%=userId%>/addOrUpdateAlbum?albumName=<%=albumName%>&webClientId=<%=webClientId%>&autoRandomNum=<%=autoRandomNum%>';
// 获取项目 title 的地址
export const GET_TITLE = '<%=baseUrl%>web-api/customerId/<%=userId%>/getProjectNameByProjectId?projectId=<%=projectId%>';
// 确认并修改 title 的接口地址
export const CHECK_TITLE = '<%=baseUrl%>web-api/customerId/<%=userId%>/updateProjectAndAlbumTitle?projectId=<%=projectId%>&projectName=<%=projectName%>';
// 获取产品的price
export const GET_PRODUCT_PRICE = '<%=baseUrl%>clientH5/product/price?product=<%=product%>&options=<%=options%>';

// 获取图片地址
export const IMAGE_SRC = 'upload/UploadServer/PicRender';

// 获取文字图片地址
export const TEXT_SRC = '<%=fontBaseUrl%>product/text/textImage?text=<%=text%>&font=<%=fontFamily%>&fontSize=<%=fontSize%>&color=<%=fontColor%>&align=<%=textAlign%>';

// 获取项目主工程图片地址
export const GET_MAIN_PROJECT_IMAGE = '<%=baseUrl%>clientH5/project/imageInfo?projectId=<%=mainProjectUid%>&autoRandomNum=<%=autoRandomNum%>';

// 将imageIds转换成encImageIds
export const GET_ENCODE_IMAGE_IDS = '<%=baseUrl%>userid/getEncImgIds?imageIds=<%=imageIds%>';

// 获取项目订单状态地址
export const GET_PROJECT_ORDERED_STATE = '<%=baseUrl%>userid/<%=userId%>/getProjectOrderedState/<%=projectId%>?webClientId=<%=webClientId%>&autoRandomNum=<%=autoRandomNum%>';

// 获取项目订单详情地址
export const GET_PROJECT_ORDERED_INFO = '<%=baseUrl%>clientH5/projectInfo/<%=projectId%>?<%=timestamp%>';

// 更新打回订单状态
export const UPDATE_CHECK_STATUS = '<%=baseUrl%>userid/<%=userId%>/submitCheckFailProject/<%=projectId%>?isParentBook=false&redirectParentBook=false';
