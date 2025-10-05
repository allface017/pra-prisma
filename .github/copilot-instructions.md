# Copilot Instructions for `pra-prisma`

This document provides essential guidance for AI coding agents to be productive in the `pra-prisma` project. It outlines the architecture, workflows, and conventions specific to this repository.

## Project Overview

- **Frontend:** React (Next.js)
- **Backend:** Hono (running on Cloudflare Workers)
- **Database:** Prisma (PostgreSQL)
- **Build Tools:**
  - Vite (Backend)
  - Next.js CLI (Frontend)

### Directory Structure

```
pra-prisma/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── index.tsx
│   │   └── renderer.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── wrangler.jsonc
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Developer Workflows

### Backend Setup (Hono + Prisma)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and configure the database connection:
   ```env
   DATABASE_URL="your-database-url"
   ```

4. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

5. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:8787`.

### Frontend Setup (React with Next.js)

1. Create a new Next.js application in the root directory:
   ```bash
   npx create-next-app@latest frontend
   ```

2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend server will run at `http://localhost:3000`.

### API Endpoints

- `GET /todos`: Fetch all todos.
- `POST /todos`: Create a new todo.
  - Request body example:
    ```json
    {
      "title": "New Todo"
    }
    ```

## Project-Specific Patterns

### Fetching Data in Next.js

Use `useEffect` and `fetch` to retrieve data from the backend API. Example:

```tsx
'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('http://localhost:8787/todos');
        const data = await response.json();
        setTodos(data.todos);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  return (
    <main>
      <h1>Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

For more complex data fetching, consider using libraries like `SWR` or `TanStack Query`.

## Key Files and Directories

- `backend/prisma/schema.prisma`: Defines the database schema.
- `frontend/app/page.tsx`: Example entry point for the frontend application.
- `backend/src/index.tsx`: Main entry point for the backend server.

## Notes

- Ensure that the `.env` file is correctly configured before running the backend.
- Follow the directory structure and naming conventions outlined above to maintain consistency.
