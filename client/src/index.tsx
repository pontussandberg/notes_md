import ReactDOM from 'react-dom'
import App from './App'
import {BrowserRouter as Router} from 'react-router-dom'

import './css/vars'
import './css/global'

import './prism_lib/prism.js'
import './prism_lib/prism.css'


ReactDOM.render(
  <Router><App/></Router>,
  document.getElementById('root')
);