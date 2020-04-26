import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache}  from '@apollo/client' 
import { setContext } from 'apollo-link-context'


const authLink = setContext((_, { headers }) => { 
  
  const jstoken = localStorage.getItem('jstoken') 

  let authorization = null

  if(jstoken && jstoken !== 'null') {
   
    authorization=  `bearer ${jstoken}`

    console.log(authorization)
  }

  return { 
  
  
  headers: {...headers,authorization,}

}})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const apollo = new ApolloClient({ 
  
  cache: new InMemoryCache(), 
  link: authLink.concat(httpLink)
})

ReactDOM.render(
<ApolloProvider client={apollo}>
  <App />
</ApolloProvider>
,document.getElementById('root')
)