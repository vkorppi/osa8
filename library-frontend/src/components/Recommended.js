import React,{useEffect} from 'react'
import { gql, useQuery,useLazyQuery  } from '@apollo/client'

const Recommended = (props) => {

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
const [filterfavorites, favorites] = useLazyQuery(FILTEREDDBOOKS, { fetchPolicy: "network-only" }) 


  useEffect(() => {

    if(props.user && props.user.data){
      
      filterfavorites({ variables: { genre: props.user.data.me.favoriteGenre } })
    }

},[props.user,filterfavorites]) 




  let user = props.user


  if (!props.show) {
    return null
  }

  if (favorites.loading)  {
    return <div>not ready yet</div>
}


 
 
    if (user.loading)  {
        return <div>not ready yet</div>
    }

   

    if(!user.data.me) {
      return null
    }



    let books=[]

    if(favorites.data) {
      books=favorites.data.allBooks
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
              
              {books.map(a =>
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              )}
            
            </tbody>
          </table>
   
         
        </div>
      )


}


export default Recommended