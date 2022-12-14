import { docsDB } from "./db"
import { Resolvers } from "./generated/graphql"
import shortid from 'shortid'

export const resolvers: Resolvers = {
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

      console.log(docsDB[documentIndex])

      return docsDB[documentIndex]
    },
  }
}