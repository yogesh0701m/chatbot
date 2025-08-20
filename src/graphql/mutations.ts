import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      updated_at
    }
  }
`;

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chat_id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $chat_id }, _set: { title: $title }) {
      id
      title
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chat_id: uuid!) {
    delete_chats_by_pk(id: $chat_id) {
      id
    }
  }
`;

export const SEND_USER_MESSAGE = gql`
  mutation SendUserMessage($chat_id: uuid!, $content: String!) {
    insert_messages_one(
      object: { chat_id: $chat_id, role: "user", content: $content, sender_id: "X-Hasura-User-Id" }
    ) {
      id
      role
      content
      created_at
    }
  }
`;

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessageAction($chat_id: uuid!, $content: String!) {
    sendMessage(chat_id: $chat_id, content: $content) {
      message_id
      reply_message_id
      reply_content
    }
  }
`;