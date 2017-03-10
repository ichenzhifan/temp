/**
 * 这是一个容器组件, 在应用中所有要用到的弹框(包括: modal, popover, notify)统一的在这里初始化.
 */
import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import { get, merge } from 'lodash';

import ConfirmModal from '../../components/ConfirmModal';
import UploadModal from '../../components/UploadModal';
import BookSettingsModal from '../../components/BookSettingsModal';
import PaintedTextModal from '../../components/PaintedTextModal';
import TextEditModal from '../../components/TextEditModal';
import HowThisWorksModal from '../../components/HowThisWorksModal';
import QuickStartModal from '../../components/QuickStartModal/';
import ContactUsModal from '../../components/ContactUsModal';
import ShareModal from '../../components/ShareModal';
import SaveTemplateModal from '../../components/SaveTemplateModal';
import CloneModal from '../../components/CloneModal';
import XImageEditModal from '../../../../common/ZNOComponents/XImageEditModal';
import PropertyModal from '../../components/PropertyModal';
import AlertModal from '../../components/AlertModal';
import PreviewModal from '../../components/PreviewModal';
import PageLoadingModal from '../../components/PageLoadingModal';
import PageBackgroundModal from '../../components/PageBackgroundModal';
import ApprovalPage from '../../components/ApprovalPage';

import './index.scss';

class Modals extends Component {
  constructor(props) {
    super(props);

    this.closeBookSettingsModal = this.closeBookSettingsModal.bind(this);
    this.closePaintedTextModal = this.closePaintedTextModal.bind(this);
    this.closeImageEditModal = this.closeImageEditModal.bind(this);
    this.closeTextEditModal = this.closeTextEditModal.bind(this);
    this.closeConfirmModalByX = this.closeConfirmModalByX.bind(this);
    this.closePropertyModal = this.closePropertyModal.bind(this);
    this.closePreviewModal = this.closePreviewModal.bind(this);
  }

  closeBookSettingsModal() {
    const { actions } = this.props;
    const { boundBookSettingsModalActions } = actions;
    boundBookSettingsModalActions.hideBookSettingsModal();
  }

  closePaintedTextModal() {
    const { actions } = this.props;
    const { boundPaintedTextModalActions } = actions;
    boundPaintedTextModalActions.hidePaintedTextModal();
  }

  closeImageEditModal() {
    const { actions } = this.props;
    const { boundImageEditModalActions } = actions;
    boundImageEditModalActions.hideImageEditModal();
  }

  closeTextEditModal() {
    const { actions } = this.props;
    const { boundTextEditModalActions } = actions;
    boundTextEditModalActions.hideTextEditModal();
  }

  closeConfirmModalByX() {
    const { actions, data } = this.props;
    const { boundConfirmModalActions } = actions;
    const { confirmModal } = data;

    boundConfirmModalActions.hideConfirm();

    if (confirmModal.get('xCloseFun') && typeof confirmModal.get('xCloseFun') === 'function') {
      confirmModal.get('xCloseFun')();
    }
  }

  closePropertyModal() {
    const { actions } = this.props;
    const { boundPropertyModalActions } = actions;
    boundPropertyModalActions.hidePropertyModal();
  }

  closePreviewModal() {
    const { actions } = this.props;
    const { boundPreviewModalActions } = actions;
    boundPreviewModalActions.hide();
  }

