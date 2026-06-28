const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const { protectAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Ensures exactly one settings document always exists, creating it on first call
const getOrCreateSettings = async () => {
  let settings = await SiteSettings.findOne({ singletonKey: 'site-settings' });
  if (!settings) {
    settings = await SiteSettings.create({
      singletonKey: 'site-settings',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '',
    });
  }
  return settings;
};

// GET /api/settings — public, used by the frontend to theme itself on load
router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch site settings', error: error.message });
  }
});

// PUT /api/settings — admin only, update theme colors / store info
// Accepts a partial body; only provided fields are updated.
// Body can include: storeName, tagline, whatsappNumber, theme: {...}
router.put('/', protectAdmin, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { 
      storeName, tagline, whatsappNumber, theme, logoUrl,
      heroMediaUrl, heroMediaType, heroTitleLine1, heroTitleLine2, heroSubtitle 
    } = req.body;

    if (storeName !== undefined) settings.storeName = storeName;
    if (tagline !== undefined) settings.tagline = tagline;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (heroMediaUrl !== undefined) settings.heroMediaUrl = heroMediaUrl;
    if (heroMediaType !== undefined) settings.heroMediaType = heroMediaType;
    if (heroTitleLine1 !== undefined) settings.heroTitleLine1 = heroTitleLine1;
    if (heroTitleLine2 !== undefined) settings.heroTitleLine2 = heroTitleLine2;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;

    if (theme && typeof theme === 'object') {
      // Merge so the admin can update a single color without sending all of them
      settings.theme = { ...settings.theme.toObject(), ...theme };
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update site settings', error: error.message });
  }
});

// POST /api/settings/logo — admin only, upload a new logo image
router.post('/logo', protectAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No logo file provided' });
    const settings = await getOrCreateSettings();
    settings.logoUrl = req.file.path;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload logo', error: error.message });
  }
});

// POST /api/settings/hero-media — admin only, upload a new hero media (image/video)
router.post('/hero-media', protectAdmin, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No media file provided' });
    const settings = await getOrCreateSettings();
    settings.heroMediaUrl = req.file.path;
    // Cloudinary automatically infers the type, but let's check mimetype
    if (req.file.mimetype && req.file.mimetype.startsWith('video')) {
      settings.heroMediaType = 'video';
    } else {
      settings.heroMediaType = 'image';
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload hero media', error: error.message });
  }
});

module.exports = router;
