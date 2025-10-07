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

*   `GET /users`: すべてのユーザーを取得します。
*   `POST /users`: 新しいユーザーを作成します。
*   `GET /posts`: すべての投稿を取得します。
*   `POST /posts`: 新しい投稿を作成します。

## デプロイメント

### 本番環境

- **バックエンド:** `https://backend.s-muramori-sys22.workers.dev`
- **フロントエンド:** `https://566e1f9c.frontend-5xn.pages.dev`

### Preview Deployments (Pull Request時)

このプロジェクトでは、Pull Requestを作成すると自動的にCloudflareにpreview環境がデプロイされます。

#### セットアップ方法

1. **GitHub Secretsの設定**
   - リポジトリの Settings → Security → Secrets and variables → Actions
   - 以下のSecretsを追加：
     - `CLOUDFLARE_API_TOKEN`: CloudflareのAPI Token
     - `CLOUDFLARE_ACCOUNT_ID`: CloudflareのAccount ID
     - `DATABASE_URL`: Prisma Accelerate の接続URL

2. **Pull Requestの作成**
   - 新しいブランチで作業
   - Pull Requestを作成すると自動的にpreview環境がデプロイ
   - PRコメントにpreview URLが表示されます

#### Preview Deployment の特徴

- **自動デプロイ**: PRの作成・更新時に自動実行
- **独立環境**: 本番環境に影響を与えない
- **URL表示**: PRコメントにpreview URLが自動表示
- **連携テスト**: フロントエンドとバックエンドが連携したpreview環境

詳細な設定方法は [`GITHUB_SECRETS_SETUP.md`](./GITHUB_SECRETS_SETUP.md) を参照してください。

## GitHub-Cloudflare 連携

### 自動デプロイメント

このプロジェクトは完全な CI/CD パイプラインが設定されています：

- **本番デプロイ**: `main` ブランチへのpush時に自動デプロイ
- **Preview デプロイ**: Pull Request時に自動でpreview環境を作成
- **ヘルスチェック**: 毎時アプリケーションの状態を監視
- **自動クリーンアップ**: PR終了時にpreview環境を削除

### 監視とメンテナンス

- **GitHub Actions**: `.github/workflows/` でワークフロー状況を確認
- **Cloudflare Dashboard**: デプロイ状況とパフォーマンス監視
- **自動ヘルスチェック**: 毎時実行され、問題時にIssueを自動作成

詳細な連携設定は [`CLOUDFLARE_GITHUB_INTEGRATION.md`](./CLOUDFLARE_GITHUB_INTEGRATION.md) を参照してください。

## その他
- **コードフォーマット**: `prettier`を使用
- **Lint**: `eslint`を使用 
