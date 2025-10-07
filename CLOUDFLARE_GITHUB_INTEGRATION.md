# Cloudflare-GitHub 連携設定ガイド

このガイドでは、GitHubリポジトリとCloudflare WorkersおよびCloudflare Pagesを連携させる方法を説明します。

## 🔧 GitHub Actions による自動デプロイ

### 現在の設定状況

✅ **preview-deploy.yml** - Pull Request時の自動preview環境デプロイ  
✅ **production-deploy.yml** - main/masterブランチへのpush時の本番デプロイ  
✅ **cleanup-preview.yml** - PR終了時のpreview環境クリーンアップ  

### 自動デプロイの動作

- **Pull Request作成/更新時**: preview環境に自動デプロイ
- **main/masterブランチへのマージ時**: 本番環境に自動デプロイ
- **Pull Request終了時**: preview環境を自動削除

## 🌐 Cloudflare Dashboard での追加設定

### 1. Cloudflare Pages の GitHub 連携

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Pages** セクションに移動
3. 既存の `frontend` プロジェクトを選択
4. **Settings** → **Source** タブを開く
5. **Connect to Git** をクリック
6. GitHub リポジトリを選択: `allface017/pra-prisma`
7. 以下の設定を行う：
   ```
   Production branch: main (または master)
   Build command: npm run build
   Build output directory: dist
   Root directory: frontend
   ```

### 2. Cloudflare Workers の GitHub 連携

1. **Workers & Pages** セクションに移動
2. 既存の `backend` Workerを選択
3. **Settings** → **Triggers** タブを開く
4. **Git Repository** の **Connect Repository** をクリック
5. GitHub リポジトリを選択: `allface017/pra-prisma`
6. 以下の設定を行う：
   ```
   Production branch: main (または master)
   Preview branch: すべてのブランチ
   ```

### 3. 環境変数の設定

#### Workers (Backend) の環境変数
1. **Settings** → **Variables** タブ
2. **Environment Variables** セクションで以下を追加：
   ```
   DATABASE_URL: (Prisma Accelerate の URL)
   ```
3. **Encrypt** にチェックを入れる

#### Pages (Frontend) の環境変数
1. **Settings** → **Environment Variables** タブ
2. **Production** と **Preview** 両方に以下を設定：
   ```
   VITE_API_BASE_URL: https://backend.s-muramori-sys22.workers.dev
   ```

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
