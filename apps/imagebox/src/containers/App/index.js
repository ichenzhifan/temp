import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { set, get, isEqual, merge, isUndefined } from 'lodash';

import qs from 'qs';

// 导入用于本地化的组件
import { TranslatorProvider } from 'react-translate';

import 'normalize.css';
import './index.scss';

import * as specActions from '../../actions/specActions';
import * as projectActions from '../../actions/projectActions';
import * as envActions from '../../actions/envActions';
import * as loginActions from '../../actions/loginActions';
import * as uploadedImagesActions from '../../actions/imagesActions';
import * as systemActions from '../../actions/systemActions';
import * as priceActions from '../../actions/priceActions';
import * as workspaceActions from '../../actions/workspaceActions';
import { spreadTypes } from '../../contants/strings';

import MainContainer from '../../components/MainContainer';
import PageHeader from '../../components/PageHeader';
import SideBar from '../../components/SideBar';
import WorkSpace from '../../components/WorkSpace';
import UploadModal from '../../components/UploadModal';
import OptionsModal from '../../components/OptionsModal';
import XLoginModal from '../../../../common/ZNOComponents/XLoginModal';

import PreviewModel from '../../components/PreviewModal';

import ItemPrice from '../../components/ItemPrice';
import TextEditor from '../../components/TextEditor';
import Loading from '../../components/Loading';


class App extends Component {
  constructor(props) {
    super(props);

    const queryStringObj = qs.parse(window.location.search.substr(1));
    const hasPreview = Boolean(queryStringObj.isPreview === 'true');
    const mainProjectUid = queryStringObj.mainProjectUid;
    const encImgId = queryStringObj.encImageId;
    // 定义一些初始化值.
    this.state = {
      modalSwitches: {
        // options设置弹框
        options: false,
        // upload 弹框
        upload: false,
        // 登录弹框
        login: false,

        optionsModalShow: false,
        // 预览弹框
        preview: false,

        // texteditor弹框
        texteditorShow: false
      },

      spreads: [],

      textOptions: null,

      // 标记是否为preview模式.
      hasPreview,
      // 主工程Uid，用来获取Project图片列表
      mainProjectUid,
      // 主工程图片ID
      encImgId
    };

    this.onSaveProject = this.onSaveProject.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { spreads, currentSpread, boundWorkspaceActions } = nextProps;
    if (spreads && !isEqual(this.state.spreads, spreads)) {
      const newSpreads = spreads.map((s) => {
        return merge({}, s, {
          width: s.w,
          height: s.h,
          bgColor: '#f6f6f6'
        });
      });

      this.setState({
        spreads: newSpreads,
        currentSpread
      });
    }

    if (this.state.hasPreview && !this.props.isProjectLoadCompleted && nextProps.isProjectLoadCompleted) {
      boundWorkspaceActions.takeWorkspaceToPreview(true);
    }
  }

