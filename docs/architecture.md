# System Architecture

The **DLQF Algorithmic Trading Challenge Platform** is a cloud-native system that evaluates user-submitted trading strategies in a reproducible and secure environment.

Participants download training datasets, submit strategies, and view leaderboard rankings based on performance on a hidden evaluation dataset.

The platform is designed to support:

- containerized evaluation
- deterministic scoring
- scalable execution of large numbers of strategies

---

# High-Level Architecture


User
│
▼
Frontend (Next.js)
│
▼
Authentication (Supabase Auth)
│
▼
Backend API (FastAPI)
│
├── S3 (datasets, submissions, evaluation artifacts)
├── DynamoDB (users, teams, submissions, leaderboard)
└── SQS (evaluation job queue)
│
▼
Evaluation Worker
│
▼
Docker Container
│
▼
Evaluation Engine
(loader + simulator + metrics)
│
▼
Results + Artifacts
│
▼
S3 + DynamoDB
│
▼
Leaderboard + Results UI


---

# Core Components

## Frontend

**Next.js + React** web application used by participants.

### Responsibilities

- challenge browsing
- dataset download
- strategy submission
- leaderboard viewing
- viewing evaluation results
- authentication via Supabase

### Main Pages

- Homepage
- Challenge Page
- Dataset Page
- Submit Strategy Page
- Leaderboard Page
- Results Page

---

# Authentication

Authentication is handled by **Supabase Auth**.

Supabase manages:

- user signup
- login
- session management
- JWT tokens

After login, the frontend receives a **JWT token**.

This token is attached to all API requests:


Authorization: Bearer <supabase_jwt>


The backend verifies the token and extracts the `user_id`.

This `user_id` becomes the primary identifier for users within the platform.

User profiles are stored in **DynamoDB**.

---

# Backend API

The backend is implemented using **FastAPI**.

### Responsibilities

- verifying authentication tokens
- registering submissions
- retrieving challenge metadata
- returning leaderboard data
- returning evaluation results
- triggering evaluation jobs

### Example API Endpoints


POST /submit
GET /submission/{id}
GET /leaderboard
GET /results/{submission_id}
GET /challenge
GET /dataset


---

# Storage Layer

## Amazon S3

S3 is used for storing large files.

### Stored Data


datasets/
train.parquet
metadata.json
schema.md

submissions/
SUB-0001/strategy.zip
SUB-0002/strategy.zip

results/
SUB-0001/
metrics.json
equity_curve.csv
trades.csv
plots.png
logs.txt


S3 provides scalable storage for datasets and evaluation outputs.

---

# Database

## DynamoDB

DynamoDB stores structured platform metadata.

### Users


user_id
email
created_at
team_id


### Teams


team_id
team_name
members
best_submission_id


### Submissions


submission_id
user_id
team_id
status
timestamp
metrics_summary
artifact_location


### Leaderboard


team_id
best_sharpe
submission_id
last_updated


DynamoDB enables fast queries for leaderboard data and submission status.

---

# Evaluation Pipeline

The evaluation pipeline runs trading simulations for submitted strategies.

Each submission is evaluated in an **isolated container**.

### Evaluation Process


submission uploaded

submission stored in S3

evaluation job queued

worker executes evaluation container

results stored in S3

leaderboard updated


### Evaluation Artifacts


metrics.json
equity_curve.csv
trades.csv
plots.png
logs.txt


---

# Evaluation Engine

The evaluation engine is implemented in Python.

### Core Modules


loader.py
simulator.py
metrics.py
visualizations.py


### Responsibilities

**Loader**

- loads strategy model
- loads dataset
- prepares feature matrix
- generates ground-truth labels

**Simulator**

- runs the trading loop
- executes buy/hold/sell signals
- tracks portfolio value
- produces equity curve

**Metrics**

- Sharpe ratio
- Sortino ratio
- CAGR
- Max drawdown
- classification metrics

**Visualizations**

- equity curve plots
- signal comparisons
- benchmark comparisons

---

# Evaluation Infrastructure

Evaluation runs inside **Docker containers**.

### Container Execution Steps


extract strategy.zip

run feature engineering script

load trained model

run trading simulation

compute performance metrics

write artifacts to output directory


Containers provide:

- deterministic evaluation
- reproducible environments
- isolation between submissions

---

# Evaluation Queue

The platform uses **Amazon SQS** to queue evaluation jobs.

### Queue Flow


User submission
│
▼
Backend API
│
▼
Submission stored in S3
│
▼
Message added to SQS queue
│
▼
Worker consumes job
│
▼
Evaluation container executed


This queue allows the platform to process many submissions concurrently.

---

# Scaling Infrastructure

For the MVP, evaluation jobs may run on a simple worker instance.

For production scaling, evaluation will run on:

**AWS Batch**

Benefits:

- automatic container scheduling
- horizontal scaling
- isolated compute environments
- efficient resource utilization

---

# Security Model

Hidden evaluation datasets must never be accessible to participants.

### Security Measures


hidden datasets stored in restricted S3 buckets
only evaluation worker roles have permission to access them
participants only download training datasets
evaluation containers run without external network access


This prevents participants from accessing hidden evaluation data.

---

# Key Design Principles

### Reproducibility

Evaluations must produce identical results for the same submission and dataset.

### Isolation

Each strategy runs in a container to prevent interference between submissions.

### Scalability

The system must support large numbers of submissions running concurrently.

### Security

Participants cannot access hidden evaluation datasets.

### Transparency

Evaluation metrics and artifacts are stored and available for inspection.