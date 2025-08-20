# ChatBot AI - Real-time Chat Application

A modern, production-ready chatbot application built with React, Tailwind CSS, Nhost authentication, Hasura GraphQL, n8n automation, and OpenRouter AI integration.

## 🚀 Features

- **Email-based Authentication** - Secure sign-up/sign-in with Nhost
- **Real-time Messaging** - GraphQL subscriptions for instant updates
- **Row-Level Security** - Users can only access their own chats and messages
- **AI Assistant Integration** - Powered by OpenRouter's free models via n8n
- **Responsive Design** - Beautiful UI that works on all devices
- **Chat Management** - Create, select, and delete chat conversations
- **Optimistic Updates** - Smooth UX with immediate message display

## 🏗️ Architecture

```
Frontend (Netlify) → Nhost Auth → Hasura GraphQL → n8n Workflow → OpenRouter AI
```

- **Frontend**: React + Vite + Tailwind CSS + Apollo Client
- **Authentication**: Nhost (email/password only)
- **Database & API**: Hasura GraphQL with PostgreSQL
- **AI Integration**: n8n workflows calling OpenRouter
- **Hosting**: Netlify with environment variables

## 🛠️ Setup Instructions

### Prerequisites

1. **Nhost Account**: Sign up at [nhost.io](https://nhost.io)
2. **n8n Instance**: Deploy n8n (cloud or self-hosted)
3. **OpenRouter API Key**: Get free API key at [openrouter.ai](https://openrouter.ai)
4. **Netlify Account**: For frontend hosting

### 1. Nhost Setup

1. Create a new Nhost project
2. Configure authentication settings:
   - Enable email/password authentication
   - Disable email confirmation (for development)
   - Set default user role to `user`
3. Note your subdomain and region

### 2. Database Schema

Execute this SQL in your Nhost database:

```sql
-- Create tables
CREATE TABLE public.chats (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL,
  title        text NOT NULL DEFAULT 'New Chat',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id      uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id    uuid NOT NULL,
  role         text NOT NULL CHECK (role IN ('user','assistant')),
  content      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX ON public.messages (chat_id, created_at DESC);

-- Auto-update chat timestamp when messages are added
CREATE OR REPLACE FUNCTION public.touch_chat_updated_at() RETURNS trigger AS $$
BEGIN
  UPDATE public.chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_messages_touch_chat
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.touch_chat_updated_at();
```

### 3. Hasura Permissions

Set up these permissions for the `user` role:

**chats table:**
- **Select**: Filter `owner_id = X-Hasura-User-Id`
- **Insert**: Check `owner_id = X-Hasura-User-Id`, preset `owner_id` from session
- **Update**: Filter `owner_id = X-Hasura-User-Id`, allow `title` column
- **Delete**: Filter `owner_id = X-Hasura-User-Id`

**messages table:**
- **Select**: Filter via relationship `chat.owner_id = X-Hasura-User-Id`
- **Insert**: Check chat ownership + role validation + sender_id matching

### 4. Hasura Action

Create a new action `sendMessage`:

```graphql
type Mutation {
  sendMessage(chat_id: uuid!, content: String!): SendMessageOutput!
}

type SendMessageOutput {
  message_id: uuid!
  reply_message_id: uuid!
  reply_content: String!
}
```

Handler URL: Your n8n webhook URL
Permissions: Only `user` role
Forward client headers: Enabled

### 5. n8n Workflow

Import this workflow structure:

1. **Webhook** - Receives POST with `{chat_id, content}`
2. **Function** - Validate headers and extract user ID
3. **HTTP Request** - Check chat ownership via Hasura
4. **HTTP Request** - Call OpenRouter API
5. **HTTP Request** - Insert assistant message via Hasura
6. **Respond** - Return action result

### 6. Frontend Deployment

1. Fork/clone this repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values:

```env
VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
VITE_NHOST_REGION=us-east-1
```

4. Deploy to Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

## 🔒 Security Features

- **JWT-based authentication** with automatic token refresh
- **Row-Level Security** ensures data isolation between users
- **Session validation** in n8n workflows
- **CORS protection** and secure headers
- **No direct API key exposure** to frontend

## 📱 Mobile Support

- Responsive design with mobile-first approach
- Touch-friendly interface with proper tap targets
- Collapsible sidebar for mobile navigation
- Optimized for various screen sizes

## 🎨 Design Features

- **Glass-morphism effects** with backdrop blur
- **Smooth animations** using Framer Motion
- **Gradient backgrounds** and modern color palette
- **Loading states** and skeleton screens
- **Toast notifications** for user feedback
- **Dark mode ready** (can be extended)

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance

- **Code splitting** for optimal bundle size
- **GraphQL subscriptions** for real-time updates
- **Optimistic updates** for immediate UI feedback
- **Lazy loading** of components
- **Efficient re-renders** with proper memoization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Review the setup documentation
3. Create a new issue with detailed information

---

**Built with ❤️ using modern web technologies**