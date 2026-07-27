#!/bin/bash

# Protected branches regex
PROTECTED_BRANCHES="^(main|master|develop|dev|test|staging)$"

while read local_ref local_sha remote_ref remote_sha
do
  remote_branch=$(echo "$remote_ref" | sed 's@refs/heads/@@')

  if [[ "$remote_branch" =~ $PROTECTED_BRANCHES ]]; then
    echo ""
    echo "================================================================="
    echo "❌ DIRECT PUSH REJECTED: Branch '$remote_branch' is protected!"
    echo "-----------------------------------------------------------------"
    echo "Direct pushes to '$remote_branch' are forbidden to prevent breaking changes."
    echo "Please push your changes to a feature branch and create a Pull Request:"
    echo ""
    echo "  1. git checkout -b feature/your-feature-name"
    echo "  2. git push -u origin feature/your-feature-name"
    echo "  3. Open a Pull Request on GitHub to merge into '$remote_branch'"
    echo "================================================================="
    echo ""
    exit 1
  fi
done

exit 0
