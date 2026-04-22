# DLQF Platform — Features

> **Stack:** React (Next.js) · FastAPI (Python) · AWS (S3, RDS, SQS, Batch, IAM) · Docker · PostgreSQL · pgvector · ECR · Optional: Workstation Compute Node  
> **Last updated:** April 2026

---

## Core Features — Must Ship First

> **Goal:** Fully working end-to-end system: User → Dataset → Job Submission → Compute Execution → Results → Dashboard

---

## Auth + User System

- [ ] Implement authentication (JWT or AWS Cognito)
- [ ] User signup/login system
- [ ] API key generation for programmatic access
- [ ] Role system (admin vs user)
- [ ] Project/workspace creation per user

---

## Dataset Management

- [ ] Upload datasets (CSV, JSON, images)
- [ ] Store datasets in AWS S3
- [ ] Dataset metadata tracking in PostgreSQL
- [ ] Dataset preview in frontend
- [ ] Delete/archive datasets (soft delete with `deleted_at`)
- [ ] Dataset versioning (v1, v2, etc.)

---

## Job Submission System

- [ ] Create job submission form (model type, dataset, parameters)
- [ ] Job creation API (`POST /jobs`)
- [ ] Store job metadata in PostgreSQL
- [ ] Job status lifecycle:
  - queued → running → completed → failed
- [ ] Job priority levels (low / medium / high)

---

## Compute Execution Engine

- [ ] AWS Batch integration for job execution
- [ ] Dockerized execution environment for all jobs
- [ ] Standard job container format:
  - input: dataset + config JSON
  - output: results JSON / files
- [ ] Retry logic for failed jobs
- [ ] Parallel execution support (multiple Batch jobs)

---

## Hybrid Compute Node (Workstation Worker)

- [ ] Local worker daemon on workstation
- [ ] Poll AWS SQS for jobs
- [ ] Execute jobs locally in Docker
- [ ] Upload results back to S3
- [ ] Sync job status back to AWS

---

## Job Monitoring Dashboard

- [ ] Live job status tracking (queued / running / completed / failed)
- [ ] Job logs viewer
- [ ] Execution time tracking
- [ ] Resource usage display
- [ ] Job retry/failure reason display
- [ ] Cancel running job (if supported)

---

## Results System

- [ ] Store outputs in AWS S3
- [ ] Store structured results in PostgreSQL
- [ ] Results download (JSON/CSV export)
- [ ] Basic visualization (tables, charts)
- [ ] Job history per user/project

---

## API Layer (Developer Access)

- [ ] REST API for:
  - dataset upload
  - job submission
  - job status polling
  - results retrieval
- [ ] API authentication via tokens
- [ ] Rate limiting per user/API key
- [ ] API documentation (Swagger/OpenAPI)

---

## UI Foundation

- [ ] Dashboard layout (responsive, mobile-first)
- [ ] Sidebar navigation (Projects / Datasets / Jobs / Results)
- [ ] Component library (buttons, cards, tables, modals)
- [ ] Loading + error states
- [ ] Dark/light mode (optional)

---

## Infrastructure Setup

- [ ] AWS account setup (separate DLQF account)
- [ ] S3 buckets:
  - datasets bucket
  - results bucket
- [ ] RDS PostgreSQL setup
- [ ] SQS job queue setup
- [ ] AWS Batch compute environment
- [ ] IAM roles for services
- [ ] ECR Docker registry
- [ ] Environment variable management

---

## Job Lifecycle System

- [ ] Job status enum:
  - queued
  - running
  - completed
  - failed
  - cancelled
- [ ] Retry logic for failed jobs
- [ ] Dead-letter queue handling
- [ ] Idempotent execution tracking

---

## Compute Jobs (Core ML Execution)

- [ ] Support Python-based ML scripts
- [ ] Standard job runner interface
- [ ] Predefined job types:
  - classification
  - regression
  - preprocessing
  - batch inference
- [ ] Standardized output format

