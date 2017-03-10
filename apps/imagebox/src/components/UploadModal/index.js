import React, { Component, PropTypes } from 'react';
import { merge, get, set, pick, forEach, isEmpty, isEqual } from 'lodash';
import { PENDING, DONE, PROGRESS, FAIL } from '../../contants/uploadStatus';
import XModal from '../../../../common/ZNOComponents/XModal';
import XButton from '../../../../common/ZNOComponents/XButton';
import XFileUpload from '../../../../common/ZNOComponents/XFileUpload';
import { translate } from 'react-translate';
import ItemList from '../UploadItemList';
import './index.scss';

class UploadModal extends Component {
	constructor(props) {
		const { t } = props;
	  super(props);
		this.state = {
			completeButton: t('CANCELL_ALL')
		}
}

  componentWillReceiveProps(nextProps) {
		const { t } = this.props;
		if (this.props.uploadingImages.length) {
			let success = 0,
					lose = 0;
			this.props.uploadingImages.map(item=>{
				if (item.status === DONE) {
					success ++;
				}
				if (item.status === FAIL) {
					lose ++;
				}
			});
			if (success === this.props.uploadingImages.length) {
				this.handleUploadModalClosed();
			}
			if (lose + success === nextProps.uploadingImages.length) {
				this.setState({
					completeButton: t('DONE')
				});
			}

		}
  }

  handleAddMore(e) {
    //
  }

  handleUploadModalClosed(){
    const { boundUploadedImagesActions, toggleModal, uploadingImages, t } = this.props;
    const uploading = uploadingImages.filter((item)=>{
      return item.status === PENDING || item.status === PROGRESS;
    })
    const hasImagePending = uploadingImages.some((item) => item.status === PENDING);

    if (hasImagePending) return null;

    if(uploading.length){
        if(window.confirm("Your image has not been uploaded.\n What do you want to do?")){
          uploadingImages.map((item)=>{
            item.xhr.abort();
          });
        }else{
          return false;
        }
    }
    toggleModal('upload', false);
    boundUploadedImagesActions.clearImages();
		this.setState({
			completeButton: t('CANCELL_ALL')
		});
  }

  selectFile() {

  }

  render() {
    const { opened, t, uploadingImages, boundUploadedImagesActions, toggleModal } = this.props;
    // this.setState({
    //   uploadedImages : merge([],uploadingImages)
    // })
    let successUploaded = 0, errorUploaded = 0;
    // 计算上传成功和失败的图片数量
    uploadingImages.map((item)=>{
        if(item.status === DONE){
          successUploaded ++;
        }else if(item.status === FAIL){
          errorUploaded ++;
        }
    })
    return (
      <XModal
        className="upload-modal"
        onClosed={ this.handleUploadModalClosed.bind(this) }
        opened={opened}
      >
        <div className="box-image-upload">
          <h3 className="title">
            { t('UPLOAD_IMAGES') }
          </h3>
          <ItemList
              uploadList={ uploadingImages }
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
                  multiple="multiple">
                { t('ADD_MORE_PHOTOS') }
              </XFileUpload>
              <XButton
                onClicked={ this.handleUploadModalClosed.bind(this) }
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
