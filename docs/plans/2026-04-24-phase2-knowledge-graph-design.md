# Phase 2: Knowledge Graph Design

**Goal:** Enable users to upload TXT/MD documents, auto-extract entities and relationships via LLM, store in Neo4j graph database, and visualize as interactive force-directed graph.

**Approach:** Document-driven pipeline: Upload -> LLM extraction -> Neo4j storage -> Force graph visualization.

**Tech Stack:** Neo4j 5.x (Docker), LangChain structured output, react-force-graph-2d, Docker Compose for local Neo4j.

---

## Data Model

### Neo4j Graph Schema

```
(:Document {id, filename, agent_id, upload_time, status})
(:Entity {id, name, type, description, document_id})
(:Concept {id, name, description})

(:Document)-[:CONTAINS]->(:Entity)
(:Entity)-[:RELATED_TO {relation, description}]->(:Entity)
(:Entity)-[:BELONGS_TO]->(:Concept)
```

Entity types: Person, Organization, Technology, Concept, Event, Location.

### MySQL New Table: knowledge_documents

| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | Primary key |
| agent_id | INT FK -> agents.id | Associated agent |
| user_id | INT FK -> users.id | Owner |
| filename | VARCHAR(255) | File name |
| file_size | INT | File size in bytes |
| status | ENUM('processing','completed','failed') | Processing status |
| entity_count | INT | Number of extracted entities |
| created_at | DATETIME | Upload time |

---

## Backend Architecture

### New Dependencies

```
neo4j>=5.0
```

### Document Processing Pipeline

1. User uploads TXT/MD file -> POST /knowledge/upload
2. Save file to `uploads/` directory
3. Create MySQL record (status=processing)
4. Read file content, split into chunks (500-1000 chars per chunk)
5. For each chunk, call LLM with structured extraction prompt
6. Parse LLM JSON output into entities and relations
7. Write entities and relations to Neo4j
8. Update MySQL record (status=completed, entity_count=N)

### LLM Extraction Prompt

```
Extract entities and relationships from the following text.

Output strict JSON:
{
  "entities": [
    {"name": "entity name", "type": "Person|Organization|Technology|Concept|Event|Location", "description": "brief description"}
  ],
  "relations": [
    {"from": "source entity", "to": "target entity", "relation": "relationship type", "description": "relationship description"}
  ]
}

Text:
{chunk_content}
```

### New Backend Files

```
app/
  services/
    knowledge_service.py   # Document parsing + LLM extraction + Neo4j storage + graph query
  repositories/
    knowledge_repo.py      # Neo4j CRUD operations
    document_repo.py       # MySQL document metadata CRUD
  api/
    routes/
      knowledge.py         # Knowledge API endpoints
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/knowledge/upload` | Upload document (multipart/form-data) |
| GET | `/knowledge/documents?agent_id=X` | List documents |
| DELETE | `/knowledge/documents/{id}` | Delete document (clean up Neo4j nodes) |
| GET | `/knowledge/graph/{agent_id}` | Get full graph data (nodes + edges) for an agent |
| GET | `/knowledge/graph/{agent_id}/search?q=xxx` | Search entities in graph |

### Neo4j Connection

Config via environment variables:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

Docker Compose addition for local development:
```yaml
neo4j:
  image: neo4j:5
  ports:
    - "7474:7474"
    - "7687:7687"
  environment:
    NEO4J_AUTH: neo4j/your_password
```

---

## Frontend Architecture

### New Dependency

```
react-force-graph-2d
```

### New Pages

**Knowledge Management Page** (`/knowledge/[agentId]`)
- Top bar: Agent name + stats (documents count, entities count)
- Left panel: Document list (upload/delete/status indicator)
- Right panel: Force-directed graph visualization

### Force Graph Interactions

- Node color by type: Person=blue, Technology=green, Concept=purple, Organization=orange, Event=red, Location=cyan
- Click node: show detail panel (name, type, description, related entities)
- Drag nodes to re-layout
- Search box highlights matching nodes
- Zoom and pan

### New Frontend Files

```
app/
  knowledge/
    [agentId]/
      page.tsx              # Knowledge main page
      DocumentList.tsx      # Document list component
      KnowledgeGraph.tsx    # Force-directed graph component
      NodeDetail.tsx        # Node detail panel
  services/
    knowledgeService.ts     # Knowledge API calls
  types/
    knowledge.ts            # Type definitions
```

### Modified Pages

- Home page: Agent card adds "Knowledge" entry button -> navigates to /knowledge/[agentId]
- Agent creation/edit: optional step to associate existing documents

---

## Error Handling

- Upload: validate file type (only .txt, .md), file size limit (5MB)
- LLM extraction: if parsing fails, mark document as "failed", show error to user
- Neo4j connection: fallback error if Neo4j is unavailable, don't crash the app
- Graph loading: show loading spinner while fetching graph data, handle empty graph gracefully
