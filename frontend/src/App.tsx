import { useState, useEffect } from 'react'
import './App.css'

// バックエンドAPIのベースURL
const API_BASE_URL = 'http://localhost:8787';

// 型定義
interface User {
  id: number;
  email: string;
  name: string | null;
  posts: Post[];
}

interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  authorId: number | null;
}

function App() {
  // ステート定義
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 新規ユーザーフォーム用のステート
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  
  // 新規投稿フォーム用のステート
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostAuthorId, setNewPostAuthorId] = useState<number>(0);
  
  // ユーザーと投稿データを取得する関数
  const fetchData = async () => {
    setLoading(true);
    try {
      // ユーザー一覧を取得
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      const usersData = await usersResponse.json();
      
      // 投稿一覧を取得
      const postsResponse = await fetch(`${API_BASE_URL}/posts`);
      const postsData = await postsResponse.json();
      
      setUsers(usersData.users || []);
      setPosts(postsData.posts || []);
      setError(null);
    } catch (err) {
      console.error('データの取得に失敗しました:', err);
      setError('データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };
  
  // 新規ユーザーを作成する関数
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName
        })
      });
      
      if (!response.ok) {
        throw new Error('ユーザーの作成に失敗しました');
      }
      
      // フォームをリセット
      setNewUserEmail('');
      setNewUserName('');
      
      // データを再取得
      fetchData();
    } catch (err) {
      console.error('ユーザー作成エラー:', err);
      setError('ユーザーの作成に失敗しました。');
    }
  };
  
  // 新規投稿を作成する関数
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          published: true,
          authorId: newPostAuthorId || null
        })
      });
      
      if (!response.ok) {
        throw new Error('投稿の作成に失敗しました');
      }
      
      // フォームをリセット
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostAuthorId(0);
      
      // データを再取得
      fetchData();
    } catch (err) {
      console.error('投稿作成エラー:', err);
      setError('投稿の作成に失敗しました。');
    }
  };
  
  // コンポーネントがマウントされたときにデータを取得
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div className="app-container">
      <h1>Prisma + Hono + React サンプルアプリ</h1>
      
      {error && <div className="error">{error}</div>}
      
      {loading ? (
        <div className="loading">データを読み込み中...</div>
      ) : (
        <div className="content">
          <div className="section">
            <h2>ユーザー登録</h2>
            <form onSubmit={createUser}>
              <div className="form-group">
                <label>メールアドレス:</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>名前:</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>
              <button type="submit">ユーザーを登録</button>
            </form>
          </div>
          
          <div className="section">
            <h2>新規投稿</h2>
            <form onSubmit={createPost}>
              <div className="form-group">
                <label>タイトル:</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>内容:</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>投稿者:</label>
                <select
                  value={newPostAuthorId}
                  onChange={(e) => setNewPostAuthorId(Number(e.target.value))}
                >
                  <option value={0}>-- 選択してください --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit">投稿する</button>
            </form>
          </div>
          
          <div className="data-section">
            <div className="users-section">
              <h2>ユーザー一覧</h2>
              {users.length === 0 ? (
                <p>ユーザーはまだ登録されていません。</p>
              ) : (
                <ul className="users-list">
                  {users.map(user => (
                    <li key={user.id} className="user-item">
                      <h3>{user.name || '名前なし'}</h3>
                      <p>メールアドレス: {user.email}</p>
                      <p>投稿数: {user.posts?.length || 0}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="posts-section">
              <h2>投稿一覧</h2>
              {posts.length === 0 ? (
                <p>投稿はまだありません。</p>
              ) : (
                <ul className="posts-list">
                  {posts.map(post => (
                    <li key={post.id} className="post-item">
                      <h3>{post.title}</h3>
                      <p>{post.content || '(内容なし)'}</p>
                      <p className="post-author">
                        投稿者: {post.authorId ? 
                          users.find(u => u.id === post.authorId)?.name || '不明なユーザー' 
                          : '匿名'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
