# GitHub Secrets設定ガイド

## 必要なSecrets

以下のSecretsをGitHubリポジトリの設定で追加する必要があります：

### 1. CLOUDFLARE_API_TOKEN
- Cloudflareのダッシュボードにアクセス
- 右上のプロフィール → "My Profile" → "API Tokens"
- "Create Token" をクリック
- "Custom token" を選択
- 以下の権限を設定：
  - Zone: Zone Settings:Read, Zone:Read
  - Account: Cloudflare Pages:Edit, Account Settings:Read
  - User: User Details:Read

### 2. CLOUDFLARE_ACCOUNT_ID
- Cloudflareダッシュボードの右側サイドバーから確認
- または、`wrangler whoami` コマンドで確認可能

### 3. DATABASE_URL
- Prisma Accelerate または PostgreSQL データベースの接続URL
- 現在の`.dev.vars`ファイルと同じ値を使用

## 設定手順

1. GitHubリポジトリのページを開く
2. "Settings" タブをクリック
3. 左メニューの "Security" → "Secrets and variables" → "Actions"
4. "New repository secret" をクリック
5. 上記の3つのSecretsを追加

## 確認方法

設定後、Pull Requestを作成してGitHub Actionsが正常に動作することを確認してください。

## トラブルシューティング

- デプロイが失敗する場合は、Secretsの値が正しく設定されているか確認
- Cloudflare API Tokenの権限が適切に設定されているか確認
- Account IDが正しいか確認
