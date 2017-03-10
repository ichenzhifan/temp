import React, { Component, PropTypes } from 'react';

import XModal from '../../../../common/ZNOComponents/XModal';
import XButton from '../../../../common/ZNOComponents/XButton';
import TextPositionTabs from '../TextPositionTabs/';
import PaintedTextForm from './paintedTextForm';

import './index.scss';

class PaintedTextModal extends Component {
  constructor(props) {
    super(props);

    const { initTabIndex } = this.props;

    this.state = {
      formData: {
        front: {},
        spine: {},
        back: {},
      },
      currentTabIndex: initTabIndex || 0
    };

    this.onTabChange = this.onTabChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onTabChange(tabIndex) {
    this.setState({
      currentTabIndex: tabIndex
    });
  }

  onSubmit() {
    const { formData } = this.state;
    const { closePaintedTextModal } = this.props;

    closePaintedTextModal();
  }

  render() {
    const {
      closePaintedTextModal,
      isShown,
      fontList,
      baseUrl,
      initTabIndex
    } = this.props;
    const { formData, currentTabIndex } = this.state;
    const formDataKeys = Object.keys(formData);

    return (
      <XModal
        className="painted-text-modal"
        onClosed={closePaintedTextModal}
        opened={isShown}
      >
        <h2 className="modal-title">Edit Painted Text</h2>
        <TextPositionTabs
          initTabIndex={initTabIndex}
          onTabChange={this.onTabChange}
        />

        {
          formDataKeys.map((key) => {
            const index = formDataKeys.indexOf(key);
            return (
              <PaintedTextForm
                key={key}
                baseUrl={baseUrl}
                isShown={index === currentTabIndex}
                fontList={fontList}
                formData={formData[key]}
                hasFontSize={key !== 'spine'}
                hasAlign={key !== 'spine'}
              />
            );
          })
        }

        <p className="button-container">
          <XButton
            onClicked={this.onSubmit}
          >Done</XButton>
        </p>

      </XModal>
    );
  }
}

PaintedTextModal.propTypes = {
  fontList: PropTypes.array.isRequired,
  isShown: PropTypes.bool.isRequired,
  closePaintedTextModal: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
  initTabIndex: PropTypes.number,
};

export default PaintedTextModal;
