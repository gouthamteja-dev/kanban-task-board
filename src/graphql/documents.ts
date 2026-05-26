import { gql } from '@apollo/client';

export const TAG_FIELDS = gql`
  fragment TagFields on Tag {
    id
    boardId
    label
    color
  }
`;

export const CARD_FIELDS = gql`
  fragment CardFields on Card {
    id
    boardId
    columnId
    title
    description
    priority
    dueDate
    order
    createdAt
    isOverdue
    tags {
      ...TagFields
    }
  }
  ${TAG_FIELDS}
`;

export const COLUMN_FIELDS = gql`
  fragment ColumnFields on Column {
    id
    boardId
    title
    order
  }
`;

export const BOARD_QUERY = gql`
  query BoardQuery {
    boards {
      id
      title
      columns {
        ...ColumnFields
      }
      tags {
        ...TagFields
      }
    }
  }
  ${COLUMN_FIELDS}
  ${TAG_FIELDS}
`;

export const COLUMN_CARDS_QUERY = gql`
  query ColumnCards($columnId: ID!, $first: Int!, $after: String, $filter: CardFilterInput) {
    columnCards(columnId: $columnId, first: $first, after: $after, filter: $filter) {
      totalCount
      nodes {
        ...CardFields
      }
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${CARD_FIELDS}
`;

export const CREATE_BOARD_MUTATION = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      title
      columns {
        ...ColumnFields
      }
      tags {
        ...TagFields
      }
    }
  }
  ${COLUMN_FIELDS}
  ${TAG_FIELDS}
`;

export const CREATE_COLUMN_MUTATION = gql`
  mutation CreateColumn($input: CreateColumnInput!) {
    createColumn(input: $input) {
      ...ColumnFields
    }
  }
  ${COLUMN_FIELDS}
`;

export const UPDATE_COLUMN_MUTATION = gql`
  mutation UpdateColumn($input: UpdateColumnInput!) {
    updateColumn(input: $input) {
      ...ColumnFields
    }
  }
  ${COLUMN_FIELDS}
`;

export const DELETE_COLUMN_MUTATION = gql`
  mutation DeleteColumn($id: ID!) {
    deleteColumn(id: $id) {
      id
    }
  }
`;

export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      ...TagFields
    }
  }
  ${TAG_FIELDS}
`;

export const CREATE_CARD_MUTATION = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      ...CardFields
    }
  }
  ${CARD_FIELDS}
`;

export const UPDATE_CARD_MUTATION = gql`
  mutation UpdateCard($input: UpdateCardInput!) {
    updateCard(input: $input) {
      ...CardFields
    }
  }
  ${CARD_FIELDS}
`;

export const DELETE_CARD_MUTATION = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      id
      columnId
    }
  }
`;

export const MOVE_CARD_MUTATION = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveCard(input: $input) {
      ...CardFields
    }
  }
  ${CARD_FIELDS}
`;

export const REORDER_CARDS_MUTATION = gql`
  mutation ReorderCards($input: ReorderCardsInput!) {
    reorderCards(input: $input) {
      ...ColumnFields
    }
  }
  ${COLUMN_FIELDS}
`;

export const REORDER_COLUMNS_MUTATION = gql`
  mutation ReorderColumns($input: ReorderColumnsInput!) {
    reorderColumns(input: $input) {
      id
      columns {
        ...ColumnFields
      }
    }
  }
  ${COLUMN_FIELDS}
`;

export const SEARCH_QUERY = gql`
  query Search($boardId: ID!, $term: String!) {
    search(boardId: $boardId, term: $term) {
      __typename
      ... on Board {
        id
        title
      }
      ... on Column {
        id
        title
      }
      ... on Card {
        id
        title
        description
      }
    }
  }
`;
