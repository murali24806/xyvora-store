const mongoose = require('mongoose');

// This is a SINGLETON collection — there will only ever be one document.
// The admin panel reads and writes this single document to control the
// live color theme of the storefront (and a few other site-wide settings).
const siteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'site-settings',
      unique: true,
    },
    storeName: {
      type: String,
      default: 'XyvorA',
    },
    tagline: {
      type: String,
      default: 'Wear the brand.',
    },
    theme: {
      primary: { type: String, default: '#111111' }, // main brand color (buttons, accents)
      secondary: { type: String, default: '#6b6b6b' }, // supporting text/secondary accents
      accent: { type: String, default: '#d4ff3f' }, // highlight / CTA pop color
      background: { type: String, default: '#ffffff' }, // page background
      surface: { type: String, default: '#f5f5f5' }, // card/section background
      text: { type: String, default: '#111111' }, // main body text color
      headerBg: { type: String, default: '#111111' }, // navbar background
      headerText: { type: String, default: '#ffffff' }, // navbar text color
      footerBg: { type: String, default: '#111111' },
      footerText: { type: String, default: '#ffffff' },
    },
    whatsappNumber: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    heroMediaUrl: {
      type: String,
      default: '',
    },
    heroMediaType: {
      type: String,
      default: 'video', // 'video' or 'image'
    },
    heroTitleLine1: {
      type: String,
      default: 'Future of',
    },
    heroTitleLine2: {
      type: String,
      default: 'Streetwear',
    },
    heroSubtitle: {
      type: String,
      default: 'New Collection',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
