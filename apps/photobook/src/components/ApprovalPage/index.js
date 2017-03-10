import React, { Component, PropTypes } from 'react';
import { merge } from 'lodash';
import ApprovalPageHeader from '../ApprovalPageHeader';
import ApprovalPageSideBar from '../ApprovalPageSideBar';
import ApprovalPageActionBar from '../ApprovalPageActionBar';
import PreviewModal from '../PreviewModal';

import * as handler from './handler';

import './index.scss';

class ApprovalPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sheetIndex: 0
    };

    this.changeStateSheetIndex = index => handler.changeStateSheetIndex(this, index);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.props.data.isShown !== nextProps.data.isShown ||
          this.state.sheetIndex !== nextState.sheetIndex);
  }

  render() {
    const { actions, data } = this.props;
    const {
      env,
      project,
      isShown,
      reviewResult,
      previewModalData
    } = data;
    const {
      deleteElement,
      onSaveProject,
      closeApprovalPage,
      boundTrackerActions,
      previewModalActions,
      boundConfirmModalActions,
      boundCloneModalActions,
      boundNotificationActions
    } = actions;
    const scopePreviewModalData = merge({}, previewModalData, { isShown: true, isInPreviewModel: true });

    const approvalPageHeaderActions = {
      onSaveProject,
      closeApprovalPage,
      boundTrackerActions,
      boundCloneModalActions,
      boundConfirmModalActions,
      boundNotificationActions
    };
    const approvalPageHeaderData = {
      env,
      project,
      reviewResult
    };

    const approvalPageActionBarActions = {
      deleteElement,
      changeStateSheetIndex: this.changeStateSheetIndex
    };
    const approvalPageActionBarData = {
      sheetIndex: this.state.sheetIndex,
      errorItems: reviewResult && reviewResult.get('errorItems')
    };

    return (
      <div>
        {
          isShown
          ? (
            <div className="approval-page">
              <ApprovalPageHeader
                actions={approvalPageHeaderActions}
                data={approvalPageHeaderData}
              />
              <div className="approval-preview">
                <PreviewModal
                  actions={previewModalActions}
                  data={scopePreviewModalData}
                />
              </div>
              <div className="approval-actionbar">
                <ApprovalPageActionBar
                  actions={approvalPageActionBarActions}
                  data={approvalPageActionBarData}
                />
              </div>
              <div className="approval-right-content">
                <ApprovalPageSideBar
                  setting={project.get('setting')}
                />
              </div>
            </div>
          )
          : null
        }
      </div>
    );
  }
}

ApprovalPage.propTypes = {
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

export default ApprovalPage;
