import { gql } from "../__generated__/gql";

export const CREATE_DOCUMENT_MUTATION = gql(/* GraphQL */ `
  mutation CreateDocumentMutation(
    $content: String,
    $fileExtension: String,
    $listIndex: Int,
    $rowsCount: Int,
    $title: String,
  ) {
    createDocument(
      content: $content,
      fileExtension: $fileExtension,
      listIndex: $listIndex,
      rowsCount: $rowsCount,
      title: $title,
    ) {
      id
    }
  }
`)

export const UPDATE_DOCUMENT_MUTATION = gql(/* GraphQL */ `
  mutation UpdateDocumentMutation(
    $id: String
    $content: String,
    $fileExtension: String,
    $rowsCount: Int,
    $title: String,
  ) {
    updateDocument(
      id: $id,
      content: $content,
      fileExtension: $fileExtension,
      rowsCount: $rowsCount,
      title: $title,
    ) {
      id
    }
  }
`)