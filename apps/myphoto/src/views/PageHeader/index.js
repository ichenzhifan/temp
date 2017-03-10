import React from 'react';
import {observer} from 'mobx-react';
import {observable, computed, reaction, autorun} from 'mobx';
import logo from './assets/img/new-logo-white.svg';

import './style.scss';
import ActionBar from '../../components/ActionBar';

@observer
class PageHeader extends React.Component {

  render() {
    const {actions} = this.props;

    return (
      <div className='Header'>
        <a className='Header__logo'>
          <img src={ logo }/>
        </a>

        <ActionBar actions={actions}/>
      </div>
    );
  }
}

PageHeader.propTypes = {
  actions: React.PropTypes.object
};

export default PageHeader;
