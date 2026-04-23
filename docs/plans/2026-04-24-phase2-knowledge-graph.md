# Phase 2: Knowledge Graph Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to upload TXT/MD documents, auto-extract entities and relationships via LLM, store in Neo4j, and visualize as interactive force-directed graph.

**Architecture:** Backend adds Neo4j repository, knowledge service (document parsing + LLM extraction), and knowledge API routes. Frontend adds a knowledge management page with document upload list and force-directed graph visualization using react-force-graph-2d.

**Tech Stack:** Neo4j 5.x (Docker), neo4j Python driver, LangChain structured extraction, react-force-graph-2d, Docker Compose

---

## Task 1: Add backend and frontend dependencies

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `frontend/package.json`

**Step 1: Add neo4j to backend requirements**

Append to `backend/requirements.txt`:

```
neo4j>=5.0
```

**Step 2: Install backend dependency**

Run: `cd backend && pip install neo4j>=5.0`
Expected: Successfully installed.

**Step 3: Install frontend force graph library**

Run: `cd frontend && npm install react-force-graph-2d`
Expected: Package installed, package.json updated.

**Step 4: Commit both**

```bash
cd backend && git add requirements.txt && git commit -m "chore: add neo4j dependency"
cd ../frontend && git add package.json package-lock.json && git commit -m "chore: add react-force-graph-2d dependency"
```

---

## Task 2: Create Neo4j Docker Compose configuration

**Files:**
- Modify: `backend/docker-compose.yml`

**Step 1: Read existing docker-compose.yml**

Read `backend/docker-compose.yml` to see current content.

**Step 2: Add Neo4j service**

Add Neo4j service to `backend/docker-compose.yml`:

```yaml
services:
  neo4j:
    image: neo4j:5
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/knowledge_graph_password
    volumes:
      - neo4j_data:/data

volumes:
  neo4j_data:
```

Note: Merge with existing content if docker-compose.yml already has services.

**Step 3: Add Neo4j env vars to .env.example**

Append to `backend/.env.example`:

```
# Neo4j 配置
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=knowledge_graph_password
```

Also add the same (with real values) to `backend/.env`.

**Step 4: Commit**

```bash
cd backend && git add docker-compose.yml .env.example && git commit -m "infra: add Neo4j Docker Compose configuration"
```

---

## Task 3: Create MySQL knowledge_documents model and migration

**Files:**
- Create: `backend/app/models/knowledge.py`
- Modify: `backend/alembic/env.py`
- Create: `backend/alembic/versions/xxxx_add_knowledge_documents_table.py`

**Step 1: Create knowledge model**

Create `backend/app/models/knowledge.py`:

```python
"""
Knowledge document model
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    status = Column(Enum("processing", "completed", "failed", name="doc_status_enum"), default="processing")
    entity_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**Step 2: Register model in alembic/env.py**

After the existing `from app.models.conversation import Conversation, Message` line, add:

```python
from app.models.knowledge import KnowledgeDocument  # noqa: F401
```

**Step 3: Create migration file manually**

Create `backend/alembic/versions/b2c3d4e5f6a7_add_knowledge_documents_table.py`:

```python
"""add knowledge_documents table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-24 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'knowledge_documents',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('agent_id', sa.Integer(), sa.ForeignKey('agents.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False, default=0),
        sa.Column('status', sa.Enum('processing', 'completed', 'failed', name='doc_status_enum'), default='processing'),
        sa.Column('entity_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('knowledge_documents')
```

**Step 4: Commit**

```bash
cd backend && git add app/models/knowledge.py alembic/env.py alembic/versions/b2c3d4e5f6a7_add_knowledge_documents_table.py && git commit -m "feat: add knowledge_documents database model"
```

---

## Task 4: Create Pydantic schemas for knowledge

**Files:**
- Create: `backend/app/schemas/knowledge.py`

**Step 1: Create knowledge schemas**

Create `backend/app/schemas/knowledge.py`:

```python
"""
Knowledge schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class DocStatus(str, Enum):
    processing = "processing"
    completed = "completed"
    failed = "failed"


class KnowledgeDocumentResponse(BaseModel):
    id: int
    agent_id: int
    user_id: int
    filename: str
    file_size: int
    status: DocStatus
    entity_count: int
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DocumentListRequest(BaseModel):
    agent_id: int
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=100)


