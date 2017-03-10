import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';

import XModal from '../../../../common/ZNOComponents/XModal';
import XButton from '../../../../common/ZNOComponents/XButton';
import XFileUpload from '../../../../common/ZNOComponents/XFileUpload';
import ItemList from '../UploadItemList';

import * as handler from './handler';

import './index.scss';

class UploadModal extends Component {
	constructor (props) {
	  super(props);

    this.state = {
      allImages: [],
      syncedGuids: [],
      addMore: false,
      successUploaded: 0,
      errorUploaded: 0
    };

    this.receiveProps = nextProps => handler.receiveProps(this, nextProps);
    this.handleUploadModalClosed = isManuClick => handler.handleUploadModalClosed(this, isManuClick);
    this.onUploadMoreClick = () => handler.onUploadMoreClick(this);
  }

  componentWillReceiveProps(nextProps) {
    this.receiveProps(nextProps);
  }

  render() {
    const { opened, t, uploadingImages, boundUploadedImagesActions, toggleModal } = this.props;
    const { allImages, successUploaded, errorUploaded } = this.state;
    return (
      <XModal
        className="upload-modal"
        onClosed={ this.handleUploadModalClosed.bind(this, true) }
        opened={opened}
      >
        <div className="box-image-upload">
          <h3 className="title">
            { t('UPLOAD_IMAGES') }
          </h3>
          <ItemList
              uploadList={ allImages }
              boundUploadedImagesActions={ boundUploadedImagesActions } />
          <div className="upload-meta">
            <div className="upload-info">
              <span className="compelete">
                { t('COMPLETE_COUNT', { n: successUploaded }) }
              </span>
              <span className="failed">
                { errorUploaded ? t('FILED_COUNT', { n: errorUploaded }) : '' }
              </span>
            </div>
            <div className="upload-buttons">
              <XFileUpload
                  className="white"
                  boundUploadedImagesActions={ boundUploadedImagesActions }
                  toggleModal={ toggleModal }
                  uploadFileClicked={this.onUploadMoreClick}
                  multiple="multiple">
                { t('ADD_MORE_PHOTOS') }
              </XFileUpload>
              <XButton
                onClicked={ this.handleUploadModalClosed.bind(this, true) }
                className="cancel-all"
              >
                { this.state.completeButton }
              </XButton>
            </div>
          </div>
        </div>
      </XModal>
    );
  }
}

UploadModal.propTypes = {
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  uploadList : PropTypes.array
};

export default translate('UploadModal')(UploadModal);
