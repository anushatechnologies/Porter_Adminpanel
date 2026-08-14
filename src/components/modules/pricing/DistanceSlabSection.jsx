import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, GripVertical, Info } from 'lucide-react';

const DistanceSlabSection = ({
  enabled,
  onToggleEnabled,
  slabs,
  onSlabsChange,
  onDeleteSlab
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleAddSlab = () => {
    let lastToKm = 0;
    if (slabs.length > 0) {
      const last = slabs[slabs.length - 1];
      lastToKm = parseFloat(last.toKm) || 0;
    }
    const newSlab = {
      id: `temp-${Date.now()}`,
      fromKm: lastToKm,
      toKm: lastToKm + 10,
      pricePerKm: 10,
      isNew: true
    };
    onSlabsChange([...slabs, newSlab]);
    setEditingId(newSlab.id);
  };

  const handleUpdateSlab = (id, field, value) => {
    const updated = slabs.map(s => s.id === id ? { ...s, [field]: value } : s);
    onSlabsChange(updated);
  };

  const handleRemoveSlab = (id) => {
    if (onDeleteSlab) {
      onDeleteSlab(id);
    } else {
      onSlabsChange(slabs.filter(s => s.id !== id));
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const reordered = [...slabs];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    setDraggedIndex(null);
    setDragOverIndex(null);
    onSlabsChange(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div className="toggle-row" style={{ borderRadius: '12px 12px 0 0', border: '1px solid var(--border-color)', borderBottom: enabled ? '1px solid var(--border-color)' : 'none' }}>
        <div className="toggle-row-label">
          <Info size={18} color="var(--primary)" />
          <span>Enable Distance Slab Pricing</span>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {enabled && (
        <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 12px 12px', background: 'var(--bg-card)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Slab pricing overrides standard Per KM rate for specified distance ranges.
          </p>

          <div className="slab-table-container">
            <table className="slab-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>From KM</th>
                  <th>To KM</th>
                  <th>Price Per KM (₹)</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slabs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No distance slabs added yet. Click "Add Slab" below.
                    </td>
                  </tr>
                ) : (
                  slabs.map((slab, index) => {
                    const isEditing = editingId === slab.id;
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;

                    return (
                      <tr
                        key={slab.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                      >
                        <td>
                          <div className="slab-drag-handle" title="Drag to reorder">
                            <GripVertical size={16} />
                          </div>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={slab.fromKm}
                              onChange={(e) => handleUpdateSlab(slab.id, 'fromKm', parseFloat(e.target.value) || 0)}
                            />
                          ) : (
                            <span>{slab.fromKm} KM</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={slab.toKm}
                              onChange={(e) => handleUpdateSlab(slab.id, 'toKm', e.target.value === '' ? '' : parseFloat(e.target.value))}
                              placeholder="Unlimited"
                            />
                          ) : (
                            <span>{slab.toKm ? `${slab.toKm} KM` : 'Unlimited'}</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={slab.pricePerKm}
                              onChange={(e) => handleUpdateSlab(slab.id, 'pricePerKm', parseFloat(e.target.value) || 0)}
                            />
                          ) : (
                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{slab.pricePerKm}</span>
                          )}
                        </td>
                        <td>
                          <div className="slab-actions">
                            {isEditing ? (
                              <button
                                type="button"
                                className="slab-action-btn save"
                                onClick={() => setEditingId(null)}
                                title="Done editing"
                              >
                                <Check size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="slab-action-btn edit"
                                onClick={() => setEditingId(slab.id)}
                                title="Edit slab"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="slab-action-btn delete"
                              onClick={() => handleRemoveSlab(slab.id)}
                              title="Delete slab"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="add-slab-btn"
            onClick={handleAddSlab}
          >
            <Plus size={16} /> Add Distance Slab
          </button>
        </div>
      )}
    </div>
  );
};

export default DistanceSlabSection;
