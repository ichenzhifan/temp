import React, { Component } from 'react';
import NotificationSystem from 'react-notification-system';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { TranslatorProvider } from 'react-translate';

import '../../../../common/utils/extension';
import '../../../../common/utils/imagePool';
// import '../../../../common/utils/setDragImage';
import { addEventListener, removeEventListener } from '../../../../common/utils/events';
import { allOptionMap } from '../../reducers/project/projectReducer';

import 'normalize.css';
import './index.scss';

// 导入字体
import '../../../../common/fontFamily/font1.css';
import '../../../../common/fontFamily/font2.css';

// 导入组件
import PageHeader from '../../components/PageHeader';
import ViewTabs from '../../components/ViewTabs';
import SideBar from '../../components/SideBar';
import ItemPrice from '../../components/ItemPrice';
import Modals from '../Modals';

import XHeartBeat from '../../../../common/ZNOComponents/XHeartBeat';

// 导入selector
import { mapAppDispatchToProps } from '../../selector/mapDispatch';
import { mapStateToProps } from '../../selector/mapState/app';

// 打入handle
import { doPrepare, toggleModal, doUserThings, onSaveProject, onCloneProject, checkIsEditPage } from './handler/app';
import * as computedHandler from './handler/computed';

import notificationStyles from './notificationStyles';


if (__DEVELOPMENT__) {
  require('react-addons-perf');
}

class App extends Component {
  constructor(props) {
    const { boundUploadImagesActions } = props;
    super(props);

    // 初始化工作.
    this.doPrepare = () => doPrepare(this);
    this.toggleModal = (type, status) => toggleModal(boundUploadImagesActions, type, status);
    this.onSaveProject = (onSaveSuccessed, onSaveFailed) => onSaveProject(this, onSaveSuccessed, onSaveFailed);
    this.onCloneProject = (newTitle, onCloneSuccessed) => onCloneProject(this, newTitle, onCloneSuccessed);

    // window resize时的处理函数.
    this.onresizingHandler = () => computedHandler.resizingHandler(this);

    this.getCoverImage = (props, done) => computedHandler.getCoverImage(this, props, done);
    this.getInnerImage = (props, done) => computedHandler.getInnerImage(this, props, done);

    // 计算ratio的方法.
    this.recomputedScreenRatios = props => computedHandler.recomputedScreenRatios(props);
    this.recomputedPreviewRatios = props => computedHandler.recomputedPreviewRatios(props);
    this.recomputedWorkspaceRatio = props => computedHandler.recomputedWorkspaceRatio(props);
    this.recomputedRenderRatios = props => computedHandler.recomputedRenderRatios(props);

    // 切换页面.
    this.switchPageTo = (props, pageIndex) => switchPageTo(this, props, pageIndex);

    // 显示preview
    this.showPreviewModal = (props) => {
      const { boundPreviewModalActions } = props || this.props;
      boundPreviewModalActions.show();
    };
  }

  /**
   * 发送ajax请求获取初始化数据.
   */
  componentWillMount() {
    this.doPrepare();
  }

  componentDidUpdate(prevProps) {
    const {
      project,
      env,
      boundTemplateActions,
      boundPriceActions
    } = this.props;

    const qs = get(env, 'qs');
    const userInfo = get(env, 'userInfo');

    const customerId = userInfo ? userInfo.get('id') : -1;
    const isPreview = qs ? qs.get('isPreview') : false;

    const oldProject = prevProps.project;
    const newProject = project;

    const oldSetting = oldProject.get('setting');
    const newSetting = newProject.get('setting');

    const oldPaper = oldSetting.get('paper');
    const newPaper = newSetting.get('paper');

    const oldSize = oldSetting.get('size');
    const newSize = newSetting.get('size');

    const oldCover = oldSetting.get('cover');
    const newCover = newSetting.get('cover');

    const oldProduct = oldSetting.get('product');
    const newProduct = newSetting.get('product');

    const oldPaperThickness = oldSetting.get('paperThickness');
    const newPaperThickness = newSetting.get('paperThickness');

    if ((oldPaper !== newPaper ||
          oldPaperThickness !== newPaperThickness ||
          oldCover !== newCover ||
          oldProduct !== newProduct ||
          oldSize !== newSize) && !isPreview) {
      boundPriceActions.getProductPrice(newSetting.toJS());
    }

    if ((oldSize !== newSize || oldCover !== newCover || oldProduct !== newProduct) && customerId !== -1) {
      boundTemplateActions.getTemplateList(customerId, newSize, newCover, newProduct);
    }

    const projectId = newProject.get('projectId');
    const oldIsProjectLoadCompleted = oldProject.get('isProjectLoadCompleted');
    const newIsProjectLoadCompleted = newProject.get('isProjectLoadCompleted');
    if (projectId === -1 && !isPreview &&
      oldIsProjectLoadCompleted !== newIsProjectLoadCompleted) {
      // 项目加载完成后，保存项目，不弹出成功提示
      this.onSaveProject(() => {});
    }
  }

