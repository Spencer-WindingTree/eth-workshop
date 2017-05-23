
//React ,router and history
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute } from "react-router";
import createHashHistory from 'history/lib/createHashHistory';

//Views
import Layout from "./Layout";
import App from "./App";

//CSS
require('../node_modules/bootstrap/dist/css/bootstrap.css');
require('../node_modules/font-awesome/css/font-awesome.css');
require('./styles.css');

//Set history
const history = createHashHistory({ queryKey: false })
const app = document.getElementById('app');

//Set router
ReactDOM.render(
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute component={App}></IndexRoute>
    </Route>
  </Router>,
app);
