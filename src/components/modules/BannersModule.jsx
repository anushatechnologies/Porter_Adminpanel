import React, { useState, useEffect, useContext } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit, X, Link as LinkIcon, Upload, ArrowRight, RefreshCw } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function BannersModule() {
  const { banners, setBanners, authFetch } = useContext(AppStateContext);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetAction, setTargetAction] = useState('PACKERS_MOVERS');
  const [targetValue, setTargetValue] = useState('DISCOUNT50');
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [isActive, setIsActive] = useState(true);

  // Fetch live banners directly from backend /api/admin/banners
  const fetchLiveBanners = async () => {
    if (!authFetch) return;
    setIsRefreshing(true);
    try {
      const res = await authFetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.banners || data.data || []);
        if (list.length > 0) {
          const normalized = list.map(b => {
            const numId = b.bannerId || (typeof b.id === 'number' ? b.id : parseInt(String(b.id || '').replace(/[^0-9]/g, ''), 10) || null);
            return {
              ...b,
              id: b.id || (numId ? `BNR-${numId}` : `BNR-${Math.floor(1000 + Math.random() * 9000)}`),
              bannerId: numId,
              title: b.title || 'Promotional Banner',
              imageUrl: b.imageUrl,
              targetAction: b.targetAction || 'PACKERS_MOVERS',
              targetValue: b.targetValue || '',
              isActive: b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true),
              active: b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true),
              createdAt: b.createdAt || new Date().toISOString()
            };
          });
          setBanners(normalized);
          try { localStorage.setItem('porter_admin_banners', JSON.stringify(normalized)); } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Could not fetch live banners from /api/admin/banners:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || '');
      setImageUrl(banner.imageUrl || '');
      setTargetAction(banner.targetAction || 'PACKERS_MOVERS');
      setTargetValue(banner.targetValue || '');
      setIsActive(banner.isActive !== undefined ? banner.isActive : true);
      setUploadType(banner.imageUrl && banner.imageUrl.startsWith('data:') ? 'file' : 'url');
    } else {
      setEditingBanner(null);
      setTitle('');
      setImageUrl('');
      setTargetAction('PACKERS_MOVERS');
      setTargetValue('DISCOUNT50');
      setIsActive(true);
      setUploadType('url');
    }
    setShowModal(true);
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setIsUploadingImage(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (authFetch) {
        const res = await authFetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setImageUrl(data.url);
            setIsUploadingImage(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Backend file upload warning:', err);
    }

    // Fallback: Read file with FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    setIsSaving(true);

    const isEdit = Boolean(editingBanner);
    const numericId = editingBanner
      ? (editingBanner.bannerId || (typeof editingBanner.id === 'number' ? editingBanner.id : parseInt(String(editingBanner.id).replace(/[^0-9]/g, ''), 10)))
      : null;

    const bodyData = {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      targetAction: targetAction || 'PACKERS_MOVERS',
      targetValue: targetValue ? targetValue.trim() : '',
      isActive: Boolean(isActive),
      active: Boolean(isActive)
    };

    try {
      let savedResult = null;
      if (authFetch) {
        if (isEdit && numericId) {
          // Backend expects numeric ID for PUT /api/admin/banners/{id}
          const res = await authFetch(`/api/admin/banners/${numericId}`, {
            method: 'PUT',
            body: JSON.stringify(bodyData)
          });
          if (res.ok) {
            const data = await res.json();
            savedResult = data.banner || data;
          }
        } else {
          // Create new banner via POST /api/admin/banners
          const res = await authFetch('/api/admin/banners', {
            method: 'POST',
            body: JSON.stringify(bodyData)
          });
          if (res.ok) {
            const data = await res.json();
            savedResult = data;
          }
        }
      }

      // Build updated banner entry
      const finalId = savedResult?.id || editingBanner?.id || (savedResult?.bannerId ? `BNR-${savedResult.bannerId}` : `BNR-${Math.floor(1000 + Math.random() * 9000)}`);
      const finalBannerId = savedResult?.bannerId || numericId || (typeof finalId === 'number' ? finalId : parseInt(String(finalId).replace(/[^0-9]/g, ''), 10));

      const finalBanner = {
        ...bodyData,
        id: finalId,
        bannerId: finalBannerId,
        createdAt: savedResult?.createdAt || editingBanner?.createdAt || new Date().toISOString()
      };

      setBanners(prev => {
        let updated;
        if (isEdit) {
          updated = prev.map(b => (b.id === editingBanner.id || b.bannerId === numericId) ? finalBanner : b);
        } else {
          updated = [finalBanner, ...prev];
        }
        try { localStorage.setItem('porter_admin_banners', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      handleCloseModal();
    } catch (err) {
      console.error('Save banner error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotional banner?')) {
      const bannerItem = banners.find(b => b.id === id || b.bannerId === id);
      const numericId = bannerItem?.bannerId || (typeof id === 'number' ? id : parseInt(String(id).replace(/[^0-9]/g, ''), 10));

      if (authFetch && numericId) {
        try {
          await authFetch(`/api/admin/banners/${numericId}`, { method: 'DELETE' });
        } catch (err) {
          console.warn('Backend delete banner error:', err);
        }
      }

      setBanners(prev => {
        const updated = prev.filter(b => b.id !== id && b.bannerId !== numericId);
        try { localStorage.setItem('porter_admin_banners', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }
  };

  const toggleStatus = async (id) => {
    const banner = banners.find(b => b.id === id || b.bannerId === id);
    if (!banner) return;

    const newStatus = !banner.isActive;
    const numericId = banner.bannerId || (typeof id === 'number' ? id : parseInt(String(id).replace(/[^0-9]/g, ''), 10));
    const updated = { ...banner, isActive: newStatus, active: newStatus };

    setBanners(prev => {
      const updatedList = prev.map(b => (b.id === id || b.bannerId === id) ? updated : b);
      try { localStorage.setItem('porter_admin_banners', JSON.stringify(updatedList)); } catch (e) {}
      return updatedList;
    });

    if (authFetch && numericId) {
      try {
        await authFetch(`/api/admin/banners/${numericId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: banner.title,
            imageUrl: banner.imageUrl,
            targetAction: banner.targetAction,
            targetValue: banner.targetValue,
            isActive: newStatus,
            active: newStatus
          })
        });
      } catch (e) {
        console.warn('Toggle banner status error:', e);
      }
    }
  };

  return (
    <div className="animate-fade">
      <div className="table-container">
        <div className="table-header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Promotional Banners</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Manage promotional banners displayed on customer home feed (GET/POST/PUT/DELETE <code>/api/admin/banners</code>).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={fetchLiveBanners}
              disabled={isRefreshing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Refresh banners from backend"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
            </button>

            <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Promotional Banner
            </button>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Banner ID</th>
              <th>Preview</th>
              <th>Title</th>
              <th>Target Action & Value</th>
              <th>Status</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!banners || banners.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No banners found. Click 'Add Promotional Banner' to create one.
                </td>
              </tr>
            ) : (
              banners.map(b => (
                <tr key={b.id || b.bannerId}>
                  <td style={{ fontWeight: '600' }}>#{b.id || `BNR-${b.bannerId}`}</td>
                  <td>
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=128&auto=format';
                          }}
                        />
                      ) : (
                        <ImageIcon size={24} color="#94A3B8" />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{b.title}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#0F172A', fontWeight: '700' }}>
                      {b.targetAction || 'PACKERS_MOVERS'}
                    </span>
                    {b.targetValue && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <code>{b.targetValue}</code>
                      </div>
                    )}
                  </td>
                  <td>
                    <button 
                      type="button"
                      className={`badge ${b.isActive ? 'badge-completed' : 'badge-cancelled'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      onClick={() => toggleStatus(b.id || b.bannerId)}
                      title="Click to toggle active status on Customer App"
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>{b.createdAt ? (isNaN(new Date(b.createdAt).getTime()) ? String(b.createdAt).slice(0, 10) : new Date(b.createdAt).toLocaleDateString()) : 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="action-btn btn-view" onClick={() => handleOpenModal(b)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => handleDelete(b.id || b.bannerId)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingBanner ? 'Edit Banner' : 'Upload Promotional Banner'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: 'var(--primary)', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ImageIcon size={18} />
                <span>Banner images sync directly with <code>/api/admin/banners</code> and display on Customer App.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Banner Title / Promo Headline</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full custom-input" 
                  placeholder="e.g. 50% Off on Intracity House Shifting" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Target Action</label>
                  <select
                    className="custom-input w-full"
                    value={targetAction}
                    onChange={(e) => setTargetAction(e.target.value)}
                  >
                    <option value="PACKERS_MOVERS">PACKERS_MOVERS</option>
                    <option value="PASSENGER">PASSENGER (Cabs)</option>
                    <option value="GOODS">GOODS (Freight Trucks)</option>
                    <option value="COUPON">COUPON CODE</option>
                    <option value="CUSTOM_URL">EXTERNAL LINK</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Target Value / Promo Code</label>
                  <input
                    type="text"
                    className="custom-input w-full"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g. DISCOUNT50 or CAB_SEDAN"
                  />
                </div>
              </div>

              {/* Upload mode tabs: URL vs File */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Banner Image Source</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button 
                    type="button" 
                    className={`btn ${uploadType === 'url' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, padding: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: uploadType === 'url' ? undefined : 'var(--bg-main)' }}
                    onClick={() => setUploadType('url')}
                  >
                    <LinkIcon size={14} /> Image URL (S3 / Web)
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${uploadType === 'file' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, padding: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: uploadType === 'file' ? undefined : 'var(--bg-main)' }}
                    onClick={() => setUploadType('file')}
                  >
                    <Upload size={14} /> Upload File
                  </button>
                </div>

                {uploadType === 'url' ? (
                  <input 
                    type="url" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    className="w-full custom-input" 
                    placeholder="https://poteranusha.s3.ap-south-2.amazonaws.com/banners/promo_pm.png" 
                    required={!imageUrl} 
                  />
                ) : (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                    className="w-full custom-input" 
                    required={!imageUrl} 
                  />
                )}
              </div>

              {imageUrl && (
                 <div style={{ marginTop: '4px' }}>
                   <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Preview</label>
                   <img src={imageUrl} alt="Preview" style={{ width: '128px', height: '128px', objectFit: 'cover', borderRadius: '8px', border: '1px dashed var(--border-color)' }} onError={(e) => e.target.style.display = 'none'} />
                 </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '13px', cursor: 'pointer' }}>Publish as Active on Customer App</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Upload Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
