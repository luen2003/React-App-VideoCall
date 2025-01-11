import React from 'react';
import ReactDOM from 'react-dom';  // Use react-dom, not react-dom/client
import App from './App';
import './css/app.scss';
import { Provider } from 'react-redux';
import store from './store'


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