  componentWillReceiveProps(nextProps) {
    doUserThings(this, nextProps);

    const oldSize = get(this.props, 'settings.spec.size');
    const newSize = get(nextProps, 'settings.spec.size');
    // cover类型更改.
    const oldCoverType = get(this.props, 'settings.spec.cover');
    const newCoverType = get(nextProps, 'settings.spec.cover');

    if (oldCoverType !== newCoverType) {
      this.getCoverImage(nextProps);
      this.getInnerImage(nextProps);
    }

    // 初始化ratio,
    const oldWidth = get(this.props, 'size.coverSpreadSize.width');
    const newWidth = get(nextProps, 'size.coverSpreadSize.width');
    const oldProductSize = get(this.props, 'settings.spec.size');
    const newProductSize = get(nextProps, 'settings.spec.size');
    if ((newWidth && oldWidth !== newWidth) ||
        (oldProductSize && oldProductSize !== newProductSize)) {
      this.recomputedScreenRatios(nextProps);
      this.recomputedPreviewRatios(nextProps);
      this.recomputedWorkspaceRatio(nextProps);
    }

    // workspace size changed.
    const oldCoverWidth = get(this.props, 'size.renderCoverSize.width');
    const newCoverWidth = get(nextProps, 'size.renderCoverSize.width');
    const oldSpainWidth = get(this.props, 'size.renderSpainWidth');
    const newSpainWidth = get(nextProps, 'size.renderSpainWidth');
    if ((newCoverWidth && oldCoverWidth !== newCoverWidth) ||
        (newSpainWidth && oldSpainWidth !== newSpainWidth)) {
      this.getCoverImage(nextProps);
      this.getInnerImage(nextProps);
    }

    // 如果渲染的效果图的素材发生变化, 就重新计算渲染效果图的缩放比例.
    const oldCoverRenderWidth = this.props.materials.getIn(['cover', 'size', 'width']);
    const newCoverRenderWidth = nextProps.materials.getIn(['cover', 'size', 'width']);
    const oldInnerRenderWidth = this.props.materials.getIn(['inner', 'size', 'width']);
    const newInnerRenderWidth = nextProps.materials.getIn(['inner', 'size', 'width']);
    if (oldCoverRenderWidth !== newCoverRenderWidth || oldInnerRenderWidth !== newInnerRenderWidth) {
      this.recomputedRenderRatios(nextProps);
    }

    // 计算渲染效果图白边的缩放比
    // 计算渲染效果图sheet非内容区(sheet的原始大小减去出血)
    const oldRenderCoverWidth = get(this.props, 'size.renderCoverSize.width');
    const newRenderCoverWidth = get(nextProps, 'size.renderCoverSize.width');
    if (!oldRenderCoverWidth && newRenderCoverWidth && oldRenderCoverWidth !== newRenderCoverWidth) {
      this.recomputedRenderRatios(nextProps);
    }

    // 判断是否为预览模式, 如果是就打开预览modal.
    const oldQs = get(this.props, 'env.qs');
    const newQs = get(nextProps, 'env.qs');
    if (oldQs.get('isPreview') !== newQs.get('isPreview') && newQs.get('isPreview')) {
      this.showPreviewModal(nextProps);
    }
    // 判断是否是匿名分享的连接，是的话就 更改页面的 title；格式： size cover Preview
    const oldIsProjectLoadCompleted = this.props.project.get('isProjectLoadCompleted');
    const newIsProjectLoadCompleted = nextProps.project.get('isProjectLoadCompleted');
    if (/share.asovx.com/.test(window.location.href)
      && (oldIsProjectLoadCompleted !== newIsProjectLoadCompleted || oldCoverType !== newCoverType || oldSize !== newSize)
      && newCoverType && newSize && newIsProjectLoadCompleted
    ) {
      const coverMap = allOptionMap && allOptionMap.cover;
      const coverLabel = (coverMap instanceof Array) && coverMap.find(item => item.id === newCoverType).name;
      document.querySelector('title').innerHTML = `${newSize} ${coverLabel} Preview`;
    }
  }

