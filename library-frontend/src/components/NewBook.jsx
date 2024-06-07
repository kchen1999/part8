import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS, ALL_GENRES } from '../queries'
import { updateCache } from '../App'

const NewBook = ({ show }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [newGenre, setNewGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [createBook] = useMutation(CREATE_BOOK, { 
    refetchQueries: [{ query: ALL_AUTHORS },{ query: ALL_GENRES }],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      console.log(error.networkError)
      console.log(messages)
    },
    update: (cache, response) => {
      /*cache.updateQuery({ query: ALL_BOOKS, variables: { genre: '' }}, ({ allBooks }) => {
        return {
          allBooks: [...allBooks, response.data.addBook]
        }
      })
      response.data.addBook.genres.forEach(g => {
        cache.updateQuery({ query: ALL_BOOKS, variables: { genre: g }}, ({ allBooks }) => {
          return {
            allBooks: [...allBooks, response.data.addBook]
          }
        })
      }) */
      updateCache(cache, { query: ALL_BOOKS, variables: { genre: '' }}, response.data.addBook)
      response.data.addBook.genres.forEach( g => {
        console.log('new book')
        console.log(g)
        updateCache(cache, { query: ALL_BOOKS, variables: { genre: g }}, response.data.addBook)
      }) 
      
    }
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    const publishedYear = Number(published)

    console.log('add book...')
    createBook({ variables: {title, author, published: publishedYear, genres}})

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setNewGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(newGenre))
    setNewGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={newGenre}
            onChange={({ target }) => setNewGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook