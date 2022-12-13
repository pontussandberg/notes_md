/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type DocumentFile = {
  __typename?: 'DocumentFile';
  content: Scalars['String'];
  fileExtension: Scalars['String'];
  id: Scalars['String'];
  listIndex: Scalars['Int'];
  rowsCount: Scalars['Int'];
  title: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createDocument?: Maybe<DocumentFile>;
  updateDocument?: Maybe<DocumentFile>;
};


export type MutationCreateDocumentArgs = {
  content?: InputMaybe<Scalars['String']>;
  fileExtension?: InputMaybe<Scalars['String']>;
  listIndex?: InputMaybe<Scalars['Int']>;
  rowsCount?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateDocumentArgs = {
  content?: InputMaybe<Scalars['String']>;
  fileExtension?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  listIndex?: InputMaybe<Scalars['Int']>;
  rowsCount?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  document?: Maybe<DocumentFile>;
  documents: Array<DocumentFile>;
};


export type QueryDocumentArgs = {
  id?: InputMaybe<Scalars['String']>;
};

export type CreateDocumentMutationMutationVariables = Exact<{
  content?: InputMaybe<Scalars['String']>;
  fileExtension?: InputMaybe<Scalars['String']>;
  listIndex?: InputMaybe<Scalars['Int']>;
  rowsCount?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
}>;


export type CreateDocumentMutationMutation = { __typename?: 'Mutation', createDocument?: { __typename?: 'DocumentFile', id: string } | null };

export type UpdateDocumentMutationMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<Scalars['String']>;
  fileExtension?: InputMaybe<Scalars['String']>;
  rowsCount?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
}>;


export type UpdateDocumentMutationMutation = { __typename?: 'Mutation', updateDocument?: { __typename?: 'DocumentFile', id: string, content: string, fileExtension: string, title: string, listIndex: number, rowsCount: number } | null };

export type GetDocumentRenderQueryQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
}>;


export type GetDocumentRenderQueryQuery = { __typename?: 'Query', document?: { __typename?: 'DocumentFile', id: string, title: string, content: string } | null };

export type GetDocumentMdRenderQueryQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
}>;


export type GetDocumentMdRenderQueryQuery = { __typename?: 'Query', document?: { __typename?: 'DocumentFile', id: string, content: string } | null };

export type GetDocumentsMenuQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDocumentsMenuQueryQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'DocumentFile', id: string, title: string, content: string, rowsCount: number }> };

export type GetDocumentsMenuDrawerQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDocumentsMenuDrawerQueryQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'DocumentFile', id: string, title: string, content: string }> };


export const CreateDocumentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDocumentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileExtension"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listIndex"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rowsCount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}},{"kind":"Argument","name":{"kind":"Name","value":"fileExtension"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileExtension"}}},{"kind":"Argument","name":{"kind":"Name","value":"listIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listIndex"}}},{"kind":"Argument","name":{"kind":"Name","value":"rowsCount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rowsCount"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateDocumentMutationMutation, CreateDocumentMutationMutationVariables>;
export const UpdateDocumentMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDocumentMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileExtension"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rowsCount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}},{"kind":"Argument","name":{"kind":"Name","value":"fileExtension"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileExtension"}}},{"kind":"Argument","name":{"kind":"Name","value":"rowsCount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rowsCount"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"fileExtension"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"listIndex"}},{"kind":"Field","name":{"kind":"Name","value":"rowsCount"}}]}}]}}]} as unknown as DocumentNode<UpdateDocumentMutationMutation, UpdateDocumentMutationMutationVariables>;
export const GetDocumentRenderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDocumentRenderQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"document"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<GetDocumentRenderQueryQuery, GetDocumentRenderQueryQueryVariables>;
export const GetDocumentMdRenderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDocumentMdRenderQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"document"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<GetDocumentMdRenderQueryQuery, GetDocumentMdRenderQueryQueryVariables>;
export const GetDocumentsMenuQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDocumentsMenuQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"rowsCount"}}]}}]}}]} as unknown as DocumentNode<GetDocumentsMenuQueryQuery, GetDocumentsMenuQueryQueryVariables>;
export const GetDocumentsMenuDrawerQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDocumentsMenuDrawerQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<GetDocumentsMenuDrawerQueryQuery, GetDocumentsMenuDrawerQueryQueryVariables>;