const { ApolloServer, gql,UserInputError } = require('apollo-server')
const database = require('mongoose')

const Author = require('./model/Author')
const Book = require('./model/Book')

const uuid = require('uuid/v1')


database.set('useFindAndModify', false)
database.set('useCreateIndex', true)

const databseuri = 'mongodb+srv://dbuser:lr94GxPg7HthnbGU@cluster0-yydjv.mongodb.net/booklist?retryWrites=true&w=majority'

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
    }
  },
  Author: {
    bookCount:async (root) => {

      const dbBooks =await Book.find({ author: { $in: [root.id] }  })
      return dbBooks.length

    }
  },
  Mutation: {
    addBook: async (root, args) => {

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
        const dbbook = await book.save() 
      }
      catch(error) {
        throw new UserInputError(error.message)
      }

      return await Book.findById(dbbook.id).populate('author', {name:1,born: 1})
    },
    editAuthor: async(root, args) => {

      return await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo }, {
        new: true
      });
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
