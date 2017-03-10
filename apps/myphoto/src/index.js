import 'font-awesome/css/font-awesome.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './views/App';
import AppStore from './stores/AppStore';
import {spy} from 'mobx';

ReactDOM.render(
	<App store={AppStore} />, document.getElementById('root')
);

if (__DEVELOPMENT__) {
  spy((event) => {
    switch(event.type) {
      case 'action': {
        console.log(event);
        break;
      }
      case 'update': {
        console.log(event);
        break;
      }
      default:
        break;
    }
  })
}
