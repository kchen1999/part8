import { useQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { ALL_BOOKS, CURRENT_USER} from '../queries'

const Recommendation = (props) => {
  const currentUser = useQuery(CURRENT_USER)
  const [favoriteGenre, setFavoriteGenre] = useState('')
  const books = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre }, 
  })

  useEffect(() => {
    if(!currentUser.loading && currentUser.data.me) {
      setFavoriteGenre(currentUser.data.me.favoriteGenre)
    }
  }, [currentUser.data])   

 
  if (!props.show) {
    return null
  }

  if(books.loading ) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>book in your favorite genre<strong> {favoriteGenre}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {
            books.data.allBooks.map(b => 
               (<tr key={b.title}>
                  <td>{b.title}</td>
                  <td>{b.author.name}</td>
                  <td>{b.published}</td>
                </tr>)
            )
          }
          
        </tbody>
      </table>
    </div>
  )
}

export default Recommendation