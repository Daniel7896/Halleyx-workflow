# HalleyX Workflow Automation Engine

> A production-style MERN stack application for building, managing, and executing automated multi-step business workflows with a custom rule evaluation engine.

---

## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB, Mongoose (UUID `_id`)        |
| Security   | Helmet, CORS                          |
| Logging    | Morgan, Dotenv                        |
| Frontend   | React 19, Vite, Tailwind CSS v4       |
| HTTP       | Axios                                 |
| Routing    | React Router v6                       |
| Icons      | Lucide React                          |

---

## Prerequisites

- **Node.js** v18 or higher
- **MongoDB** running locally on default port `27017`
- **npm** v8+

---

## Installation

```bash
# Install backend dependencies
cd halleyx-workflow-engine/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

---

## Environment Setup

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/halleyx_workflow
NODE_ENV=development
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Seed Script

The seed script populates the database with a ready-to-use "Expense Approval Workflow" with 4 steps and 4 rules.

```bash
# Run from the backend folder
cd backend && node ../seed/sampleWorkflow.js
```

---

## Running the App

Open **two terminals**:

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend UI (port 5173)
cd frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoint Reference

All responses follow the format:
- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "message": "..." }`

### Workflows
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| POST   | `/api/workflows`          | Create a new workflow           |
| GET    | `/api/workflows`          | List all workflows              |
| GET    | `/api/workflows/:id`      | Get a single workflow           |
| PUT    | `/api/workflows/:id`      | Update workflow (bumps version) |
| DELETE | `/api/workflows/:id`      | Delete a workflow               |

### Steps
| Method | Endpoint                              | Description            |
|--------|---------------------------------------|------------------------|
| POST   | `/api/workflows/:workflow_id/steps`   | Add a step             |
| GET    | `/api/workflows/:workflow_id/steps`   | List steps (by order)  |
| PUT    | `/api/steps/:id`                      | Update a step          |
| DELETE | `/api/steps/:id`                      | Delete a step          |

### Rules
| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| POST   | `/api/steps/:step_id/rules`       | Add a rule to a step         |
| GET    | `/api/steps/:step_id/rules`       | List rules (by priority)     |
| PUT    | `/api/rules/:id`                  | Update a rule                |
| DELETE | `/api/rules/:id`                  | Delete a rule                |

### Executions
| Method | Endpoint                                | Description                  |
|--------|-----------------------------------------|------------------------------|
| POST   | `/api/workflows/:workflow_id/execute`   | Trigger a workflow execution |
| GET    | `/api/executions/:id`                   | Get execution + logs         |
| POST   | `/api/executions/:id/cancel`            | Cancel an in-progress run    |
| POST   | `/api/executions/:id/retry`             | Retry from the failed step   |

---

## How the Rule Engine Works

The Rule Engine (`backend/src/engine/ruleEngine.js`) is a fully custom, hand-written expression parser — **no `eval()` or `new Function()` is used anywhere**. When an execution reaches a step, it loads all rules for that step, sorts them by their `priority` field (ascending), and evaluates each rule's `condition` string against the live input data. The parser handles comparison operators (`==`, `!=`, `>`, `>=`, `<`, `<=`), logical connectors (`&&`, `||`), string functions (`contains()`, `startsWith()`, `endsWith()`), and a special `DEFAULT` keyword that always resolves to true. Evaluation stops as soon as the first matching rule is found. If a field referenced in a condition is missing from the input data, the condition safely returns `false` instead of crashing.

---

## How the Execution Engine Works

The Execution Engine (`backend/src/engine/executionEngine.js`) implements a directed-graph traversal over the workflow's step-rule network. It begins at the step defined by `workflow.start_step_id` and enters a loop: for each step, it calls the Rule Engine to find the matching rule, logs the result (including all evaluated rules and the matched one), then follows the `next_step_id` pointer to the next step. The loop continues until a rule with `next_step_id = null` is matched, at which point the execution is marked `completed`. If any step fails to find a matching rule or a step cannot be found, the error is caught, logged into the execution document, and the status is set to `failed` — the server is never brought down. The engine also supports `cancel` (halts an in-progress run) and `retry` (resumes only from the last failed step, preserving prior successful log entries).

---

## Sample Execution Walkthrough

**Input submitted:**
```json
{ "amount": 500, "country": "US", "priority": "High" }
```

**Expected path:**
```
Manager Approval → Finance Notification → [DEFAULT → null] → Workflow Completed
```

**Log output (abbreviated):**
```
Step: "Manager Approval"
  ✅ amount > 100 && country == 'US' && priority == 'High'  → MATCHED
  Next Step: Finance Notification

Step: "Finance Notification"
  ✅ DEFAULT → MATCHED
  Next Step: null (Workflow Ends)

Execution Status: completed ✅
```

---

## Folder Structure

```
halleyx-workflow-engine/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── workflowController.js
│   │   │   ├── stepController.js
│   │   │   ├── ruleController.js
│   │   │   └── executionController.js
│   │   ├── engine/
│   │   │   ├── ruleEngine.js        ← Custom parser (no eval)
│   │   │   └── executionEngine.js   ← Graph traversal runner
│   │   ├── services/
│   │   │   ├── workflowService.js
│   │   │   ├── stepService.js
│   │   │   ├── ruleService.js
│   │   │   └── executionService.js
│   │   ├── middleware/errorHandler.js
│   │   ├── models/
│   │   │   ├── Workflow.js
│   │   │   ├── Step.js
│   │   │   ├── Rule.js
│   │   │   └── Execution.js
│   │   ├── routes/
│   │   │   ├── workflowRoutes.js
│   │   │   ├── stepRoutes.js
│   │   │   ├── ruleRoutes.js
│   │   │   └── executionRoutes.js
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── StepCard.jsx
│   │   │   ├── RuleRow.jsx
│   │   │   ├── LogViewer.jsx
│   │   │   └── SchemaBuilder.jsx
│   │   ├── pages/
│   │   │   ├── WorkflowList.jsx
│   │   │   ├── WorkflowEditor.jsx
│   │   │   ├── RuleEditor.jsx
│   │   │   ├── ExecutionPage.jsx
│   │   │   └── ExecutionLogs.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
├── seed/
│   └── sampleWorkflow.js
└── README.md
```