class DocumentIdRequest(BaseModel):
    document_id: int


class GraphNode(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    description: Optional[str] = None


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class EntitySearchRequest(BaseModel):
    agent_id: int
    query: str = Field(..., min_length=1, max_length=200)
```

**Step 2: Commit**

```bash
cd backend && git add app/schemas/knowledge.py && git commit -m "feat: add knowledge Pydantic schemas"
```

---

## Task 5: Create Neo4j knowledge repository

**Files:**
- Create: `backend/app/repositories/knowledge_repo.py`

**Step 1: Create knowledge repo**

Create `backend/app/repositories/knowledge_repo.py`:

```python
"""
Neo4j knowledge graph repository
"""
import os
import logging
from typing import List, Dict, Optional
from neo4j import GraphDatabase

logger = logging.getLogger(__name__)


class KnowledgeRepository:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "knowledge_graph_password")
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    def _get_session(self):
        return self._driver.session()

    def store_entities_and_relations(
        self,
        document_id: int,
        agent_id: int,
        entities: List[Dict],
        relations: List[Dict],
    ) -> int:
        """Store extracted entities and relations. Returns count of entities stored."""
        entity_count = 0
        with self._get_session() as session:
            # Create document node
            session.run(
                "MERGE (d:Document {id: $doc_id}) SET d.agent_id = $agent_id",
                doc_id=document_id,
                agent_id=agent_id,
            )

            # Create entity nodes
            for entity in entities:
                session.run(
                    """
                    MERGE (e:Entity {name: $name, document_id: $doc_id})
                    SET e.type = $type, e.description = $desc, e.agent_id = $agent_id
                    WITH e
                    MATCH (d:Document {id: $doc_id})
                    MERGE (d)-[:CONTAINS]->(e)
                    """,
                    name=entity["name"],
                    type=entity.get("type", "Concept"),
                    desc=entity.get("description", ""),
                    doc_id=document_id,
                    agent_id=agent_id,
                )
                entity_count += 1

            # Create relationships
            for rel in relations:
                session.run(
                    """
                    MATCH (e1:Entity {name: $from_name, document_id: $doc_id})
                    MATCH (e2:Entity {name: $to_name, document_id: $doc_id})
                    MERGE (e1)-[:RELATED_TO {relation: $relation, description: $desc}]->(e2)
                    """,
                    from_name=rel["from"],
                    to_name=rel["to"],
                    relation=rel.get("relation", "RELATED_TO"),
                    desc=rel.get("description", ""),
                    doc_id=document_id,
                )

        return entity_count

    def get_graph_data(self, agent_id: int) -> Dict:
        """Get all nodes and edges for an agent's knowledge graph."""
        nodes = []
        edges = []

        with self._get_session() as session:
            # Get all entities for this agent
            result = session.run(
                "MATCH (e:Entity {agent_id: $agent_id}) RETURN e.name AS name, e.type AS type, e.description AS description, e.document_id AS doc_id",
                agent_id=agent_id,
            )
            seen = set()
            for record in result:
                name = record["name"]
                if name not in seen:
                    nodes.append({
                        "id": name,
                        "name": name,
                        "type": record["type"] or "Concept",
                        "description": record["description"],
                    })
                    seen.add(name)

            # Get all relations for this agent
            result = session.run(
                """
                MATCH (e1:Entity {agent_id: $agent_id})-[r:RELATED_TO]->(e2:Entity {agent_id: $agent_id})
                RETURN e1.name AS source, e2.name AS target, r.relation AS relation, r.description AS description
                """,
                agent_id=agent_id,
            )
            for record in result:
                edges.append({
                    "source": record["source"],
                    "target": record["target"],
                    "relation": record["relation"],
                    "description": record["description"],
                })

        return {"nodes": nodes, "edges": edges}

    def search_entities(self, agent_id: int, query: str) -> List[Dict]:
        """Search entities by name (case-insensitive partial match)."""
        with self._get_session() as session:
            result = session.run(
                """
                MATCH (e:Entity {agent_id: $agent_id})
                WHERE e.name CONTAINS $query
                RETURN e.name AS name, e.type AS type, e.description AS description
                LIMIT 20
                """,
                agent_id=agent_id,
                query=query,
            )
            return [{"id": r["name"], "name": r["name"], "type": r["type"], "description": r["description"]} for r in result]

    def delete_document_data(self, document_id: int) -> bool:
        """Delete all entities and relations for a document."""
        with self._get_session() as session:
            session.run(
                """
                MATCH (e:Entity {document_id: $doc_id})
                DETACH DELETE e
                """,
                doc_id=document_id,
            )
            session.run(
                "MATCH (d:Document {id: $doc_id}) DELETE d",
                doc_id=document_id,
            )
        return True


