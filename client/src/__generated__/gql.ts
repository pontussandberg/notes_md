/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  mutation CreateDocumentMutation(\n    $content: String,\n    $fileExtension: String,\n    $listIndex: Int,\n    $rowsCount: Int,\n    $title: String,\n  ) {\n    createDocument(\n      content: $content,\n      fileExtension: $fileExtension,\n      listIndex: $listIndex,\n      rowsCount: $rowsCount,\n      title: $title,\n    ) {\n      id\n    }\n  }\n": types.CreateDocumentMutationDocument,
    "\n  mutation UpdateDocumentMutation(\n    $id: String\n    $content: String,\n    $fileExtension: String,\n    $rowsCount: Int,\n    $title: String,\n  ) {\n    updateDocument(\n      id: $id,\n      content: $content,\n      fileExtension: $fileExtension,\n      rowsCount: $rowsCount,\n      title: $title,\n    ) {\n      id\n      content\n      fileExtension\n      title\n      listIndex\n      rowsCount\n    }\n  }\n": types.UpdateDocumentMutationDocument,
    "\n  query GetDocumentContainerQuery($id: String) {\n    document(id: $id) {\n      id\n    }\n  }\n": types.GetDocumentContainerQueryDocument,
    "\n  query GetDocumentRenderQuery($id: String) {\n    document(id: $id) {\n      id\n      title\n      content\n    }\n  }\n": types.GetDocumentRenderQueryDocument,
    "\n  query GetDocumentMdRenderQuery($id: String) {\n    document(id: $id) {\n      id\n      content\n    }\n  }\n": types.GetDocumentMdRenderQueryDocument,
    "\n  query GetDocumentsMenuQuery {\n    documents {\n      id\n      title\n      content\n      rowsCount\n    }\n  }\n": types.GetDocumentsMenuQueryDocument,
    "\n  query GetDocumentsMenuDrawerQuery {\n    documents {\n      id\n      title\n      content\n    }\n  }\n": types.GetDocumentsMenuDrawerQueryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateDocumentMutation(\n    $content: String,\n    $fileExtension: String,\n    $listIndex: Int,\n    $rowsCount: Int,\n    $title: String,\n  ) {\n    createDocument(\n      content: $content,\n      fileExtension: $fileExtension,\n      listIndex: $listIndex,\n      rowsCount: $rowsCount,\n      title: $title,\n    ) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateDocumentMutation(\n    $content: String,\n    $fileExtension: String,\n    $listIndex: Int,\n    $rowsCount: Int,\n    $title: String,\n  ) {\n    createDocument(\n      content: $content,\n      fileExtension: $fileExtension,\n      listIndex: $listIndex,\n      rowsCount: $rowsCount,\n      title: $title,\n    ) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateDocumentMutation(\n    $id: String\n    $content: String,\n    $fileExtension: String,\n    $rowsCount: Int,\n    $title: String,\n  ) {\n    updateDocument(\n      id: $id,\n      content: $content,\n      fileExtension: $fileExtension,\n      rowsCount: $rowsCount,\n      title: $title,\n    ) {\n      id\n      content\n      fileExtension\n      title\n      listIndex\n      rowsCount\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateDocumentMutation(\n    $id: String\n    $content: String,\n    $fileExtension: String,\n    $rowsCount: Int,\n    $title: String,\n  ) {\n    updateDocument(\n      id: $id,\n      content: $content,\n      fileExtension: $fileExtension,\n      rowsCount: $rowsCount,\n      title: $title,\n    ) {\n      id\n      content\n      fileExtension\n      title\n      listIndex\n      rowsCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDocumentContainerQuery($id: String) {\n    document(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  query GetDocumentContainerQuery($id: String) {\n    document(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDocumentRenderQuery($id: String) {\n    document(id: $id) {\n      id\n      title\n      content\n    }\n  }\n"): (typeof documents)["\n  query GetDocumentRenderQuery($id: String) {\n    document(id: $id) {\n      id\n      title\n      content\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDocumentMdRenderQuery($id: String) {\n    document(id: $id) {\n      id\n      content\n    }\n  }\n"): (typeof documents)["\n  query GetDocumentMdRenderQuery($id: String) {\n    document(id: $id) {\n      id\n      content\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDocumentsMenuQuery {\n    documents {\n      id\n      title\n      content\n      rowsCount\n    }\n  }\n"): (typeof documents)["\n  query GetDocumentsMenuQuery {\n    documents {\n      id\n      title\n      content\n      rowsCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDocumentsMenuDrawerQuery {\n    documents {\n      id\n      title\n      content\n    }\n  }\n"): (typeof documents)["\n  query GetDocumentsMenuDrawerQuery {\n    documents {\n      id\n      title\n      content\n    }\n  }\n"];

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
**/
export function gql(source: string): unknown;

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;