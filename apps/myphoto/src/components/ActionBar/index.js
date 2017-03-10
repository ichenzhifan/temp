import React from 'react';
import {observer} from 'mobx-react';

import './style.scss';

@observer
class ActionBar extends React.Component {
  render() {
    const {actions = []} = this.props;

    return (
      <ul className='Header__menus'>
        {actions.map((action, index) => (
          <li className='Header__menus--item' key={ index }>
            <a>{ action.title }</a>
          </li>
        ))}
      </ul>
    );
  }
}

ActionBar.propTypes = {
  actions: React.PropTypes.object
};

export default ActionBar;
