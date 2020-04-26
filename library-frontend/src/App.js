
import React, { useState,useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/Login'
import { gql, useQuery,useMutation } from '@apollo/client'


const App = () => {
  const [page, setPage] = useState('authors')
  const [jsToken, setjsToken] = useState(null)


  const ALLAUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
const ALLBOOKS = gql`
query {
  allBooks { 
    title 
    author {
      name
    }
    published
  }
}
`
const LOGIN = gql`
mutation makeLogin($username: String!, $password: String!) {
  login(username: $username, password: $password
  ) {
    value
  }
}
`

const [ makeLogin, result ] = useMutation(LOGIN)
const allauthors = useQuery(ALLAUTHORS)
const allbooks = useQuery(ALLBOOKS)

useEffect(() => {

      const newtoken = result.data ? result.data.login.value : null
      setjsToken(newtoken)     
      localStorage.setItem('jstoken', newtoken) 

  },[result.data]) 

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        { jsToken ? <button onClick={() => setPage('add')}>add book</button> : null}

        { !jsToken ? <button onClick={() => setPage('login')}>Login</button>: null}

        { jsToken ? <button onClick={() => {setjsToken(null);setPage('books')}}>Logout</button>: null}
        
      </div>

      <Authors
        show={page === 'authors'}
        result={allauthors} jstoken={jsToken}
      />
  
      <Books
        show={page === 'books'}
        result={allbooks}
      />

      <NewBook
        show={page === 'add'}
      />

    <LoginForm
        show={page === 'login'} setjstoken={setjsToken} setpage={setPage} makelogin={makeLogin}
      />

    </div>
  )
}

export default App