# Cloudflare Workers and Pages Bot 設定ガイド

このガイドでは、Cloudflare Workers and Pages botを使用した自動デプロイ設定について説明します。

## � Cloudflare Bot による自動デプロイ

### 現在の設定方針

⚡ **Cloudflare Workers and Pages bot** - プルリクエストと本番の自動デプロイ  
✅ **GitHub Actions** - CI（テスト・ビルド）のみ実行  
🔄 **完全自動化** - デプロイに関してはCloudflareが完全管理  

### 自動デプロイの動作

- **Pull Request作成/更新時**: Cloudflare botが自動でプレビュー環境にデプロイ
- **main ブランチへのマージ時**: Cloudflare botが自動で本番環境にデプロイ
- **GitHub Actions**: CI（テスト・型チェック・ビルド確認）のみ実行

## 🌐 Cloudflare Workers and Pages Bot 設定

### 1. バックエンド (Cloudflare Workers) の GitHub 連携

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** セクションに移動
3. **Create application** → **Workers** → **Create Worker**
4. Worker名: `backend` を作成
5. **Settings** → **Integrations** タブを開く
6. **GitHub** セクションで **Connect to GitHub** をクリック
7. GitHub リポジトリを選択: `allface017/pra-prisma`
8. 以下の設定を行う：
   ```
   Production branch: main
   Preview branches: すべてのブランチ (プルリクエストを含む)
   Root directory: backend
   ```

### 2. フロントエンド (Cloudflare Pages) の GitHub 連携

1. **Pages** セクションに移動
2. **Create a project** → **Connect to Git**
3. GitHub リポジトリを選択: `allface017/pra-prisma`
4. 以下の設定を行う：
   ```
   Project name: frontend
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: frontend
   ```

### 3. 環境変数の設定

#### Workers (Backend) の環境変数
1. **Workers & Pages** → **backend** → **Settings** → **Variables**
2. **Environment Variables** セクションで以下を追加：
   ```
   DATABASE_URL: (Prisma Accelerate の URL)
   ```
3. **Encrypt** にチェックを入れる

#### Pages (Frontend) の環境変数
1. **Pages** → **frontend** → **Settings** → **Environment Variables**
2. **Production** と **Preview** 両方に以下を設定：
   ```
   VITE_API_BASE_URL: https://backend.s-muramori-sys22.workers.dev
   ```

## ✨ Cloudflare Bot の利点

### 🔄 完全自動化
- **プルリクエスト作成時**: 自動でプレビュー環境を作成
- **コミット追加時**: プレビュー環境を自動更新
- **PR マージ時**: 自動で本番環境にデプロイ
- **PR クローズ時**: プレビュー環境を自動削除

### 💬 GitHub 統合
- PRに自動でプレビューURLをコメント投稿
- デプロイ状況をGitHub Checksで表示
- デプロイ失敗時はPRにエラー詳細を投稿

### ⚡ 高速デプロイ
- Cloudflareの高速エッジネットワークを活用
- ゼロダウンタイムデプロイ
- 瞬時のロールバック機能

### 💰 コスト効率
- GitHub Actionsの使用時間を最小化
- Cloudflareの豊富な無料枠を活用

## 📊 デプロイメント監視

### GitHub Actions での監視

1. リポジトリの **Actions** タブでワークフローの実行状況を確認
2. 失敗した場合は、ログを確認してエラーの原因を特定
3. **Issues** タブで継続的なデプロイ問題を追跡

### Cloudflare Dashboard での監視

1. **Workers & Pages** → **backend** → **Metrics** でバックエンドのパフォーマンス監視
2. **Pages** → **frontend** → **Analytics** でフロントエンドのアクセス状況監視
3. **Audit Logs** でデプロイメント履歴を確認

### 通知設定

1. **Notifications** セクションでデプロイ通知を設定
2. Slack、Email、Webhookでの通知が可能
3. エラー発生時の即座な通知設定

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. GitHub Secretsが設定されていない
**エラー**: デプロイが失敗する  
**解決方法**: `GITHUB_SECRETS_SETUP.md` を参照してSecretsを設定

#### 2. ビルドエラー
**エラー**: `npm run build` が失敗する  
**解決方法**: 
- `package-lock.json` の依存関係を確認
- ローカルでビルドが成功することを確認
- Node.jsのバージョンを確認（v18推奨）

#### 3. API接続エラー
**エラー**: フロントエンドからバックエンドに接続できない  
**解決方法**:
- CORS設定を確認
- バックエンドのURL設定を確認
- 環境変数の設定を確認

#### 4. 権限エラー
**エラー**: Cloudflare APIでアクセス権限エラー  
**解決方法**:
- API Tokenの権限設定を確認
- Account IDが正しいか確認

## 📈 パフォーマンス最適化

### バックエンド (Workers)
- Prisma Clientのキャッシュ設定を最適化
- レスポンスサイズを最小化
- エラーログの詳細度を調整

### フロントエンド (Pages)
- ビルド時間の最適化
- 静的アセットのキャッシュ設定
- CDNの活用

## 🔄 継続的な改善

1. **定期的なレビュー**: 月1回デプロイプロセスをレビュー
2. **メトリクス分析**: パフォーマンスデータの定期的な確認
3. **セキュリティ更新**: 依存関係の定期的な更新
4. **ドキュメント更新**: 変更に合わせてドキュメントを更新

---

## 📞 サポート

問題が発生した場合は：
1. GitHub Issues で問題を報告
2. Cloudflare Community フォーラムで質問
3. このドキュメントのトラブルシューティングセクションを確認