knowledge_repository = KnowledgeRepository()
```

**Step 2: Commit**

```bash
cd backend && git add app/repositories/knowledge_repo.py && git commit -m "feat: add Neo4j knowledge repository"
```

---

## Task 6: Create MySQL document repository

**Files:**
- Create: `backend/app/repositories/document_repo.py`

**Step 1: Create document repository**

Create `backend/app/repositories/document_repo.py`:

```python
"""
Knowledge document MySQL repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.knowledge import KnowledgeDocument


class DocumentRepository:
    def get_by_id(self, db: Session, doc_id: int) -> Optional[KnowledgeDocument]:
        return db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()

    def get_by_agent(self, db: Session, agent_id: int, user_id: int, skip: int = 0, limit: int = 50) -> List[KnowledgeDocument]:
        return (
            db.query(KnowledgeDocument)
            .filter(KnowledgeDocument.agent_id == agent_id, KnowledgeDocument.user_id == user_id)
            .order_by(KnowledgeDocument.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, agent_id: int, user_id: int, filename: str, file_size: int) -> KnowledgeDocument:
        doc = KnowledgeDocument(
            agent_id=agent_id,
            user_id=user_id,
            filename=filename,
            file_size=file_size,
            status="processing",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    def update_status(self, db: Session, doc_id: int, status: str, entity_count: int = 0) -> Optional[KnowledgeDocument]:
        doc = self.get_by_id(db, doc_id)
        if not doc:
            return None
        doc.status = status
        doc.entity_count = entity_count
        db.commit()
        db.refresh(doc)
        return doc

    def delete(self, db: Session, doc_id: int) -> bool:
        doc = self.get_by_id(db, doc_id)
        if not doc:
            return False
        db.delete(doc)
        db.commit()
        return True


document_repository = DocumentRepository()
```

**Step 2: Commit**

```bash
cd backend && git add app/repositories/document_repo.py && git commit -m "feat: add document MySQL repository"
```

---

## Task 7: Create knowledge service (document parsing + LLM extraction)

**Files:**
- Create: `backend/app/services/knowledge_service.py`

**Step 1: Create knowledge service**

Create `backend/app/services/knowledge_service.py`:

```python
"""
Knowledge service: document parsing, LLM extraction, graph management
"""
import json
import logging
import os
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.repositories.knowledge_repo import knowledge_repository
from app.repositories.document_repo import document_repository
from app.agent_repo.agent import AgentRepository
from app.services.llm_service import llm_service
from app.core.exceptions import NotFoundException, ErrorCode

logger = logging.getLogger(__name__)
agent_repository = AgentRepository()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

EXTRACTION_PROMPT = """You are a knowledge graph construction assistant. Extract entities and their relationships from the following text.

Output strict JSON only (no markdown, no explanation):
{
  "entities": [
    {"name": "entity name", "type": "Person|Organization|Technology|Concept|Event|Location", "description": "brief description"}
  ],
  "relations": [
    {"from": "source entity name", "to": "target entity name", "relation": "relationship type", "description": "relationship description"}
  ]
}

