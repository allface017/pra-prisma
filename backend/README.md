```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

### フロントエンド (Next.js)
1. `frontend`ディレクトリに移動します:
   ```bash
   cd ../frontend
   ```
2. 依存関係をインストールします:
   ```bash
    npm install
    ```
3. 開発サーバーを起動します:
   ```bash
   npm run dev
