  
import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Select from 'react-select';

export const UPDATEBIRTHDATE = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo)  {
      name
      born
    }
  }
`

const ALLAUTHORS = gql`
query {
  allAuthors {
    name
    born
    bookCount
  }
}
`

const Authors = (props) => {

  const [born, setBorn] = useState('')
  const [name, setName] = useState('')
  const [option, setOption] = useState(null)

  const [ editAuthor ] = useMutation(UPDATEBIRTHDATE,{refetchQueries: [ { query: ALLAUTHORS } ]  })

  if (!props.show) {
    return null
  }
  const result = props.result

  if (result.loading)  {
    return <div>not ready yet</div>
  }

  const authors = result.data.allAuthors

  const options = authors.map(author => ( { value: author.name, label: author.name }) )


  const updateAuthor = async (event) => {
    
    event.preventDefault()


    editAuthor({  variables: { "name":option, "setBornTo":parseInt(born)  } })

    
    setBorn('')
    setOption(null)

  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <h2>Set date of birth for author</h2>
      </div>
      <form onSubmit={updateAuthor}>
      <div>
        born  <input value={born} onChange={({ target }) => setBorn(target.value)}/>
      </div>
      <div>
                <Select
        value={options.filter(obj => obj.value === option)}
        onChange={({ value }) => setOption(value)}
        options={options}
      />
      </div>
      <div>
      <button type='submit'>Update birth date</button>
      </div>
      </form>
    </div>
 
  )
}

export default Authors
