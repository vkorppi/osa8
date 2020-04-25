import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache}  from '@apollo/client' 

const apollo = new ApolloClient({ cache: new InMemoryCache(), 
  link: new HttpLink({uri: 'http://localhost:4000',})
})

ReactDOM.render(
<ApolloProvider client={apollo}>
  <App />
</ApolloProvider>
,document.getElementById('root')
)