  componentWillMount() {
    // 如果为preview模式, 就直接打开预览modal.
    if (this.state.hasPreview) {
      this.toggleModal('preview', true);
    }
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      return 'Unsaved changes(If any) will be discarded. Are you sure to exit?';
    };
  }

  /**
   * 显示或关闭modal
   * @param {string} type 待关闭的modal在state中key的值(this.state.modalSwitches).
   * @param {bool} status true/false, modal是显示还是关闭
   */
  toggleModal(type, status) {
    let state = set(this.state, `modalSwitches.${type}`, status);
    this.setState(state);
  }

  toggleNewAdded(status) {
    let state = set(this.state, 'textOptions.newAdded', status);
    this.setState(state);
  }

  handleLogin() {
    // 隐藏login弹框
    this.toggleModal.bind(this, 'login', false);
  }

  addText() {
    this.toggleModal('texteditorShow', true);
    this.setState({
      textOptions: null
    });
  }

  editText(options) {
    this.toggleModal('texteditorShow', true);
    this.setState({
      textOptions: options
    });
  }

  onSaveProject(onSaveSuccessed) {
    const {
      boundProjectActions,
      boundSystemActions,
      projectId,
      userId,
      setting,
      spreadArray,
      imageArray,
      createdDate,
      coverThumbnail
    } = this.props;

    const { mainProjectUid } = this.state;
    return boundProjectActions.saveProject(
      projectId === -1 ? null : projectId,
      userId,
      setting,
      spreadArray,
      imageArray,
      createdDate,
      coverThumbnail,
      mainProjectUid
    ).then((res) => {
      const isRequestSuccess = (get(res, 'resultData.state') === 'success');
      if (!isRequestSuccess) {
        const errorCode = +get(res, 'resultData.code');

        switch (errorCode) {
          case 201:
          case 202: {
            boundSystemActions.showConfirm({
              confirmMessage: 'Your current project was already ordered ' +
              'or added to cart. You need to create a new project ' +
              'to make additional changes.',
              onOkClick: () => {
                boundSystemActions.hideConfirm();
              },
              okButtonText: 'OK'
            });
            break;
          }
          default:
            boundSystemActions.showNotify('Saving project failed!');
            break;
        }
      } else {
        // 项目保存成功时，若url参数中没有initGuid
        // 将url参数进行替换
        const initGuid = get(res, 'resultData.project.guid');

        if (projectId === -1 && initGuid) {
          window.history.replaceState({}, 'ImageBox', `?${qs.stringify({
            initGuid,
            webClientId: 1
          })}`);
        }

        if (!isUndefined(onSaveSuccessed)) {
          onSaveSuccessed();
        }
      }
    });
  }

  // get orig image detail
  getImageDetail(imgId) {
    const { imageArray } = this.props;
    const currentImg = imageArray.filter((image) => {
      return image.id === imgId;
    });
    return currentImg ? currentImg[0] : {};
  }

  onPreviewHandle() {
    const { boundWorkspaceActions } = this.props;
    boundWorkspaceActions.takeWorkspaceToPreview(true);
    this.toggleModal('preview', true);
  }

  onClosedPreview() {
    const { boundWorkspaceActions } = this.props;
    boundWorkspaceActions.takeWorkspaceToPreview(false);
    this.toggleModal('preview', false);
  }

  render() {
    const {
      translations,
      boundSpecActions,
      boundProjectActions,
      boundLoginActions,
      boundEnvActions,
      boundSystemActions,
      boundNotifyActions,
      boundUploadedImagesActions,
      boundPriceActions,
      boundWorkspaceActions,

      projectId,
      optionMap,
      setting,
      userId,
      albumId,
      spreadArray,
      imageArray,
      imageUsedCountMap,
      isProjectLoadCompleted,
      isProjectEdited,
      encProjectIdString,

      uploadingImages,
      price,

      notifyData,
      confirmData,
      loadingData,
      imageEditModalData,
      currentSpread,
      operationPanel,
      inPreviewWorkspace,
      allSpreads,
      baseUrls,

      ratio,
      containerBaseSize
    } = this.props;

    const { hasPreview, mainProjectUid, encImgId } = this.state;

    // 获取当前的spread的type, 看看是innerPage还是cover page.
    const spreadType = get(currentSpread, 'spreadOptions.type');
    const spreadTypeText = !spreadType ? '[ERROR]' : (spreadType === spreadTypes.innerPage ? 'Inner' : 'Cover');

    return (
      <TranslatorProvider translations={translations}>
        <MainContainer
          className="app"
          boundSpecActions={boundSpecActions}
          boundProjectActions={boundProjectActions}
          boundEnvActions={boundEnvActions}
          boundSystemActions={boundSystemActions}
          boundPriceActions={boundPriceActions}
          imageEditModalData={imageEditModalData}
          projectId={projectId}
          userId={userId}
          setting={setting}
          baseUrls={baseUrls}
          onSaveProject={this.onSaveProject}
          confirmData={confirmData}
          notifyData={notifyData}
          isProjectLoadCompleted={isProjectLoadCompleted}
          encProjectIdString={encProjectIdString}
          mainProjectUid={mainProjectUid}
          encImgId={encImgId}
        >
          <PageHeader
            showOptionsModal={this.toggleModal.bind(this, 'optionsModalShow', true)}
            onLoginHandle={this.toggleModal.bind(this, 'login', true)}
            onPreviewHandle={this.onPreviewHandle.bind(this)}
            onSaveProject={this.onSaveProject}
            setting={setting}
            typeText={spreadTypeText}
            baseUrls={baseUrls}
            projectId={projectId}
            boundSystemActions={boundSystemActions}
            isProjectEdited={isProjectEdited}
          />

          {
            Object.keys(price).length
              ? <ItemPrice price={price}/>
              : null
          }
          <SideBar
            boundUploadedImagesActions={boundUploadedImagesActions}
            boundProjectActions={boundProjectActions}
            boundWorkspaceActions={boundWorkspaceActions}
            toggleModal={this.toggleModal.bind(this)}
            imageArray={imageArray}
            imageUsedCountMap={imageUsedCountMap}
            baseUrls={baseUrls}
            currentSpread={currentSpread}
          />
          <WorkSpace
            boundSystemActions={boundSystemActions}
            boundProjectActions={boundProjectActions}
            boundWorkspaceActions={boundWorkspaceActions}
            setting={setting}
            spreads={this.state.spreads}
            currentSpread={currentSpread}
            baseUrls={baseUrls}
            loadingData={loadingData}
            imageArray={imageArray}
            operationPanel={operationPanel}
            boundUploadedImagesActions={boundUploadedImagesActions}
            addText={this.addText.bind(this)}
            editText={this.editText.bind(this)}
            toggleModal={this.toggleModal.bind(this)}
            getImageDetail={this.getImageDetail.bind(this)}
            ratio={ratio}
          >
            {/* 显示弹窗 */}
            {/*<input*/}
            {/*type="button"*/}
            {/*className="cursor-p"*/}
            {/*value="显示弹窗"*/}
            {/*onClick={this.toggleModal.bind(this, 'options', true)}*/}
            {/*/>*/}
          </WorkSpace>

          <UploadModal
            opened={this.state.modalSwitches.upload}
            uploadingImages={uploadingImages}
            boundUploadedImagesActions={boundUploadedImagesActions}
            boundWorkspaceActions={boundWorkspaceActions}
            currentSpread={currentSpread}
            toggleModal={this.toggleModal.bind(this)}
          />

          <XLoginModal
            loginActions={boundLoginActions}
            onClosed={this.toggleModal.bind(this, 'login', false)}
            opened={this.state.modalSwitches.login}
          />

          <PreviewModel
            onClosed={this.onClosedPreview.bind(this)}
            opened={this.state.modalSwitches.preview}
            spreads={this.state.spreads}
            allSpreads={allSpreads}
            currentSpread={currentSpread}
            imageArray={imageArray}
            inPreviewWorkspace={inPreviewWorkspace}
            hasPreview={hasPreview}
            setting={setting}
            baseUrls={baseUrls}
            ratio={ratio}
          />


          {/*header 中点击 options 的配置修改弹框*/}
          <OptionsModal
            onClosed={ this.toggleModal.bind(this, "optionsModalShow", false) }
            opened={ this.state.modalSwitches.optionsModalShow }
            optionMap={optionMap}
            setting={setting}
            userId={userId}
            projectId={projectId}
            boundEnvActions={boundEnvActions}
            boundProjectActions={boundProjectActions}
          />
          <TextEditor opened={this.state.modalSwitches.texteditorShow}
                      textOptions={this.state.textOptions}
                      baseUrls={baseUrls}
                      onClosed={this.toggleModal.bind(this, "texteditorShow", false)}
                      currentSpread={currentSpread}
                      ratio={ratio}
                      containerBaseSize={containerBaseSize}
                      boundProjectActions={boundProjectActions}/>

        </MainContainer>
      </TranslatorProvider>
    );
  }
}

