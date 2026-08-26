import React, { useState, useContext } from 'react';
import { X, MapPin, Truck, Users, Calendar, Clock, Package, DollarSign, CheckCircle2, AlertTriangle, Phone, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function BookingDetailModal({ booking, onClose, onAssignTeam, onOpenQuote }) {
  const { updateBookingStatus } = useContext(PackersMoversContext);
  const [selectedStatus, setSelectedStatus] = useState(booking?.status || 'CONFIRMED');

  if (!booking) return null;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    updateBookingStatus(booking.id, newStatus);
  };

  const getStatusBadge = (status) => {
    const map = {
      'QUOTE_PENDING': { bg: '#FEF3C7', color: '#B45309', label: 'Quote Pending' },
      'AWAITING_PAYMENT': { bg: '#E0E7FF', color: '#4338CA', label: 'Awaiting Payment' },
      'CONFIRMED': { bg: '#DCFCE7', color: '#15803D', label: 'Confirmed' },
      'TEAM_ASSIGNED': { bg: '#E0F2FE', color: '#0369A1', label: 'Team Assigned' },
      'PACKING': { bg: '#F3E8FF', color: '#7E22CE', label: 'Packing in Progress' },
      'LOADING': { bg: '#FEF9C3', color: '#A16207', label: 'Loading Truck' },
      'TRANSIT': { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Transit' },
      'DELIVERED': { bg: '#D1FAE5', color: '#065F46', label: 'Delivered & Completed' },
      'CANCELLED': { bg: '#FEE2E2', color: '#B91C1C', label: 'Cancelled' },
      'REFUNDED': { bg: '#F1F5F9', color: '#475569', label: 'Refunded' }
    };
    const s = map[status] || { bg: '#F1F5F9', color: '#475569', label: status };
    return (
      <span style={{ backgroundColor: s.bg, color: s.color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 className="modal-title" style={{ margin: 0 }}>Booking #{booking.bookingId}</h3>
            {getStatusBadge(booking.status)}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Action Ribbon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Update Move Stage:</span>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'var(--card-bg)' }}
              >
                <option value="QUOTE_PENDING">Quote Pending</option>
                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="TEAM_ASSIGNED">Team Assigned</option>
                <option value="PACKING">Packing Started</option>
                <option value="LOADING">Loading Started</option>
                <option value="TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered & Verified</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {booking.status === 'QUOTE_PENDING' && (
                <button className="btn btn-primary" onClick={() => onOpenQuote(booking)} style={{ fontSize: '12px', padding: '6px 14px' }}>
                  Review & Revise Quote
                </button>
              )}
              {['CONFIRMED', 'AWAITING_PAYMENT', 'QUOTE_PENDING'].includes(booking.status) && (
                <button className="btn btn-secondary" onClick={() => onAssignTeam(booking)} style={{ fontSize: '12px', padding: '6px 14px' }}>
                  <Users size={14} style={{ marginRight: '6px' }} />
                  {booking.team ? 'Re-assign Team' : 'Assign Crew & Truck'}
                </button>
              )}
            </div>
          </div>

          {/* Grid of Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Customer Details */}
            <div className="card" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} /> Customer Information
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{booking.customer?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <Phone size={14} /> {booking.customer?.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <Mail size={14} /> {booking.customer?.email || 'N/A'}
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                Service Type: {booking.serviceTypeName}
              </div>
            </div>

            {/* Schedule & Timing */}
            <div className="card" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Relocation Schedule
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{booking.moveDate}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <Clock size={14} /> Slot: {booking.timeSlot}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                  Packing: {booking.packingType}
                </span>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Pickup */}
            <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> ORIGIN / PICKUP LOCATION
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{booking.pickup?.address}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>Floor: {booking.pickup?.floor}</span>
                <span>Lift: {booking.pickup?.hasLift ? '✅ Available' : '❌ No Lift (Stairs)'}</span>
                <span>Parking: {booking.pickup?.parkingDistanceM}m</span>
              </div>
            </div>

            {/* Drop */}
            <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#3B82F6', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> DESTINATION / DROP LOCATION
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{booking.drop?.address}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>Floor: {booking.drop?.floor}</span>
                <span>Lift: {booking.drop?.hasLift ? '✅ Available' : '❌ No Lift (Stairs)'}</span>
                <span>Parking: {booking.drop?.parkingDistanceM}m</span>
              </div>
            </div>
          </div>

          {/* Assigned Crew & Vehicle */}
          <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="var(--primary)" /> Assigned Moving Unit & Truck
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Team:</span>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{booking.team?.name || '⚠️ No Crew Assigned Yet'}</div>
                {booking.team && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead: {booking.team.leaderName} ({booking.team.phone}) • {booking.labour?.workers} Workers</div>}
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Truck Fleet:</span>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{booking.vehicle?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vehicle No: <strong>{booking.vehicle?.number || 'Unassigned'}</strong> {booking.driver?.name && `• Driver: ${booking.driver.name} (${booking.driver.phone})`}</div>
              </div>
            </div>
          </div>

          {/* Items Inventory */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={16} color="var(--primary)" /> Declared Items Inventory ({booking.itemsCount || booking.itemsList?.length} items)</span>
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <table className="custom-table" style={{ margin: 0, fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Packing</th>
                    <th>Dismantling</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.itemsList?.map((itm, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{itm.name}</td>
                      <td>{itm.qty}</td>
                      <td>{itm.packing ? '✅ Included' : '❌ None'}</td>
                      <td>{itm.dismantling ? '🛠️ Required' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} color="var(--primary)" /> Commercials & Payment Accounting
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Base & Distance</div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>₹{(booking.pricing?.baseFare || 0) + (booking.pricing?.distanceFare || 0)}</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Packing & Labour</div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>₹{(booking.pricing?.packingCharge || 0) + (booking.pricing?.labourCharge || 0)}</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GST & Handling</div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>₹{(booking.pricing?.gst || 0) + (booking.pricing?.floorHandling || 0) + (booking.pricing?.dismantlingCharge || 0)}</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#ECFDF5', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '11px', color: '#065F46', fontWeight: '600' }}>Total Amount</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#065F46', marginTop: '2px' }}>₹{booking.pricing?.totalAmount}</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Move Progress Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {booking.timeline?.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: t.done ? '#10B981' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px' }}>
                    {t.done ? '✓' : '•'}
                  </div>
                  <span style={{ fontWeight: t.done ? '600' : '400', flex: 1, color: t.done ? 'var(--text-color)' : 'var(--text-muted)' }}>{t.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
