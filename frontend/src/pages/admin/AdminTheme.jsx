import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const colorFields = [
  { key: 'primary', label: 'Primary', hint: 'Buttons, headings, brand accent' },
  { key: 'secondary', label: 'Secondary', hint: 'Muted text, borders' },
  { key: 'accent', label: 'Accent', hint: 'Call-to-action highlight (e.g. Add to cart)' },
  { key: 'background', label: 'Page background', hint: 'Main site background' },
  { key: 'surface', label: 'Surface', hint: 'Cards and panels' },
  { key: 'text', label: 'Body text', hint: 'Main text color' },
  { key: 'headerBg', label: 'Header background', hint: 'Top navigation bar' },
  { key: 'headerText', label: 'Header text', hint: 'Navigation text & logo' },
  { key: 'footerBg', label: 'Footer background', hint: 'Bottom footer bar' },
  { key: 'footerText', label: 'Footer text', hint: 'Footer text color' },
];

const AdminTheme = () => {
  const { settings, applyLocalTheme, refetch } = useSiteSettings();
  const [theme, setTheme] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [heroTitleLine1, setHeroTitleLine1] = useState('');
  const [heroTitleLine2, setHeroTitleLine2] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroMediaUrl, setHeroMediaUrl] = useState('');
  const [heroMediaType, setHeroMediaType] = useState('video');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme);
      setStoreName(settings.storeName || '');
      setTagline(settings.tagline || '');
      setWhatsappNumber(settings.whatsappNumber || '');
      setHeroTitleLine1(settings.heroTitleLine1 || 'Future of');
      setHeroTitleLine2(settings.heroTitleLine2 || 'Streetwear');
      setHeroSubtitle(settings.heroSubtitle || 'New Collection');
      setHeroMediaUrl(settings.heroMediaUrl || '');
      setHeroMediaType(settings.heroMediaType || 'video');
    }
  }, [settings]);

  if (!theme) return <p className="text-gray-500">Loading theme...</p>;

  const handleColorChange = (key, value) => {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    applyLocalTheme(updated); // instant live preview across the whole site
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/settings', { 
        theme, storeName, tagline, whatsappNumber,
        heroTitleLine1, heroTitleLine2, heroSubtitle
      });
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    setUploadingMedia(true);
    try {
      const res = await api.post('/settings/hero-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHeroMediaUrl(res.data.heroMediaUrl);
      setHeroMediaType(res.data.heroMediaType);
      await refetch();
    } catch (err) {
      alert('Failed to upload media: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingMedia(false);
    }
  };

  const resetDefaults = () => {
    const defaults = {
      primary: '#0d0d0d',
      secondary: '#6b6b6b',
      accent: '#d4ff3f',
      background: '#f5f4f0',
      surface: '#ffffff',
      text: '#0d0d0d',
      headerBg: '#0d0d0d',
      headerText: '#f5f4f0',
      footerBg: '#0d0d0d',
      footerText: '#f5f4f0',
    };
    setTheme(defaults);
    applyLocalTheme(defaults);
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Theme & colors</h1>
      <p className="text-gray-500 text-sm mb-8">
        Changes preview live on the storefront immediately. Click "Save changes" to make them permanent.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-md p-6 shadow-sm mb-6">
            <h2 className="font-semibold mb-4">Store details</h2>
            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Store name</span>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>
            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Tagline</span>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                WhatsApp number (with country code, no + or spaces)
              </span>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="919876543210"
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm mb-6">
            <h2 className="font-semibold mb-4">Home Page Hero</h2>
            
            <label className="block mb-4">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                Hero Background Media (Image or Video)
              </span>
              <div className="flex items-center gap-4">
                {heroMediaUrl ? (
                  <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
                    {heroMediaType === 'video' ? (
                      <video src={heroMediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={heroMediaUrl} alt="Hero" className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center shrink-0">
                    <span className="text-xs text-gray-400">None</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-sm file:border-0
                      file:text-xs file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-800 file:cursor-pointer"
                  />
                  {uploadingMedia && <p className="text-xs text-blue-500 mt-2">Uploading...</p>}
                </div>
              </div>
            </label>

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Subtitle (Small top text)</span>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>
            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Title Line 1</span>
              <input
                type="text"
                value={heroTitleLine1}
                onChange={(e) => setHeroTitleLine1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Title Line 2</span>
              <input
                type="text"
                value={heroTitleLine2}
                onChange={(e) => setHeroTitleLine2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Color palette</h2>
              <button onClick={resetDefaults} className="text-xs underline text-gray-500">
                Reset to defaults
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {colorFields.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[field.key] || '#000000'}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-10 h-10 rounded-sm border border-gray-200 cursor-pointer shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{field.label}</p>
                    <p className="text-xs text-gray-400">{field.hint}</p>
                  </div>
                  <input
                    type="text"
                    value={theme[field.key] || ''}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-200 rounded-sm text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 py-3 bg-[#0d0d0d] text-white font-semibold rounded-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>

        {/* Live preview panel */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Live preview</p>
          <div className="rounded-md overflow-hidden border border-gray-200 sticky top-6">
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: theme.headerBg, color: theme.headerText }}
            >
              <span className="font-display text-lg">{storeName || 'XYVORA'}</span>
              <span className="text-xs uppercase">Cart (2)</span>
            </div>
            <div className="p-6" style={{ backgroundColor: theme.background }}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
                New drop
              </p>
              <h3 className="font-display text-2xl mb-3" style={{ color: theme.text }}>
                {tagline || 'Wear the brand.'}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-sm p-3" style={{ backgroundColor: theme.surface }}>
                    <div className="aspect-square rounded-sm mb-2" style={{ backgroundColor: theme.secondary, opacity: 0.3 }} />
                    <p className="text-xs font-semibold" style={{ color: theme.text }}>
                      Sample item
                    </p>
                    <p className="text-xs" style={{ color: theme.secondary }}>
                      ₹799
                    </p>
                  </div>
                ))}
              </div>
              <button
                className="w-full py-2.5 text-sm font-bold uppercase rounded-sm"
                style={{ backgroundColor: theme.accent, color: theme.primary }}
              >
                Add to cart
              </button>
            </div>
            <div className="px-5 py-4 text-xs" style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
              © {storeName || 'XyvorA'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTheme;