// 包装 component ，注入 dispatch 和 state 到其默认的 connect(select)(App) 中；
const mapStateToProps = state => ({
  optionMap: get(state, 'project.availableOptionMap'),
  setting: get(state, 'project.setting'),
  spreadArray: get(state, 'project.spreadArray'),
  imageArray: get(state, 'project.imageArray'),
  projectId: get(state, 'project.projectId'),
  createdDate: get(state, 'project.createdDate'),
  coverThumbnail: get(state, 'project.coverThumbnail'),
  encProjectIdString: get(state, 'project.encProjectIdString'),
  userId: get(state, 'system.env.userInfo.id'),
  albumId: get(state, 'system.env.albumId'),

  // 标识图片的使用次数.
  imageUsedCountMap: get(state, 'project.imageUsedCountMap'),

  // project spreads.
  spreads: get(state, 'project.spreadArray'),

  // 当前workspace上活动的spread.
  currentSpread: get(state, 'system.workspace.currentSpread'),

  // 当前workspace上活动的spread.
  allSpreads: get(state, 'system.workspace.allSpreads'),

  // 显示或隐藏workspace上的操作面板.
  operationPanel: get(state, 'system.workspace.operationPanel'),

  // 标记当前的workspace是否处于预览状态.
  inPreviewWorkspace: get(state, 'system.workspace.inPreviewWorkspace'),

  uploadingImages: state.system.images.uploading,
  price: state.system.price,

  baseUrls: get(state, 'system.env.urls'),
  notifyData: state.system.notifyData,
  confirmData: state.system.confirmData,
  loadingData: state.system.loadingData,
  imageEditModalData: get(state, 'system.imageEditModalData'),
  ratio: get(state, 'system.workspace.currentSpread.rate'),
  isProjectLoadCompleted: get(state, 'project.isProjectLoadCompleted'),
  isProjectEdited: get(state, 'project.isProjectEdited'),
  containerBaseSize: get(state, 'system.workspace.currentSpread.containerSizeBaseOnScreen')
});

const mapDispatchToProps = dispatch => ({
  boundSpecActions: bindActionCreators(specActions, dispatch),
  boundProjectActions: bindActionCreators(projectActions, dispatch),
  boundLoginActions: bindActionCreators(loginActions, dispatch),
  boundEnvActions: bindActionCreators(envActions, dispatch),
  boundUploadedImagesActions: bindActionCreators(uploadedImagesActions, dispatch),
  boundSystemActions: bindActionCreators(systemActions, dispatch),
  boundPriceActions: bindActionCreators(priceActions, dispatch),
  boundWorkspaceActions: bindActionCreators(workspaceActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
