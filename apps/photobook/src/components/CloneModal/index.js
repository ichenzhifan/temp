import classNames from 'classnames';
import { translate } from 'react-translate';
import React, { Component, PropTypes } from 'react';

import XModal from '../../../../common/ZNOComponents/XModal';
import XButton from '../../../../common/ZNOComponents/XButton';


import './index.scss';

class CloneModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      timer: null,
      isInvalid: false,
      isFormatInvalid: false,
      errorTip: '.',
      placeHolder: 'input new book title here'
    };
    this.handleClone = this.handleClone.bind(this);
    this.resetTitle = this.resetTitle.bind(this);
    this.handleCloseCloneModal = this.handleCloseCloneModal.bind(this);
  }

  resetTitle(event) {
    this.setState({
      name: event.target.value
    });
    this.checkProjectTitleFun(event.target.value);
  }

  checkProjectTitleFun(ProjectTitle, callback) {
    const { checkProjectTitle, userId, closeCloneModal } = this.props;
    const timerFunc = (projectTitle) => {
      checkProjectTitle({ projectName: this.state.name, customerID: userId }).then((res) => {
        if (!res) {
          if (!this.state.isFormatInvalid) {
            this.setState({
              isInvalid: true,
              errorTip: 'Title existed, please pick another one.'
            });
          } else {
            this.setState({
              isFormatInvalid: false
            });
          }
        } else {
          if (callback) {
            this.handleCloseCloneModal();
            callback(projectTitle);
          }
          this.setState({
            isInvalid: false,
            isFormatInvalid: false,
            errorTip: ''
          });
        }
      });
    };
    if (!ProjectTitle.trim()) {
      this.setState({
        isInvalid: true,
        isFormatInvalid: true,
        errorTip: 'Title is required'
      });
    } else if (!(/^[a-zA-Z 0-9\d_\s-]+$/.test(ProjectTitle))) {
      this.setState({
        isInvalid: true,
        isFormatInvalid: true,
        errorTip: 'Only letters, numbers, blank space, - (hyphen) and _ (underscore) are allowed in the title.'
      });
    } else {
      if (callback) {
        timerFunc(ProjectTitle);
        this.setState({
          isFormatInvalid: false
        });
      } else {
        if (this.state.timer) {
          clearTimeout(this.state.timer);
        }
        const timer = setTimeout(timerFunc, 300);
        this.setState({
          isFormatInvalid: false,
          timer
        });
      }
    }
  }

  handleCloseCloneModal() {
    const { closeCloneModal } = this.props;
    closeCloneModal();
    this.setState({
      name: '',
      timer: null,
      isInvalid: false,
      isFormatInvalid: false,
      errorTip: '.'
    });
  }

  handleClone() {
    const { onCloneProject, addAlbum, userId, addTracker } = this.props;
    const callback = (name) => {
      addAlbum(userId, name).then(() => {
        onCloneProject(name);
      });
    };
    addTracker('ClickCloneAndDone');
    this.checkProjectTitleFun(this.state.name, callback);
  }

  render() {
    const { isShown } = this.props;
    const errorTip = classNames('error-tip', { show: this.state.isInvalid });
    return (
      <XModal
        className="clone-modal"
        onClosed={this.handleCloseCloneModal}
        opened={isShown}
      >
        <p className="modal-title">Clone Project</p>
        <p className="input-tip">Please input new book title</p>
        <div className="name-inputer-wrap">
          <input
            type="text"
            value={this.state.name}
            onChange={this.resetTitle}
            maxLength="50"
            placeholder={this.state.placeHolder}
          />
          <span className={errorTip}>{this.state.errorTip}</span>
        </div>
        <div className="button-wrap">
          <XButton
            className="little-button white"
            onClicked={this.handleCloseCloneModal}
          >Close</XButton>
          <XButton
            className="little-button"
            disabled={this.state.isInvalid || !this.state.name}
            onClicked={this.handleClone}
          >Clone</XButton>
        </div>
      </XModal>
    );
  }
}

CloneModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  closeCloneModal: PropTypes.func.isRequired,
  onCloneProject: PropTypes.func.isRequired,
  addAlbum: PropTypes.func.isRequired,
  userId: PropTypes.number,
  addTracker: PropTypes.func.isRequired
};

export default translate('CloneModal')(CloneModal);
