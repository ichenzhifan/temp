import { translate } from 'react-translate';
import React, { Component, PropTypes } from 'react';
import { get } from 'lodash';
import { allOptionMap } from '../../reducers/project/projectReducer';
import { productNames } from '../../contants/strings';

import './index.scss';

class ApprovalPageSideBar extends Component {
  constructor(props) {
    super(props);
    this.getItemLabel = this.getItemLabel.bind(this);
  }

  /**
   * Gets the item label.
   *
   * @param      {object}  allOptionsMap    spec 中所有可用的 option 的集合
   * @param      {string}  keyName          需要查找的属性名， 如 size， cover 等。
   * @param      {string}  value            需要查找的option的值， 如 12X12， EP 等。
   * @return     {string}  The item label   option 的值 对应的 label。
   */
  getItemLabel(allOptionsMap, keyName, value) {
    const keyMap = allOptionsMap[keyName];
    if (!(keyMap instanceof Array)) return '';
    const itemObject = keyMap.find(item => item.id === value);
    const itemLabel = itemObject ? (itemObject.name || itemObject.title) : '';
    return itemLabel;
  }


  render() {
    const { setting, t } = this.props;
    const cover = this.getItemLabel(allOptionMap, 'cover', setting.get('cover'));
    const size = this.getItemLabel(allOptionMap, 'size', setting.get('size'));
    const paper = this.getItemLabel(allOptionMap, 'paper', setting.get('paper'));
    const thickness = this.getItemLabel(allOptionMap, 'paperThickness', setting.get('paperThickness'));

    const product = setting.get('product');
    const productFullName = productNames[product];

    return (
      <div className="approval-sidebar-wrap">
        <div className="approval-sidebar-item">
          <h2>{`${t('PARAGRAPH1_TITLE')}:`}</h2>
          <ul>
            <li>{t('PARAGRAPH1_TEXT1')}</li>
            <li>{t('PARAGRAPH1_TEXT2')}</li>
            <li>{t('PARAGRAPH1_TEXT3')}</li>
            <li>{t('PARAGRAPH1_TEXT4')}</li>
          </ul>
        </div>
        <div className="approval-sidebar-item">
          <h2>{`${t('PARAGRAPH2_TITLE')}:`}</h2>
          <ul>
            <li>{`${t('PARAGRAPH2_TEXT1')}: ${productFullName}(${cover})`}</li>
            <li>{`${t('PARAGRAPH2_TEXT2')}: ${size}`}</li>
            <li>{`${t('PARAGRAPH2_TEXT3')}: ${paper}`}</li>
            <li>{`${t('PARAGRAPH2_TEXT4')}: ${thickness}`}</li>
          </ul>
        </div>
        <div className="approval-sidebar-item">
          <h2>{`${t('PARAGRAPH3_TITLE')}:`}</h2>
          <ul>
            <li>{t('PARAGRAPH3_TEXT1')}</li>
            <li>{t('PARAGRAPH3_TEXT2')}</li>
            <li>{t('PARAGRAPH3_TEXT3')}</li>
          </ul>
        </div>
      </div>
    );
  }
}

ApprovalPageSideBar.propTypes = {
  setting: PropTypes.object.isRequired
};

export default translate('ApprovalPageSideBar')(ApprovalPageSideBar);
