import Loader from 'react-loader';
import Immutable from 'immutable';
import classNames from 'classnames';
import { translate } from 'react-translate';
import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { template, merge, isEqual, get } from 'lodash';


import * as handler from './handler';
import LayoutFilter from '../LayoutFilter';
import XButton from '../../../../common/ZNOComponents/XButton';


import './index.scss';

class LayoutList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      numTemplate: {},
      templateList: [],

      // layout 图片的大小.
      imageSize: {
        width: 0,
        height: 0
      },

      // 每行显示的个数.
      colNumber: 0
    };

    this.getTemplateHTML = () => handler.getTemplateHTML(this);
    this.groupTemplateByNum = (list) => handler.groupTemplateByNum(list);
    this.doFilter = (tag, list) => handler.doFilter(this, tag, list);
  }

  componentWillReceiveProps(nextProps) {
    const { actions } = this.props;
    const { onSelectFilter } = actions;
    const oldList = get(this.props, 'data.templateList');
    const newList = get(nextProps, 'data.templateList');
    const oldFilter = get(this.props, 'data.currentFilterTag');
    const newFilter = get(nextProps, 'data.currentFilterTag');
    if (!isEqual(oldList, newList)) {
      const numTemplate = this.groupTemplateByNum(newList);
      let currentFilterTag = '';
      if (Object.keys(numTemplate).indexOf(newFilter) === -1) {
        currentFilterTag = 'top';
        onSelectFilter(currentFilterTag);
      } else {
        currentFilterTag = newFilter;
      }
      this.setState({
        templateList: newList,
        numTemplate
      }, () => {
        this.doFilter(currentFilterTag, newList);
      });
    }
    if (!isEqual(oldFilter, newFilter)) {
      const numTemplate = this.groupTemplateByNum(newList);
      this.setState({
        numTemplate
      }, () => {
        this.doFilter(newFilter, newList);
      });
    }
  }

  componentDidMount() {
    const { actions } = this.props;
    const { onSelectFilter } = actions;
    const list = get(this.props, 'data.templateList');
    const filter = get(this.props, 'data.currentFilterTag');
    const numTemplate = this.groupTemplateByNum(list);
    let currentFilterTag = '';
    if (Object.keys(numTemplate).indexOf(filter) === -1) {
      currentFilterTag = 'top';
      onSelectFilter(currentFilterTag);
    } else {
      currentFilterTag = filter;
    }

    this.setState({
      templateList: list,
      numTemplate
    }, () => {
      this.doFilter(currentFilterTag, list);
    });
  }

  render() {
    const { data, actions, t } = this.props;
    let { currentFilterTag, isLoaded, pagination } = data;
    const { numTemplate, templateList } = this.state;

    const { onSelectFilter } = actions;

    const isCover = pagination.get('sheetIndex') == '0';

    const hideFilter = classNames('', {
      'hide': !!!data.templateList.length
    });

    const nums = Object.keys(numTemplate);

    const layoutWidthStyle = {
      width: 'auto'
    };

    // 当模板列表为空时, 就是用flex布局.
    const listClassName = classNames('list', {
      'display-flex': !templateList.length
    });

    return (
      <div className="layout-list">
        <LayoutFilter
          nums={nums}
          className={hideFilter}
          currentFilterTag={currentFilterTag}
          onSelectFilter={onSelectFilter}
        />
        <div className={listClassName}>
          {
            templateList.length
            ? this.getTemplateHTML()
            : <span className="no-layouts" style={layoutWidthStyle}>{ isCover ? t('NO_LAYOUTS') : t('NO_LAYOUTS_INNER') }</span>
          }
        </div>
      </div>
    );
  }
}

LayoutList.proptype = {

};

export default translate('LayoutList')(LayoutList);
