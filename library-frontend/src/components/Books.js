import React from 'react'
const _ = require('lodash');

const Books = (props) => {


  if (!props.show) {
    return null
  }

  let result


  if(!props.fetchedbooks.data) {
 
    result = props.result
  }
  else {

   
    result = props.fetchedbooks

  }

  

  if (result.loading || props.filteredbooks.loading)  {
    return <div>not ready yet</div>
  }
  

  
 
  let books=null
  let listbooks=null
  let genres=[]

  listbooks=result.data.allBooks

  if(props.filteredbooks) {
   

    if(props.filteredbooks.data && props.filter) {
      listbooks=props.filteredbooks.data.allBooks
    }
  }

    books= result.data.allBooks

    books.forEach(book => {
      genres= _.union(genres, book.genres);
      
    });

  if(props.filter) {

    books = books.filter(function(book) {
      return book.genres.includes(props.filter);
    });

  }

 
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {listbooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <br/>
      <button type="button" onClick={props.clearfilter}>Clear filter</button>
      {genres.map(genre =>
        <button type="button" onClick={props.filterout}>{genre}</button>
      )}
     
    </div>
  )
} 

export default Books