  componentDidMount() {
    // 添加resizing处理函数, 用于改变workspace的ratio
    addEventListener(window, 'resize', this.onresizingHandler);

    if (!(/isPreview/.test(window.location.href))) {
      window.onbeforeunload = () => 'Unsaved changes(If any) will be discarded. Are you sure to exit?';
    }

    const { boundNotificationActions } = this.props;
    boundNotificationActions.initNotificationSystem(this.refs.notificationSystem);
  }

  componentWillUnmount() {
    // 移除resizing的处理函数.
    removeEventListener(window, 'resize', this.onresizingHandler);
  }

  render() {
    const {
      translations,
      sidebar,
      uploadingImages,
      uploadedImages,
      upload,
      price,
      template,
      stickerList,
      env,
      autoAddPhotoToCanvas,
      project,
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
      fontList,
      ratio,
      size,
      pagination,
      paginationSpread,
      spec,
      materials,
      variables,
      settings,
      parameters,
      snipping,
      allImages,

      // preview
      previewRatios,
      previewSize,
      previewPosition,
      allSheets,
      allElements,

      // used count
      imageUsedCountMap,
      decorationUsedCountMap,

      // actions
      boundSidebarActions,
      boundImagesActions,
      boundUploadImagesActions,
      boundBookSettingsModalActions,
      boundPaintedTextModalActions,
      boundImageEditModalActions,
      boundTextEditModalActions,
      boundProjectActions,
      boundTemplateActions,
      boundEnvActions,
      boundStickerActions,
      boundConfirmModalActions,
      boundHowThisWorksActions,
      boundQuickStartActions,
      boundContactUsActions,
      boundShareProjectActions,
      boundSaveTemplateActions,
      boundCloneModalActions,
      boundPropertyModalActions,
      boundNotificationActions,
      boundAlertModalActions,
      boundPreviewModalActions,
      boundPageLoadingModalActions,
      boundChangeBgColorModalActions,
      boundApprovalPageActions,
      boundPaginationActions,
      boundTrackerActions,
      boundSnippingActions
    } = this.props;

    const toggleModal = this.toggleModal;
    const baseUrls = env.urls;
    const setting = project.get('setting');

    // 封装actions方法到一个对象, 以减少组件属性的传递.
    // 顶部导航方法与数据
    const pageHeaderActions = {
      boundProjectActions,
      boundHowThisWorksActions,
      boundQuickStartActions,
      boundContactUsActions,
      boundShareProjectActions,
      boundCloneModalActions,
      boundConfirmModalActions,
      boundNotificationActions,
      boundAlertModalActions,
      boundPreviewModalActions,
      boundPaginationActions,
      boundTrackerActions,
      boundApprovalPageActions,
      onSaveProject: this.onSaveProject,
      onCloneProject: this.onCloneProject
    };
    const pageHeaderData = {
      env,
      project,
      spec
    };

    // 左侧导航方法与数据
    const sideBarActions = { boundSidebarActions, boundImagesActions, boundProjectActions, boundTemplateActions, boundStickerActions, toggleModal, boundTrackerActions };
    const sideBarData = { sidebar, paginationSpread, uploadedImages, baseUrls, template, stickerList, setting, imageUsedCountMap, pagination, ratio, decorationUsedCountMap };

    // 校正一下ratios对象中的coverWorkspace的值.
    // 为了保持封面和内页的渲染高度相同, 在getRenderSize中对封面的各个size做了校正. 但是coverWorkspace
    // 还是老的值. 这里我们再次把它校验到正确的值.
    if (previewSize.coverSpreadSize.width &&
      previewRatios.coverWorkspace &&
      previewSize.coverSpreadSize.width * previewRatios.coverWorkspace !== previewSize.coverWorkspaceSize.width) {
      // 重新计算preview的coverWorkspace.
      previewRatios.coverWorkspace = previewSize.coverWorkspaceSize.width / previewSize.coverSpreadSize.width;

      if (pagination.get('sheetIndex') === 0) {
        previewRatios.workspace = previewRatios.coverWorkspace;
      }
    }

    // 各种弹窗方法与数据
    const modalsActions = {
      boundImagesActions,
      boundBookSettingsModalActions,
      boundPaintedTextModalActions,
      boundProjectActions,
      boundImageEditModalActions,
      boundTextEditModalActions,
      boundConfirmModalActions,
      boundHowThisWorksActions,
      boundQuickStartActions,
      boundContactUsActions,
      boundShareProjectActions,
      boundSaveTemplateActions,
      boundCloneModalActions,
      boundTemplateActions,
      toggleModal,
      boundPropertyModalActions,
      boundNotificationActions,
      boundAlertModalActions,
      boundPreviewModalActions,
      boundPageLoadingModalActions,
      boundChangeBgColorModalActions,
      boundApprovalPageActions,
      onSaveProject: this.onSaveProject,
      onCloneProject: this.onCloneProject,
      boundEnvActions,
      boundTrackerActions,
      boundSnippingActions
    };

    const currentPage = paginationSpread.get('page');

    const modalsData = {
      spec,
      env,
      autoAddPhotoToCanvas,
      project,
      upload,
      uploadingImages,
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
      alertModal,
      cloneModal,
      previewModal,
      pageLoadingModal,
      changeBgColorModal,
      approvalPage,
      fontList,
      baseUrls,
      currentPage,
      pagination,
      paginationSpread,
      ratio: ratio.workspace,
      bookSetting: project.get('bookSetting'),
      elementArray: project.get('elementArray'),

      materials,
      variables,
      settings,
      parameters,
      snipping,

      // preview
      previewRatios,
      previewSize,
      previewPosition,
      allSheets,
      allImages
    };

    const viewTabsActions = { boundTrackerActions };

    // Item Price 方法与数据
    const itemPriceActions = { boundTrackerActions };
    const itemPriceData = { price, parameters, allSheets, allElements, settings };

    const userId = env.userInfo.get('id');
    // 根据当前的 url 判断是否为 分享预览状态。
    const isPreview = (/isPreview/.test(window.location.href));
    const isEditPage = checkIsEditPage();

    return (
      <TranslatorProvider translations={translations}>
        <div className="app">
          {
            userId === -1 || isPreview
              ? null
              : (
                <div className="main-modules">
                  {/* 页面顶部导航组件 */}
                  <PageHeader actions={pageHeaderActions} data={pageHeaderData} />

                  {/* 产品价格显示 */}
                  <ItemPrice actions={itemPriceActions} data={itemPriceData} />

                  {/* 左侧的导航组件 */}
                  <ViewTabs actions={viewTabsActions} />

                  {/* 左侧的导航组件 */}
                  {
                    isEditPage
                    ? (
                      <SideBar actions={sideBarActions} data={sideBarData} />
                    )
                    : null
                  }
                </div>
              )
          }

          {
            !isPreview
            ? <XHeartBeat userId={userId} keepAlive={boundEnvActions.keepAlive} />
            : null
          }

          {/* 这是一个容器, 放置所有的弹框组件, 包括(modal, popover, notify等) */}
          <Modals actions={modalsActions} data={modalsData} />

          {/* notification */}
          <NotificationSystem ref="notificationSystem" style={notificationStyles} />

        </div>
      </TranslatorProvider>
    );
  }
}

export default connect(mapStateToProps, mapAppDispatchToProps)(App);
