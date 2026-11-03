import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Palette, RotateCcw, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

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

  if (!theme) return (
    <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-black/5">
      Loading theme settings...
    </div>
  );

  const handleColorChange = (key, value) => {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    applyLocalTheme(updated);
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#0d0d0d] mb-1">Theme & Colors</h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Changes preview live immediately. Click &quot;Save changes&quot; below to persist them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Controls Column */}
        <div className="space-y-6">
          {/* Brand Info */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5">
            <h2 className="font-semibold text-base mb-4 text-[#0d0d0d]">Store Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  WhatsApp Orders Number (Country code + digits)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="919876543210"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hero Media & Headings */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5">
            <h2 className="font-semibold text-base mb-4 text-[#0d0d0d]">Homepage Hero Banner</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  Hero Background Media (Image / Video)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {heroMediaUrl ? (
                    <div className="h-16 w-24 bg-gray-100 rounded-lg border border-black/10 flex items-center justify-center overflow-hidden shrink-0">
                      {heroMediaType === 'video' ? (
                        <video src={heroMediaUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={heroMediaUrl} alt="Hero" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="h-16 w-24 bg-gray-100 rounded-lg border border-black/10 flex items-center justify-center shrink-0 text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  )}

                  <div className="flex-1 w-full min-w-0">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={uploadingMedia}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-black/5 hover:file:bg-black/10 file:cursor-pointer"
                    />
                    {uploadingMedia && <p className="text-xs text-blue-600 font-medium mt-1.5 animate-pulse">Uploading media...</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Top Subtitle
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Title Line 1
                  </label>
                  <input
                    type="text"
                    value={heroTitleLine1}
                    onChange={(e) => setHeroTitleLine1(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Title Line 2
                  </label>
                  <input
                    type="text"
                    value={heroTitleLine2}
                    onChange={(e) => setHeroTitleLine2(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="font-semibold text-base text-[#0d0d0d]">Color Palette</h2>
              <button
                type="button"
                onClick={resetDefaults}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1 font-medium"
              >
                <RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {colorFields.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[field.key] || '#000000'}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0 p-0.5 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#0d0d0d] truncate">{field.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{field.hint}</p>
                  </div>
                  <input
                    type="text"
                    value={theme[field.key] || ''}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-20 sm:w-24 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono text-center outline-none focus:border-black uppercase"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 px-6 bg-[#0d0d0d] text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-black/80 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : saved ? (
              <>
                <Check size={18} className="text-[#d4ff3f]" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <span>Save Theme & Store Settings</span>
            )}
          </button>
        </div>

        {/* Live Preview Panel */}
        <div>
          <div className="lg:sticky lg:top-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Live Storefront Preview</p>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
              {/* Header Preview */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ backgroundColor: theme.headerBg, color: theme.headerText }}
              >
                <span className="font-display text-lg tracking-wider">{storeName || 'XYVORA'}</span>
                <span className="text-xs uppercase font-semibold">Cart (2)</span>
              </div>

              {/* Body Preview */}
              <div className="p-6" style={{ backgroundColor: theme.background }}>
                <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: theme.accent }}>
                  {heroSubtitle || 'New Drop'}
                </p>
                <h3 className="font-display text-2xl mb-1" style={{ color: theme.text }}>
                  {heroTitleLine1 || 'Future of'} {heroTitleLine2 || 'Streetwear'}
                </h3>
                <p className="text-xs mb-5" style={{ color: theme.secondary }}>
                  {tagline || 'Wear the brand.'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg p-3 shadow-sm" style={{ backgroundColor: theme.surface }}>
                      <div className="aspect-square rounded-md mb-2 opacity-30" style={{ backgroundColor: theme.secondary }} />
                      <p className="text-xs font-semibold" style={{ color: theme.text }}>
                        Product {i}
                      </p>
                      <p className="text-xs" style={{ color: theme.secondary }}>
                        ₹799
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
                  style={{ backgroundColor: theme.accent, color: theme.primary }}
                >
                  Add to Cart
                </button>
              </div>

              {/* Footer Preview */}
              <div className="px-5 py-3.5 text-xs text-center border-t border-black/5" style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
                © {storeName || 'XyvorA'} Store
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTheme;