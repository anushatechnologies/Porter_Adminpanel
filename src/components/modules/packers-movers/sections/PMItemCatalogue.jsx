import React, { useState, useContext } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';
import ItemEditorModal from '../components/ItemEditorModal';

export default function PMItemCatalogue() {
  const {
    categories, addCategory, updateCategory, deleteCategory,
    items, addItem, updateItem, deleteItem,
    appSettings, setAppSettings
  } = useContext(PackersMoversContext);

  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', description: '', sortOrder: categories.length + 1, isActive: true });

  const filteredItems = items.filter(item => {
    if (selectedCat !== 'ALL' && item.categoryId !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.categoryId.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    addCategory(newCat);
    setNewCat({ name: '', icon: '📦', description: '', sortOrder: categories.length + 1, isActive: true });
    setShowCatForm(false);
  };

  const handleSaveItem = (itemData) => {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Custom Item Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--primary)" /> Item Categories & Moving Catalogue
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Admin catalogue items automatically appear in the Customer App inventory picker with volume, weight & rates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Custom Item Feature Flag */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Allow Customer Custom Items:</span>
            <button
              onClick={() => setAppSettings(p => ({ ...p, allowCustomerCustomItems: !p.allowCustomerCustomItems }))}
              style={{
                border: 'none',
                backgroundColor: appSettings.allowCustomerCustomItems ? '#10B981' : '#E2E8F0',
                color: appSettings.allowCustomerCustomItems ? '#FFF' : '#64748B',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {appSettings.allowCustomerCustomItems ? 'YES (Enabled)' : 'NO (Disabled)'}
            </button>
          </div>

          <button className="btn btn-secondary" onClick={() => setShowCatForm(!showCatForm)} style={{ fontSize: '12px' }}>
            <Layers size={14} style={{ marginRight: '6px' }} /> Manage Categories
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingItem(null); setShowItemModal(true); }} style={{ fontSize: '12px' }}>
            <Plus size={14} style={{ marginRight: '6px' }} /> Add New Item
          </button>
        </div>
      </div>

      {/* Category Creation Drawer/Form */}
      {showCatForm && (
        <form onSubmit={handleSaveCategory} noValidate className="card" style={{ padding: '16px 20px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700' }}>Create New Item Category</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 3fr 100px auto', gap: '10px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Icon</label>
              <input type="text" value={newCat.icon} onChange={(e) => setNewCat(p => ({ ...p, icon: e.target.value }))} style={{ width: '100%', padding: '8px', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Category Name *</label>
              <input type="text" required value={newCat.name} onChange={(e) => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Garden & Balcony" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
              <input type="text" value={newCat.description} onChange={(e) => setNewCat(p => ({ ...p, description: e.target.value }))} placeholder="Plants, outdoor chairs, pots" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Order</label>
              <input type="number" value={newCat.sortOrder} onChange={(e) => setNewCat(p => ({ ...p, sortOrder: parseInt(e.target.value) || 1 }))} style={{ width: '100%', padding: '8px', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>Save Category</button>
          </div>
        </form>
      )}

      {/* Category Filter Chips & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedCat('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid var(--border-color)',
              backgroundColor: selectedCat === 'ALL' ? 'var(--primary)' : 'var(--bg-main)',
              color: selectedCat === 'ALL' ? '#FFF' : 'var(--text-color)',
              cursor: 'pointer'
            }}
          >
            All Items ({items.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--border-color)',
                backgroundColor: selectedCat === cat.id ? 'var(--primary)' : 'var(--bg-main)',
                color: selectedCat === cat.id ? '#FFF' : 'var(--text-color)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper" style={{ minWidth: '240px' }}>
          <Search className="header-search-icon" size={14} />
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Image</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Volume / Weight</th>
              <th>Packing Rate</th>
              <th>Dismantle / Reassemble</th>
              <th>Handling Charge</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const cat = categories.find(c => c.id === item.categoryId);
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Package size={18} color="var(--primary)" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{item.name}</div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '10px', marginTop: '2px' }}>
                      {item.isFragile && <span style={{ color: '#D97706', fontWeight: '700' }}>⚠️ Fragile</span>}
                      {item.packingRequired && <span style={{ color: '#0284C7' }}>• Packing Mandatory</span>}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#F1F5F9', color: 'var(--text-color)', fontSize: '11px' }}>
                      {cat ? `${cat.icon} ${cat.name}` : item.categoryId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{item.volumeCuFt} cu.ft</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>~{item.weightKg} kg</div>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{item.packingPrice}</td>
                  <td>
                    <div style={{ fontSize: '12px' }}>Dismantle: ₹{item.dismantlingPrice}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reassemble: ₹{item.reassemblyPrice}</div>
                  </td>
                  <td style={{ fontWeight: '700' }}>₹{item.baseHandling}</td>
                  <td>
                    <button
                      onClick={() => updateItem(item.id, { isActive: !item.isActive })}
                      style={{
                        border: 'none',
                        background: item.isActive ? '#DCFCE7' : '#FEE2E2',
                        color: item.isActive ? '#15803D' : '#B91C1C',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {item.isActive ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="action-btn btn-view" onClick={() => { setEditingItem(item); setShowItemModal(true); }}><Edit size={14} /></button>
                      <button className="action-btn" style={{ color: '#EF4444' }} onClick={() => { if (confirm(`Delete ${item.name}?`)) deleteItem(item.id); }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showItemModal && (
        <ItemEditorModal
          item={editingItem}
          categories={categories}
          onSave={handleSaveItem}
          onClose={() => { setShowItemModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