  render() {
    const { data, actions } = this.props;

    const {
      spec,
      env,
      autoAddPhotoToCanvas,
      project,
      uploadingImages,
      upload,
      fontList,
      bookSettingsModal,
      paintedTextModal,
      imageEditModal,
      textEditModal,
      propertyModal,
      confirmModal,
      howThisWorksModal,
      quickStartModal,
      contactUsModal,
      shareProjectModal,
      saveTemplateModal,
      cloneModal,
      alertModal,
      previewModal,
      pageLoadingModal,
      changeBgColorModal,
      approvalPage,
      bookSetting,
      baseUrls,
      ratio,
      pagination,
      currentPage,
      elementArray,
      materials,
      variables,
      settings,
      snipping,
      parameters,
      paginationSpread,
      allImages,
      allSheets,

      // preview
      previewRatios,
      previewSize,
      previewPosition,

      // order page
      orderRatios,
      orderSize,
      orderPosition
    } = data;

    const {
      boundImagesActions,
      toggleModal,
      boundProjectActions,
      boundHowThisWorksActions,
      boundQuickStartActions,
      boundContactUsActions,
      boundShareProjectActions,
      boundSaveTemplateActions,
      boundCloneModalActions,
      boundTemplateActions,
      boundNotificationActions,
      boundAlertModalActions,
      boundPageLoadingModalActions,
      boundChangeBgColorModalActions,
      boundApprovalPageActions,
      boundConfirmModalActions,
      boundSnippingActions,
      onSaveProject,
      onCloneProject,
      boundEnvActions,
      boundTrackerActions
    } = actions;

    const saveProject = () => {
      const { userInfo } = env;
      const specVersion = spec.get('version');
      boundProjectActions.saveProject(
        project, userInfo, specVersion
      ).then((res) => {
        const isRequestSuccess = (get(res, 'status') === 'success');
        if (isRequestSuccess) {
          boundProjectActions.uploadCoverImage();
        }
      });
    };
    const imageEditModalObj = imageEditModal.toJS();

    // PreviewModal
    const previewModalData = {
      isInPreviewModel: get(env, 'qs').get('isPreview'),
      isShown: previewModal.get('isShown'),
      urls: baseUrls.toJS(),
      ratios: previewRatios,
      size: previewSize,
      position: previewPosition,
      materials,
      snipping,
      variables,
      settings,
      project,

      // 总是显示在封面.
      pagination: pagination.merge({sheetIndex: 0}),
      parameters,
      allSheets
    };
    const previewModalActions = {
      boundSnippingActions,
      closePreviewModal: this.closePreviewModal
    };

    // approval page
    const approvalPageActions = {
      onSaveProject,
      boundTrackerActions,
      boundCloneModalActions,
      boundNotificationActions,
      boundConfirmModalActions,
      previewModalActions,
      closeApprovalPage: boundApprovalPageActions.hideApprovalPage,
      deleteElement: boundProjectActions.deleteElement
    };
    const approvalPageModelData = merge({}, previewModalData, {
      ratios: orderRatios,
      size: orderSize,
      position: orderPosition,
    });
    const approvalPageData = {
      env,
      project,
      previewModalData: approvalPageModelData,
      isShown: approvalPage.get('isShown'),
      reviewResult: approvalPage.get('reviewResult')
    };

    const baseUrl = env.urls && env.urls.get('baseUrl');
    const productType = project.getIn(['setting', 'product']);
    const userId = env.userInfo.get('id');
    // 根据当前的 url 判断是否为 分享预览状态。
    const isPreview = (/isPreview/.test(window.location.href));

    // 在分享预览模式下只 render 预览模态窗，只有在正常模式下才render 所有窗口。
    if (userId === -1 || isPreview) {
      return (
        <div className="modals">
          <PreviewModal
            actions={previewModalActions}
            data={previewModalData}
          />
        </div>
      );
    }

    return (
      <div className="modals">
        <UploadModal
          opened={upload.get('isShown')}
          uploadingImages={uploadingImages}
          boundUploadedImagesActions={boundImagesActions}
          boundProjectActions={boundProjectActions}
          toggleModal={toggleModal}
          env={env}
          project={project}
          autoAddPhotoToCanvas={autoAddPhotoToCanvas}
          addTracker={boundTrackerActions.addTracker}
          saveProject={saveProject}
        />

        {
          fontList.length
          ? (
            <div>
              <BookSettingsModal
                baseUrl={baseUrls.get('baseUrl')}
                bookSetting={bookSetting}
                fontList={fontList}
                isShown={bookSettingsModal.get('isShown')}
                closeBookSettingsModal={this.closeBookSettingsModal}
                changeBookSetting={boundProjectActions.changeBookSetting}
                addNotification={boundNotificationActions.addNotification}
              />

              { /* <PaintedTextModal
                baseUrl={baseUrls.get('baseUrl')}
                fontList={fontList}
                isShown={paintedTextModal.get('isShown')}
                initTabIndex={1}
                closePaintedTextModal={this.closePaintedTextModal}
              /> */ }

              <TextEditModal
                ratio={ratio}
                fontList={fontList}
                baseUrl={baseUrls.get('baseUrl')}
                isShown={textEditModal.get('isShown')}
                element={textEditModal.get('element')}
                bookSetting={bookSetting}
                currentPage={currentPage}
                fontBaseUrl={baseUrls.get('productBaseURL')}
                elementArray={elementArray}
                closeTextEditModal={this.closeTextEditModal}
                createElement={boundProjectActions.createElement}
                updateElement={boundProjectActions.updateElement}
              />
            </div>
          )
          : null
        }

        <PropertyModal
          propertyModal={propertyModal.toJS()}
          closePropertyModal={this.closePropertyModal}
          boundProjectActions={boundProjectActions}
          allImages={allImages}
          page={currentPage}
        />

        {
          confirmModal.get('isShown') ? (
            <ConfirmModal
              isShown={true}
              onOkClick={confirmModal.get('onOkClick')}
              confirmTitle={confirmModal.get('confirmTitle')}
              confirmMessage={confirmModal.get('confirmMessage')}
              okButtonText={confirmModal.get('okButtonText')}
              cancelButtonText={confirmModal.get('cancelButtonText')}
              onCancelClick={confirmModal.get('onCancelClick')}
              hideOnOk={confirmModal.get('hideOnOk')}
              closeConfirmModal={boundConfirmModalActions.hideConfirm}
              closeConfirmModalByX={this.closeConfirmModalByX}
            />
          ) : null
        }

        <XImageEditModal
          {...imageEditModalObj}
          onCancelClick={this.closeImageEditModal}
        />

        {
          howThisWorksModal.get('isShown') ? (
            <HowThisWorksModal
              isShown={true}
              closeHowThisWorksModal={boundHowThisWorksActions.hideHowThisWorksModal}
            />
          ) : null
        }

        {
          quickStartModal.get('isShown') ? (
            <QuickStartModal
              isShown={true}
              closeQuickStartModal={boundQuickStartActions.hideQuickStartModal}
            />
          ) : null
        }

        {
          contactUsModal.get('isShown')? (
            <ContactUsModal
              env={env}
              project={project}
              isShown={true}
              boundContactUsActions={boundContactUsActions}
              addNotification={boundNotificationActions.addNotification}
            />
          ) : null
        }

        {
          shareProjectModal.get('isShown') ? (
            <ShareModal
              isShown={true}
              znoUrl={shareProjectModal.get('znoUrl')}
              anonymousUrl={shareProjectModal.get('anonymousUrl')}
              closeShareModal={boundShareProjectActions.hideShareProjectModal}
              getShareUrls={boundShareProjectActions.getShareUrls}
              projectId={project.get('projectId')}
              baseUrl={baseUrl}
              productType={productType}
            />
          ) : null
        }

        {
          cloneModal.get('isShown')? (
            <CloneModal
              env={env}
              userId={userId}
              isShown={true}
              onCloneProject={onCloneProject}
              addAlbum={boundEnvActions.addAlbum}
              checkProjectTitle={boundProjectActions.checkProjectTitle}
              closeCloneModal={boundCloneModalActions.hideCloneModal}
              addTracker={boundTrackerActions.addTracker}
              uploadCoverImage={boundProjectActions.uploadCoverImage}
            />
          ) : null
        }

        {
          alertModal.get('isShown')? (
            <AlertModal
              isShown={true}
              title={alertModal.get('title')}
              onButtonClick={alertModal.get('onButtonClick')}
              message={alertModal.get('message')}
              escapeClose={alertModal.get('escapeClose')}
              isHideIcon={alertModal.get('isHideIcon')}
              closeAlertModal={boundAlertModalActions.hideAlertModal}
            />
          ) : null
        }

        {
          pageLoadingModal.get('isShown') ? (
            <PageLoadingModal
              isShown={true}
              text={pageLoadingModal.get('text')}
            />
          ) : null
        }

        {
          changeBgColorModal.get('isShown')? (
            <PageBackgroundModal
              isShown={true}
              bgColor={changeBgColorModal.get('bgColor')}
              selectedPageId={changeBgColorModal.get('selectedPageId')}
              updatePageInfo={boundProjectActions.changePageBgColor}
              closeModal={boundChangeBgColorModalActions.hideChangeBgColorModal}
            />
          ) : null
        }

        {
          approvalPageData.isShown ? (
            <ApprovalPage
              actions={approvalPageActions}
              data={approvalPageData}
            />
          ) : null
        }

        <PreviewModal
          actions={previewModalActions}
          data={previewModalData}
        />
      </div>
    );
  }
}

Modals.propTypes = {
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default translate('Modals')(Modals);
