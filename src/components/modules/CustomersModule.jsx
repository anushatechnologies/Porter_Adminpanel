import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone, Wallet, Plus, ShoppingBag, MessageSquare, X } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function CustomersModule() {
  const navigate = useNavigate();
  const [selectedCust, setSelectedCust] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const { tickets, customers, orders, addCustomerFunds } = useContext(AppStateContext);

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
    setTopUpAmount('');
  };

  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Mutate state using context
    addCustomerFunds(selectedCust.id, amount);
    // Update local modal view state
    setSelectedCust(prev => ({ ...prev, wallet: prev.wallet + amount }));

    setTopUpAmount('');
  };

  return (
    <div className="animate-fade">
      <div className="table-container">
        <div className="table-header-controls">
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Active Customer Registry</h3>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Wallet Balance</th>
              <th>Total Orders</th>
              <th>Tickets Logged</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No customer accounts found in system database.
                </td>
              </tr>
            )}
            {customers.map(c => {
              const ticketsCount = getCustomerTicketsCount(c.name);
              const orderCount = c.totalOrders !== undefined ? c.totalOrders : getCustomerOrdersCount(c);
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: '700' }}>{c.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div
                      onClick={() => handleOpenProfile(c)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      className="clickable-customer-name"
                      title="View Customer Profile"
                    >
                      <img
                        src={c.avatar}
                        alt={c.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                      <span className="customer-name-link" style={{ transition: 'color var(--transition-fast)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td style={{ fontWeight: '600' }}>₹{c.wallet || 0}</td>
                  <td>
                    <span
                      onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(c.email || c.name)}`)}
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
                  <td>
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
              <h3 className="modal-title">Customer Profile - {selectedCust.name}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCust(null)}><X size={20} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={selectedCust.avatar}
                  alt={selectedCust.name}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <div>
                  <h4 style={{ fontSize: '17px' }}>{selectedCust.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email: {selectedCust.email} • ID: {selectedCust.id}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Phone size={12} /> {selectedCust.phone}</p>
                </div>
              </div>

              {/* Wallet adjustment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', justify: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Wallet Balance</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Wallet size={24} /> ₹{selectedCust.wallet}</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>Credit Wallet</div>
                  <form onSubmit={handleTopUpSubmit} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100px', outline: 'none' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', gap: '4px', width: 'auto' }}>
                      <Plus size={12} /> Add Funds
                    </button>
                  </form>
                </div>
              </div>

              {/* Analytics summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div
                  style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)' }}
                  onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(selectedCust.email || selectedCust.name)}`)}
                  title="View deliveries in Orders Manager"
                >
                  <ShoppingBag size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
                      {getCustomerOrdersCount(selectedCust)} Deliveries →
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to view in Orders Manager</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <MessageSquare size={18} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>
                      {getCustomerTicketsCount(selectedCust.displayName || selectedCust.name)} {getCustomerTicketsCount(selectedCust.displayName || selectedCust.name) === 1 ? 'Support Ticket' : 'Support Tickets'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total queries opened</div>
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