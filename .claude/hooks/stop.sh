#!/bin/bash

# Read the full session context
CONTEXT=$(cat)

# Patterns that suggest real learning / architectural decisions happened
SIGNALS="decided|decision|changed approach|refactor|fix|fixed|bug|leakage|overfitting|optimization|discovered|realized|promoted team|regression|convergence"

if echo "$CONTEXT" | grep -qiE "$SIGNALS"; then
    cat << 'EOF'
{
  "decision": "approve",
  "systemMessage": "This session likely involved a decision or discovery. Consider updating .claude/rules/decisions.md."
}
EOF
else
    echo '{"decision":"approve"}'
fi