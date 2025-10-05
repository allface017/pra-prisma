import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// CORS対応のためのミドルウェアを追加
import { cors } from 'hono/cors'

// Prisma Accelerate を使用してクライアントを作成
// Edge ランタイム（Cloudflare Workers）で動作するように構成
// 各リクエストで新しいPrismaClientインスタンスを作成する方式に変更
const createPrismaClient = () => {
  return new PrismaClient().$extends(withAccelerate())
}

const app = new Hono()

// CORSミドルウェアを適用
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}))

// ウェルカムメッセージ
app.get('/', (c) => c.json({ message: 'Welcome to Prisma + Hono API!' }))

// ユーザー一覧を取得
app.get('/users', async (c) => {
  try {
    const prisma = createPrismaClient()
    const users = await prisma.user.findMany({
      include: { posts: true }
    })
    return c.json({ users })
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// 特定のユーザーを取得
app.get('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const prisma = createPrismaClient()
    const user = await prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    })
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user })
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

// 新しいユーザーを作成
app.post('/users', async (c) => {
  try {
    const { email, name } = await c.req.json()
    const prisma = createPrismaClient()
    const user = await prisma.user.create({
      data: {
        email,
        name
      }
    })
    return c.json({ user }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// 投稿一覧を取得
app.get('/posts', async (c) => {
  try {
    const prisma = createPrismaClient()
    const posts = await prisma.post.findMany({
      include: { author: true }
    })
    return c.json({ posts })
  } catch (error) {
    return c.json({ error: 'Failed to fetch posts' }, 500)
  }
})

// 特定の投稿を取得
app.get('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const prisma = createPrismaClient()
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    })
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    return c.json({ post })
  } catch (error) {
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

// 新しい投稿を作成
app.post('/posts', async (c) => {
  try {
    const { title, content, published, authorId } = await c.req.json()
    const prisma = createPrismaClient()
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: authorId || null
      }
    })
    return c.json({ post }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

export default app
