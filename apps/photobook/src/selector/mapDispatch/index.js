import { bindActionCreators } from 'redux';

// 导入action文件.
import * as todoAction from '../../actions/test/todoAction';
import * as randomAction from '../../actions/test/randomAction';

// spec
import * as specActions from '../../actions/spec/specActions';

// project
import * as projectActions from '../../actions/project/projectActions';

// system
import * as undoAction from '../../actions/system/undoAction';
import * as queryStringAction from '../../actions/system/queryStringAction';
import * as ratioAction from '../../actions/system/ratioAction';
import * as paginationAction from '../../actions/system/paginationAction';
import * as renderActions from '../../actions/system/renderActions';
import * as envActions from '../../actions/system/envActions';
import * as alertActions from '../../actions/system/alertAction';
import * as confirmModalActions from '../../actions/system/confirmModalActions';
import * as loadingActions from '../../actions/system/loadingActions';
import * as notificationActions from '../../actions/system/notificationActions';
import * as imageEditModalActions from '../../actions/system/imageEditModalActions';
import * as sidebarAction from '../../actions/system/sidebarAction';
import * as imagesActions from '../../actions/system/imagesActions';
import * as uploadImageActions from '../../actions/system/uploadImageActions';
import * as priceActions from '../../actions/system/priceActions';
import * as templateActions from '../../actions/system/templateActions';
import * as bookSettingsModalActions from '../../actions/system/bookSettingsModalActions';
import * as stickerActions from '../../actions/system/stickerActions';
import * as paintedTextModalActions from '../../actions/system/paintedTextModalActions';
import * as textEditModalActions from '../../actions/system/textEditModalActions';
import * as howThisWorksModalActions from '../../actions/system/howThisWorksModalActions';
import * as quickStartModalActions from '../../actions/system/quickStartModalActions';
import * as contactUsModalActions from '../../actions/system/contactUsModalActions';
import * as shareProjectModalActions from '../../actions/system/shareProjectModalActions';
import * as saveTemplateModalActions from '../../actions/system/saveTemplateModalActions';
import * as cloneModalActions from '../../actions/system/cloneModalActions';
import * as propertyModalActions from '../../actions/system/propertyModalActions';
import * as alertModalActions from '../../actions/system/alertModalActions';
import * as previewModalActions from '../../actions/system/previewModalActions';
import * as pageLoadingModalActions from '../../actions/system/pageLoadingModalActions';
import * as trackerActions from '../../actions/system/trackerActions';
import * as snippingActions from '../../actions/system/snippingActions';
import * as fontActions from '../../actions/system/fontActions';
import * as changeBgColorModalActions from '../../actions/system/changeBgColorModalActions';
import * as approvalPageActions from '../../actions/system/approvalPageActions';

/**
 * App container component
 */
export const mapAppDispatchToProps = dispatch => ({
  // system
  boundQueryStringActions: bindActionCreators(queryStringAction, dispatch),
  boundEnvActions: bindActionCreators(envActions, dispatch),
  boundRatioActions: bindActionCreators(ratioAction, dispatch),
  boundAlertActions: bindActionCreators(alertActions, dispatch),
  boundLoadingActions: bindActionCreators(loadingActions, dispatch),
  boundNotificationActions: bindActionCreators(notificationActions, dispatch),
  boundImageEditModalActions: bindActionCreators(imageEditModalActions, dispatch),
  boundSidebarActions: bindActionCreators(sidebarAction, dispatch),
  boundImagesActions: bindActionCreators(imagesActions, dispatch),
  boundUploadImagesActions: bindActionCreators(uploadImageActions, dispatch),
  boundPriceActions: bindActionCreators(priceActions, dispatch),
  boundTemplateActions: bindActionCreators(templateActions, dispatch),
  boundBookSettingsModalActions: bindActionCreators(bookSettingsModalActions, dispatch),
  boundStickerActions: bindActionCreators(stickerActions, dispatch),
  boundimageEditModalActions: bindActionCreators(imageEditModalActions, dispatch),
  boundTextEditModalActions: bindActionCreators(textEditModalActions, dispatch),
  boundConfirmModalActions: bindActionCreators(confirmModalActions, dispatch),
  boundHowThisWorksActions: bindActionCreators(howThisWorksModalActions, dispatch),
  boundQuickStartActions: bindActionCreators(quickStartModalActions, dispatch),
  boundContactUsActions: bindActionCreators(contactUsModalActions, dispatch),
  boundShareProjectActions: bindActionCreators(shareProjectModalActions, dispatch),
  boundSaveTemplateActions: bindActionCreators(saveTemplateModalActions, dispatch),
  boundRenderActions: bindActionCreators(renderActions, dispatch),
  boundCloneModalActions: bindActionCreators(cloneModalActions, dispatch),
  boundPropertyModalActions: bindActionCreators(propertyModalActions, dispatch),
  boundAlertModalActions: bindActionCreators(alertModalActions, dispatch),
  boundPreviewModalActions: bindActionCreators(previewModalActions, dispatch),
  boundPageLoadingModalActions: bindActionCreators(pageLoadingModalActions, dispatch),
  boundPaginationActions: bindActionCreators(paginationAction, dispatch),
  boundTrackerActions: bindActionCreators(trackerActions, dispatch),
  boundFontActions: bindActionCreators(fontActions, dispatch),
  boundChangeBgColorModalActions: bindActionCreators(changeBgColorModalActions, dispatch),
  boundApprovalPageActions: bindActionCreators(approvalPageActions, dispatch),
  boundSnippingActions: bindActionCreators(snippingActions, dispatch),

  // spec
  boundSpecActions: bindActionCreators(specActions, dispatch),

  // project
  boundProjectActions: bindActionCreators(projectActions, dispatch)
});

