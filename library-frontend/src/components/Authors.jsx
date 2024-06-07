import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const authors = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, { refetchQueries: [{ query: ALL_AUTHORS }]})

  if (!props.show) {
    return null
  }

  if(authors.loading) {
    return <div>loading...</div>
  }

  const submit = async (event) => {
    event.preventDefault()
    const bornYear = Number(born)
    editAuthor({ variables: {name, setBornTo: bornYear}})
    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody> 
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <select value={name} onChange={e => setName(e.target.value)}>{authors.data.allAuthors.map((a) => <option key={a.name} value={a.name}>{a.name}</option>)}</select>
        <div>
          born
            <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
