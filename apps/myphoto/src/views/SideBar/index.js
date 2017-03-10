import React from 'react';
import classnames from 'classnames';
import {observer} from 'mobx-react';

import './style.scss';

@observer
class SideBar extends React.Component {
  render() {
    const {viewMode, onChangeViewMode} = this.props;

    return (
      <ul className='SideBar'>
        <li className='SideBar__item' onClick={() => {
          onChangeViewMode('TimeLine')
        }}>
          <a className='SideBar__item--link'>
            <span className={`fa fa-${viewMode === 'TimeLine' ? 'circle' : 'circle-thin'}`}></span>TimeLine
          </a>
        </li>
        <li className='SideBar__item' onClick={() => {
          onChangeViewMode('ProjectList')
        }}>
          <a className='SideBar__item--link'>
            <span className={`fa fa-${viewMode === 'ProjectList' ? 'circle' : 'circle-thin'}`}></span>Project
          </a>
        </li>
      </ul>
    );
  }
}

SideBar.propTypes = {
  viewMode: React.PropTypes.string
};

export default SideBar;
