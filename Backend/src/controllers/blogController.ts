import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required')
});
const prisma = new PrismaClient();
export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = (req as any).user;
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    const parsed = blogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { title, content } = parsed.data;

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        authorId: admin.id
      }
    });

    res.status(201).json(blog);
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const admin = (req as any).user;

    const blog = await prisma.blog.findUnique({ where: { id: String(id) } });
    if (!blog || blog.deletedAt) return res.status(404).json({ error: 'Blog not found' });
    if (blog.authorId !== admin.id) return res.status(403).json({ error: 'Forbidden: not your blog' });

    const parsed = blogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const updated = await prisma.blog.update({
      where: { id: String(id) },
      data: parsed.data
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const admin = (req as any).user;

    const blog = await prisma.blog.findUnique({ where: { id: String(id) } });
    if (!blog || blog.deletedAt) return res.status(404).json({ error: 'Blog not found' });
    if (blog.authorId !== admin.id) return res.status(403).json({ error: 'Forbidden: not your blog' });

    await prisma.blog.update({
      where: { id: String(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const blogs = await prisma.blog.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: search as string } },
          { content: { contains: search as string } }
        ]
      },
      include: { author: true },
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.blog.count({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: search as string } },
          { content: { contains: search as string } }
        ]
      }
    });

    res.json({ blogs, total, page: pageNumber, limit: limitNumber });
  } catch (err) {
    next(err);
  }
};

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id: String(id) },
      include: { author: true }
    });

    if (!blog || blog.deletedAt) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
};