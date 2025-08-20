import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      updated_at
      created_at
      # messages_aggregate फील्ड हटा दें
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      role
      content
      created_at
      sender_id
    }
  }
`;

export const GET_CHAT_DETAILS = gql`
  query GetChatDetails($chat_id: uuid!) {
    chats_by_pk(id: $chat_id) {
      id
      title
      created_at
      updated_at
      owner_id
    }
  }
`;