# Phase 1: Basic AI Conversation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to have multi-turn streaming conversations with their digital humans via LangChain + OpenAI + SSE.

**Architecture:** Backend adds conversation/message models, LangChain-based LLM service, and SSE streaming endpoint. Frontend adds a chat page with conversation list, message bubbles, and typewriter-effect SSE input. Existing agent click handlers are updated to navigate to the new chat page.

**Tech Stack:** LangChain 0.1+, langchain-openai 0.1+, sse-starlette 1.x, OpenAI GPT-4/GPT-3.5, Next.js 15 dynamic routes, EventSource API

---

## Task 1: Add backend dependencies

**Files:**
- Modify: `backend/requirements.txt`

**Step 1: Add new dependencies to requirements.txt**

Append these lines to `backend/requirements.txt`:

```
langchain>=0.1.0
langchain-openai>=0.1.0
sse-starlette>=1.6.0
```

Note: `python-multipart==0.0.6` is already present (needed later for file upload).

**Step 2: Install dependencies**

Run: `cd backend && pip install -r requirements.txt`
Expected: All packages install successfully.

**Step 3: Commit**

```bash
git add requirements.txt
git commit -m "chore: add langchain, langchain-openai, sse-starlette dependencies"
```

---

## Task 2: Create conversation and message database models

**Files:**
- Create: `backend/app/models/conversation.py`
- Modify: `backend/alembic/env.py`

**Step 1: Create the Conversation and Message models**

Create `backend/app/models/conversation.py`:

```python
"""Conversation and Message models"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(Enum("user", "assistant", "system", name="message_role_enum"), nullable=False)
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**Step 2: Register models in alembic/env.py**

In `backend/alembic/env.py`, after line 11 (`from app.models.agent import Agent`), add:

```python
from app.models.conversation import Conversation, Message  # noqa: F401
```

**Step 3: Generate migration**

Run: `cd backend && alembic revision --autogenerate -m "add conversations and messages tables"`
Expected: Migration file created with `conversations` and `messages` table creation.

**Step 4: Run migration**

Run: `cd backend && alembic upgrade head`
Expected: Tables created in database.

**Step 5: Commit**

```bash
git add app/models/conversation.py alembic/env.py alembic/versions/
git commit -m "feat: add conversation and message database models"
```

---

## Task 3: Create Pydantic schemas for conversation

**Files:**
- Create: `backend/app/schemas/conversation.py`

**Step 1: Create conversation schemas**

Create `backend/app/schemas/conversation.py`:

```python
"""Conversation and message schemas"""
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ConversationCreate(BaseModel):
    agent_id: int
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    agent_id: int
    user_id: int
    title: Optional[str]
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: MessageRole
    content: str
    tokens_used: Optional[int]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    content: str


class ConversationListRequest(BaseModel):
    agent_id: Optional[int] = None
    skip: int = 0
    limit: int = 50


class ConversationIdRequest(BaseModel):
    conversation_id: int
```

**Step 2: Commit**

```bash
git add app/schemas/conversation.py
git commit -m "feat: add conversation and message pydantic schemas"
```

---

## Task 4: Create conversation repository

**Files:**
- Create: `backend/app/repositories/__init__.py`
- Create: `backend/app/repositories/conversation_repo.py`

**Step 1: Create repositories directory**

Run: `mkdir -p backend/app/repositories`

**Step 2: Create __init__.py**

Create `backend/app/repositories/__init__.py`:

```python
from app.repositories.conversation_repo import ConversationRepository, conversation_repository

