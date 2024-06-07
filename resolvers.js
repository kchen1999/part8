const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()


const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if(!args.genre) {
        return Book.find({})
      }
      else {
        return Book.find({genres: args.genre })
      } 
    }, 
    allGenres: async () => {
      const genres = []
      const books = await Book.find({})
      books.map(b => {
        b.genres.map(g => {
          if(!genres.includes(g)) {
            genres.push(g)
          }
        })
      })
      return genres
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Book: {
    author: async (root) => {
      const author = await Author.findOne({_id: root.author})
      return {
        name: author.name
      }
    }
  }, 
  /*
  Author: {
    bookCount: async (root) => {
      const b = books.filter(book => book.author === root.name)
      return b.length
    }
  },  */
  Mutation: {
    addBook: async (root, args, context) => {
      const book = new Book({ ...args})
      const currentUser = context.currentUser
      if(!currentUser) {
        throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT', 
            }
          })
      }
      const author = await Author.findOne({ name: args.author})
      if(!author) {
        const newAuthor = new Author({ name: args.author})
        try {
          await newAuthor.save()
          book.author = newAuthor
        } catch (error) {
          throw new GraphQLError('Adding author failed', {
            extensions: {
              code: 'BAD_USER_INPUT', 
              invalidArgs: args.author,
              error
            }
          })
        }
      }
      else {
        book.author = author
      }
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Adding book failed', {
          extensions: {
            code: 'BAD_USER_INPUT', 
            invalidArgs: args.title,
            error
          }
        })
      }
      pubsub.publish('BOOK_ADDED', {bookAdded: book })

      return book 
    } ,
    editAuthor: async (root, args, {currentUser}) => {
      if(!currentUser) {
        throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT', 
            }
          })
      }
      const author = await Author.findOne({ name: args.name })
      if(!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT', 
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({...args})
      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT', 
            invalidArgs: args,
            error
          }
        })
      }
      return user
    }, 
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if(!user || args.password !== 'secret') {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const userForToken = {
        username: user.username, 
        id: user._id
      }

      return {value: jwt.sign(userForToken, process.env.JWT_SECRET)}
 
    }
  }, 
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  },
}

module.exports = resolvers