Text:
{content}"""


class KnowledgeService:

    def upload_document(self, db: Session, agent_id: int, user_id: int, filename: str, content: bytes) -> dict:
        """Upload and process a document."""
        # Validate agent ownership
        agent = agent_repository.get_agent_by_id(db, agent_id)
        if not agent or agent.user_id != user_id:
            raise NotFoundException("Agent not found", ErrorCode.AGENT_NOT_FOUND)

        file_size = len(content)

        # Save to MySQL
        doc = document_repository.create(db, agent_id, user_id, filename, file_size)

        # Save file to disk
        file_path = os.path.join(UPLOAD_DIR, f"{doc.id}_{filename}")
        with open(file_path, "wb") as f:
            f.write(content)

        # Process asynchronously (in background for now, synchronous for simplicity)
        try:
            text = content.decode("utf-8")
            entity_count = self._process_document(db, doc.id, agent_id, text)
            document_repository.update_status(db, doc.id, "completed", entity_count)
        except Exception as e:
            logger.error(f"Failed to process document {doc.id}: {e}")
            document_repository.update_status(db, doc.id, "failed", 0)

        doc = document_repository.get_by_id(db, doc.id)
        return {"id": doc.id, "filename": doc.filename, "status": doc.status, "entity_count": doc.entity_count}

    def _process_document(self, db: Session, doc_id: int, agent_id: int, text: str) -> int:
        """Split text into chunks and extract entities/relations via LLM."""
        chunks = self._split_text(text, chunk_size=800)
        all_entities = []
        all_relations = []

        for chunk in chunks:
            try:
                result = self._extract_with_llm(chunk)
                all_entities.extend(result.get("entities", []))
                all_relations.extend(result.get("relations", []))
            except Exception as e:
                logger.warning(f"LLM extraction failed for chunk in doc {doc_id}: {e}")
                continue

        # Deduplicate entities by name
        seen = set()
        unique_entities = []
        for e in all_entities:
            key = e["name"].lower().strip()
            if key not in seen:
                seen.add(key)
                unique_entities.append(e)

        # Store in Neo4j
        if unique_entities:
            count = knowledge_repository.store_entities_and_relations(
                document_id=doc_id,
                agent_id=agent_id,
                entities=unique_entities,
                relations=all_relations,
            )
            return count
        return 0

    def _split_text(self, text: str, chunk_size: int = 800) -> List[str]:
        """Split text into chunks by paragraphs."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = para
            else:
                current_chunk += "\n\n" + para if current_chunk else para

        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks if chunks else [text[:chunk_size]]

    def _extract_with_llm(self, content: str) -> dict:
        """Call LLM to extract entities and relations from text."""
        prompt = EXTRACTION_PROMPT.format(content=content)
        response = asyncio_run(llm_service.chat(
            system_prompt="You are a knowledge graph construction assistant. Always respond with valid JSON only.",
            history=[],
            user_message=prompt,
            temperature=0.1,
            max_tokens=2000,
        ))
        # Parse JSON from response (handle markdown code blocks)
        response = response.strip()
        if response.startswith("```"):
            response = response.split("```")[1]
            if response.startswith("json"):
                response = response[4:]
            response = response.strip()
        return json.loads(response)

    def get_documents(self, db: Session, agent_id: int, user_id: int, skip: int = 0, limit: int = 50) -> list:
        return document_repository.get_by_agent(db, agent_id, user_id, skip, limit)

    def delete_document(self, db: Session, doc_id: int, user_id: int) -> bool:
        doc = document_repository.get_by_id(db, doc_id)
        if not doc or doc.user_id != user_id:
            raise NotFoundException("Document not found", ErrorCode.PARAM_ERROR)
        # Clean up Neo4j
        knowledge_repository.delete_document_data(doc_id)
        # Clean up file
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{doc.filename}")
        if os.path.exists(file_path):
            os.remove(file_path)
        return document_repository.delete(db, doc_id)

    def get_graph(self, agent_id: int) -> dict:
        return knowledge_repository.get_graph_data(agent_id)

    def search_entities(self, agent_id: int, query: str) -> list:
        return knowledge_repository.search_entities(agent_id, query)


import asyncio

