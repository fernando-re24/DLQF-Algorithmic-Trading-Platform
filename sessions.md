Session Commands


{Sync}: Before responding, read and follow these files as the authoritative source of truth:

CLAUDE.md  
.claude/rules/project.md  
.claude/rules/decisions.md  
docs/architecture.md  
docs/prd.md  

These documents define the platform architecture, infrastructure decisions, and product goals.

Do not invent system behavior or infrastructure not described in these files.  
If something is missing or unclear, ask exactly one clarifying question before proceeding.

Assume this repository implements the **DLQF Algorithmic Trading Challenge Platform**, a cloud-native system that evaluates algorithmic trading strategies using containerized simulations and hidden out-of-sample datasets.




{Save}: Update project documentation to reflect the changes made during this session.

Update the following if relevant:

docs/architecture.md → if system architecture changed  
docs/prd.md → if product features changed  
.claude/rules/decisions.md → if new architectural decisions were made  

Ensure documentation reflects the current system design.

Do not rewrite documents unnecessarily — only update sections impacted by the changes.





{Plan}: Before writing code, explain the proposed implementation plan.

Your response must include:

1. Problem being solved
2. Components affected
3. Files that will be modified or created
4. Data flow through the system
5. Any infrastructure changes
6. Potential risks or edge cases

Ensure the plan aligns with:

- AWS-first infrastructure
- containerized evaluation pipelines
- deterministic simulation
- DynamoDB metadata storage
- S3 dataset storage

Wait for approval before implementing the plan.




{Explain}: Analyze the relevant code and explain how it works at a system level.

Your explanation should include:

1. The purpose of the component
2. How it fits into the platform architecture
3. Key functions and logic
4. Data flow through the component
5. Any dependencies on AWS services or infrastructure
6. Potential issues or improvements


