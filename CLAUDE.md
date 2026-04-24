# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT THINGS TO REMEMBER
NEVER USE EM DASHES

---
                            
## Project Description

DLQF Platform is a cloud-native distributed compute and ML job orchestration system.

It allows users to:
- Upload datasets
- Submit compute / ML jobs
- Execute workloads on AWS Batch or a hybrid workstation compute node
- Track job execution in real time
- Retrieve structured results and analytics

This is NOT a simple CRUD app. It is a distributed systems project with:
- queue-based job scheduling
- containerized execution
- hybrid compute architecture (AWS + optional local node)
- scalable backend orchestration

The goal is to simulate a simplified version of AWS Batch + ML platform infrastructure.

---

## Project Overview

**DLQF Platform** is a distributed ML compute orchestration system.

**Stack:**
React (Next.js) · FastAPI (Python) · PostgreSQL · pgvector · Docker · AWS (S3, RDS, SQS, Batch, IAM, ECR)

**Optional compute layer:**
Workstation worker node (Python daemon + Docker execution engine)

---

## Current Status

Phase 1 (Core System) is in progress. No production code exists yet.

The repository should eventually include:
- `FEATURES.md` — full system specification (source of truth for features and architecture)
- `/frontend` — React dashboard
- `/backend` — FastAPI service
- `/infra` — AWS infrastructure definitions (Terraform or CDK recommended)
- `/worker` — optional workstation compute node
- `/docker` — job execution containers

---

## Architecture Overview

### Core System Flow


User
↓
Frontend (React)
↓
Backend API (FastAPI)
↓
PostgreSQL + S3
↓
Job Queue (SQS)
↓
Compute Layer
├── AWS Batch (primary)
└── Workstation Worker (optional)
↓
Results stored in S3 + metadata in Postgres
↓
Frontend Dashboard


---

## Key Architectural Decisions

- **Backend:** FastAPI (Python preferred for ML + orchestration simplicity)
- **Frontend:** React (Next.js recommended)
- **Database:** PostgreSQL (with pgvector extension for embeddings later)
- **Storage:** AWS S3 (datasets + results)
- **Queue:** AWS SQS (job orchestration backbone)
- **Compute:** AWS Batch (primary execution engine)
- **Containerization:** Docker for all compute jobs
- **Optional hybrid compute:** local workstation worker node consuming SQS jobs

---

## Job System Design

### Job Lifecycle


queued → running → completed → failed
↘ cancelled


### Important rules:
- Jobs are immutable once created (only status changes)
- Every job execution must be idempotent
- Failed jobs must be retryable via queue reprocessing
- Job execution must always be containerized

---

## Core Entities

### users
- Authentication identity
- Linked to projects

### projects
- Logical workspace per user

### datasets
- Stored in S3
- Metadata stored in Postgres
- Can be reused across jobs

### jobs
- Defines compute task
- Includes dataset reference + config

### job_runs
- Execution instance of a job (supports retries)

### results
- Output artifacts stored in S3
- Metadata stored in Postgres

---

## Compute Layer Rules

### AWS Batch (Primary)
- Executes containerized jobs
- Must be stateless
- Pulls input from S3
- Pushes output to S3

### Workstation Worker (Optional)
- Polls SQS queue
- Executes same Docker jobs locally
- Used for dev/test or overflow compute
- Must behave identically to AWS Batch execution

---

## Security Requirements

- IAM roles must be scoped per service:
  - backend role (S3 + SQS access)
  - batch execution role (S3 read/write only for job scope)
  - worker node role (restricted queue + S3 access)
- No long-lived AWS credentials in code
- All secrets stored in environment variables or AWS Secrets Manager
- JWT authentication required for all API routes
- Rate limit job submission endpoints to prevent abuse

---

## Data Storage Rules

- S3 is the source of truth for:
  - datasets
  - job inputs
  - job outputs
- PostgreSQL is the source of truth for:
  - metadata
  - job status
  - user/project structure

### Critical constraint:
Do NOT store large payloads in Postgres.

---

## Job Execution Rules

- Every job must run inside a Docker container
- No direct execution on backend server
- Input always pulled from S3
- Output always written to S3
- Execution must be reproducible

---

## Queue System Rules (SQS)

- SQS is the single source of job dispatch
- Backend enqueues jobs only
- Workers (Batch or local) consume jobs only
- No direct backend execution triggers allowed

---

## Observability Requirements

- Every job must emit logs
- Logs must be retrievable per job_run
- Track:
  - execution time
  - success/failure state
  - error messages
- System health endpoint required: `/health`

---

## Hybrid Compute Rules (Workstation Node)

If enabled:

- Must poll SQS continuously
- Must respect job locking (no duplicate execution)
- Must upload outputs identical to AWS Batch
- Must fail gracefully if disconnected
- Must NOT bypass backend API

---

## Performance Targets

- Job submission latency: < 300ms
- Job start time (idle system): < 10 seconds
- Result retrieval: < 200ms (metadata query)
- Dataset upload processing: < 1 minute for 100MB files

---

## Security Checklist

- [ ] IAM roles separated per service
- [ ] S3 buckets locked down (no public access)
- [ ] JWT validation on all endpoints
- [ ] SQS access restricted to authorized roles
- [ ] No AWS root credentials used in code
- [ ] Secrets stored in secure env or Secrets Manager
- [ ] Rate limiting enabled on job submission API

---

## Critical System Rules

- The backend does NOT execute jobs directly
- All compute MUST go through:
  - AWS Batch OR
  - Workstation worker via SQS
- No exceptions
- No synchronous compute inside API layer

---

## Phase 1 Blockers (must be completed before expansion)

- [ ] AWS S3 + RDS + SQS fully configured
- [ ] Job queue pipeline working end-to-end
- [ ] AWS Batch container execution working
- [ ] Worker node implemented (or explicitly deferred)
- [ ] Job lifecycle fully functional
- [ ] Basic frontend dashboard integrated with API
- [ ] Security (IAM + JWT) implemented correctly

---

## Design Philosophy

This system should always follow:

- Queue-first architecture (never synchronous compute)
- Stateless compute workers
- Cloud-native storage separation (S3 vs Postgres)
- Reproducible containerized execution
- Clear separation between control plane (backend) and compute plane (Batch/worker)

---

## Anti-Patterns to Avoid

- Do NOT run ML jobs inside FastAPI server
- Do NOT store datasets in PostgreSQL
- Do NOT bypass SQS queue for execution
- Do NOT tightly couple frontend to compute logic
- Do NOT mix orchestration logic with execution logic

---