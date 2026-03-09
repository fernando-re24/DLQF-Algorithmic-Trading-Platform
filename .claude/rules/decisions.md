# Architecture Decisions

This file records key architectural decisions for the DLQF platform.

Future contributors should reference this file before introducing new infrastructure or patterns.

---

## Decision: AWS-Native Infrastructure

We use AWS-managed services for scalability and simplicity.

Selected services:

- S3 for datasets and artifacts
- DynamoDB for metadata
- AWS Batch for evaluation jobs
- Step Functions for orchestration
- API Gateway + Lambda for backend APIs

### Reasoning

- minimal infrastructure management
- strong integration between services
- good support for containerized workloads

---

## Decision: Python-Based Simulation Engine

The backtesting engine is implemented in Python.

### Reasoning

- strong ecosystem for data analysis
- easy integration with quant libraries
- accessible for contributors

Performance optimizations can use:

- NumPy
- Numba
- vectorized computation

---

## Decision: Containerized Strategy Execution

Strategies are executed inside Docker containers.

### Reasoning

- reproducibility
- dependency isolation
- safe execution environment

---

## Decision: Hidden Test Dataset Evaluation

All final scoring occurs on hidden datasets.

### Reasoning

- prevents overfitting
- mirrors professional quant research workflows

Hidden data is stored in restricted S3 buckets.

Only evaluation containers can access it.

---

## Decision: DynamoDB as Metadata Store

Metadata such as submissions, runs, and scores are stored in DynamoDB.

### Reasoning

- simple NoSQL schema
- high scalability
- serverless operation

Large artifacts remain in S3.

---

## Decision: Supabase Auth as Identity Provider

Authentication is handled by Supabase Auth. DynamoDB remains the source of truth for all platform data.

### Reasoning

- managed auth with email/password, OAuth, and magic links out of the box
- issues standard RS256 JWTs that the FastAPI backend verifies via JWKS
- no Supabase database tables are used — only the auth service
- keeps platform data isolated in AWS (DynamoDB / S3)

### Implementation

- Frontend uses `@supabase/supabase-js` (`supabase.auth.signUp`, `signInWithPassword`)
- JWT is attached to API calls as `Authorization: Bearer <token>`
- Backend fetches public keys from `${SUPABASE_URL}/auth/v1/keys` (JWKS) and verifies RS256 signature
- `user_id` is always derived from the verified `sub` claim — never trusted from client input
- On first authenticated request, backend upserts a user record in DynamoDB (`dlqf-users` table) keyed by `user_id`