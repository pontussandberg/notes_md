import ReactDOM from 'react-dom'
import App from './App'
import {BrowserRouter as Router} from 'react-router-dom'

import './css/vars'
import './css/global'

import './prism_lib/prism.js'
import './prism_lib/prism.css'

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <Router>
    <ApolloProvider client={client}>
      <App/>
    </ApolloProvider>
  </Router>,
  document.getElementById('root')
);