import React, { useState, useEffect, useContext } from 'react';
import { Send, CheckCircle2, AlertCircle, FileText, Search, User, Truck, Clock } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function SupportModule() {
  const { tickets, sendMessageToTicket, resolveTicket, updateTicketStatus } = useContext(AppStateContext);

  const [statusFilter, setStatusFilter] = useState(() => {
    return localStorage.getItem('porter_support_active_tab') || 'pending';
  });

  const [activeTicketId, setActiveTicketId] = useState(null);
  const [customerInput, setCustomerInput] = useState('');
  const [driverInput, setDriverInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('porter_support_active_tab', statusFilter);
    window.dispatchEvent(new Event('storage-update'));
  }, [statusFilter]);

  useEffect(() => {
    const syncTab = () => {
      const stored = localStorage.getItem('porter_support_active_tab') || 'all';
      setStatusFilter(stored);
    };
    window.addEventListener('storage-update', syncTab);
    return () => window.removeEventListener('storage-update', syncTab);
  }, []);

  const countAll = tickets.length;
  const countOpen = tickets.filter(t => t.status === 'open').length;
  const countPending = tickets.filter(t => t.status === 'pending').length;
  const countResolved = tickets.filter(t => t.status === 'resolved').length;

  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      ticket.id.toLowerCase().includes(query) ||
      ticket.customerName.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query)
    );
    if (!matchesSearch) return false;

    if (statusFilter !== 'all') {
      if (statusFilter === 'resolved' && ticket.status !== 'resolved') return false;
      if (statusFilter === 'open' && ticket.status !== 'open') return false;
      if (statusFilter === 'pending' && ticket.status !== 'pending') return false;
    }
    return true;
  });

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  useEffect(() => {
    if (filteredTickets.length > 0) {
      const isStillVisible = filteredTickets.some(t => t.id === activeTicketId);
      if (!isStillVisible) {
        setActiveTicketId(filteredTickets[0].id);
      }
    } else {
      setActiveTicketId(null);
    }
  }, [statusFilter, searchQuery, tickets, activeTicketId]);

  const handleSendToCustomer = (e) => {
    e.preventDefault();
    if (!customerInput.trim() || !activeTicketId) return;
    sendMessageToTicket(activeTicketId, 'customer', customerInput);
    setCustomerInput('');
  };

  const handleSendToDriver = (e) => {
    e.preventDefault();
    if (!driverInput.trim() || !activeTicketId) return;
    sendMessageToTicket(activeTicketId, 'driver', driverInput);
    setDriverInput('');
  };

  const handleResolveTicket = () => {
    if (!activeTicketId) return;
    resolveTicket(activeTicketId);
  };

  return (
    <div className="support-container animate-fade">
      {/* Left Sidebar Tickets Queue */}
      <div className="support-tickets-sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="search-input-wrapper" style={{ width: '100%' }}>
            <Search className="header-search-icon" size={14} style={{ left: '10px' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 30px' }}
            />
          </div>

          {/* Status Filter Pill Tabs */}
          <div className="support-tabs-wrapper" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '5px 10px',
                borderRadius: '20px',
                backgroundColor: statusFilter === 'all' ? 'var(--primary)' : 'var(--bg-main)',
                color: statusFilter === 'all' ? '#fff' : 'var(--text-muted)',
                border: '1px solid ' + (statusFilter === 'all' ? 'var(--primary)' : 'var(--border-color)'),
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              All <span style={{ opacity: 0.8, fontSize: '10px' }}>{countAll}</span>
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '5px 10px',
                borderRadius: '20px',
                backgroundColor: statusFilter === 'open' ? 'var(--status-pending)' : 'var(--bg-main)',
                color: statusFilter === 'open' ? '#fff' : 'var(--text-muted)',
                border: '1px solid ' + (statusFilter === 'open' ? 'var(--status-pending)' : 'var(--border-color)'),
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Open <span style={{ opacity: 0.8, fontSize: '10px' }}>{countOpen}</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '5px 10px',
                borderRadius: '20px',
                backgroundColor: statusFilter === 'pending' ? 'var(--status-assigned)' : 'var(--bg-main)',
                color: statusFilter === 'pending' ? '#fff' : 'var(--text-muted)',
                border: '1px solid ' + (statusFilter === 'pending' ? 'var(--status-assigned)' : 'var(--border-color)'),
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Pending <span style={{ opacity: 0.8, fontSize: '10px' }}>{countPending}</span>
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '5px 10px',
                borderRadius: '20px',
                backgroundColor: statusFilter === 'resolved' ? 'var(--status-online)' : 'var(--bg-main)',
                color: statusFilter === 'resolved' ? '#fff' : 'var(--text-muted)',
                border: '1px solid ' + (statusFilter === 'resolved' ? 'var(--status-online)' : 'var(--border-color)'),
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Closed <span style={{ opacity: 0.8, fontSize: '10px' }}>{countResolved}</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className={`support-ticket-item ${activeTicketId === ticket.id ? 'active' : ''}`}
              onClick={() => setActiveTicketId(ticket.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>#{ticket.id}</span>
                <span className={`badge ${ticket.status === 'open' ? 'badge-pending' : ticket.status === 'pending' ? 'badge-assigned' : 'badge-online'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {ticket.status === 'resolved' ? 'Closed' : ticket.status === 'open' ? 'Open' : 'Pending'}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '6px' }}>{ticket.subject}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '8px' }}>
                <span>Cust: {ticket.customerName}</span>
                <span>•</span>
                <span>Driver: {ticket.driverName.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Split Panel Chat Area */}
      {activeTicket ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Active Ticket Banner */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{activeTicket.subject}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Order: #{activeTicket.orderId})</span>
                {activeTicket.status !== 'resolved' ? (
                  <select
                    className={`custom-select badge ${activeTicket.status === 'open' ? 'badge-pending' : 'badge-assigned'
                      }`}
                    style={{
                      padding: '2px 24px 2px 8px',
                      fontSize: '10px',
                      height: '24px',
                      width: 'auto',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      outline: 'none',
                      appearance: 'auto'
                    }}
                    value={activeTicket.status}
                    onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value)}
                  >
                    <option value="open" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Open</option>
                    <option value="pending" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Pending</option>
                  </select>
                ) : (
                  <span className="badge badge-online" style={{ fontSize: '10px', padding: '3px 8px' }}>
                    Closed
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Coordinating customer <strong style={{ color: 'var(--text-main)' }}>{activeTicket.customerName}</strong> and driver <strong style={{ color: 'var(--text-main)' }}>{activeTicket.driverName}</strong>
              </p>
            </div>

            {activeTicket.status !== 'resolved' ? (
              <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handleResolveTicket}>
                <CheckCircle2 size={14} /> Close Ticket
              </button>
            ) : (
              <span className="badge badge-online" style={{ fontSize: '12px', padding: '6px 14px' }}>
                Closed
              </span>
            )}
          </div>

          <div className="chat-split-view">
            {/* Left Chat: Customer Side */}
            <div className="chat-panel">
              <div className="chat-header">
                <div className="chat-user-info">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,107,0,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <User size={16} />
                  </div>
                  <div>
                    <div className="chat-user-title">{activeTicket.customerName}</div>
                    <div className="chat-user-sub">Customer Account</div>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeTicket.customerChat.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-bubble ${msg.sender === 'customer' ? 'message-received' : 'message-sent'}`}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '4px', opacity: 0.8 }}>{msg.time}</div>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'resolved' && (
                <form className="chat-input-area" onSubmit={handleSendToCustomer}>
                  <input
                    type="text"
                    placeholder="Reply to customer..."
                    value={customerInput}
                    onChange={(e) => setCustomerInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* Right Chat: Driver Side */}
            <div className="chat-panel">
              <div className="chat-header">
                <div className="chat-user-info">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Truck size={16} />
                  </div>
                  <div>
                    <div className="chat-user-title">{activeTicket.driverName}</div>
                    <div className="chat-user-sub">Delivery Driver</div>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeTicket.driverName === 'Unassigned' ? (
                  <div style={{ margin: 'auto', textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <AlertCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                    No driver is assigned to this order yet.
                  </div>
                ) : (
                  activeTicket.driverChat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`message-bubble ${msg.sender === 'driver' ? 'message-received' : 'message-sent'}`}
                    >
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '4px', opacity: 0.8 }}>{msg.time}</div>
                    </div>
                  ))
                )}
              </div>

              {activeTicket.status !== 'resolved' && activeTicket.driverName !== 'Unassigned' && (
                <form className="chat-input-area" onSubmit={handleSendToDriver}>
                  <input
                    type="text"
                    placeholder="Reply to driver..."
                    value={driverInput}
                    onChange={(e) => setDriverInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Select a support ticket from the list to begin coordination.
        </div>
      )}
    </div>
  );
}