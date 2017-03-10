import React, { Component, PropTypes } from 'react';
import { isEqual } from 'lodash';
import ConfirmModal from '../../components/ConfirmModal';
import XImageEditModal from '../../../../common/ZNOComponents/XImageEditModal';
import XNotify from '../../../../common/ZNOComponents/XNotify';
import XHeartBeat from '../../../../common/ZNOComponents/XHeartBeat';

class MainContainer extends Component {

  constructor(props) {
    super(props);

    this.onImageEditModalCanceled = this.onImageEditModalCanceled.bind(this);
  }

  componentWillMount() {
    const {
      boundSpecActions,
      boundEnvActions,
      boundProjectActions,
      projectId,
      encProjectIdString
    } = this.props;

    // 获取环境变量, 如各种接口的根路径
    boundEnvActions.getEnv().then(() => {
      if (encProjectIdString) {
        boundSpecActions.getSpecData();
        boundProjectActions.getPreviewProjectData(encProjectIdString);
      } else if (projectId !== -1) {
        boundSpecActions.getSpecData();
        boundEnvActions.getUserInfo();
      } else {
        // 当projectId不存在，spec数据加载完毕，用户信息加载完毕时
        // 将project数据标记为已完成
        Promise.all([
          boundSpecActions.getSpecData(),
          boundEnvActions.getUserInfo()
        ]).then(() => {
          boundProjectActions.projectLoadCompleted();
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const oldUserId = this.props.userId;
    const newUserId = nextProps.userId;

    const {
      boundProjectActions,
      boundSystemActions,
      boundPriceActions,
      boundEnvActions,
      projectId,
      setting,
      baseUrls
    } = this.props;
    if (oldUserId !== newUserId) {
      if (!newUserId) {
        boundSystemActions.showConfirm({
          confirmMessage: 'Please log in!',
          okButtonText: 'Done',
          cancelButtonText: 'Cancel',
          onOkClick: () => {
            window.location.href = baseUrls.baseUrl;
          }
        });
        return;
      }

      if (projectId !== -1) {
        boundProjectActions.getProjectData(newUserId, projectId).then(() => {
          boundEnvActions.getProjectTitle(newUserId, projectId).then((res) => {
            if (res.respCode === '200') {
              boundProjectActions.changeProjectSetting({ title: res.projectName });
            }
            boundProjectActions.projectLoadCompleted();
          });
        });
      } else {
        if (setting.title) {
          boundEnvActions.addAlbum(newUserId, setting.title).then(() => {
            boundEnvActions.getAlbumId(newUserId, setting.title);
          });
        }

        boundPriceActions.getProductPrice(setting);
      }
    }

    const oldProjectTitle = this.props.setting.title;
    const newProjectTitle = nextProps.setting.title;
    if (oldProjectTitle !== newProjectTitle) {
      boundEnvActions.getAlbumId(newUserId, newProjectTitle);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      onSaveProject,
      setting,
      userId,
      isProjectLoadCompleted,
      projectId,
      boundPriceActions,
      boundProjectActions,
      mainProjectUid,
      encImgId
    } = this.props;
    // 当project数据加载完毕，并且projectSetting对象改变
    // 或者url后面没有initGuid，并且用户信息获取完毕，并且project数据加载完成时
    // 保存项目信息
    if ((!isEqual(prevProps.setting, setting) && isProjectLoadCompleted) ||
      (projectId === -1 && userId !== -1 &&
      prevProps.isProjectLoadCompleted !== isProjectLoadCompleted)) {
        if(projectId === -1) {
          boundProjectActions.loadMainProjectImages(mainProjectUid, encImgId)
            // 加载完Main Project Images以后保存项目，生成项目guid
            .then(() => onSaveProject())
            // 此时已经有guid，再次保存即可生成切图
            .then(() => onSaveProject())
        } else {
          onSaveProject();
        }
    }

    if (!isEqual(prevProps.setting, setting)) {
      boundPriceActions.getProductPrice(setting);
    }
  }


  onImageEditModalCanceled() {
    const { boundSystemActions } = this.props;
    boundSystemActions.hideImageEditModal();
  }

  render() {
    const {
      children,
      className,
      confirmData,
      notifyData,
      userId,
      imageEditModalData,
      boundSystemActions,
      boundEnvActions
    } = this.props;

    return (
      <div className={className}>
        {children}

        <ConfirmModal
          {...confirmData}
          onModalClose={boundSystemActions.hideConfirm}
        />

        <XNotify
          {...notifyData}
          hideNotify={boundSystemActions.hideNotify}
        />

        <XImageEditModal
          {...imageEditModalData}
          onCancelClick={this.onImageEditModalCanceled.bind(this)}
        />

        <XHeartBeat userId={userId} keepAlive={boundEnvActions.keepAlive} />
      </div>
    );
  }
}

MainContainer.propTypes = {
  children: PropTypes.node.isRequired,
  boundSpecActions: PropTypes.object.isRequired,
  boundProjectActions: PropTypes.object.isRequired,
  boundEnvActions: PropTypes.object.isRequired,
  boundSystemActions: PropTypes.object.isRequired,
  boundPriceActions: PropTypes.object.isRequired,
  projectId: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  setting: PropTypes.object.isRequired,
  onSaveProject: PropTypes.func.isRequired,
  isProjectLoadCompleted: PropTypes.bool.isRequired,
  encProjectIdString: PropTypes.string.isRequired,
  baseUrls: PropTypes.object.isRequired,
  className: PropTypes.string,
  confirmData: PropTypes.object,
  notifyData: PropTypes.object,
  imageEditModalData: PropTypes.object,
  mainProjectUid:PropTypes.string,
  encImgId: PropTypes.string
};


export default MainContainer;
