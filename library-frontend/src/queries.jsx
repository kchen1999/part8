import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
    query {
      allAuthors {
        name
        born
      }
    }
  `
export const ALL_BOOKS = gql`
  query allBook($genre: String!) {
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
export const ALL_GENRES = gql`
    query {
      allGenres
    }
  `


export const CREATE_BOOK = gql`
  mutation addBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(
      title: $title, 
      published: $published, 
      author: $author, 
      genres: $genres
    ) {
      title, 
      published,
      author {
        name
      }
      genres
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name, 
      setBornTo: $setBornTo
    ) {
      name, 
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
export const CURRENT_USER = gql`
  query {
    me {
      id,
      favoriteGenre
    }
  }
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title,
      published,
      author {
        name
      },
      genres
    }
  }
`