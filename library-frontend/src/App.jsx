import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommendation from "./components/Recommendation";
import LoginForm from "./components/LoginForm";
import { useSubscription, useApolloClient } from "@apollo/client";
import { ALL_BOOKS, BOOK_ADDED} from "./queries";


export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }
  try {
    cache.updateQuery(query, ({ allBooks }) => {
      return {
        allBooks: uniqByName([...allBooks, addedBook])
      }
    })
  }
  catch(e) {
    console.log(e)
  }
 
}

const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(localStorage.getItem('library-user-token'))
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      window.alert(`${addedBook.title} added`)
      updateCache(client.cache, {query: ALL_BOOKS, variables: { genre: '' }}, addedBook)
      addedBook.genres.forEach(g => {
        updateCache(client.cache, {query: ALL_BOOKS, variables: { genre: g }}, addedBook)
      }) 
    }
    
  })
  
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage("login")
  }




  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ?
          <span>
            <button onClick={() => setPage("add")}>add book</button> 
            <button onClick={() => setPage("recommend")}>recommend</button> 
            <button onClick={logout}>logout</button>
          </span>
          : <button onClick={() => setPage("login")}>login</button>}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} /> 

      <Recommendation show={page === "recommend"} token={token}/> 

      <LoginForm show={page === "login"} setToken={setToken} setPage={setPage}/>
    </div>
  );
};

export default App;
