import { gql } from '@apollo/client';

export const SUBSCRIBE_TO_CHATS = gql`
  subscription SubscribeToChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      updated_at
      created_at
      
    }
  }
`;

export const SUBSCRIBE_TO_MESSAGES = gql`
  subscription SubscribeToMessages($chat_id: uuid!) {
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