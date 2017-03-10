import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

import * as handler from './handler.js';

import './index.scss';

class LayoutFilter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { nums, onSelectFilter , currentFilterTag, className } = this.props;
    const filterClass = classNames(className, {
      'layout-filter': true
    });
    return (
      <div className={filterClass}>
        <a
          href="javascript:void(0)"
          className={currentFilterTag === 'top' ? 'selected' : ''}
          onClick={onSelectFilter.bind(this, 'top')}
        >
           Top Picks
        </a>
        {
          nums
          ? nums.map((item, key) => {
            return (
              <a
                href="javascript:void(0)"
                key={key}
                className={currentFilterTag===item ? 'selected' : ''}
                onClick={onSelectFilter.bind(this, item)}>
                {item}
              </a>
            );
          })
          : null
        }
        <a
          href="javascript:void(0)"
          className={currentFilterTag==='my' ? 'selected' : ''}
          onClick={onSelectFilter.bind(this, 'my')}
        >
          My Layouts
        </a>
      </div>
    );
  }
}

LayoutFilter.proptype = {

};

export default LayoutFilter;
