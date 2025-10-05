# React (Next.js) + Hono + Prisma セットアップガイド

このプロジェクトは、フロントエンドにReact (Next.js)、バックエンドにHono、データベースにPrismaを使用したフルスタックアプリケーションのセットアップガイドです。

## 概要

*   **フロントエンド:** React (Next.js)
*   **バックエンド:** Hono (Cloudflare Workers上で動作)
*   **データベース:** Prisma (PostgreSQL)
*   **ビルドツール:** Vite (バックエンド), Next.js CLI (フロントエンド)

## 前提条件

*   Node.js (v18.x 以降)
*   npm
*   Cloudflareアカウント
*   Git

## バックエンドのセットアップ (Hono + Prisma)

1.  `backend`ディレクトリに移動します。
    ```bash
    cd backend
    ```

2.  依存関係をインストールします。
    ```bash
    npm install
    ```

3.  `.env`ファイルを作成し、データベースの接続情報を設定します。
    ```
    DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza194Tmg3bWdQS25GbUdtQXVkZlFkZGEiLCJhcGlfa2V5IjoiMDFLNlQxMUZWMUNTNlhFS1k1WFFFVDZCVjMiLCJ0ZW5hbnRfaWQiOiIzN2U0MDdkNzYwZDdmN2NiN2ZlNzhkMmRmYWM1NjVkYTczMWQ3ZjdlM2NmZjhlOThjOThhNWZkYmNjNWIwYmNmIiwiaW50ZXJuYWxfc2VjcmV0IjoiZWYwYWIwZTEtMzVjYS00OGQ3LWI4MDMtZDE4ZmQ4NjVmNjUwIn0.JFmtIPLBnqx8LlblPLZEPB6L74n2bZousf4kgVntFaY"
    ```

4.  Prismaマイグレーションを実行して、データベースにテーブルを作成します。
    ```bash
    npx prisma migrate dev
    ```

5.  Prisma Clientを生成します。
    ```bash
    npx prisma generate
    ```

6.  開発サーバーを起動します。
    ```bash
    npm run dev
    ```
    バックエンドサーバーは `http://localhost:8787` で起動します。

## フロントエンドのセットアップ (React with Next.js)

1.  プロジェクトのルートディレクトリで、Next.jsアプリケーションを新規作成します。
    ```bash
    npx create-next-app@latest frontend
    ```
    作成中に表示される質問には、お好みに合わせて回答してください。

2.  `frontend`ディレクトリに移動します。
    ```bash
    cd frontend
    ```

3.  開発サーバーを起動します。
    ```bash
    npm run dev
    ```
    フロントエンドサーバーは `http://localhost:3000` で起動します。

4.  **バックエンドからのデータ取得**

    Next.jsのコンポーネント内で`useEffect`と`fetch`を使用して、バックエンドのAPIからデータを取得できます。

    以下は、`/todos`エンドポイントからTodoリストを取得して表示するコンポーネントの例です。(`frontend/app/page.tsx`などに記述)

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

    **注意:** より複雑なアプリケーションでは、`SWR`や`TanStack Query (React Query)`などのデータ取得ライブラリを使用することを推奨します。

## プロジェクト構成

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

## APIエンドポイント

*   `GET /todos`: すべてのTodoを取得します。
*   `POST /todos`: 新しいTodoを作成します。

    リクエストボディ:
    ```json
    {
      "title": "新しいTodo"
    }
    ```
