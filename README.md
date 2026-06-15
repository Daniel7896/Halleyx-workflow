# ⚡ FlowCraft — Workflow Automation SaaS

**Build, automate, and monitor powerful multi-step business workflows with a visual rule engine.**

FlowCraft is a micro SaaS platform that lets users design directed-graph workflows with conditional routing, execute them in real-time, and monitor results with detailed audit logs.

## 🚀 Features

- **Visual Workflow Builder** — Create multi-step automation pipelines
- **Custom Rule Engine** — Secure expression parser (no `eval()`)
- **Real-time Execution Logs** — Detailed step-by-step audit trails
- **Smart Retry** — Resume failed workflows from the exact failure point
- **Multi-tenant Auth** — JWT-based authentication with data isolation
- **Tiered Billing** — Free, Pro ($19/mo), and Business ($49/mo) plans
- **Analytics Dashboard** — Track workflows, execution counts, and success rates
- **REST API** — Full API access for programmatic workflow triggers

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Lucide React |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Deployment | Vercel (frontend) + Render (backend) |

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd halleyx-workflow-engine

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/flowcraft_db
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Run
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173` to access FlowCraft.

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Workflows (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List user's workflows |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows/:id` | Get workflow |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| POST | `/api/workflows/:id/execute` | Execute workflow |

### Analytics (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Get dashboard stats |

## 💰 Pricing Tiers

| Feature | Free | Pro ($19/mo) | Business ($49/mo) |
|---------|------|-------------|-------------------|
| Workflows | 3 | 25 | Unlimited |
| Executions/mo | 100 | 5,000 | Unlimited |
| Steps/workflow | 5 | 20 | Unlimited |
| History | 7 days | 30 days | 90 days |
| API Access | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

## 📄 License

Proprietary. All rights reserved.

---

Built with ❤️ by FlowCraft
