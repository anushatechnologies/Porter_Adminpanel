import React, { useState, useContext } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit, X, Link as LinkIcon, Upload } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function BannersModule() {
  const { banners, setBanners, authFetch } = useContext(AppStateContext);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [isActive, setIsActive] = useState(true);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || '');
      setImageUrl(banner.imageUrl || '');
      setIsActive(banner.isActive !== undefined ? banner.isActive : true);
      setUploadType(banner.imageUrl && banner.imageUrl.startsWith('data:') ? 'file' : 'url');
    } else {
      setEditingBanner(null);
      setTitle('');
      setImageUrl('');
      setIsActive(true);
      setUploadType('url');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Resize image to 512x512 canvas for optimal size
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 512, 512);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageUrl(compressedDataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const bannerId = editingBanner ? editingBanner.id : `BNR-${Math.floor(1000 + Math.random() * 9000)}`;

    const bannerPayload = {
      id: bannerId,
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      isActive: Boolean(isActive),
      createdAt: editingBanner ? editingBanner.createdAt : new Date().toISOString()
    };

    // Update React state & localStorage immediately
    if (editingBanner) {
      setBanners(prev => {
        const updated = prev.map(b => b.id === editingBanner.id ? bannerPayload : b);
        try { localStorage.setItem('porter_admin_banners', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    } else {
      setBanners(prev => {
        const updated = [bannerPayload, ...prev];
        try { localStorage.setItem('porter_admin_banners', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }

    // Try posting to backend API as well (truncates ultra-long base64 if needed for backend 500 char limit)
    if (authFetch) {
      try {
        const safeApiUrl = imageUrl.length > 490 && imageUrl.startsWith('data:') 
          ? `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&auto=format` 
          : imageUrl;

        await authFetch('/api/banners', {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            imageUrl: safeApiUrl,
            isActive: Boolean(isActive)
          })
        });
      } catch (err) {
        console.warn('Backend banner save warning (retained locally):', err);
      }
    }

    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      const bannerItem = banners.find(b => b.id === id || b.bannerId === id);
      const numericId = bannerItem?.bannerId || (typeof id === 'number' ? id : parseInt(String(id).replace(/[^0-9]/g, ''), 10));

      if (authFetch) {
        try {
          if (numericId && !isNaN(numericId)) {
            await authFetch(`/api/banners/${numericId}`, { method: 'DELETE' });
          }
          await authFetch(`/api/banners/${id}`, { method: 'DELETE' });
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

  const toggleStatus = (id) => {
    setBanners(prev => {
      const updatedList = prev.map(b => {
        if (b.id === id) {
          const updated = { ...b, isActive: !b.isActive };
          if (authFetch) {
            authFetch('/api/banners', {
              method: 'POST',
              body: JSON.stringify(updated)
            }).catch(() => {});
          }
          return updated;
        }
        return b;
      });
      try { localStorage.setItem('porter_admin_banners', JSON.stringify(updatedList)); } catch (e) {}
      return updatedList;
    });
  };

  return (
    <div className="animate-fade">
      <div className="table-container">
        <div className="table-header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Promotional Banners</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage app home screen banners. Required size: 512 × 512 pixels.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Add New Banner
          </button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Banner ID</th>
              <th>Preview (512×512)</th>
              <th>Title</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!banners || banners.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No banners found. Click 'Add New Banner' to create one.
                </td>
              </tr>
            ) : (
              banners.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '600' }}>{b.id}</td>
                  <td>
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {b.imageUrl ? (
                         <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                         <ImageIcon size={24} color="#ccc" />
                      )}
                    </div>
                  </td>
                  <td>{b.title}</td>
                  <td>
                    <span 
                      className={`badge ${b.isActive ? 'badge-completed' : 'badge-cancelled'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleStatus(b.id)}
                      title="Click to toggle status"
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{b.createdAt ? (isNaN(new Date(b.createdAt).getTime()) ? String(b.createdAt) : new Date(b.createdAt).toLocaleDateString()) : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="action-btn btn-view" onClick={() => handleOpenModal(b)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => handleDelete(b.id)} title="Delete">
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
              <h3 className="modal-title">{editingBanner ? 'Edit Banner' : 'Upload New Banner'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: 'var(--primary)', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ImageIcon size={18} />
                <span>Image must be <strong>512 × 512 pixels</strong> for optimal mobile app display.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Banner Title / Alt Text</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full" 
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  placeholder="e.g., Summer Sale Promo" 
                  required 
                />
              </div>

              {/* Upload mode tabs: URL vs File */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Banner Image Input Method</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button 
                    type="button" 
                    className={`btn ${uploadType === 'url' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, padding: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: uploadType === 'url' ? undefined : 'var(--bg-main)' }}
                    onClick={() => setUploadType('url')}
                  >
                    <LinkIcon size={14} /> Image URL (Link)
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
                    className="w-full" 
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    placeholder="https://example.com/banner.png" 
                    required={!imageUrl} 
                  />
                ) : (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                    className="w-full" 
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    required={!imageUrl} 
                  />
                )}
              </div>

              {imageUrl && (
                 <div style={{ marginTop: '10px' }}>
                   <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Image Preview</label>
                   <img src={imageUrl} alt="Preview" style={{ width: '128px', height: '128px', objectFit: 'cover', borderRadius: '8px', border: '1px dashed var(--border-color)' }} onError={(e) => e.target.style.display = 'none'} />
                 </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '13px', cursor: 'pointer' }}>Set as Active immediately</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={handleCloseModal} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBanner ? 'Update Banner' : 'Upload Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
