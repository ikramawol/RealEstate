import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

const propertySchema = z.object({
  image: z.string(),
  propertyType: z.enum(['CONDOMINIUM', 'REAL_ESTATE', 'HOUSE', 'APARTMENT']),
  purchase: z.enum(['RENT', 'SALE']),
  price: z.number(),
  status: z.string(),
  description: z.string(),
  contactDetail: z.string(),
  video: z.string().optional(),
  location: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  features: z.string().optional(),
  images: z.string(),
});

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Get the uploaded image URLs from req.files
    const images = (req.files as Express.Multer.File[])?.map(
      (file: any) => file.path
    );

    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    // Convert string values to numbers where needed
    const body = {
      ...req.body,
      price: Number(req.body.price),
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      area: req.body.area ? Number(req.body.area) : undefined,
    };

    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.flatten().fieldErrors });
    }

    const property = await prisma.propertyDetail.create({
      data: {
        ...parsed.data,
        image: JSON.stringify(images), // Store all images as JSON string
      },
    });

    res.status(201).json(property);
  } catch (err) {
    console.error('Create error:', err);
    next(err);
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.propertyDetail.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // if (existing.adminId !== user.id) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    const parsed = propertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.flatten().fieldErrors });
    }

    const updated = await prisma.propertyDetail.update({
      where: { id },
      data: parsed.data,
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update error:', err);
    next(err);
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.propertyDetail.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // if (existing.adminId !== user.id) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    await prisma.propertyDetail.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    next(err);
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.propertyDetail.findUnique({
      where: { id: Number(id) },
    });
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.propertyDetail.findMany({
        skip,
        take: limit,
      }),
      prisma.propertyDetail.count(),
    ]);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      properties,
    });
  } catch (err: any) {
    console.error('Fetch all error:', err);
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
};

export const searchProperties = async (req: Request, res: Response) => {
  try {
    const {
      propertyType,
      purchaseType,
      minPrice,
      maxPrice,
      location,
      city,
      state,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      features,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build the where clause
    const where: any = {
      deletedAt: null,
    };

    // Add filters if they exist
    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (purchaseType) {
      where.purchase = purchaseType;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive'
      };
    }

    if (city) {
      where.city = {
        contains: city as string,
        mode: 'insensitive'
      };
    }

    if (state) {
      where.state = {
        contains: state as string,
        mode: 'insensitive'
      };
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms as string);
    }

    if (bathrooms) {
      where.bathrooms = parseInt(bathrooms as string);
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea as string);
      if (maxArea) where.area.lte = parseFloat(maxArea as string);
    }

    if (features) {
      const featureArray = (features as string).split(',');
      where.features = {
        contains: featureArray.join('|'),
        mode: 'insensitive'
      };
    }

    // Pagination
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    // Execute query
    const [properties, total] = await Promise.all([
      prisma.propertyDetail.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy,
      }),
      prisma.propertyDetail.count({ where })
    ]);

    // Return results
    res.json({
      properties,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search properties' });
  }
};
