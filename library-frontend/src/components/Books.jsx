import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = ({ show }) => {
  const [genre, setGenre] = useState('')
  const genres = useQuery(ALL_GENRES)
  
  const books = useQuery(ALL_BOOKS, {
    variables: { genre }, 
  })

  if (!show) {
    return null
  }

  if(books.loading) {
    return <div>loading...</div>
  }


  return (
    <div> 
      <h2>books</h2>
      <p>in genre <strong>{genre}</strong></p>
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
      {genres.data.allGenres.map((g) => {
        return <button key={g} onClick={() => setGenre(g)}>{g}</button>
    })}
      <button onClick={() => setGenre('')}>all genres</button>
    </div>
  )
}

export default Books
