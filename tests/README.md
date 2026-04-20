# Testing Documentation

## Introduction
This document describes the automated testing suite implemented using Playwright. The suite validates both the frontend 
of the SemT-X framework and its backend logic by verifying semantic enrichment results.

The primary objective is to ensure application stability through regression testing, when integrating new features and
updating existing ones, and to validate complex user workflows across the entire semantic pipeline.

## Project Structure
The tests are organized into logical directories to separate UI components, core semantic workflows, and global tools.

```text title="Folders and files"
📦src
 ┣ 📂tests
 ┃ ┣ 📂auth
 ┃ ┃ ┗ 📜login.spec.ts
 ┃ ┣ 📂contextual-actions
 ┃ ┃ ┣ 📜column_header.spec.ts
 ┃ ┃ ┣ 📜row.spec.ts
 ┃ ┃ ┗ 📜subtoolbar.spec.ts
 ┃ ┣ 📂dashboard-management
 ┃ ┃ ┗ 📜dashboard.spec.ts
 ┃ ┣ 📂enrichment
 ┃ ┃ ┣ 📜column_revision.spec.ts
 ┃ ┃ ┣ 📜entity_revision.spec.ts
 ┃ ┃ ┣ 📜extension.spec.ts
 ┃ ┃ ┣ 📜generative_ai.spec.ts
 ┃ ┃ ┣ 📜modification.spec.ts
 ┃ ┃ ┗ 📜reconciliation.spec.ts
 ┃ ┣ 📂global-actions
 ┃ ┃ ┣ 📜automatic_annotation.spec.ts
 ┃ ┃ ┣ 📜compliance.spec.ts
 ┃ ┃ ┣ 📜export.spec.ts
 ┃ ┃ ┣ 📜help.spec.ts
 ┃ ┃ ┗ 📜visualization.spec.ts
 ┃ ┣ 📂openrefine
 ┃ ┃ ┣ 📂enrichment
 ┃ ┃ ┃ ┣ 📜entity_revision.spec.ts
 ┃ ┃ ┃ ┣ 📜extension.spec.ts
 ┃ ┃ ┃ ┣ 📜modification.spec.ts
 ┃ ┃ ┃ ┗ 📜reconciliation.spec.ts
 ┃ ┃ ┗ 📂user-tasks
 ┃ ┃ ┃ ┣ 📜task_full_workflow.spec.ts
 ┃ ┃ ┃ ┗ 📜task_reconcile_revision.spec.ts
 ┃ ┣ 📂user-tasks
 ┃ ┃ ┣ 📜task_full_workflow.spec.ts
 ┃ ┃ ┣ 📜task_reconcile_revision.spec.ts
 ┃ ┃ ┗ 📜task_schema_annotation.spec.ts
 ┃ ┗ 📂utils
 ┃   ┗ 📜setup.utils.ts
```

## Execution and Development CLI
The Playwright framework provides a set of Command Line Interface (CLI) tools that were essential for the development and maintenance of the SemT-X test suite:

- `npx playwright codegen`: An automated Test Generator used to accelerate the creation of initial test scripts. By interacting with the SemT-X interface in a specialized browser window, the tool automatically records user actions (clicks, fills, navigations) and generates the corresponding TypeScript code with optimized locators. 
- `npx playwright test --ui`: Launches the Interactive UI Mode. This tool was primarily used during the development phase to provide a real-time visual preview of the test execution, allowing for step-by-step debugging and time-travel analysis through the execution trace.
- `npx playwright show-report`: Used to serve the locally generated \textbf{HTML Report}. It provides a centralized view of the test results, including execution times, console logs, and attachments (videos/screenshots), which is crucial for analyzing the performance of semantic enrichment tasks.
