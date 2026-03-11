# Project Rules

This repository implements the **DLQF Algorithmic Trading Challenge Platform**.

All development should support the platform's primary goal:

> Provide a secure, scalable, and reproducible environment for evaluating algorithmic trading strategies.

## Core Platform Requirements

The system must support:

- submission of trading strategies
- deterministic backtesting simulations
- evaluation on hidden out-of-sample data
- automated scoring and leaderboards
- secure isolation between user submissions

## Architectural Principles

### 1. AWS-first Infrastructure

The platform is built around AWS managed services.

Primary services:

- S3 (datasets + artifacts)
- DynamoDB (metadata)
- AWS Batch (strategy evaluation)
- Step Functions (workflow orchestration)
- Lambda (API logic)

Do not introduce infrastructure that conflicts with this architecture.

### 2. Deterministic Evaluation

Strategy evaluation must be reproducible.

Rules:

- fixed dataset versions
- fixed runtime environments
- containerized execution
- deterministic seeds where applicable

### 3. Dataset Isolation

Hidden test datasets must remain secure.

Rules:

- hidden data must never be accessible to participants
- only evaluation containers may access hidden data
- hidden datasets must live in restricted S3 buckets

### 4. Containerized Evaluation

All strategy execution occurs inside Docker containers.

Evaluation containers must:

- run in restricted environments
- enforce resource limits
- prohibit network access where possible

### 5. Platform Simplicity

Favor simple architectures.

Avoid:

- unnecessary microservices
- premature optimization
- over-engineered abstractions

The platform should remain maintainable by a small team.

## Coding Guidelines

- Prefer Python for evaluation and simulation code
- Prefer TypeScript for frontend code
- Write clear documentation for infrastructure workflows
- Keep evaluation logic modular and testable