def asyncio_run(coro):
    """Run async coroutine synchronously."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


knowledge_service = KnowledgeService()
```

**Step 2: Commit**

```bash
cd backend && git add app/services/knowledge_service.py && git commit -m "feat: add knowledge service with LLM extraction"
```

---

## Task 8: Create knowledge API routes

**Files:**
- Create: `backend/app/api/routes/knowledge.py`
- Modify: `backend/app/api/routes/__init__.py`

**Step 1: Create knowledge routes**

Create `backend/app/api/routes/knowledge.py`:

```python
"""
Knowledge API routes
"""
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.schemas.knowledge import (
    KnowledgeDocumentResponse, DocumentListRequest, DocumentIdRequest,
    GraphData, GraphNode, EntitySearchRequest,
)
from app.schemas.response import ApiResponse
from app.schemas.user import UserResponse
from app.core.auth import get_current_user
from app.core.database import get_db
from app.services.knowledge_service import knowledge_service

router = APIRouter()

ALLOWED_EXTENSIONS = {".txt", ".md"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload", response_model=ApiResponse[dict])
async def upload_document(
    agent_id: int,
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate file extension
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if f".{ext}" not in ALLOWED_EXTENSIONS:
        return ApiResponse.error("Only .txt and .md files are supported")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        return ApiResponse.error("File size exceeds 5MB limit")

    result = knowledge_service.upload_document(db, agent_id, current_user.id, filename, content)
    return ApiResponse.success(data=result)


@router.post("/documents/list", response_model=ApiResponse[list[KnowledgeDocumentResponse]])
async def list_documents(
    req: DocumentListRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = knowledge_service.get_documents(db, req.agent_id, current_user.id, req.skip, req.limit)
    return ApiResponse.success(data=[KnowledgeDocumentResponse.model_validate(d) for d in docs])


@router.post("/documents/delete", response_model=ApiResponse[bool])
async def delete_document(
    req: DocumentIdRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = knowledge_service.delete_document(db, req.document_id, current_user.id)
    return ApiResponse.success(data=success)


@router.get("/graph/{agent_id}", response_model=ApiResponse[GraphData])
async def get_graph(
    agent_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = knowledge_service.get_graph(agent_id)
    return ApiResponse.success(data=GraphData(**data))


@router.post("/graph/search", response_model=ApiResponse[list[GraphNode]])
async def search_entities(
    req: EntitySearchRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = knowledge_service.search_entities(req.agent_id, req.query)
    return ApiResponse.success(data=[GraphNode(**r) for r in results])
```

**Step 2: Register knowledge routes in __init__.py**

In `backend/app/api/routes/__init__.py`, update the import line:

```python
from app.api.routes import items, users, auth, agents, chat, knowledge
```

And add the router registration:

```python
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
```

**Step 3: Verify backend starts**

Run: `cd backend && python -c "from app.main import app; print('OK')"`
Expected: No import errors.

**Step 4: Commit**

```bash
cd backend && git add app/api/routes/knowledge.py app/api/routes/__init__.py && git commit -m "feat: add knowledge API routes"
```

---

## Task 9: Create frontend knowledge types

**Files:**
- Create: `frontend/app/types/knowledge.ts`

**Step 1: Create knowledge types**

Create `frontend/app/types/knowledge.ts`:

```typescript
export interface KnowledgeDocument {
  id: number
  agent_id: number
  user_id: number
  filename: string
  file_size: number
  status: 'processing' | 'completed' | 'failed'
  entity_count: number
  created_at: string
}

export interface GraphNode {
  id: string
  name: string
  type: string
  description: string | null
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
  description: string | null
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface UploadResult {
  id: number
  filename: string
  status: string
  entity_count: number
}
```

**Step 2: Commit**

```bash
cd frontend && git add app/types/knowledge.ts && git commit -m "feat: add knowledge TypeScript types"
```

---

## Task 10: Create frontend knowledge service

**Files:**
- Create: `frontend/app/services/knowledgeService.ts`

**Step 1: Create knowledge service**

Create `frontend/app/services/knowledgeService.ts`:

```typescript
import type { KnowledgeDocument, GraphData, GraphNode, UploadResult } from '../types/knowledge'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || ''
}

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`)
  }
  const json = await response.json()
  return json.data
}

export const knowledgeService = {
  async uploadDocument(agentId: number, file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/api/v1/knowledge/upload?agent_id=${agentId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    return handleResponse<UploadResult>(response)
  },

  async getDocuments(agentId: number, skip = 0, limit = 50): Promise<KnowledgeDocument[]> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/documents/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, skip, limit }),
    })
    return handleResponse<KnowledgeDocument[]>(response)
  },

  async deleteDocument(documentId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/documents/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ document_id: documentId }),
    })
    return handleResponse<boolean>(response)
  },

  async getGraph(agentId: number): Promise<GraphData> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/graph/${agentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<GraphData>(response)
  },

  async searchEntities(agentId: number, query: string): Promise<GraphNode[]> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/graph/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, query }),
    })
    return handleResponse<GraphNode[]>(response)
  },
}
```

**Step 2: Commit**

```bash
cd frontend && git add app/services/knowledgeService.ts && git commit -m "feat: add knowledge API service"
```

---

## Task 11: Create frontend knowledge page with graph visualization

**Files:**
- Create: `frontend/app/knowledge/[agentId]/page.tsx`
- Create: `frontend/app/knowledge/[agentId]/DocumentList.tsx`
- Create: `frontend/app/knowledge/[agentId]/KnowledgeGraph.tsx`
- Create: `frontend/app/knowledge/[agentId]/NodeDetail.tsx`

**Step 1: Create directory**

Run: `mkdir -p "frontend/app/knowledge/[agentId]"`

**Step 2: Create NodeDetail component**

Create `frontend/app/knowledge/[agentId]/NodeDetail.tsx`:

```tsx
'use client'

import type { GraphNode } from '../../types/knowledge'

interface Props {
  node: GraphNode | null
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  Person: 'bg-blue-500/20 text-blue-400',
  Organization: 'bg-orange-500/20 text-orange-400',
  Technology: 'bg-green-500/20 text-green-400',
  Concept: 'bg-purple-500/20 text-purple-400',
  Event: 'bg-red-500/20 text-red-400',
  Location: 'bg-cyan-500/20 text-cyan-400',
}

export function NodeDetail({ node, onClose }: Props) {
  if (!node) return null

  return (
    <div className="w-72 border-l border-default bg-bg-secondary/80 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-text-primary truncate">{node.name}</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-sm cursor-pointer">x</button>
      </div>
      <span className={`inline-block px-2 py-1 rounded text-xs ${TYPE_COLORS[node.type] || 'bg-gray-500/20 text-gray-400'}`}>
        {node.type}
      </span>
      {node.description && (
        <p className="mt-3 text-sm text-text-secondary">{node.description}</p>
      )}
      <div className="mt-4 text-xs text-text-muted">
        <p>ID: {node.id}</p>
      </div>
    </div>
  )
}
```

**Step 3: Create DocumentList component**

Create `frontend/app/knowledge/[agentId]/DocumentList.tsx`:

```tsx
'use client'

import { useRef } from 'react'
import type { KnowledgeDocument } from '../../types/knowledge'

interface Props {
  documents: KnowledgeDocument[]
  onUpload: (file: File) => void
  onDelete: (doc: KnowledgeDocument) => void
  isUploading: boolean
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  processing: { label: 'Processing', color: 'text-warning' },
  completed: { label: 'Completed', color: 'text-success' },
  failed: { label: 'Failed', color: 'text-error' },
}

export function DocumentList({ documents, onUpload, onDelete, isUploading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-80 border-r border-default bg-bg-secondary/50 flex flex-col h-full">
      <div className="p-4 border-b border-default">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-2.5 rounded-lg bg-accent-gradient text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : '+ Upload Document'}
        </button>
        <p className="text-xs text-text-muted mt-2">Supports .txt and .md files (max 5MB)</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <p className="text-text-muted text-sm text-center mt-8">No documents yet</p>
        ) : (
          documents.map((doc) => {
            const status = STATUS_MAP[doc.status] || STATUS_MAP.failed
            return (
              <div key={doc.id} className="px-4 py-3 border-b border-default group">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary truncate flex-1">{doc.filename}</span>
                  <button
                    onClick={() => onDelete(doc)}
                    className="text-text-muted hover:text-error text-xs opacity-50 group-hover:opacity-100 md:opacity-0 transition-opacity cursor-pointer ml-2"
                  >
                    x
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${status.color}`}>{status.label}</span>
                  {doc.status === 'completed' && (
                    <span className="text-xs text-text-muted">{doc.entity_count} entities</span>
                  )}
                  <span className="text-xs text-text-muted">
                    {(doc.file_size / 1024).toFixed(1)}KB
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
```

**Step 4: Create KnowledgeGraph component**

Create `frontend/app/knowledge/[agentId]/KnowledgeGraph.tsx`:

```tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { GraphData, GraphNode } from '../../types/knowledge'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface Props {
  graphData: GraphData
  onNodeClick: (node: GraphNode) => void
  searchQuery: string
}

const TYPE_COLORS: Record<string, string> = {
  Person: '#3B82F6',
  Organization: '#F97316',
  Technology: '#22C55E',
  Concept: '#A855F7',
  Event: '#EF4444',
  Location: '#06B6D4',
}

export function KnowledgeGraph({ graphData, onNodeClick, searchQuery }: Props) {
  const fgRef = useRef<any>(null)

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.zoomToFit(400, 50)
    }
  }, [graphData])

  const nodePaint = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name
    const fontSize = Math.max(12 / globalScale, 4)
    ctx.font = `${fontSize}px Sans-Serif`
    const textWidth = ctx.measureText(label).width
    const bgWidth = textWidth + fontSize
    const bgHeight = fontSize * 1.5

    // Highlight matching nodes
    const isMatch = searchQuery && label.toLowerCase().includes(searchQuery.toLowerCase())
    const color = TYPE_COLORS[node.type] || '#6B7280'

    // Draw circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, bgHeight * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = isMatch ? '#FDE047' : color
    ctx.globalAlpha = isMatch ? 1 : 0.7
    ctx.fill()
    ctx.globalAlpha = 1

    // Draw label
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = isMatch ? '#000' : '#F5F5F5'
    ctx.fillText(label.length > 12 ? label.slice(0, 12) + '...' : label, node.x, node.y + bgHeight * 0.8)
  }, [searchQuery])

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-text-muted text-sm">No knowledge graph yet</p>
          <p className="text-text-muted text-xs mt-2">Upload a document to start building the graph</p>
        </div>
      </div>
    )
  }

  // Transform data for react-force-graph-2d
  const fgData = {
    nodes: graphData.nodes.map(n => ({ ...n, val: 5 })),
    links: graphData.edges.map(e => ({ source: e.source, target: e.target, label: e.relation })),
  }

  return (
    <div className="flex-1 bg-bg-primary">
      <ForceGraph2D
        ref={fgRef}
        graphData={fgData}
        nodeCanvasObject={nodePaint}
        onNodeClick={(node: any) => {
          if (node) onNodeClick({ id: node.id, name: node.name, type: node.type, description: node.description })
        }}
        linkColor={() => 'rgba(255,255,255,0.15)'}
        linkDirectionalArrowLength={3}
        backgroundColor="#0A1628"
        cooldownTicks={100}
      />
    </div>
  )
}
```

**Step 5: Create the main knowledge page**

Create `frontend/app/knowledge/[agentId]/page.tsx`:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { knowledgeService } from '../../services/knowledgeService'
import { agentService } from '../../services/agentService'
import { authService } from '../../services/authService'
import type { AgentResponse } from '../../types/agent'
import type { KnowledgeDocument, GraphData, GraphNode } from '../../types/knowledge'
import { DocumentList } from './DocumentList'
import { KnowledgeGraph } from './KnowledgeGraph'
import { NodeDetail } from './NodeDetail'
import { ConfirmDialog } from '../../components/ConfirmDialog'

export default function KnowledgePage() {
  const router = useRouter()
  const params = useParams()
  const agentId = Number(params.agentId)

  const [agent, setAgent] = useState<AgentResponse | null>(null)
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [deleteDoc, setDeleteDoc] = useState<KnowledgeDocument | null>(null)

  // Auth check + load agent
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) { router.replace('/login'); return }
      try { await authService.getMe() } catch { router.replace('/login'); return }
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

  // Load documents and graph
  const loadData = useCallback(async () => {
    try {
      const [docs, graph] = await Promise.all([
        knowledgeService.getDocuments(agentId),
        knowledgeService.getGraph(agentId),
      ])
      setDocuments(docs)
      setGraphData(graph)
    } catch (err) {
      console.error('Failed to load knowledge data:', err)
    }
  }, [agentId])

  useEffect(() => {
    if (agent) loadData()
  }, [agent, loadData])

  // Upload document
  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await knowledgeService.uploadDocument(agentId, file)
      await loadData()
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Delete document
  const handleDelete = async () => {
    if (!deleteDoc) return
    try {
      await knowledgeService.deleteDocument(deleteDoc.id)
      setDeleteDoc(null)
      await loadData()
    } catch {
      alert('Failed to delete document')
    }
  }

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <div>Loading...</div>
      </div>
    )
  }

  const totalEntities = graphData.nodes.length
  const totalRelations = graphData.edges.length

  return (
    <div className="h-screen flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-bg-secondary/80 border-b border-default">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-semibold gradient-text no-underline">Cosmray</Link>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary text-sm">{agent.name}</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary text-sm">Knowledge Graph</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities..."
              className="bg-bg-tertiary border border-default rounded-lg px-3 py-1.5 text-text-primary text-sm w-48 focus:outline-none focus:border-accent-primary"
            />
            {/* Stats */}
            <span className="text-xs text-text-muted">{totalEntities} entities</span>
            <span className="text-xs text-text-muted">{totalRelations} relations</span>
            <Link href={`/chat/${agentId}`} className="text-sm text-accent-primary no-underline hover:underline">
              Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <DocumentList
          documents={documents}
          onUpload={handleUpload}
          onDelete={(doc) => setDeleteDoc(doc)}
          isUploading={isUploading}
        />
        <KnowledgeGraph
          graphData={graphData}
          onNodeClick={setSelectedNode}
          searchQuery={searchQuery}
        />
        <NodeDetail
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* Delete confirmation */}
      {deleteDoc && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Document"
          message={`Delete "${deleteDoc.filename}" and all its extracted entities?`}
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDoc(null)}
        />
      )}
    </div>
  )
}
```

**Step 6: Commit**

```bash
cd frontend && git add "app/knowledge/" && git commit -m "feat: add knowledge page with force graph visualization"
```

---

## Task 12: Update home page to add knowledge entry

**Files:**
- Modify: `frontend/app/HomeClient.tsx`

**Step 1: Add knowledge button to agent card**

In `frontend/app/HomeClient.tsx`, find where the agent card actions are rendered (edit and delete buttons). Add a "Knowledge" button alongside them:

After the existing edit button handler `handleEditAgent` pattern, add a new handler and button. Find the section with the edit/delete icon buttons on each agent card and add before or after them:

```tsx
<button
  onClick={(e) => { e.stopPropagation(); router.push(`/knowledge/${agent.id}`) }}
  className="text-text-muted hover:text-accent-primary transition-colors cursor-pointer"
  title="Knowledge Graph"
>
  {/* Network/graph icon SVG */}
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
</button>
```

The exact insertion point depends on the card layout. Look for the `handleEditAgent` and `handleDeleteAgent` buttons and add the knowledge button in the same group.

**Step 2: Commit**

```bash
cd frontend && git add app/HomeClient.tsx && git commit -m "feat: add knowledge graph entry on agent cards"
```

---

## Task 13: Verify and push

**Step 1: Verify backend starts**

Run: `cd backend && python -c "from app.main import app; print('OK')"`
Expected: No import errors.

**Step 2: Verify frontend builds**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "^app/knowledge" | head -10`
Expected: No TypeScript errors in knowledge files.

**Step 3: Push both repos**

```bash
cd backend && git push
cd ../frontend && git push
```

---

## Summary

| Task | Description | Backend/Frontend |
|------|-------------|-----------------|
| 1 | Add dependencies | Both |
| 2 | Docker Compose + Neo4j config | Backend |
| 3 | MySQL knowledge_documents model | Backend |
| 4 | Pydantic knowledge schemas | Backend |
| 5 | Neo4j knowledge repository | Backend |
| 6 | MySQL document repository | Backend |
| 7 | Knowledge service (LLM extraction) | Backend |
| 8 | Knowledge API routes | Backend |
| 9 | Frontend knowledge types | Frontend |
| 10 | Frontend knowledge service | Frontend |
| 11 | Knowledge page (graph + docs) | Frontend |
| 12 | Home page knowledge entry | Frontend |
| 13 | Verify and push | Both |
