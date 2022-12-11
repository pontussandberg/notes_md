import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { readFileSync } from 'fs'
import { Resolvers } from './generated/graphql';
import shortid from 'shortid'

const typeDefs = readFileSync('src/schema.graphql', { encoding: 'utf-8' })

const docsDB = [
  {
    "id": "1",
    "listIndex": 0,
    "rowsCount": 2,
    "title": "my title",
    "content": "Heloo world",
    "fileExtension": ".md"
  },
  {
    "id": "2",
    "listIndex": 1,
    "rowsCount": 2,
    "title": "my title",
    "content": "Heloo world",
    "fileExtension": ".md"
  },
  {
    "id": "3",
    "listIndex": 2,
    "rowsCount": 7,
    "title": "best note",
    "content": "best not hello world",
    "fileExtension": ".md"
  },
  {
    "id": "4",
    "listIndex": 3,
    "rowsCount": 12,
    "title": "TODO",
    "content": "TODO \n -do stuff",
    "fileExtension": ".md"
  }
]

const resolvers: Resolvers = {
  Query: {
    documents: () => docsDB,
    document: (_parent, { id }) => docsDB.find(doc => doc.id === id) || null,
  },
  Mutation: {
    createDocument: (_parent, {content, rowsCount, title, fileExtension, listIndex}) => {
      const document = {
        id: shortid.generate(),
        content,
        rowsCount,
        title,
        fileExtension,
        listIndex,
      }

      docsDB.unshift(document)
      return document
    },

    updateDocument: (_parent, {id, content, rowsCount, title, fileExtension, listIndex}) => {
      
      console.log(id)
      console.log(content)
      console.log(rowsCount)
      console.log(title)
      console.log(fileExtension)
      console.log(listIndex)

      const documentIndex = docsDB.findIndex(doc => doc.id === id)

      if (documentIndex === -1) {
        return null
      }

      const ref = {...docsDB[documentIndex]}

      docsDB[documentIndex] = {
        ...ref,
        content: content             || ref.content, 
        rowsCount: rowsCount         || ref.rowsCount, 
        title: title                 || ref.title, 
        fileExtension: fileExtension || ref.fileExtension, 
        listIndex: listIndex         || ref.listIndex,
      }

      return docsDB[documentIndex]
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`🚀  Server ready at: ${url}`)