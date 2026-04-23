# Cosmray AI Features Design

## Overview

Cosmray is a digital human (AI agent) creation and management platform. Currently it supports user authentication and agent CRUD. This design adds three core features: AI conversation with streaming, knowledge graph from document upload, and intelligent context-aware dialogue.

## Technology Choices

- **LLM**: OpenAI (GPT-4/GPT-3.5) via LangChain
- **Knowledge Graph**: Neo4j for entity-relationship storage and querying
- **Streaming**: SSE (Server-Sent Events) for real-time token delivery
- **Document Formats**: TXT and Markdown
- **Conversation Model**: Multi-conversation per agent, with full message history

## Database Schema

### MySQL New Tables

**conversations**

| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | Primary key |
| agent_id | INT FK -> agents.id | Associated agent |
| user_id | INT FK -> users.id | Owner user |
| title | VARCHAR(200) | Conversation title (first 20 chars of first message) |
| is_active | BOOLEAN DEFAULT TRUE | Soft delete flag |
| created_at | DATETIME DEFAULT NOW() | Creation time |
| updated_at | DATETIME DEFAULT NOW() ON UPDATE | Last update time |

**messages**

| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | Primary key |
| conversation_id | INT FK -> conversations.id | Parent conversation |
| role | ENUM('user', 'assistant', 'system') | Message role |
| content | TEXT | Message content |
| tokens_used | INT NULLABLE | Token consumption for stats |
| created_at | DATETIME DEFAULT NOW() | Creation time |

### Neo4j Graph Schema

- **Nodes**: `Document`, `Entity`, `Concept`
- **Relationships**: `CONTAINS` (Document -> Entity), `RELATED_TO` (Entity -> Entity), `BELONGS_TO` (Entity -> Concept)

## Backend Architecture

### New Dependencies

```
langchain>=0.1.0
langchain-openai>=0.1.0
neo4j>=5.0
sse-starlette
python-multipart
```

### New API Endpoints

**Chat** (`/api/v1/chat`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat/conversations` | Create new conversation |
| GET | `/chat/conversations?agent_id=X` | List conversations for an agent |
| GET | `/chat/conversations/{id}/messages` | Get message history |
| DELETE | `/chat/conversations/{id}` | Delete conversation |
| POST | `/chat/conversations/{id}/stream` | SSE streaming chat (core endpoint) |

**Knowledge** (`/api/v1/knowledge`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/knowledge/upload` | Upload TXT/MD file |
| GET | `/knowledge/documents` | List uploaded documents |
| DELETE | `/knowledge/documents/{id}` | Delete document |
| POST | `/knowledge/query` | Query knowledge graph |

### Service Layer

```
app/
  services/
    chat_service.py       # Conversation management (create/list/history)
    llm_service.py        # LangChain + OpenAI wrapper, SSE streaming
    knowledge_service.py  # Document parsing + Neo4j graph build + query
  repositories/
    conversation_repo.py  # Conversation and message DB operations
    knowledge_repo.py     # Neo4j operations wrapper
```

### Chat Stream Data Flow

```
User sends message -> POST /chat/conversations/{id}/stream
  -> ChatService loads conversation history + agent config
  -> LLMService builds LangChain Chain (injects system_prompt, temperature)
  -> If knowledge graph exists -> KnowledgeService retrieves relevant entities as context
  -> LangChain calls OpenAI API (stream=True)
  -> SSE delivers chunks to frontend
  -> After stream ends, save user message + AI reply to messages table
```

## Frontend Architecture

### New Pages

**Chat Page** (`/chat/[agentId]`)
- Left sidebar: conversation list (create/switch/delete)
- Right panel: chat interface (message bubbles + input)
- SSE typewriter effect for AI responses
- Header shows current agent name and description

**Knowledge Page** (`/knowledge`)
- Document upload area (drag-and-drop for TXT/MD)
- Uploaded document list (with delete)
- Knowledge graph visualization (basic node-relationship display)

### Modified Pages

- **Home page** (`HomeClient.tsx`): Click agent card navigates to `/chat/[agentId]` instead of alert
- **Profile page**: Conversations tab shows real conversation history
- **Agent creation**: Optional "knowledge base" step for associating documents

### New Frontend Files

```
app/
  chat/
    [agentId]/
      page.tsx
      ChatPanel.tsx
      ConversationList.tsx
      MessageBubble.tsx
      ChatInput.tsx
  knowledge/
    page.tsx
  services/
    chatService.ts
    knowledgeService.ts
  hooks/
    useSSE.ts
    useChat.ts
```

## Implementation Phases

### Phase 1 -- Basic AI Conversation (Core Skeleton)

Goal: Users can have multi-turn streaming conversations with digital humans.

Backend:
1. Install dependencies: langchain, langchain-openai, sse-starlette, python-multipart
2. Database migration: add conversations and messages tables
3. Implement ConversationRepo (conversation/message CRUD)
4. Implement LLMService (LangChain + OpenAI, inject agent's system_prompt, temperature)
5. Implement ChatService (combine conversation history + LLM call)
6. Implement SSE streaming endpoint POST /chat/conversations/{id}/stream
7. Implement conversation CRUD endpoints

Frontend:
1. Implement useSSE hook (EventSource wrapper)
2. Implement useChat hook (conversation state management)
3. Implement chat page /chat/[agentId] (ChatPanel + ConversationList + MessageBubble + ChatInput)
4. Implement chatService.ts (API calls)
5. Modify home page: click agent navigates to chat page

### Phase 2 -- Knowledge Graph (Document Upload + Neo4j)

Goal: Upload documents, auto-extract entities and relationships, build knowledge graph.

Backend:
1. Install dependencies: neo4j, document parsing library
2. Configure Neo4j connection
3. Implement KnowledgeRepo (Neo4j CRUD operations)
4. Implement document parsing (TXT/MD -> text -> chunking -> LLM entity/relation extraction -> store in Neo4j)
5. Implement KnowledgeService (upload + parse + graph build + query)
6. Implement knowledge API endpoints (upload, list, delete, query)

Frontend:
1. Implement knowledge management page /knowledge
2. Implement knowledgeService.ts
3. File upload component (drag-and-drop)
4. Document list and delete functionality

### Phase 3 -- Intelligent Conversation Enhancement

Goal: Automatically query knowledge graph during conversation and inject context.

Backend:
1. Integrate KnowledgeService into ChatService: retrieve relevant entities based on user message
2. Inject retrieval results as additional context into LangChain prompt
3. Associate knowledge base with agent model (agent -> documents relationship)

Frontend:
1. Add knowledge source indicators in chat (show referenced knowledge nodes)
2. Add optional "associate knowledge base" step in agent creation flow
