import React, { Component, PropTypes } from 'react';
import { translate } from 'react-translate';
import classNames from 'classnames';

import XButton from '../../../../common/ZNOComponents/XButton';
import './index.scss';

class CameoPaintedButtons extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { t } = this.props;
    const { actions, data } = this.props;
    const {
      isShowCameo,
      isShowAddCameoBtn,
      isShowPaintedText,
      isShowSaveTemplate,
      style, className
    } = data;
    const btnsListClassName = classNames(className, 'cameo-painted-btns');

    const addCameoClassName = classNames('cameo-btn cp-btn', { 'show': isShowCameo && isShowAddCameoBtn });
    const removeCameoClassName = classNames('cameo-btn cp-btn', { 'show': isShowCameo && !isShowAddCameoBtn });
    const paintedTextClassName = classNames('painted-text-btn cp-btn', { 'show': isShowPaintedText });
    const saveTemplateClassName = classNames('save-template-btn cp-btn', { 'show': isShowSaveTemplate });

    return (
      <div className={btnsListClassName} style={style}>
        <XButton className={saveTemplateClassName} onClicked={actions.onSaveTemplate}>{t('SAVE_TEMPLATE')}</XButton>
        <XButton className={paintedTextClassName} onClicked={actions.onAddPaintedText}>{t('PAINTED_TEXT')}</XButton>
        <XButton className={addCameoClassName} onClicked={actions.onAddCameo}>{t('ADD_CAMEO')}</XButton>
        <XButton className={removeCameoClassName} onClicked={actions.onRemoveCameo}>{t('REMOVE_CAMEO')}</XButton>
      </div>
    );
  }
}

CameoPaintedButtons.propTypes = {
  actions: PropTypes.shape({
    onAddCameo: PropTypes.func.isRequired,
    onRemoveCameo: PropTypes.func.isRequired,
    onAddPaintedText: PropTypes.func.isRequired
  }),
  data: PropTypes.shape({
    isShowCameo: PropTypes.bool,
    isShowAddCameoBtn: PropTypes.bool,
    isShowPaintedText: PropTypes.bool
  })
};

CameoPaintedButtons.defaultProps = {
  data: {
    isShowAddCameo: true,
    isShowPaintedText: true
  }
};

export default translate('CameoPaintedButtons')(CameoPaintedButtons);

