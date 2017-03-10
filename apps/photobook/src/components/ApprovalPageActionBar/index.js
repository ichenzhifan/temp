import { translate } from 'react-translate';
import React, { Component, PropTypes } from 'react';

import './index.scss';

class ApprovalPageActionBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorItems: this.props.data.errorItems
    };
    this.spliceOperatedItem = this.spliceOperatedItem.bind(this);
    this.onAutofixClick = this.onAutofixClick.bind(this);
    this.onIgnoreClick = this.onIgnoreClick.bind(this);
    this.onReviewClick = this.onReviewClick.bind(this);
  }

  onAutofixClick(pageId, elementId, errorItemIndex) {
    const { actions } = this.props;
    const { deleteElement } = actions;
    deleteElement(pageId, elementId);
    this.spliceOperatedItem(errorItemIndex);
  }

  onIgnoreClick(errorItemIndex) {
    this.spliceOperatedItem(errorItemIndex);
  }

  onReviewClick(errorItemIndex) {
    const { actions } = this.props;
    const { changeStateSheetIndex } = actions;
    changeStateSheetIndex(errorItemIndex);
  }

  spliceOperatedItem(index) {
    const newErrorItems = this.state.errorItems.splice(index, 1);
    this.setState({
      errorItems: newErrorItems
    });
  }

  render() {
    const { data, t } = this.props;
    const { sheetIndex } = data;
    return (
      <div className="approval-actionbar-wrap">
        <div className="approval-actionbar-caption">
          <ul className="approval-actionbar-item">
            <li>{t('PAGE_NUMBER')}</li>
            <li>{t('WARNING_MESSAGE')}</li>
            <li>{t('ACTIONS')}</li>
          </ul>
        </div>
        <div className="approval-actionbar-body">
          <ul className="fix">
            {
              this.state.errorItems.map((item, index) => {
                return (
                  <li
                    className={item.get('sheetIndex') == sheetIndex ? 'selectedPage' : ''}
                    key={index}
                  >
                    <ul className="approval-actionbar-item fix">
                      <li>{item.get('pageNumber')}</li>
                      <li>{item.get('errorMessage')}</li>
                      <li>
                        {
                          item.get('errorType') === 0
                          ? (
                            <a
                              title={t('IGNORE_TITLE')}
                              onClick={this.onIgnoreClick.bind(this, index)}
                            >
                              {t('IGNORE')}
                            </a>
                          )
                          : null
                        }
                        {
                          item.get('errorType') === 1
                          ? (
                            <a
                              title={t('AUTOFIX_TITLE')}
                              onClick={this.onAutofixClick.bind(this, item.get('pageId'), item.get('elementId'), index)}
                            >
                              {t('AUTOFIX')}
                            </a>
                          )
                          : null
                        }
                        <a
                          title={t('REVIEW_TITLE')}
                          onClick={this.onReviewClick.bind(this, item.get('sheetIndex'))}
                        >
                          {t('REVIEW')}
                        </a>
                      </li>
                    </ul>
                  </li>
                );
              })
            }
            <div className="line1"></div>
            <div className="line2"></div>
          </ul>
        </div>
      </div>
    );
  }
}

ApprovalPageActionBar.propTypes = {
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

export default translate('ApprovalPageActionBar')(ApprovalPageActionBar);
