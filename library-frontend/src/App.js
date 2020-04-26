
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState('authors')

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


const allauthors = useQuery(ALLAUTHORS)
const allbooks = useQuery(ALLBOOKS)

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors
        show={page === 'authors'}
        result={allauthors}
      />

      <Books
        show={page === 'books'}
        result={allbooks}
      />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App