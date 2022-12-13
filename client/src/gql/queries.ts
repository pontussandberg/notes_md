import { gql } from "../__generated__/gql";

export const GET_DOCUMENT_CONTAINER_QUERY = gql(/* GraphQL */ `
  query GetDocumentContainerQuery($id: String) {
    document(id: $id) {
      id
    }
  }
`)

export const GET_DOCUMENT_RENDER_QUERY = gql(/* GraphQL */ `
  query GetDocumentRenderQuery($id: String) {
    document(id: $id) {
      id
      title
      content
    }
  }
`)

export const GET_DOCUMENT_MD_RENDER_QUERY = gql(/* GraphQL */ `
  query GetDocumentMdRenderQuery($id: String) {
    document(id: $id) {
      id
      content
    }
  }
`)

export const GET_DOCUMENTS_MENU_QUERY = gql(/* GraphQL */ `
  query GetDocumentsMenuQuery {
    documents {
      id
      title
      content
      rowsCount
    }
  }
`)
  
export const GET_DOCUMENTS_MENU_DRAWER_QUERY = gql(/* GraphQL */ `
  query GetDocumentsMenuDrawerQuery {
    documents {
      id
      title
      content
    }
  }
`)