/**
 * ArragePages container component
 */
export const mapArragePagesDispatchToProps = dispatch => ({
  // project
  boundProjectActions: bindActionCreators(projectActions, dispatch)
});

/**
 * BookOptions container component
 */
export const mapBookOptionsDispatchToProps = dispatch => ({
  boundProjectActions: bindActionCreators(projectActions, dispatch),
  boundPaginationActions: bindActionCreators(paginationAction, dispatch),
  boundConfirmModalActions: bindActionCreators(confirmModalActions, dispatch),
  boundSnippingActions: bindActionCreators(snippingActions, dispatch)
});

/**
 * EditPage container component
 */
export const mapEditPageDispatchToProps = dispatch => ({
  // 测试使用.
  boundTodoActions: bindActionCreators(todoAction, dispatch),
  boundRandomActions: bindActionCreators(randomAction, dispatch),

  // undo.
  boundUndoActions: bindActionCreators(undoAction, dispatch),

  // system
  boundRatioActions: bindActionCreators(ratioAction, dispatch),
  boundPaginationActions: bindActionCreators(paginationAction, dispatch),
  boundRenderActions: bindActionCreators(renderActions, dispatch),
  boundAlertActions: bindActionCreators(alertActions, dispatch),
  boundConfirmModalActions: bindActionCreators(confirmModalActions, dispatch),
  boundLoadingActions: bindActionCreators(loadingActions, dispatch),
  boundNotificationActions: bindActionCreators(notificationActions, dispatch),
  boundImageEditModalActions: bindActionCreators(imageEditModalActions, dispatch),
  boundBookSettingsModalActions: bindActionCreators(bookSettingsModalActions, dispatch),
  boundPaintedTextModalActions: bindActionCreators(paintedTextModalActions, dispatch),
  boundTextEditModalActions: bindActionCreators(textEditModalActions, dispatch),
  boundImagesActions: bindActionCreators(imagesActions, dispatch),
  boundUploadImagesActions: bindActionCreators(uploadImageActions, dispatch),
  boundSaveTemplateActions: bindActionCreators(saveTemplateModalActions, dispatch),
  boundPropertyModalActions: bindActionCreators(propertyModalActions, dispatch),
  boundTemplateActions: bindActionCreators(templateActions, dispatch),
  boundSnippingActions: bindActionCreators(snippingActions, dispatch),
  boundPageLoadingModalActions: bindActionCreators(pageLoadingModalActions, dispatch),
  boundAlertModalActions: bindActionCreators(alertModalActions, dispatch),
  boundChangeBgColorModalActions: bindActionCreators(changeBgColorModalActions, dispatch),

  // project
  boundProjectActions: bindActionCreators(projectActions, dispatch),
  boundTrackerActions: bindActionCreators(trackerActions, dispatch)
});

/**
 * photoGrouping container component
 */
export const mapPhotoGroupingDispatchToProps = dispatch => ({
});

/**
 * previewModel container component
 */
export const mapPreviewModelDispatchToProps = dispatch => ({
});

/**
 * selectThemes container component
 */
export const mapSelectThemesDispatchToProps = dispatch => ({
});
