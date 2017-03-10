import Loader from 'react-loader';
import Immutable from 'immutable';
import classNames from 'classnames';
import { translate } from 'react-translate';
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
      templateList: []
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

  componentDidUpdate(prevProps, prevState) {
    const oldSelectedId = get(prevProps, 'data.paginationSpread').getIn(['page', 'template', 'tplGuid']);
    const newSelectedId = get(this.props, 'data.paginationSpread').getIn(['page', 'template', 'tplGuid']);
    if (oldSelectedId !== newSelectedId) {
        setTimeout(() => {
          const selectedLayout = document.querySelector('.layout-list .list .selected');
          if (selectedLayout) {
            selectedLayout.scrollIntoView();
          }
        }, 100);
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

    const options = {
      lines: 9,
      length: 35,
      width: 17,
      radius: 33,
      scale: 0.25,
      corners: 1,
      color: '#000',
      opacity: 0.25,
      rotate: 21,
      direction: 1,
      speed: 1,
      trail: 60,
      fps: 20,
      zIndex: 2e9,
      className: 'spinner',
      top: '50%',
      left: '50%',
      shadow: false,
      hwaccel: false,
      position: 'absolute'
    };
    const nums = Object.keys(numTemplate);

    const layoutWidthStyle = {
      width: 'auto'
    };

    return (
      <div className="layout-list">
        <LayoutFilter
          nums={nums}
          className={hideFilter}
          currentFilterTag={currentFilterTag}
          onSelectFilter={onSelectFilter}
        />
        <div className="list">
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