__all__ = ["ConversationRepository", "conversation_repository"]
```

**Step 3: Create conversation repository**

Create `backend/app/repositories/conversation_repo.py`:

```python
"""Conversation CRUD operations"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.conversation import Conversation, Message
from app.schemas.conversation import ConversationCreate


class ConversationRepository:
    def get_conversation_by_id(self, db: Session, conversation_id: int) -> Optional[Conversation]:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_conversations_by_agent(self, db: Session, agent_id: int, user_id: int, skip: int = 0, limit: int = 50) -> List[Conversation]:
        return (
            db.query(Conversation)
            .filter(Conversation.agent_id == agent_id, Conversation.user_id == user_id, Conversation.is_active == True)
            .order_by(Conversation.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_conversations_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[Conversation]:
        return (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id, Conversation.is_active == True)
            .order_by(Conversation.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_conversation(self, db: Session, conv_create: ConversationCreate, user_id: int) -> Conversation:
        conv = Conversation(
            agent_id=conv_create.agent_id,
            user_id=user_id,
            title=conv_create.title,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    def delete_conversation(self, db: Session, conversation_id: int) -> bool:
        conv = self.get_conversation_by_id(db, conversation_id)
        if not conv:
            return False
        conv.is_active = False
        db.commit()
        return True

    def get_messages(self, db: Session, conversation_id: int, skip: int = 0, limit: int = 100) -> List[Message]:
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def add_message(self, db: Session, conversation_id: int, role: str, content: str, tokens_used: int = None) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tokens_used=tokens_used,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    def update_conversation_title(self, db: Session, conversation_id: int, title: str) -> Optional[Conversation]:
        conv = self.get_conversation_by_id(db, conversation_id)
        if not conv:
            return None
        conv.title = title
        db.commit()
        db.refresh(conv)
        return conv


conversation_repository = ConversationRepository()
```

**Step 4: Commit**

```bash
git add app/repositories/
git commit -m "feat: add conversation repository with CRUD operations"
```

---

## Task 5: Create LLM service (LangChain + OpenAI + streaming)

**Files:**
- Create: `backend/app/services/llm_service.py`
- Modify: `backend/.env` (add OPENAI_API_KEY)

**Step 1: Create LLM service**

Create `backend/app/services/llm_service.py`:

```python
"""LLM service using LangChain + OpenAI with streaming support"""
import os
from typing import AsyncGenerator, List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


class LLMService:
    def __init__(self):
        self._api_key = os.getenv("OPENAI_API_KEY")
        self._model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

    def _get_chat_model(self, temperature: float = 0.7, max_tokens: int = 2048) -> ChatOpenAI:
        return ChatOpenAI(
            api_key=self._api_key,
            model=self._model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            streaming=True,
        )

    def build_messages(
        self,
        system_prompt: str,
        history: List[Dict[str, str]],
        user_message: str,
    ) -> List:
        """Build LangChain message list from history and current input."""
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=user_message))
        return messages

    async def stream_chat(
        self,
        system_prompt: str,
        history: List[Dict[str, str]],
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        """Stream chat tokens as an async generator."""
        chat_model = self._get_chat_model(temperature=temperature, max_tokens=max_tokens)
        messages = self.build_messages(system_prompt, history, user_message)

        full_response = ""
        async for chunk in chat_model.astream(messages):
            token = chunk.content
            if token:
                full_response += token
                yield token

    async def chat(
        self,
        system_prompt: str,
        history: List[Dict[str, str]],
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """Non-streaming chat, returns full response."""
        chat_model = self._get_chat_model(temperature=temperature, max_tokens=max_tokens)
        chat_model.streaming = False
        messages = self.build_messages(system_prompt, history, user_message)
        response = await chat_model.ainvoke(messages)
        return response.content


llm_service = LLMService()
```

**Step 2: Add environment variable**

Add to `backend/.env`:

```
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

Also add to `backend/.env.example`:

```
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Step 3: Commit**

```bash
git add app/services/llm_service.py .env.example
git commit -m "feat: add LLM service with LangChain streaming support"
```

---

## Task 6: Create chat service

**Files:**
- Create: `backend/app/services/chat_service.py`

**Step 1: Create chat service**

Create `backend/app/services/chat_service.py`:

```python
"""Chat service: orchestrates conversation management and LLM calls"""
from typing import List, AsyncGenerator, Optional
from sqlalchemy.orm import Session
from app.repositories.conversation_repo import conversation_repository
from app.services.llm_service import llm_service
from app.schemas.conversation import ConversationCreate, ConversationResponse, MessageResponse
from app.models.agent import Agent
from app.agent_repo.agent import AgentRepository
from app.core.exceptions import NotFoundException, ErrorCode


agent_repository = AgentRepository()


class ChatService:

    def create_conversation(self, db: Session, conv_create: ConversationCreate, user_id: int) -> ConversationResponse:
        # Verify agent exists and belongs to user
        agent = agent_repository.get_agent_by_id(db, conv_create.agent_id)
        if not agent:
            raise NotFoundException("Agent not found", ErrorCode.AGENT_NOT_FOUND)
        if agent.user_id != user_id:
            raise NotFoundException("Agent not found", ErrorCode.AGENT_NOT_FOUND)

        conv = conversation_repository.create_conversation(db, conv_create, user_id)
        return ConversationResponse.model_validate(conv)

    def get_conversations(self, db: Session, agent_id: Optional[int], user_id: int, skip: int = 0, limit: int = 50) -> List[ConversationResponse]:
        if agent_id:
            convs = conversation_repository.get_conversations_by_agent(db, agent_id, user_id, skip, limit)
        else:
            convs = conversation_repository.get_conversations_by_user(db, user_id, skip, limit)
        return [ConversationResponse.model_validate(c) for c in convs]

    def get_messages(self, db: Session, conversation_id: int) -> List[MessageResponse]:
        messages = conversation_repository.get_messages(db, conversation_id)
        return [MessageResponse.model_validate(m) for m in messages]

    def delete_conversation(self, db: Session, conversation_id: int, user_id: int) -> bool:
        conv = conversation_repository.get_conversation_by_id(db, conversation_id)
        if not conv or conv.user_id != user_id:
            raise NotFoundException("Conversation not found", ErrorCode.PARAM_ERROR)
        return conversation_repository.delete_conversation(db, conversation_id)

    async def stream_chat(
        self,
        db: Session,
        conversation_id: int,
        user_id: int,
        user_message: str,
    ) -> AsyncGenerator[str, None]:
        """Stream chat response and persist messages."""
        # Validate conversation
        conv = conversation_repository.get_conversation_by_id(db, conversation_id)
        if not conv or conv.user_id != user_id:
            raise NotFoundException("Conversation not found", ErrorCode.PARAM_ERROR)

        # Get agent config
        agent = agent_repository.get_agent_by_id(db, conv.agent_id)
        if not agent:
            raise NotFoundException("Agent not found", ErrorCode.AGENT_NOT_FOUND)

        # Auto-title on first message
        if not conv.title:
            title = user_message[:20] + ("..." if len(user_message) > 20 else "")
            conversation_repository.update_conversation_title(db, conversation_id, title)

        # Save user message
        conversation_repository.add_message(db, conversation_id, "user", user_message)

        # Build history
        history_msgs = conversation_repository.get_messages(db, conversation_id)
        history = [{"role": m.role, "content": m.content} for m in history_msgs[:-1]]

        # Stream response
        full_response = ""
        async for token in llm_service.stream_chat(
            system_prompt=agent.system_prompt or f"You are {agent.name}, a helpful AI assistant.",
            history=history,
            user_message=user_message,
            temperature=agent.temperature or 0.7,
            max_tokens=agent.max_tokens or 2048,
        ):
            full_response += token
            yield token

        # Save assistant response after stream completes
        conversation_repository.add_message(db, conversation_id, "assistant", full_response)


chat_service = ChatService()
```

**Step 2: Commit**

```bash
git add app/services/chat_service.py
git commit -m "feat: add chat service with streaming and conversation management"
```

---

## Task 7: Create chat API routes (including SSE endpoint)

**Files:**
- Create: `backend/app/api/routes/chat.py`
- Modify: `backend/app/api/routes/__init__.py`

**Step 1: Create chat routes**

Create `backend/app/api/routes/chat.py`:

```python
"""Chat API routes"""
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
from app.schemas.conversation import (
    ConversationCreate, ConversationResponse, ConversationListRequest,
    ConversationIdRequest, MessageResponse, ChatRequest,
)
from app.schemas.response import ApiResponse
from app.schemas.user import UserResponse
from app.core.auth import get_current_user
from app.core.database import get_db
from app.services.chat_service import chat_service

router = APIRouter()


@router.post("/conversations", response_model=ApiResponse[ConversationResponse])
async def create_conversation(
    conv_create: ConversationCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = chat_service.create_conversation(db, conv_create, current_user.id)
    return ApiResponse.success(data=conv)


@router.post("/conversations/list", response_model=ApiResponse[list[ConversationResponse]])
async def list_conversations(
    req: ConversationListRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = chat_service.get_conversations(db, req.agent_id, current_user.id, req.skip, req.limit)
    return ApiResponse.success(data=convs)


@router.get("/conversations/{conversation_id}/messages", response_model=ApiResponse[list[MessageResponse]])
async def get_messages(
    conversation_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = chat_service.get_messages(db, conversation_id)
    return ApiResponse.success(data=messages)


@router.post("/conversations/delete", response_model=ApiResponse[bool])
async def delete_conversation(
    req: ConversationIdRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = chat_service.delete_conversation(db, req.conversation_id, current_user.id)
    return ApiResponse.success(data=success)


@router.post("/conversations/{conversation_id}/stream")
async def stream_chat(
    conversation_id: int,
    chat_request: ChatRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SSE streaming chat endpoint."""
    async def event_generator():
        try:
            async for token in chat_service.stream_chat(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user.id,
                user_message=chat_request.content,
            ):
                yield {"event": "message", "data": json.dumps({"token": token})}
            yield {"event": "done", "data": json.dumps({"status": "complete"})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
```

**Step 2: Register chat routes in __init__.py**

In `backend/app/api/routes/__init__.py`, add `chat` import and router registration. Current file:

```python
from fastapi import APIRouter
from app.api.routes import items, users, auth, agents

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
```

Change to:

```python
from fastapi import APIRouter
from app.api.routes import items, users, auth, agents, chat

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
```

**Step 3: Verify backend starts**

Run: `cd backend && python -c "from app.main import app; print('OK')"`
Expected: No import errors.

**Step 4: Commit**

```bash
git add app/api/routes/chat.py app/api/routes/__init__.py
git commit -m "feat: add chat API routes with SSE streaming endpoint"
```

---

## Task 8: Add frontend chat types

**Files:**
- Create: `frontend/app/types/chat.ts`

**Step 1: Create chat types**

Create `frontend/app/types/chat.ts`:

```typescript
export interface Conversation {
  id: number
  agent_id: number
  user_id: number
  title: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number | null
  created_at: string
}

export interface ConversationCreate {
  agent_id: number
  title?: string
}

export interface ChatRequest {
  content: string
}

export interface SSEMessageEvent {
  token: string
}

export interface SSEDoneEvent {
  status: string
}

export interface SSEErrorEvent {
  error: string
}
```

**Step 2: Commit**

```bash
git add app/types/chat.ts
git commit -m "feat: add chat TypeScript types"
```

---

## Task 9: Add frontend chat service

**Files:**
- Create: `frontend/app/services/chatService.ts`

**Step 1: Create chat service**

Create `frontend/app/services/chatService.ts`:

```typescript
import type { Conversation, Message, ConversationCreate } from '../types/chat'
import type { AgentResponse } from '../types/agent'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

function getAuthHeaders(): HeadersInit {
  const token =
    (typeof window !== 'undefined' && localStorage.getItem('access_token')) ||
    (typeof window !== 'undefined' && sessionStorage.getItem('access_token')) ||
    ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const chatService = {
  async createConversation(data: ConversationCreate): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const json = await response.json()
    return json.data
  },

  async getConversations(agentId?: number, skip = 0, limit = 50): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, skip, limit }),
    })
    const json = await response.json()
    return json.data
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const json = await response.json()
    return json.data
  },

  async deleteConversation(conversationId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversation_id: conversationId }),
    })
    const json = await response.json()
    return json.data
  },

  streamChat(
    conversationId: number,
    content: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ): () => void {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token') ||
      ''

    const controller = new AbortController()

    fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          onError(`HTTP ${response.status}`)
          return
        }
        const reader = response.body?.getReader()
        if (!reader) {
          onError('No response body')
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event: message')) {
              // next line is data
            } else if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.token) {
                  onToken(parsed.token)
                } else if (parsed.status === 'complete') {
                  onDone()
                } else if (parsed.error) {
                  onError(parsed.error)
                }
              } catch {
                // skip malformed data
              }
            }
          }
        }
        onDone()
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err.message)
        }
      })

    return () => controller.abort()
  },
}
```

**Step 2: Commit**

```bash
git add app/services/chatService.ts
git commit -m "feat: add chat service with SSE streaming support"
```

---

## Task 10: Create frontend chat page

**Files:**
- Create: `frontend/app/chat/[agentId]/page.tsx`
- Create: `frontend/app/chat/[agentId]/ConversationList.tsx`
- Create: `frontend/app/chat/[agentId]/ChatPanel.tsx`
- Create: `frontend/app/chat/[agentId]/MessageBubble.tsx`
- Create: `frontend/app/chat/[agentId]/ChatInput.tsx`

**Step 1: Create directory**

Run: `mkdir -p frontend/app/chat/[agentId]`

Note: On Windows bash, use: `mkdir -p "frontend/app/chat/[agentId]"`

**Step 2: Create MessageBubble component**

Create `frontend/app/chat/[agentId]/MessageBubble.tsx`:

```tsx
'use client'

