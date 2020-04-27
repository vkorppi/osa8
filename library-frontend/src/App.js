
import React, { useState,useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/Login'
import Recommended from './components/Recommended'

import { gql, useQuery,useMutation,useLazyQuery  } from '@apollo/client'


const App = () => {

  const [page, setPage] = useState('authors')
  const [jsToken, setjsToken] = useState(null)
  const [filter, setFilter] = useState(null)



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
    genres
  }
}
`
const FILTEREDDBOOKS = gql`
query filter($genre: String){
  allBooks(genre: $genre) { 
    title 
    author {
      name
    }
    published
    genres
  }
}
`


const LOGIN = gql`
mutation makeLogin($username: String!, $password: String!) {
  login(username: $username, password: $password) 
  {
    value
  }
}
`



const [ makeLogin, result ] = useMutation(LOGIN)
const allauthors = useQuery(ALLAUTHORS)
const allbooks = useQuery(ALLBOOKS)

const [getBooks, fetchedBooks] = useLazyQuery(ALLBOOKS, { fetchPolicy: "network-only" }) 

const [filterbooks, filteredBooks] = useLazyQuery(FILTEREDDBOOKS, { fetchPolicy: "network-only" }) 

const ME = gql`
query {
    me {
    favoriteGenre
  }
}
`

const [getUser, user] = useLazyQuery(ME, { fetchPolicy: "network-only" })


const filterOut = (event) => {


  setFilter(event.target.innerText)
  
  filterbooks({ variables: { genre: event.target.innerText } })
  getBooks()

}


const clearFilter = (event) => {


  setFilter(null)
  getBooks()

}




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

        { jsToken ? <button onClick={() => {setPage('recommended');getUser() }}>Recommended</button> : null}


      </div>

      <Authors
        show={page === 'authors'}
        result={allauthors} jstoken={jsToken}
      />
  
 
      <Books
        show={page === 'books'}
        result={allbooks}   filterout={filterOut} clearfilter={clearFilter} filter={filter} fetchedbooks={fetchedBooks}
        filteredbooks = {filteredBooks}
      />
   

      <NewBook
        show={page === 'add'} 
      />

    <LoginForm
        show={page === 'login'} setjstoken={setjsToken} setpage={setPage} makelogin={makeLogin} 
      />

    <Recommended
        show={page === 'recommended'}   user={user}  />
   

    </div>
  )
}

export default App