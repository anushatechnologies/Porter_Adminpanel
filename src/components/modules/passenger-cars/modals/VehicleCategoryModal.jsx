import React, { useState } from 'react';
import { X, Car, Users, Briefcase, IndianRupee, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export default function VehicleCategoryModal({ category, onClose, onSave }) {
  const isEditing = Boolean(category);

  const [id, setId] = useState(category?.id || `cat_${Date.now()}`);
  const [name, setName] = useState(category?.name || '');
  const [displayName, setDisplayName] = useState(category?.displayName || '');
  const [description, setDescription] = useState(category?.description || '');
  const [maxPassengers, setMaxPassengers] = useState(category?.maxPassengers || 4);
  const [maxLuggage, setMaxLuggage] = useState(category?.maxLuggage || 2);
  const [baseFare, setBaseFare] = useState(category?.baseFare || 300);
  const [minKm, setMinKm] = useState(category?.minKm || 10);
  const [perKm, setPerKm] = useState(category?.perKm || 14);
  const [perMinute, setPerMinute] = useState(category?.perMinute || 1.5);
  const [driverAllowance, setDriverAllowance] = useState(category?.driverAllowance || 100);
  const [status, setStatus] = useState(category?.status || 'active');
  const [image, setImage] = useState(category?.image || category?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png');
  const [uploadType, setUploadType] = useState('file'); // 'file' | 'url'
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('porter_admin_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          setImage(data.url);
          setIsUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Vehicle icon upload to /api/upload warning:', err);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: isEditing ? category.id : id.toLowerCase().replace(/\s+/g, '_'),
      name,
      displayName,
      description,
      maxPassengers: Number(maxPassengers),
      maxLuggage: Number(maxLuggage),
      baseFare: Number(baseFare),
      minKm: Number(minKm),
      perKm: Number(perKm),
      perMinute: Number(perMinute),
      driverAllowance: Number(driverAllowance),
      status,
      image,
      imageUrl: image,
      displayOrder: category?.displayOrder || 99
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? `Edit Category: ${category.name}` : 'Add Vehicle Category'}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sedan or Scooter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Display Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Scooter (Activa, Jupiter)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>

            {/* Vehicle Icon / Photo Upload Section */}
            <div style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} color="var(--primary)" /> Vehicle Image / Icon
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`btn ${uploadType === 'file' ? 'btn-primary' : ''}`}
                    style={{ fontSize: '11px', padding: '3px 10px', height: 'auto', border: '1px solid var(--border-color)', background: uploadType === 'file' ? undefined : 'var(--bg-card)' }}
                    onClick={() => setUploadType('file')}
                  >
                    <Upload size={12} style={{ marginRight: '4px' }} /> Upload File
                  </button>
                  <button
                    type="button"
                    className={`btn ${uploadType === 'url' ? 'btn-primary' : ''}`}
                    style={{ fontSize: '11px', padding: '3px 10px', height: 'auto', border: '1px solid var(--border-color)', background: uploadType === 'url' ? undefined : 'var(--bg-card)' }}
                    onClick={() => setUploadType('url')}
                  >
                    <LinkIcon size={12} style={{ marginRight: '4px' }} /> Image URL
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  {image ? (
                    <img src={image} alt="Vehicle Preview" style={{ width: '42px', height: '42px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <Car size={26} color="#94A3B8" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  {uploadType === 'file' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="vehicle-category-file-picker"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="vehicle-category-file-picker"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px', cursor: 'pointer' }}
                      >
                        <Upload size={14} /> Choose Image from Computer
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        PNG, JPG, SVG or WebP (e.g. Scooter / Car icon)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://poteranusha.s3... or Web image link"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity constraints */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max Passenger Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={maxPassengers}
                  onChange={(e) => setMaxPassengers(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max Luggage Capacity</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={maxLuggage}
                  onChange={(e) => setMaxLuggage(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>
            </div>

            {/* Base Fare & Distance Rules */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Base Fare (₹)</label>
                <input
                  type="number"
                  required
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum KM</label>
                <input
                  type="number"
                  required
                  value={minKm}
                  onChange={(e) => setMinKm(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Per KM Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={perKm}
                  onChange={(e) => setPerKm(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', color: '#10B981' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Driver Allowance (₹)</label>
                <input
                  type="number"
                  value={driverAllowance}
                  onChange={(e) => setDriverAllowance(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}
