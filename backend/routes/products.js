const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protectAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/products — public, list products with optional filters
// query params: category (slug or id), featured, search, page, limit
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 24 } = req.query;
    const filter = { isActive: true };

    if (category) {
      const Category = require('../models/Category');
      const catQuery = [{ slug: category }];
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        catQuery.push({ _id: category });
      }
      const cat = await Category.findOne({ $or: catQuery });
      if (cat) filter.category = cat._id;
      else filter.category = null; // no matching category → empty result
    }

    if (featured === 'true') filter.featured = true;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// GET /api/products/:slug — public, single product detail
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      'category',
      'name slug'
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

// POST /api/products — admin only, create product (up to 5 images)
router.post('/', protectAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, sizes, colors, stock, inStock, featured } =
      req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    let slug = slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
      name,
      slug,
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category,
      images,
      sizes: sizes ? JSON.parse(sizes) : undefined,
      colors: colors ? JSON.parse(colors) : [],
      stock: stock ? Number(stock) : 100,
      inStock: inStock === 'true' || inStock === true,
      featured: featured === 'true' || featured === true,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// PUT /api/products/:id — admin only, update product
router.put('/:id', protectAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, sizes, colors, stock, inStock, featured, isActive } =
      req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (category) updateData.category = category;
    if (sizes) updateData.sizes = JSON.parse(sizes);
    if (colors) updateData.colors = JSON.parse(colors);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (inStock !== undefined) updateData.inStock = inStock === 'true' || inStock === true;
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((f) => f.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;
