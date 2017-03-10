import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from '../reducers';
import apiMiddleware from '../middlewares/api';

/**
 * 用于创建一个store
 * @param {Object} initialState 初始值.
 */

export function configureStore(initialState = {}) {
  const middlewares = [applyMiddleware(thunk),
    applyMiddleware(apiMiddleware)];

  if (__DEVELOPMENT__) {
    middlewares.push(applyMiddleware(createLogger()));
  }

  const finalCreateStore = compose(
    ...middlewares
  )(createStore);

  const store = finalCreateStore(rootReducer, initialState);

  if (__DEVELOPMENT__ && module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
