import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request) => {
    const paramsScheme = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsScheme.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return memory
  })

  app.post('/memories', async (request) => {
    const bodyScheme = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // coerce converts the value to boolean -> Boolean(value)
    })

    const { content, isPublic, coverUrl } = bodyScheme.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: '39dc4794-7818-4b2a-8219-f290033d5098',
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request) => {
    const paramsScheme = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsScheme.parse(request.params)

    const bodyScheme = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // coerce converts the value to boolean -> Boolean(value)
    })

    const { content, isPublic, coverUrl } = bodyScheme.parse(request.body)

    const updatedMemory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return updatedMemory
  })

  app.delete('/memories/:id', async (request) => {
    const paramsScheme = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsScheme.parse(request.params)

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
