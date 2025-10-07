# HonoとPrismaプロジェクトのセットアップ指示

## 前提条件

- Node.js (v18 以上)
- npm または yarn
- PostgreSQL データベース (ローカルまたはリモート)
- Cloudflare アカウント (デプロイ時に必要)

## 1. 環境変数の設定

### バックエンド環境変数

`backend/.env` ファイルを作成し、以下を設定：

```env
# データベース接続URL
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT用の秘密鍵 (任意の文字列)
JWT_SECRET="your-jwt-secret-key"
```

### Cloudflare Workers用環境変数

`backend/wrangler.toml` または `backend/wrangler.jsonc` で環境変数を設定：

```toml
name = "hono-prisma-api"
main = "src/index.ts"
compatibility_date = "2023-10-30"

[env.production.vars]
JWT_SECRET = "your-production-jwt-secret"

[env.production]
# Cloudflare D1 データベース (オプション)
[[env.production.d1_databases]]
binding = "DB"
database_name = "your-d1-database"
database_id = "your-d1-database-id"
```

## 2. バックエンドのセットアップ

### インストールと初期化

```bash
cd backend

# 依存関係をインストール
npm install

# Prismaクライアントを生成
npx prisma generate

# データベースマイグレーションを実行
npx prisma migrate dev --name init

# 開発サーバーを起動
npm run dev
```

### Prismaの追加設定

データベーススキーマを変更する場合：

```bash
# スキーマを変更後、マイグレーションを作成
npx prisma migrate dev --name your-migration-name

# Prisma Studio でデータを確認 (オプション)
npx prisma studio
```

## 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 4. API エンドポイント一覧

### Users
- `GET /users` - 全ユーザー一覧
- `GET /users/:id` - 特定ユーザー取得
- `POST /users` - ユーザー作成
- `PUT /users/:id` - ユーザー更新
- `DELETE /users/:id` - ユーザー削除

### Posts
- `GET /posts` - 全投稿一覧
- `GET /posts/:id` - 特定投稿取得
- `POST /posts` - 投稿作成
- `PUT /posts/:id` - 投稿更新
- `DELETE /posts/:id` - 投稿削除

### リクエスト例

#### ユーザー作成
```json
POST /users
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### 投稿作成
```json
POST /posts
{
  "title": "My First Post",
  "content": "This is the content...",
  "published": true,
  "authorId": 1
}
```

## 5. Cloudflare Workers へのデプロイ

### D1 データベースの作成 (オプション)

```bash
# D1 データベースを作成
wrangler d1 create your-database-name

# マイグレーションをD1に適用
wrangler d1 migrations apply your-database-name --local
wrangler d1 migrations apply your-database-name --remote
```

### デプロイ

```bash
cd backend

# 本番環境にデプロイ
npm run deploy
```

## 6. トラブルシューティング

### よくあるエラー

1. **Prisma Client エラー**
   ```bash
   npx prisma generate
   ```

2. **データベース接続エラー**
   - `.env` ファイルのDATABASE_URLを確認
   - データベースサーバーが起動しているか確認

3. **CORS エラー**
   - フロントエンドのURLがCORS設定に含まれているか確認
   - `backend/src/index.ts` のCORS設定を調整

### ログの確認

開発環境：
```bash
cd backend
npm run dev
```

本番環境：
```bash
wrangler tail
```

## 7. 推奨される開発フロー

1. データベーススキーマを `backend/prisma/schema.prisma` で定義
2. `npx prisma migrate dev` でマイグレーション作成・適用
3. APIエンドポイントを実装・テスト
4. フロントエンドでAPIを呼び出し
5. 動作確認後、Cloudflare Workersにデプロイ

## 8. セキュリティ考慮事項

- 本番環境では強固なJWT_SECRETを使用
- データベース接続URLに機密情報が含まれるため、環境変数で管理
- CORS設定を本番環境に合わせて調整
- 入力値の検証とサニタイゼーションを実装

## 参考リンク

- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
