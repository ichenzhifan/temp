import React, { Component, PropTypes } from 'react';
import { template, merge } from 'lodash';
import { translate } from "react-translate";

import XHeader from '../../../../common/ZNOComponents/XHeader';
import TitleEditor from '../TitleEditor';
import {
  onClone,
  onHelp,
  onPreview,
  onSave,
  onShare,
  onOrder,
  directToFAQ,
  showQuickStartModal,
  showHowThisWorksModal,
  showContactUsModal
} from './handler';
import './index.scss';

class PageHeader extends Component {
  constructor(props) {
    super(props);

    this.isOrdering = false;

    // 按钮的处理函数.
    this.onClone = () => onClone(this);
    this.onHelp = () => onHelp(this);
    this.onPreview = () => onPreview(this);
    this.onSave = (onSaveSuccessed, onSaveFailed) => onSave(this, onSaveSuccessed, onSaveFailed);
    this.onShare = () => onShare(this);
    this.onOrder = () => onOrder(this);
    this.directToFAQ = () => directToFAQ(this);
  }

  render() {
    const { actions, data, t } = this.props;
    const {
      boundProjectActions,
      boundConfirmModalActions,
      boundTrackerActions,
      boundQuickStartActions,
      boundHowThisWorksActions,
      boundContactUsActions
    } = actions;
    const { project, env } = data;
    const title = project.get('title');
    const projectId = project.get('projectId');
    const projectInfo = project.get('info');
    const userId = env.userInfo.get('id');
    const baseUrls = env.urls && env.urls.toJS();
    const TitleEditorData = { title, projectId, userId, projectInfo };
    const TitleEditorActions = { boundProjectActions, boundTrackerActions };

    return (
      // todo.
      <XHeader
        boundSystemActions={boundConfirmModalActions}
        isProjectEdited={false}
        onSaveProject={this.onSave}
        baseUrls={baseUrls}
      >
        <TitleEditor
          actions={TitleEditorActions}
          data={TitleEditorData}
        />
        <div className="head-nav">
          <span className="nav-item" onClick={this.onClone}>{t('CLONE')}</span>
          <span className="nav-item" onClick={this.onHelp}>{t('HELP')}
            <div className="sub-panel">
              <span>◆</span>
              <a className="sub-item" onClick={boundQuickStartActions.showQuickStartModal}>{t('QUICK_START')}</a>
              <a className="sub-item" onClick={boundHowThisWorksActions.showHowThisWorksModal}>{t('HOW_THIS_WORKS')}</a>
              <a className="sub-item" onClick={this.directToFAQ}>{t('FAQ')}</a>
              <a className="sub-item" onClick={boundContactUsActions.showContactUsModal}>{t('CONTACT_US')}</a>
            </div>
          </span>
          <span className="nav-item" onClick={this.onPreview}>{t('PREVIEW')}</span>
          <span className="nav-item" onClick={this.onSave.bind(this, null)}>{t('SAVE')}</span>
          <span className="nav-item" onClick={this.onShare}>{t('SHARE')}</span>
          <span className="nav-item" onClick={this.onOrder}>{t('ORDER')}</span>
        </div>
      </XHeader>
    );
  }
}

PageHeader.propTypes = {};

// 要导出的一个translate模块.
// - 第一个括号里的参数对应的是资源文件中定义的.
// - 第一个括号里的参数对应的是你要导出的组件名.
export default translate('PageHeader')(PageHeader);
