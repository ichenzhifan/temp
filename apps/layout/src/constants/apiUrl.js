
// api的根路径.
export const API_BASE = __DEVELOPMENT__ ? 'http://www.zno.com.dd/' : '/';

// 获取接口的base url.
export const GET_ENV = '<%=baseUrl%>userid/getEnv';

// 获取template信息接口
export const GET_TEMPLATE = '/portal/templateService/getTemplate.ep?uidPk=<%=uidPk%>';

//获取spread信息接口
export const GET_SPREAD = '/portal/templateService/getBookInformation.ep';

//save接口
export const SAVE_TEMPLATE = '/portal/templateService/updateTemplate.ep';

//publish接口
export const PUBLISH_TEMPLATE = '/portal/templateService/publishTemplate.ep';

//copy接口
export const COPY_TEMPLATE = '/portal/templateService/copyTemplate.ep?uidPk=<%=uidPk%>';

//get fonts
export const GET_FONTS = '<%=baseUrl%>api/product/text/fontmap';

//get Style list
export const GET_STYLE_LIST = '/portal/templateService/getStyleList.ep?styleSize=<%=styleSize%>&styleType=<%=styleType%>';

//get test image url
export const GET_TEST_IMAGE_URL = 'http://test-zno-artwork.s3.amazonaws.com/styleimage/<%=guid%>/<%=position%>_1000.jpg';

//get live image url
export const GET_LIVE_IMAGE_URL = 'http://artisanstate-artwork.s3.amazonaws.com/styleimage/<%=guid%>/<%=position%>_96.jpg';

// 获取文字图片地址
export const TEXT_SRC = '<%=baseUrl%>api/product/text/textImage?text=<%=text%>&font=<%=fontFamily%>&fontSize=<%=fontSize%>&color=<%=color%>&align=<%=textAlign%>&ratio=<%=ratio%>';

export const GET_FONT_THUMBNAIL = '<%=baseUrl%>prod-assets/static/font_thumbnail/<%=fontFamily%>.png';

