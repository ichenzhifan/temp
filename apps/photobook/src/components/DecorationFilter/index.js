import React, { Component, PropTypes } from 'react';
import { translate } from "react-translate";
import XSelect from '../../../../common/ZNOComponents/XSelect';
import * as handler from './handler.js';
import './index.scss';

class DecorationFilter extends Component {
  constructor(props) {
    super(props);
    const { t } = props;
    this.state = {
      filterOptions: [
        {
          label: t('EVERY_DAY'),
          value: 'everyday'
        },
        {
          label: t('THEME_NAME'),
          value: 'themename'
        }
      ],
      filterValue: {
        label: t('EVERY_DAY'),
        value: 'everyday'
      }
    };
    this.onFilterChange = this.onFilterChange.bind(this);
  }

  onFilterChange(value) {
    this.setState({
      filterValue: value
    });
  }

  render() {
    const { t } = this.props;
    return (
      <div className="decoration-filter">
        <div className="filter-content">
          <label>{ t('FILTER_BY_THEME') }</label>
          <XSelect value={this.state.filterValue}
                   onChanged={this.onFilterChange}
                   searchable={false}
                   options={this.state.filterOptions}/>
          <div className="clear"></div>
        </div>
      </div>
    );
  }
}

DecorationFilter.proptype = {

};

export default translate('DecorationFilter')(DecorationFilter);
