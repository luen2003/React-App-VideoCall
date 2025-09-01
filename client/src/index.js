import React from 'react';
import ReactDOM from 'react-dom';  // Use react-dom, not react-dom/client
import Application from './Application';
import './css/app.scss';
import { Provider } from 'react-redux';
import store from './store'


ReactDOM.render(
  <Provider store={store}>
    <Application />
  </Provider>,
  document.getElementById('root')
);