import type { Message } from '../../types/chat'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-accent-gradient text-white rounded-br-sm'
            : 'bg-bg-secondary border border-default text-text-primary rounded-bl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span className={`text-xs mt-1 block ${isUser ? 'text-white/60' : 'text-text-muted'}`}>
          {new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
```

**Step 3: Create ChatInput component**

Create `frontend/app/chat/[agentId]/ChatInput.tsx`:

```tsx
'use client'

import { useState, KeyboardEvent } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-default bg-bg-secondary/80 backdrop-blur-xl p-4">
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-bg-tertiary border border-default rounded-xl px-4 py-3 text-text-primary text-sm resize-none focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50"
          style={{ minHeight: '44px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = Math.min(target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-5 py-3 rounded-xl bg-accent-gradient text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
        >
          发送
        </button>
      </div>
    </div>
  )
}
```

**Step 4: Create ConversationList component**

Create `frontend/app/chat/[agentId]/ConversationList.tsx`:

```tsx
'use client'

import type { Conversation } from '../../types/chat'

interface Props {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (conv: Conversation) => void
  onNew: () => void
  onDelete: (conv: Conversation) => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="w-72 border-r border-default bg-bg-secondary/50 flex flex-col h-full">
      <div className="p-4 border-b border-default">
        <button
          onClick={onNew}
          className="w-full py-2.5 rounded-lg bg-accent-gradient text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
        >
          + 新对话
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-text-muted text-sm text-center mt-8">暂无对话</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`px-4 py-3 cursor-pointer border-b border-default transition-colors group ${
                activeId === conv.id
                  ? 'bg-bg-tertiary border-l-2 border-l-accent-primary'
                  : 'hover:bg-bg-tertiary/50'
              }`}
              onClick={() => onSelect(conv)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary truncate flex-1">
                  {conv.title || '新对话'}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv) }}
                  className="text-text-muted hover:text-error text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-2"
                >
                  x
                </button>
              </div>
              <span className="text-xs text-text-muted">
                {new Date(conv.updated_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 5: Create ChatPanel component**

Create `frontend/app/chat/[agentId]/ChatPanel.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '../../types/chat'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface Props {
  messages: Message[]
  streamingContent: string
  isStreaming: boolean
  agentName: string
  onSend: (content: string) => void
}

export function ChatPanel({ messages, streamingContent, isStreaming, agentName, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default bg-bg-secondary/80 backdrop-blur-xl">
        <h2 className="text-lg font-medium text-text-primary gradient-text">{agentName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !streamingContent ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-sm">开始与 {agentName} 对话吧</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {streamingContent && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-bg-secondary border border-default text-text-primary rounded-bl-sm">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {streamingContent}
                    <span className="inline-block w-0.5 h-4 bg-accent-primary animate-pulse ml-0.5 align-middle" />
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  )
}
```

**Step 6: Create the main chat page**

Create `frontend/app/chat/[agentId]/page.tsx`:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { chatService } from '../../services/chatService'
import { agentService } from '../../services/agentService'
import { authService } from '../../services/authService'
import type { AgentResponse } from '../../types/agent'
import type { Conversation, Message } from '../../types/chat'
import { ConversationList } from './ConversationList'
import { ChatPanel } from './ChatPanel'
import { ConfirmDialog } from '../../components/ConfirmDialog'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = Number(params.agentId)

  const [agent, setAgent] = useState<AgentResponse | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Conversation | null>(null)

  // Auth check + load agent
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) { router.replace('/login'); return }
      try {
        await authService.getMe()
      } catch {
        router.replace('/login')
        return
      }
      try {
        const data = await agentService.getAgent(agentId)
        setAgent(data)
      } catch {
        alert('Agent not found')
        router.replace('/')
      }
    }
    init()
  }, [agentId, router])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations(agentId)
      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [agentId])

  useEffect(() => {
    if (agent) loadConversations()
  }, [agent, loadConversations])

  // Load messages when switching conversation
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return }
    chatService.getMessages(activeConvId).then(setMessages).catch(console.error)
  }, [activeConvId])

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const conv = await chatService.createConversation({ agent_id: agentId })
      setConversations((prev) => [conv, ...prev])
      setActiveConvId(conv.id)
    } catch (err) {
      alert('Failed to create conversation')
    }
  }

  // Delete conversation
  const handleDeleteConversation = async () => {
    if (!deleteConfirm) return
    try {
      await chatService.deleteConversation(deleteConfirm.id)
      setConversations((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
      if (activeConvId === deleteConfirm.id) setActiveConvId(null)
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleteConfirm(null)
    }
  }

  // Send message
  const handleSend = async (content: string) => {
    if (!activeConvId) {
      // Auto-create conversation on first message
      try {
        const conv = await chatService.createConversation({
          agent_id: agentId,
          title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
        })
        setConversations((prev) => [conv, ...prev])
        setActiveConvId(conv.id)

        // Small delay to ensure conversation exists on server
        await new Promise((r) => setTimeout(r, 100))
        await doStream(conv.id, content)
      } catch {
        alert('Failed to start conversation')
      }
      return
    }
    await doStream(activeConvId, content)
  }

  const doStream = (convId: number, content: string) => {
    // Add optimistic user message
    const optimisticMsg: Message = {
      id: Date.now(),
      conversation_id: convId,
      role: 'user',
      content,
      tokens_used: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setStreamingContent('')
    setIsStreaming(true)

    chatService.streamChat(
      convId,
      content,
      (token) => setStreamingContent((prev) => prev + token),
      () => {
        setIsStreaming(false)
        // Reload messages to get persisted IDs
        chatService.getMessages(convId).then((msgs) => {
          setMessages(msgs)
          setStreamingContent('')
        })
        loadConversations() // refresh title/order
      },
      (error) => {
        setIsStreaming(false)
        setStreamingContent('')
        alert(`Stream error: ${error}`)
      },
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grid-bg" />

      {/* Top nav */}
      <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-bg-secondary/80 border-b border-default">
        <div className="px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold gradient-text no-underline">
            Cosmray
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-secondary text-sm">{agent.name}</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={(conv) => setActiveConvId(conv.id)}
          onNew={handleNewConversation}
          onDelete={(conv) => setDeleteConfirm(conv)}
        />
        <ChatPanel
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          agentName={agent.name}
          onSend={handleSend}
        />
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Conversation"
          message="Are you sure you want to delete this conversation?"
          type="danger"
          onConfirm={handleDeleteConversation}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
```

**Step 7: Commit**

```bash
git add app/chat/
git commit -m "feat: add chat page with SSE streaming and conversation management"
```

---

## Task 11: Update home page agent click to navigate to chat

**Files:**
- Modify: `frontend/app/HomeClient.tsx` (line 98-100)

**Step 1: Update handleAgentClick**

In `frontend/app/HomeClient.tsx`, replace the `handleAgentClick` function (lines 98-100):

```typescript
const handleAgentClick = (agent: AgentResponse) => {
  alert(`数字人"${agent.name}"对话功能开发中，敬请期待！`)
}
```

With:

```typescript
const handleAgentClick = (agent: AgentResponse) => {
  router.push(`/chat/${agent.id}`)
}
```

**Step 2: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: navigate to chat page on agent click"
```

---

## Task 12: Update profile page agent chat buttons

**Files:**
- Modify: `frontend/app/profile/page.tsx`

**Step 1: Update agent chat handler in profile**

In `frontend/app/profile/page.tsx`, find the agent chat click handler (around line 154-156) that currently shows an alert and replace it with navigation:

From:
```typescript
alert(`与 "${agent.name}" 对话功能开发中，敬请期待！`)
```

To:
```typescript
router.push(`/chat/${agent.id}`)
```

Ensure `useRouter` is imported from `next/navigation` at the top of the file (it may already be).

**Step 2: Commit**

```bash
git add app/profile/page.tsx
git commit -m "feat: profile page agent click navigates to chat"
```

---

## Task 13: End-to-end verification

**Step 1: Start backend**

Run: `cd backend && uvicorn app.main:app --reload`
Expected: Server starts on port 8000.

**Step 2: Start frontend**

Run: `cd frontend && npm run dev`
Expected: Server starts on port 3000.

**Step 3: Test the flow**

1. Open http://localhost:3000, login
2. Click a digital human card -> should navigate to `/chat/{agentId}`
3. Chat page loads with empty conversation list
4. Type a message and send -> SSE streaming should show typewriter effect
5. Verify message history persists after refresh
6. Test creating new conversation, switching conversations, deleting conversation

**Step 4: Final commit**

```bash
git commit --allow-empty -m "feat: complete Phase 1 - basic AI conversation with SSE streaming"
```

---

## Summary

| Task | Description | Backend/Frontend |
|------|-------------|-----------------|
| 1 | Add dependencies | Backend |
| 2 | Create DB models + migration | Backend |
| 3 | Create Pydantic schemas | Backend |
| 4 | Create conversation repository | Backend |
| 5 | Create LLM service (LangChain) | Backend |
| 6 | Create chat service | Backend |
| 7 | Create chat API routes + SSE | Backend |
| 8 | Add chat TypeScript types | Frontend |
| 9 | Add chat service (SSE client) | Frontend |
| 10 | Create chat page components | Frontend |
| 11 | Update home page navigation | Frontend |
| 12 | Update profile page navigation | Frontend |
| 13 | End-to-end verification | Both |
