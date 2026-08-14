import React, { useState, useContext, useMemo } from 'react';
import { Bell, Send, Users, MapPin, Eye, CheckCircle2, X, Trash2, Layers, Search, UserCheck, User, Sparkles } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function NotificationsModule() {
  const {
    notifications = [],
    orders = [],
    drivers = [],
    customers = [],
    sendBroadcastNotification,
    darkMode,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    removeDuplicateNotifications
  } = useContext(AppStateContext);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Users');
  const [targetCity, setTargetCity] = useState('All');
  const [success, setSuccess] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Filtering & Deduplication state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [hideDuplicates, setHideDuplicates] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    sendBroadcastNotification(title, message, audience, targetCity);

    // Clear inputs
    setTitle('');
    setMessage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Helper to extract/resolve Driver Name and Customer Name for a notification item
  const resolveNotificationMeta = (notif) => {
    let driverName = notif.driverName || notif.driver || null;
    let customerName = notif.customerName || notif.customer || null;

    // Try finding order match if orderId / bookingId is present
    const notifOrderId = notif.orderId || notif.bookingId;
    if (notifOrderId) {
      const match = orders.find(o => String(o.id) === String(notifOrderId) || String(o.backendId) === String(notifOrderId) || String(o.bookingId) === String(notifOrderId));
      if (match) {
        if (!driverName && match.driver) driverName = match.driver;
        if (!customerName && match.customer) customerName = match.customer;
      }
    }

    const msg = notif.message || '';

    // Regex parse Driver Name from message if missing
    if (!driverName) {
      const dMatch1 = msg.match(/Driver\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      const dMatch2 = msg.match(/Driver Assigned \(([^)]+)\)/i);
      if (dMatch1 && dMatch1[1] && !['Accepted', 'Assigned', 'Status', 'Details', 'Location'].includes(dMatch1[1])) {
        driverName = dMatch1[1];
      } else if (dMatch2 && dMatch2[1]) {
        driverName = dMatch2[1];
      }
    }

    // Regex parse Customer Name from message if missing
    if (!customerName) {
      const cMatch1 = msg.match(/(?:Customer|User)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      const cMatch2 = msg.match(/Placed by ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      if (cMatch1 && cMatch1[1] && !['Accepted', 'Assigned'].includes(cMatch1[1])) {
        customerName = cMatch1[1];
      } else if (cMatch2 && cMatch2[1]) {
        customerName = cMatch2[1];
      }
    }

    // Fallbacks based on target audience
    const aud = notif.audience || notif.targetAudience || 'All Users';
    if (!driverName && (aud === 'Drivers' || aud === 'Driver')) {
      driverName = 'All Drivers';
    }
    if (!customerName && (aud === 'Customers' || aud === 'Customer')) {
      customerName = 'All Customers';
    }

    return {
      driverName: driverName || 'N/A',
      customerName: customerName || 'N/A'
    };
  };

  // Enhance notifications list with resolved metadata
  const enhancedNotifications = useMemo(() => {
    return notifications.map(n => {
      const meta = resolveNotificationMeta(n);
      return {
        ...n,
        resolvedDriver: meta.driverName,
        resolvedCustomer: meta.customerName
      };
    });
  }, [notifications, orders]);

  // Calculate duplicate count
  const duplicateCount = useMemo(() => {
    const seen = new Set();
    let dupes = 0;
    enhancedNotifications.forEach(n => {
      const key = `${(n.title || '').trim().toLowerCase()}|${(n.message || '').trim().toLowerCase()}`;
      if (seen.has(key)) {
        dupes++;
      } else {
        seen.add(key);
      }
    });
    return dupes;
  }, [enhancedNotifications]);

  // Processed notifications with deduplication and search filtering applied
  const displayedNotifications = useMemo(() => {
    let result = enhancedNotifications;

    // Apply audience filter
    if (filterAudience !== 'All') {
      result = result.filter(n => (n.audience || '').toLowerCase().includes(filterAudience.toLowerCase()));
    }

    // Apply deduplication if enabled
    if (hideDuplicates) {
      const seenKeys = new Set();
      result = result.filter(n => {
        const key = `${(n.title || '').trim().toLowerCase()}|${(n.message || '').trim().toLowerCase()}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(n =>
        (n.id && String(n.id).toLowerCase().includes(q)) ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (n.resolvedDriver && n.resolvedDriver.toLowerCase().includes(q)) ||
        (n.resolvedCustomer && n.resolvedCustomer.toLowerCase().includes(q)) ||
        (n.date && n.date.toLowerCase().includes(q))
      );
    }

    return result;
  }, [enhancedNotifications, filterAudience, hideDuplicates, searchTerm]);

  return (
    <div className="animate-fade">
      <div className="dashboard-row-equal">
        {/* Creator panel */}
        <div className="dashboard-card" style={{ height: 'auto' }}>
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Compose Push Broadcast</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Alert Title</label>
              <input
                type="text"
                placeholder="e.g. Traffic Congestion Alert"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea
                rows="4"
                placeholder="Type your message to the audience..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Audience</label>
                <select
                  className="custom-select"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option>All Users</option>
                  <option>Drivers</option>
                  <option>Customers</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target City</label>
                <select
                  className="custom-select"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                >
                  <option>All</option>
                  <option>Hyderabad</option>
                  <option>Vijayawada</option>
                  <option>Guntur</option>
                  <option>Warangal</option>
                </select>
              </div>
            </div>

            {success && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#10B981', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Broadcast transmitted successfully!
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Send size={14} /> Send Broadcast
            </button>
          </form>
        </div>

        {/* Live preview in smartphone frame */}
        <div className="dashboard-card" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="dashboard-card-header" style={{ width: '100%' }}>
            <h3 className="dashboard-card-title">Live Device Preview</h3>
          </div>

          {/* Mock smartphone */}
          <div style={{ width: '240px', height: '420px', borderRadius: '32px', border: '8px solid #1E293B', backgroundColor: '#0F172A', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            {/* Phone notch */}
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '18px', backgroundColor: '#1E293B', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', zIndex: '20' }}></div>

            {/* Background image mockup */}
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)', position: 'relative', padding: '36px 14px 14px 14px' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginBottom: '16px' }}>System Alert</div>

              {/* Notification card preview */}
              <div style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', animation: title ? 'slideUp 0.3s ease-out' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '9px', fontWeight: '800' }}>P</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#1E293B' }}>PORTER ADMIN</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#64748B' }}>now</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A' }}>{title || 'Sample Alert Title'}</div>
                <div style={{ fontSize: '10px', color: '#334155', marginTop: '3px', lineHeight: '1.3' }}>{message || 'Type message in the composer to preview push notification rendering...'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History log table */}
      <div className="table-container" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} style={{ color: 'var(--primary)' }} /> System Notifications & Broadcast Logs
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing {displayedNotifications.length} of {notifications.length} notifications {hideDuplicates && duplicateCount > 0 && `(${duplicateCount} duplicates hidden)`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Hide Duplicates Toggle */}
              <button
                className="btn"
                onClick={() => setHideDuplicates(!hideDuplicates)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  height: '34px',
                  backgroundColor: hideDuplicates ? 'rgba(59, 130, 246, 0.15)' : (darkMode ? '#1E293B' : '#F1F5F9'),
                  color: hideDuplicates ? '#3B82F6' : 'var(--text-main)',
                  border: hideDuplicates ? '1px solid #3B82F6' : '1px solid var(--border-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                title={hideDuplicates ? 'Showing unique notifications only' : 'Click to hide duplicate notifications'}
              >
                <Layers size={14} />
                {hideDuplicates ? 'Duplicates Hidden' : 'Show All'}
                {duplicateCount > 0 && (
                  <span style={{ backgroundColor: hideDuplicates ? '#3B82F6' : '#64748B', color: 'white', fontSize: '10px', borderRadius: '10px', padding: '1px 6px' }}>
                    {duplicateCount}
                  </span>
                )}
              </button>

              {/* Permanently Purge Duplicates Button */}
              {duplicateCount > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={removeDuplicateNotifications}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    height: '34px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#EF4444',
                    borderColor: 'rgba(239, 68, 68, 0.3)'
                  }}
                  title="Remove all duplicate notification entries permanently"
                >
                  <Sparkles size={14} /> Remove Duplicates
                </button>
              )}

              {/* Mark All Read Button */}
              {notifications.some(n => !n.read) && (
                <button
                  className="btn btn-secondary"
                  onClick={markAllNotificationsAsRead}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    height: '34px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={14} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Search & Audience Filter Controls Bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by Title, Message, Driver Name, or Customer Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px'
                }}
              />
              {searchTerm && (
                <X
                  size={14}
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Audience:</span>
              <select
                className="custom-select"
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                style={{ height: '36px', width: '130px', fontSize: '12px' }}
              >
                <option value="All">All Audiences</option>
                <option value="Driver">Drivers</option>
                <option value="Customer">Customers</option>
              </select>
            </div>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Broadcast ID</th>
              <th>Date / Time</th>
              <th>Alert Title</th>
              <th>Message summary</th>
              <th>Driver Name</th>
              <th>Customer Name</th>
              <th>Audience</th>
              <th>City Target</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedNotifications.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  No notifications match your filter criteria.
                </td>
              </tr>
            ) : (
              displayedNotifications.map(notif => (
                <tr key={notif.id} style={!notif.read ? { backgroundColor: darkMode ? 'rgba(30, 93, 255, 0.05)' : 'rgba(30, 93, 255, 0.03)' } : undefined}>
                  <td style={{ fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!notif.read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            display: 'inline-block',
                            flexShrink: 0
                          }}
                          title="Unread Notification"
                        />
                      )}
                      {notif.id}
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{notif.date}</td>
                  <td style={{ fontWeight: !notif.read ? '700' : '600' }}>{notif.title}</td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={notif.message}>
                    {notif.message}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: notif.resolvedDriver !== 'N/A' ? (darkMode ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF') : (darkMode ? '#1E293B' : '#F1F5F9'), color: notif.resolvedDriver !== 'N/A' ? '#3B82F6' : (darkMode ? '#94A3B8' : '#64748B'), display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <User size={11} /> {notif.resolvedDriver}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: notif.resolvedCustomer !== 'N/A' ? (darkMode ? 'rgba(217, 70, 239, 0.15)' : '#FDF4FF') : (darkMode ? '#1E293B' : '#F1F5F9'), color: notif.resolvedCustomer !== 'N/A' ? '#D946EF' : (darkMode ? '#94A3B8' : '#64748B'), display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <UserCheck size={11} /> {notif.resolvedCustomer}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: darkMode ? '#1E293B' : '#F1F5F9', color: darkMode ? '#94A3B8' : '#334155' }}>
                      <Users size={10} style={{ marginRight: '4px' }} /> {notif.audience || 'All Users'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: darkMode ? '#1E293B' : '#F1F5F9', color: darkMode ? '#94A3B8' : '#334155' }}>
                      <MapPin size={10} style={{ marginRight: '4px' }} /> {notif.target || 'All'}
                    </span>
                  </td>
                  <td>
                    <div className="action-row" style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="action-btn btn-view"
                        title="View Notification Details"
                        onClick={() => {
                          setSelectedNotification(notif);
                          markNotificationAsRead(notif.id);
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="action-btn"
                        title="Delete Notification"
                        style={{ color: '#EF4444', backgroundColor: darkMode ? 'rgba(239,68,68,0.1)' : '#FEE2E2', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        onClick={() => deleteNotification(notif.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="modal-backdrop" onClick={() => setSelectedNotification(null)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Broadcast Details - {selectedNotification.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedNotification(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metadata Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Date & Time</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', display: 'block', color: 'var(--text-main)' }}>{selectedNotification.date}</span>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Driver Name</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', display: 'block', color: '#3B82F6' }}>
                    {selectedNotification.resolvedDriver}
                  </span>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Customer Name</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', display: 'block', color: '#D946EF' }}>
                    {selectedNotification.resolvedCustomer}
                  </span>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Target Filters</span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ backgroundColor: darkMode ? '#1E293B' : '#F1F5F9', color: darkMode ? '#94A3B8' : '#334155', fontSize: '9px' }}>
                      <Users size={9} style={{ marginRight: '2px' }} /> {selectedNotification.audience || 'All'}
                    </span>
                    <span className="badge" style={{ backgroundColor: darkMode ? '#1E293B' : '#F1F5F9', color: darkMode ? '#94A3B8' : '#334155', fontSize: '9px' }}>
                      <MapPin size={9} style={{ marginRight: '2px' }} /> {selectedNotification.target || 'All'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Alert Title</span>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{selectedNotification.title}</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Message Content</span>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)',
                  borderLeft: '4px solid var(--primary)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'var(--text-main)'
                }}>
                  {selectedNotification.message}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', alignSelf: 'flex-start' }}>Lockscreen Preview</span>

                {/* Mock smartphone */}
                <div style={{ width: '220px', height: '220px', borderRadius: '24px', border: '6px solid #1E293B', backgroundColor: '#0F172A', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
                  {/* Phone notch */}
                  <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '14px', backgroundColor: '#1E293B', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', zIndex: '20' }}></div>

                  {/* Background image mockup */}
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)', position: 'relative', padding: '24px 10px 10px 10px' }}>

                    {/* Notification card preview */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '7px', fontWeight: '800' }}>P</span>
                          <span style={{ fontSize: '8px', fontWeight: '700', color: '#1E293B' }}>PORTER ADMIN</span>
                        </div>
                        <span style={{ fontSize: '7px', color: '#64748B' }}>now</span>
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: '700', color: '#0F172A' }}>{selectedNotification.title}</div>
                      <div style={{ fontSize: '8px', color: '#334155', marginTop: '2px', lineHeight: '1.2' }}>{selectedNotification.message}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn"
                style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px' }}
                onClick={() => {
                  deleteNotification(selectedNotification.id);
                  setSelectedNotification(null);
                }}
              >
                <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete Notification
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedNotification(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}