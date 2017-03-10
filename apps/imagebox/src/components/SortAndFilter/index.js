import React, { Component, PropTypes } from 'react';
import { translate } from "react-translate";
import XSelect from '../../../../common/ZNOComponents/XSelect';
import './index.scss';


class SortAndFilter extends Component{
  constructor(props){
    super(props);
      const { t } = props;
      this.state = {
        sortOptions: [
          {
            label: t('UPLOAD_TIME'),
            value: 'uploadTime'
          },
          {
            label: t('CREATION_TIME'),
            value: 'createTime'
          },
          {
            label: t('IMAGE_TITLE'),
            value: 'name'
          }
        ],
        sortValue: {
          label: t('UPLOAD_TIME'),
          value: 'uploadTime'
        }
      };
  }

  handleOptionChange(option){
    // console.log(option.value+" selected")
    this.setState({sortValue: option});

    const { onSorted } = this.props;
    onSorted({value:option.value});
  }

  handleHideUsedToggle(event){
    const {onToggleHideUsed} = this.props;
    const isChecked = event.target.checked;
    onToggleHideUsed(isChecked);
  }

    render(){
      const { t } = this.props;
      return(
        <div className="upload-hide">
          <div className="t-left">
          <XSelect value={this.state.sortValue}
                   onChanged={this.handleOptionChange.bind(this)}
                   searchable={false}
                   options={this.state.sortOptions}/>
          </div>
          <div className="t-right">
            <input type="checkbox" id="hideUsed" onChange={this.handleHideUsedToggle.bind(this)} />
              <label htmlFor="hideUsed" className="hide-used">
                { t('HIDE_USED') }
              </label>
          </div>
        </div>

        );
    }
}


export default translate('SortAndFilter')(SortAndFilter);
