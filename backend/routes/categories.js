const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protectAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Helper to slugify a category name
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/categories — public, list all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// GET /api/categories/:slug — public, get single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
});

// POST /api/categories — admin only, create category (with optional image upload)
router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      image: req.file ? req.file.path : '',
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});

// PUT /api/categories/:id — admin only, update category
router.put('/:id', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    const updateData = { description, sortOrder };

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (req.file) {
      updateData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

module.exports = router;
