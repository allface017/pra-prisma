import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getPrisma } from './prisma'

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
}>()

// CORSミドルウェアを適用
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}))

// API のウェルカムメッセージ
app.get('/', async (c) => {
  return c.json({ 
    message: 'Welcome to Hono + Prisma API! backend is running.',
    endpoints: {
      users: '/users',
      posts: '/posts'
    }
  })
})

// ユーザー一覧を取得
app.get('/users', async (c) => {
  try {
    // DATABASE_URLが設定されているかチェック
    if (!c.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return c.json({ error: 'DATABASE_URL is not configured' }, 500)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    const users = await prisma.user.findMany({
      include: { posts: true }
    })
    return c.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 特定のユーザーを取得
app.get('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ error: 'Invalid user ID' }, 400)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    const user = await prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    })
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

// 新しいユーザーを作成
app.post('/users', async (c) => {
  try {
    const { email, name } = await c.req.json()
    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    const user = await prisma.user.create({
      data: {
        email,
        name
      }
    })
    return c.json({ user }, 201)
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.code === 'P2002') {
      return c.json({ error: 'Email already exists' }, 409)
    }
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// 投稿一覧を取得
app.get('/posts', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL)
    const posts = await prisma.post.findMany({
      include: { author: true }
    })
    return c.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return c.json({ error: 'Failed to fetch posts' }, 500)
  }
})

// 特定の投稿を取得
app.get('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ error: 'Invalid post ID' }, 400)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    })
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    return c.json({ post })
  } catch (error) {
    console.error('Error fetching post:', error)
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

// 新しい投稿を作成
app.post('/posts', async (c) => {
  try {
    const { title, content, published, authorId } = await c.req.json()
    if (!title) {
      return c.json({ error: 'Title is required' }, 400)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: authorId || null
      },
      include: { author: true }
    })
    return c.json({ post }, 201)
  } catch (error) {
    console.error('Error creating post:', error)
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

// ユーザー情報を更新
app.put('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ error: 'Invalid user ID' }, 400)
    }
    
    const { email, name } = await c.req.json()
    const prisma = getPrisma(c.env.DATABASE_URL)
    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        name
      },
      include: { posts: true }
    })
    return c.json({ user })
  } catch (error: any) {
    console.error('Error updating user:', error)
    if (error.code === 'P2025') {
      return c.json({ error: 'User not found' }, 404)
    }
    if (error.code === 'P2002') {
      return c.json({ error: 'Email already exists' }, 409)
    }
    return c.json({ error: 'Failed to update user' }, 500)
  }
})

// ユーザーを削除
app.delete('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ error: 'Invalid user ID' }, 400)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    await prisma.user.delete({
      where: { id }
    })
    return c.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    if (error.code === 'P2025') {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json({ error: 'Failed to delete user' }, 500)
  }
})

// 投稿を更新
app.put('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ error: 'Invalid post ID' }, 400)
    }
    
    const { title, content, published } = await c.req.json()
    const prisma = getPrisma(c.env.DATABASE_URL)
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        published
      },
      include: { author: true }
    })
    return c.json({ post })
  } catch (error: any) {
    console.error('Error updating post:', error)
    if (error.code === 'P2025') {
      return c.json({ error: 'Post not found' }, 404)
    }
    return c.json({ error: 'Failed to update post' }, 500)
  }
})

// 投稿を削除
app.delete('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ error: 'Invalid post ID' }, 400)
    }
    
    const prisma = getPrisma(c.env.DATABASE_URL)
    await prisma.post.delete({
      where: { id }
    })
    return c.json({ message: 'Post deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    if (error.code === 'P2025') {
      return c.json({ error: 'Post not found' }, 404)
    }
    return c.json({ error: 'Failed to delete post' }, 500)
  }
})

export default app
