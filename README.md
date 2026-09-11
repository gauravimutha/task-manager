# 📋 KanbanFlow — Full-Stack Task Management System

A full-stack, real-time Kanban task manager built with **React (Vite)**, **Node.js + Express (MCR Architecture)**, and **PostgreSQL**.

![Tech Stack](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169e1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🎨 Frontend UI & User Interaction
* **Kanban Board:** Three distinct workflow columns (`To Do`, `In Progress`, `Done`) with fluid drag-and-drop powered by `@hello-pangea/dnd`.
* **Task Cards:** Dynamic cards displaying priority tags (`Low`, `Medium`, `High`), due dates with overdue detection, multi-line descriptions, and assignee avatar badges.
* **Task CRUD & Modals:**
  * **Create:** Global `+ New Task` button or per-column `+` button with customizable metadata.
  * **Edit:** Edit task title, description, priority, due date, column, and assignees on the fly.
  * **Delete:** Instant card removal with optimistic UI updates.
* **Priority Filtering:** Filter cards in real-time by `All`, `High`, `Medium`, or `Low` with active count badges.
* **Team & Workload Distribution:** Live sidebar showing team members and their active in-progress task count with workload thresholds.
* **User Management:** Onboard new users or remove existing team members directly from the UI.

### ⚙️ Backend Logic & Architecture
* **MCR Architecture:** Cleanly organized into **Modular**, **Controller**, and **Routes** patterns for maintainability:
  * `modules/users/`
  * `modules/projects/`
  * `modules/tasks/`
* **Relational PostgreSQL Data Model:**
  * Strict foreign key constraints with `ON DELETE CASCADE`.
  * Automated trigger `tasks_updated_at` to update timestamps on row changes.
  * Native PostgreSQL `JSON_AGG` queries for nested task assignees.
* **Optimistic Drag-and-Drop Sync:** Dedicated `PATCH /api/tasks/:id/move` endpoint for column transitions and ordering.
* **Centralized Middleware:** CORS protection for Vite dev server, JSON body parsing, request validation, and global error handling.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, `@hello-pangea/dnd`, Vanilla CSS, `uuid` |
| **Backend** | Node.js, Express, `cors`, `dotenv`, `nodemon` |
| **Database** | PostgreSQL, `pg` (Native Connection Pool with SSL support) |
| **Architecture** | MCR (Model-Controller-Routes) Monorepo |

---

## 📁 Repository Structure

```
task-manager/
├── package.json               # Root monorepo scripts
├── .gitignore                 # Root gitignore
├── README.md
│
├── frontend/                  # React Single-Page Application
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx            # Main state container & live sync logic
│       ├── App.css            # Board & layout styling
│       ├── components/        # Header, Column, Card, Modals, TeamList, FilterBar
│       ├── data/              # Board definitions & fallback presets
│       ├── hooks/             # useWorkload hook for workload calculations
│       └── services/
│           └── api.js         # Centralized REST API client
│
└── backend/                   # Node.js + Express API
    ├── package.json
    ├── server.js              # Server entry point (port 3001)
    ├── schema.sql             # PostgreSQL schema, triggers & seed data
    ├── .env.example           # Environment template
    └── src/
        ├── app.js             # Express app, CORS, routes & error middleware
        ├── config/
        │   └── db.js          # pg.Pool configuration with SSL
        ├── middleware/        # errorHandler, request validation
        └── modules/           # Users, Projects, Tasks (Routes, Controllers, Models)
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **PostgreSQL** instance (local or hosted like Neon, Supabase, AWS RDS, etc.)

---

### 2. Clone the Repository
```bash
git clone https://github.com/gauravimutha/task-manager.git
cd task-manager
```

---

### 3. Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

---

### 4. Configure Environment Variables
Copy the example environment template in `backend`:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and update your PostgreSQL connection string:
```ini
# PostgreSQL Connection URL
DATABASE_URL="postgres://your_user:your_password@your_host:5432/your_database?sslmode=require"

# Server Port
PORT=3001
```

---

### 5. Initialize the Database Schema
Execute [backend/schema.sql](file:///Users/khush/Desktop/Quantiphi-vibe%20coding/backend/schema.sql) against your PostgreSQL database:

```bash
# Using psql:
psql -d "YOUR_DATABASE_URL" -f backend/schema.sql

# Or using Node:
node -e "
const fs = require('fs');
const pool = require('./backend/src/config/db');
pool.query(fs.readFileSync('./backend/schema.sql', 'utf8'))
  .then(() => { console.log('Schema initialized!'); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
"
```

---

### 6. Run the Application

From the root project folder:

#### Start the Backend API (Port 3001)
```bash
npm run dev:backend
```

#### In a new terminal, start the Frontend (Port 5173)
```bash
npm run dev
# or: npm run dev:frontend
```

Now open your browser at **`http://localhost:5173`**! 🎉

---

## 📡 REST API Reference

### Health
* `GET /api/health` — API health status

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | Get all tasks for a project (with assignees) |
| `POST` | `/api/projects/:projectId/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Get single task details |
| `PUT` | `/api/tasks/:id` | Update task title, description, priority, due date, status |
| `PATCH`| `/api/tasks/:id/move` | Move task to new column (`status`) and reorder (`position`) |
| `DELETE`| `/api/tasks/:id` | Delete task |
| `POST` | `/api/tasks/:id/assignees` | Assign user to task (`{ userId }`) |
| `DELETE`| `/api/tasks/:id/assignees/:userId` | Remove assignee from task |

### Users
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a new user (`{ name, email }`) |
| `PUT` | `/api/users/:id` | Update user details |
| `DELETE`| `/api/users/:id` | Delete user |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects with task & member counts |
| `GET` | `/api/projects/:id` | Get project details and members |
| `POST` | `/api/projects` | Create a project (`{ title, description }`) |
| `POST` | `/api/projects/:id/members` | Add/update project member role (`owner`/`member`) |
| `DELETE`| `/api/projects/:id/members/:userId` | Remove member from project |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS ||--o{ PROJECT_MEMBERS : "joins"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has members"
    PROJECTS ||--o{ TASKS : "contains"
    TASKS ||--o{ TASK_ASSIGNEES : "has"
    USERS ||--o{ TASK_ASSIGNEES : "assigned to"

    USERS {
        serial id PK
        varchar name
        varchar email UK
        timestamp created_at
    }

    PROJECTS {
        serial id PK
        varchar title
        text description
        timestamp created_at
    }

    PROJECT_MEMBERS {
        serial id PK
        int project_id FK
        int user_id FK
        varchar role "owner | member"
        timestamp joined_at
    }

    TASKS {
        serial id PK
        int project_id FK
        varchar title
        text description
        varchar priority "low | medium | high"
        varchar status "todo | inprogress | done"
        date due_date
        int position
        timestamp created_at
        timestamp updated_at
    }

    TASK_ASSIGNEES {
        int task_id PK,FK
        int user_id PK,FK
    }
```

---

## 🛡️ Security
* Environment variables containing database credentials (`backend/.env`) are strictly excluded via `.gitignore`.
* All SQL queries utilize parameterized queries (`$1`, `$2`, ...) to protect against SQL injection vulnerabilities.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
