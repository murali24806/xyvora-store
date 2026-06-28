// Run with: npm run seed
// Populates the database with sample categories and products so you can
// see the storefront working immediately. Safe to re-run — it clears
// existing categories/products first.

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await Category.deleteMany({});
  await Product.deleteMany({});

  const categoryData = [
    { name: 'T-Shirts', description: 'Everyday graphic and plain tees', sortOrder: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
    { name: 'Hoodies', description: 'Heavyweight streetwear hoodies', sortOrder: 2, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80' },
    { name: 'Jackets', description: 'Outerwear for every season', sortOrder: 3, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80' },
    { name: 'Accessories', description: 'Caps, bags, and more', sortOrder: 4, image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80' },
  ];

  const categories = await Category.insertMany(
    categoryData.map((c) => ({ ...c, slug: slugify(c.name) }))
  );

  const tshirt = categories.find((c) => c.name === 'T-Shirts');
  const hoodie = categories.find((c) => c.name === 'Hoodies');
  const jacket = categories.find((c) => c.name === 'Jackets');
  const accessories = categories.find((c) => c.name === 'Accessories');

  const productData = [
    {
      name: 'XyvorA Classic Logo Tee',
      description: 'Premium 220 GSM cotton tee with the signature XyvorA wordmark print.',
      price: 799,
      discountPrice: 649,
      category: tshirt._id,
      colors: ['Black', 'White', 'Sand'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80'],
    },
    {
      name: 'Oversized Drop-Shoulder Tee',
      description: 'Relaxed fit oversized tee with dropped shoulders for that streetwear look.',
      price: 899,
      category: tshirt._id,
      colors: ['Black', 'Olive'],
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'],
    },
    {
      name: 'Heavyweight Pullover Hoodie',
      description: '420 GSM brushed fleece hoodie, built for cold Vizag evenings.',
      price: 1499,
      discountPrice: 1299,
      category: hoodie._id,
      colors: ['Charcoal', 'Maroon', 'Black'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
    },
    {
      name: 'Zip-Up Tech Hoodie',
      description: 'Athletic-fit zip hoodie with hidden phone pocket.',
      price: 1699,
      category: hoodie._id,
      colors: ['Black', 'Grey'],
      images: ['https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80'],
    },
    {
      name: 'Varsity Bomber Jacket',
      description: 'Classic varsity silhouette with ribbed cuffs and snap buttons.',
      price: 2499,
      category: jacket._id,
      colors: ['Black/Gold'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'],
    },
    {
      name: 'Embroidered Cap',
      description: 'Adjustable cotton cap with embroidered XyvorA logo.',
      price: 399,
      category: accessories._id,
      colors: ['Black', 'White'],
      sizes: ['One Size'],
      images: ['https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80', 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=800&q=80'],
    },
  ];

  await Product.insertMany(
    productData.map((p) => ({ ...p, slug: slugify(p.name) }))
  );

  // ensure a settings doc exists
  const existingSettings = await SiteSettings.findOne({ singletonKey: 'site-settings' });
  if (!existingSettings) {
    await SiteSettings.create({
      singletonKey: 'site-settings',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '',
    });
  }

  console.log(`Seeded ${categories.length} categories and ${productData.length} products.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
