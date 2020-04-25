const { ApolloServer, gql,UserInputError,AuthenticationError } = require('apollo-server')
const database = require('mongoose')
const jsonwebtoken = require('jsonwebtoken')

const Author = require('./model/Author')
const Book = require('./model/Book')
const User = require('./model/User')

const uuid = require('uuid/v1')


database.set('useFindAndModify', false)
database.set('useCreateIndex', true)

const databseuri = 'mongodb+srv://dbuser:lr94GxPg7HthnbGU@cluster0-yydjv.mongodb.net/booklist?retryWrites=true&w=majority'
const secret = 'SecretKey'

database.connect(databseuri, { useNewUrlParser: true, useUnifiedTopology: true })



let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]


const typeDefs = gql`
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String,genre: String):  [Book!]!
    allAuthors: [Author!]!
    me: User
  }

    type Book {
      title : String!
      author: Author!
      published: Int!
      genres: [String!]!
      id: ID!
    }

    type Author {
      name : String!
      id: String!
      born: Int
      bookCount: Int
    }

    type User {
      username: String!
      favoriteGenre: String!
      id: ID!
    }

    type Token {
      value: String!
    }

    type Mutation {
      addBook(
        title: String!
        author:  String!
        published: Int!
        genres: [String!]!      
      ): Book 

        editAuthor(
          name: String
          setBornTo: Int
        ): Author

        createUser(
          username: String!
          favoriteGenre: String!
        ): User

        login(
          username: String!
          password: String!
        ): Token
    }

`

const resolvers = {
  Query: {
    bookCount:async () => {
      
      
      const dbbooks =await Book.find()

      return dbbooks.length
    },
    authorCount:async () => {

      const dbauthors =await Author.find()

      return dbauthors.length

    },
    allBooks:async (root, args) => {

      if(args.genre) {
        return await Book.find({ genres: { $in: [args.genre] }  }).populate('author', {name:1,born: 1}) 
      }

      return await Book.find().populate('author', {name:1,born: 1}) 

    },
    allAuthors:async () => {
      return await Author.find()
    },
    me: (root, args,  { userSession }) => {
      return userSession
    }
  },
  Author: {
    bookCount:async (root) => {

      const dbBooks =await Book.find({ author: { $in: [root.id] }  })
      return dbBooks.length

    },
    
  },
  Mutation: {
    addBook: async (root, args, { userSession }) => {

      
      if (!userSession) {
        throw new AuthenticationError("User have not been authenticated yet")
      }
      

      let dbbook= null
      const book = new Book({ ...args })

      const existingauthor = await Author.findOne({ name: args.author })

      if(!existingauthor) {
         
        const authorObjt = new Author({ name:args.author ,born: null})

        try {
          const author = await authorObjt.save()
        }
        catch(error) {
          throw new UserInputError(error.message)
        }
        book.author= author.id

       
      }
      else {
        book.author=existingauthor.id
      }
      try {
         dbbook = await book.save() 
      }
      catch(error) {
        throw new UserInputError(error.message)
      }

      return await Book.findById(dbbook.id).populate('author', {name:1,born: 1})
    },
    editAuthor: async(root, args, { userSession }) => {

      if (!userSession) {
        throw new AuthenticationError("User have not been authenticated yet")
      }

      return await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo }, {
        new: true
      });
    },

    createUser: async(root, args) => {
      
      const user = new User({ ...args })
      try {
        return await user.save() 
      }
      catch(error) {
        throw new UserInputError(error.message)
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      
      if (!user) {
        throw new UserInputError("Username was incorrect")
      }

      if(args.password !== 'password' ) {
        throw new UserInputError("Password was incorrect")
      } 


      return { value: jsonwebtoken.sign({username: user.username,id: user.id}, secret) }

    }

  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    
    if(req)
    {
      authorization = req.headers.authorization

      if(authorization  && authorization.startsWith('bearer ')) {

        const encodedToken= authorization.substring(7)

        const decodedtok=jsonwebtoken.verify(encodedToken, secret )

        const userSession = await User.findById(decodedtok.id)

        return { userSession }

      }

    }

  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
