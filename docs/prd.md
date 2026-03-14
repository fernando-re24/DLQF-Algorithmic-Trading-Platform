# Product Requirements Document

## Product

DLQF Algorithmic Trading Challenge Platform

## Goal

Provide a competitive research environment where participants develop and test algorithmic trading strategies.

The platform evaluates strategies using realistic market simulations and hidden test data.

## Target Users

Primary users:

- quantitative finance students
- data science researchers
- algorithmic trading enthusiasts

Secondary users:

- research labs
- finance clubs
- academic institutions

## Core Features

### Strategy Submission

Users submit strategy code as:

- ZIP package
or
- GitHub repository reference

Strategies must implement a required API.

---

### Automated Evaluation

Submissions are executed inside containerized environments.

Evaluation pipeline:

1. strategy execution
2. simulated market trading
3. metric computation
4. leaderboard update

---

### Realistic Market Simulation

The simulation engine models:

- transaction costs
- slippage
- liquidity constraints
- leverage limits

---

### Leaderboard

Participants are ranked based on performance metrics such as:

- Sharpe ratio
- drawdown
- volatility
- risk-adjusted returns

---

### Dataset Management

Participants receive:

- training datasets

Final scoring occurs on:

- hidden test datasets

---

## Non-Goals

The platform is **not** intended to provide:

- real-money trading execution
- brokerage connectivity
- live trading infrastructure

The platform is strictly for **research and competition**.