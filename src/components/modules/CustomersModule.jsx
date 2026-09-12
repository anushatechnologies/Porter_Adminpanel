import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone, ShoppingBag, MessageSquare, X, CheckCircle, Globe } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function CustomersModule() {
  const navigate = useNavigate();
  const [selectedCust, setSelectedCust] = useState(null);

  const { tickets, customers, orders } = useContext(AppStateContext);

  const getCustomerTicketsCount = (cName) => {
    return tickets.filter(t => t.customerName === cName).length;
  };

  const getCustomerOrdersCount = (cust) => {
    const matching = (orders || []).filter(o =>
      (o.customer && (
        o.customer.toLowerCase() === (cust.email || '').toLowerCase() ||
        o.customer.toLowerCase() === (cust.name || '').toLowerCase() ||
        o.customer.toLowerCase() === (cust.phone || '').toLowerCase()
      )) ||
      (o.customerEmail && o.customerEmail.toLowerCase() === (cust.email || '').toLowerCase())
    );
    return matching.length > 0 ? matching.length : (cust.totalOrders || 0);
  };

  const handleOpenProfile = (cust) => {
    setSelectedCust(cust);
  };

  return (
    <div className="animate-fade">
      <div className="table-container">
        <div className="table-header-controls">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Active Customer Registry</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer Directory loaded via <code>GET /api/admin/customers</code>.</p>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Total Deliveries</th>
              <th>Support Tickets</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No customer accounts found in system database.
                </td>
              </tr>
            )}
            {customers.map(c => {
              const ticketsCount = getCustomerTicketsCount(c.name);
              const orderCount = c.totalOrders !== undefined ? c.totalOrders : getCustomerOrdersCount(c);
              const displayName = c.name ? c.name : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>null</span>;
              const status = c.status || 'active';

              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: '700' }}>#{c.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div
                      onClick={() => handleOpenProfile(c)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      className="clickable-customer-name"
                      title="View Customer Profile"
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                        {(c.name || 'C')[0].toUpperCase()}
                      </div>
                      <span className="customer-name-link" style={{ transition: 'color var(--transition-fast)' }}>
                        {displayName}
                      </span>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>
                    <span className={`badge ${status === 'active' ? 'badge-online' : 'badge-offline'}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                      {c.role || 'customer'}
                    </span>
                  </td>
                  <td>
                    <span
                      onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(c.email || c.name || '')}`)}
                      style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}
                      title="Click to view deliveries in Orders Manager"
                    >
                      {orderCount} {orderCount === 1 ? 'delivery' : 'deliveries'}
                    </span>
                  </td>
                  <td>
                    {ticketsCount > 0 ? (
                      <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <MessageSquare size={12} /> {ticketsCount} {ticketsCount === 1 ? 'ticket' : 'tickets'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <MessageSquare size={12} style={{ opacity: 0.5 }} /> 0 tickets
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-btn btn-view" onClick={() => handleOpenProfile(c)} title="View Profile">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCust && (
        <div className="modal-backdrop" onClick={() => setSelectedCust(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Customer Profile - #{selectedCust.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCust(null)}><X size={20} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EEF2FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', border: '2px solid #C7D2FE' }}>
                  {(selectedCust.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', margin: 0 }}>
                    {selectedCust.name ? selectedCust.name : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>null</span>}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Email: {selectedCust.email} • ID: #{selectedCust.id}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Phone size={12} /> {selectedCust.phone}</p>
                </div>
              </div>

              {/* Status and Role Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Account Status</div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge ${selectedCust.status === 'active' ? 'badge-online' : 'badge-offline'}`}>
                      {selectedCust.status || 'active'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>User Role</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginTop: '6px', textTransform: 'capitalize' }}>
                    {selectedCust.role || 'customer'}
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Language</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={14} color="var(--primary)" />
                    {selectedCust.language || 'en'}
                  </div>
                </div>
              </div>

              {/* Analytics summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div
                  style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                  onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(selectedCust.email || selectedCust.name)}`)}
                  title="View deliveries in Orders Manager"
                >
                  <ShoppingBag size={22} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                      {getCustomerOrdersCount(selectedCust)} Total Deliveries →
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to view in Orders Manager</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <MessageSquare size={20} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>
                      {getCustomerTicketsCount(selectedCust.displayName || selectedCust.name)} Support Tickets
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Customer inquiries logged</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCust(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}