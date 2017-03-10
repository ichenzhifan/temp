import React, { Component, PropTypes } from 'react';
import { template, merge } from 'lodash';

import { ORDER, GET_BOX_SPEC } from '../../../src/contants/apiUrl';
import XHeader from '../../../../common/ZNOComponents/XHeader';
import './index.scss';

class PageHeader extends Component {
  constructor(props) {
    super(props);
    this.handleDownload = this.handleDownload.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleDownload() {
    const { setting, baseUrls } = this.props;
    const downloadUrl = template(GET_BOX_SPEC)(merge({}, setting, {
      baseUrl: baseUrls.baseUrl
    }));
    window.open(downloadUrl, '_blank');
  }

  handleSetOption() {
    alert('handleSetOption');
  }

  handlePreview() {
    const { boundSystemActions } = this.props;
    boundSystemActions.showConfirm({
      confirmMessage: 'Your current project was already orderd or added to cart.You need to save your addtional changes into a new project.',
      okButtonText: 'Save as',
      cancelButtonText: 'Cancel',
      onOkClick: () => {
      },
      onCancelClick: () => {
      }
    });
    // alert('handlePreview');
  }

  handleSave() {
    const {
      boundSystemActions,
      onSaveProject,
      projectId
    } = this.props;

    if(!projectId){
      return;
    }

    onSaveProject(() => {
      boundSystemActions.showNotify('Saved successfully!');
    });
  }

  handleOrder() {
    const {
      onSaveProject,
      baseUrls,
      projectId
    } = this.props;

    // 如果project id为空, 就不做任何事情.
    if(!projectId){
      return;
    }

    onSaveProject(() => {
      window.onbeforeunload = null;
      window.location.href = template(ORDER)({
        baseUrl: baseUrls.baseUrl,
        projectId
      });
    });
  }

  render() {
    const {
      boundSystemActions,
      setting,
      onLoginHandle,
      onPreviewHandle,
      showOptionsModal,
      isProjectEdited,
      onSaveProject,
      baseUrls,
      typeText
    } = this.props;

    let projectDescString = '';
    const { product, size } = setting;
    if (product && size) {
      const productName = (product === 'IB' ? 'Image Box' : '');
      const sizeString = size.replace('X', '*');

      projectDescString = `Customize your ${productName} - ${sizeString} - ${typeText}`;
    }

    return (
      <XHeader
        boundSystemActions={boundSystemActions}
        isProjectEdited={isProjectEdited}
        onSaveProject={onSaveProject}
        baseUrls={baseUrls}
      >
        <p className="project-title">
          {projectDescString}
        </p>
        <div className="head-nav">
          <span className="nav-item" onClick={ this.handleDownload }>Box Spec</span>
          <span className="nav-item" onClick={ showOptionsModal }>Options</span>
          <span className="nav-item" onClick={ onPreviewHandle}>Preview</span>
          <span className="nav-item" onClick={ this.handleSave }>Save</span>
          <span className="nav-item" onClick={ this.handleOrder }>Order</span>
          {
            __DEVELOPMENT__
            ? <span className="nav-item" onClick={ onLoginHandle }>Login</span>
            : null
          }
        </div>
      </XHeader>
    );
  }
}

PageHeader.propTypes = {
  showOptionsModal: PropTypes.func.isRequired,
  onLoginHandle: PropTypes.func.isRequired,
  onPreviewHandle: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired,
  baseUrls: PropTypes.object.isRequired,
  setting: PropTypes.object.isRequired,
  typeText: PropTypes.string.isRequired,
  onSaveProject: PropTypes.func.isRequired,
  boundSystemActions: PropTypes.object.isRequired,
  isProjectEdited: PropTypes.bool.isRequired,
};

export default PageHeader;
