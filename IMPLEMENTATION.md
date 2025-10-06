# Hono + Prisma 完全実装指示書

このドキュメントは、[Hono公式のPrismaサンプル](https://hono.dev/examples/prisma)を参考に、本プロジェクトを最適化した実装指示を提供します。

## 🚀 実装済み機能

### バックエンド (Hono + Prisma)
✅ **完全なCRUD API実装**
- ユーザー管理 (作成、読取、更新、削除)
- 投稿管理 (作成、読取、更新、削除)
- リレーション対応 (ユーザー ← → 投稿)

✅ **改善されたエラーハンドリング**
- 適切なHTTPステータスコード
- Prismaエラーコードの識別
- 詳細なエラーログ
- バリデーション (必須フィールドチェック)

✅ **統一されたPrismaクライアント**
- 環境変数からの動的初期化
- Cloudflare Workers対応
- Prisma Accelerate サポート

### フロントエンド (React + TypeScript)
✅ **完全なUI実装**
- ユーザー登録フォーム
- 投稿作成フォーム  
- データ一覧表示
- エラーハンドリング

✅ **TypeScript型定義**
- API レスポンス型
- フォーム用ステート型
- 完全な型安全性

## 📋 次のステップ実装指示

### 1. 環境設定 (必須)

#### バックエンド環境変数
`backend/.env` を作成:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-jwt-secret-key-here"
```

#### Cloudflare設定 (本番デプロイ用)
`backend/wrangler.toml` を更新:
```toml
[env.production.vars]
JWT_SECRET = "your-production-jwt-secret"
DATABASE_URL = "your-production-database-url"
```

### 2. データベース初期化

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed  # シードデータがある場合
```

### 3. 開発サーバー起動

#### バックエンド
```bash
cd backend
npm run dev
# → http://localhost:8787
```

#### フロントエンド  
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. 追加実装推奨事項

#### 🔐 認証機能の追加

JWTトークンを使用した認証システム:

```typescript
// backend/src/middleware/auth.ts を作成
import { jwt } from 'hono/jwt'

export const authMiddleware = jwt({
  secret: (c) => c.env.JWT_SECRET,
})

// protected ルートに適用
app.use('/users/*', authMiddleware)
app.use('/posts/*', authMiddleware)
```

#### 📝 バリデーション強化

Zodを使用した厳密なバリデーション:

```bash
npm install zod
```

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50)
})

app.post('/users', async (c) => {
  const body = await c.req.json()
  const validatedData = userSchema.parse(body)
  // ... 処理続行
})
```

#### 🔍 ページネーション

大量データ対応:

```typescript
app.get('/posts', async (c) => {
  const page = Number(c.req.query('page')) || 1
  const limit = Number(c.req.query('limit')) || 10
  const skip = (page - 1) * limit

  const posts = await prisma.post.findMany({
    skip,
    take: limit,
    include: { author: true },
    orderBy: { id: 'desc' }
  })
  
  const total = await prisma.post.count()
  
  return c.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})
```

#### 🔄 リアルタイム更新

Server-Sent Events (SSE) 実装:

```typescript
app.get('/events', (c) => {
  return c.streamText(async (stream) => {
    let id = 0
    const timer = setInterval(async () => {
      const posts = await prisma.post.count()
      await stream.write(`data: {"posts": ${posts}}\n\n`)
    }, 1000)
    
    stream.onAbort(() => {
      clearInterval(timer)
    })
  })
})
```

### 5. テスト実装

#### バックエンドテスト

```bash
npm install --save-dev vitest @types/node
```

```typescript
// backend/tests/api.test.ts
import { describe, it, expect } from 'vitest'
import app from '../src/index'

describe('API Tests', () => {
  it('should return welcome message', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    
    const json = await res.json()
    expect(json.message).toBe('Welcome to Hono + Prisma API!')
  })
  
  it('should create user', async () => {
    const res = await app.request('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User'
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    expect(res.status).toBe(201)
  })
})
```

### 6. デプロイメント

#### Cloudflare Workers デプロイ

```bash
cd backend

# 設定確認
wrangler whoami

# デプロイ
npm run deploy

# ログ確認
wrangler tail
```

#### 静的サイトデプロイ (フロントエンド)

```bash
cd frontend

# ビルド
npm run build

# Cloudflare Pages にデプロイ
npx wrangler pages publish dist
```

## 🛠 トラブルシューティング

### よくある問題と解決策

1. **CORS エラー**
   - バックエンドのCORS設定を確認
   - フロントエンドのURLを許可リストに追加

2. **Prisma接続エラー**
   - DATABASE_URL の形式確認
   - データベースサーバーの起動確認
   - ネットワーク接続確認

3. **TypeScript エラー**
   - `npx prisma generate` を実行
   - 型定義ファイルの更新確認

### モニタリング

#### ログ集約
```typescript
// 構造化ログ
const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }))
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error: error.message, timestamp: new Date().toISOString() }))
  }
}
```

#### パフォーマンス監視
```typescript
// リクエスト時間計測
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  c.res.headers.set('X-Response-Time', `${ms}ms`)
})
```

## 📚 参考リンク

- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [React + TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)

---

この実装指示に従って開発を進めることで、本格的なフルスタックアプリケーションを構築できます。段階的に機能を追加し、必要に応じてテストとモニタリングを強化していくことを推奨します。