---

## Infrastructure — Core Tables

- [ ] `users`
- [ ] `projects`
- [ ] `datasets`
- [ ] `jobs`
- [ ] `job_runs`
- [ ] `results`
- [ ] `processed_jobs` (idempotency tracking)

---

## Security & Access Control

- [ ] IAM role separation per service
- [ ] Secure S3 policies (bucket-level access control)
- [ ] JWT authentication on all API routes
- [ ] API key hashing + rotation support
- [ ] Secrets stored in AWS Secrets Manager
- [ ] Rate limiting for job submission endpoints

---

## Observability & Logging

- [ ] Centralized logging (CloudWatch or DB logs)
- [ ] Job-level execution logs
- [ ] Error tracking per job
- [ ] Health check endpoint (`/health`)
- [ ] Basic metrics dashboard:
  - jobs per day
  - success/failure rate
  - average runtime

---

## Notifications System

- [ ] Email notifications (job completion/failure)
- [ ] In-app notifications
- [ ] Optional webhook support
- [ ] Alerts for long-running jobs

---

## Integration Checkpoint

> ⚠️ System is only considered functional when ALL below work:

- [ ] Dataset upload → S3 storage
- [ ] Job submission → DB + queue
- [ ] AWS Batch or workstation executes job
- [ ] Output stored in S3
- [ ] Results visible in dashboard

---

## Advanced Features — After Core Works

---

## Semantic Dataset Search (pgvector)

- [ ] Dataset embeddings using pgvector
- [ ] Semantic search across datasets
- [ ] Hybrid keyword + vector search
- [ ] “Find similar datasets” feature

---

## Experiment Tracking System

- [ ] Track ML runs per job
- [ ] Store hyperparameters
- [ ] Store evaluation metrics
- [ ] Compare experiments
- [ ] Versioned outputs

---

## AI Job Assistant

- [ ] Natural language → job generation
- [ ] Auto-suggest model type
- [ ] Auto-fill parameters
- [ ] Explain results in plain English

---

## Workstation Scaling Layer

- [ ] Multi-job parallel execution
- [ ] SQS-based distribution
- [ ] Failover to workstation if AWS Batch fails
- [ ] Resource-aware scheduling

---

## Admin Panel

- [ ] View users, datasets, jobs
- [ ] Delete/rerun jobs
- [ ] Platform-wide analytics
- [ ] Audit logs for admin actions

---

## Cost & Usage Tracking

- [ ] Per-user compute usage tracking
- [ ] Job cost estimation
- [ ] Usage dashboard
- [ ] Cost alerts

---

## Unscheduled Backlog

| Feature | Why it matters | Effort |
|---|---|---|
| Auto ML selection | Suggest best model automatically | Medium |
| GPU scheduling | Optimize compute routing | High |
| Dataset quality scoring | Detect missing/bad data | Medium |
| Model deployment API | Turn models into endpoints | High |
| Collaborative projects | Multi-user workspaces | Medium |
| Live job streaming | Real-time logs via WebSockets | Medium |

---

## Execution Strategy

### Build order:
1. Auth + Projects
2. Dataset upload (S3)
3. Job submission system
4. Compute (AWS Batch)
5. Results pipeline
6. Dashboard
7. Hybrid workstation node

---

### Cut order if behind schedule:
- AI assistant ❌  
- semantic search ❌  
- experiment tracking ❌  
- workstation hybrid ❌ (fallback to AWS Batch only)

---

## Security Checklist

- IAM per service (no shared credentials)
- S3 access restrictions
- Signed URLs for dataset access
- JWT authentication
- Rate limiting on compute endpoints
- Webhook signature validation
- Secrets stored in AWS Secrets Manager

---

## Performance Targets

| Metric | Target |
|---|---|
| Job submission latency | < 300ms |
| Job start time | < 10s |
| Result retrieval | < 200ms |
| Dashboard load | < 2s |
| Compute failure recovery | >95% success rate |

---