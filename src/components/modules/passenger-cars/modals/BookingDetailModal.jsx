import React, { useContext } from 'react';
import {
  X, Car, User, Phone, MapPin, DollarSign,
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, Calendar
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function BookingDetailModal({ booking, onClose, onAssignDriver }) {
  const { formatRupee, advanceBookingStatus } = useContext(PassengerCarContext);

  if (!booking) return null;

  const snap = booking.pricingSnapshot || {};

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
              Passenger Booking Detail
            </span>
            <h3 className="modal-title" style={{ margin: 0 }}>
              {booking.id}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Status Banner */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '700' }}>TRIP STATUS</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E40AF' }}>{booking.status}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '700' }}>PRICING VERSION</div>
              <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '800', color: '#1E40AF' }}>
                {snap.pricingVersion || 'PV-2026-09-07-01'}
              </div>
            </div>
          </div>

          {/* Customer & Driver Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                Passenger Details
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>{booking.customer?.name}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{booking.customer?.phone}</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                👤 <strong>{booking.passengerCount}</strong> Passengers Booked
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                Assigned Driver & Car
              </div>
              {booking.driver ? (
                <>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{booking.driver.name}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {booking.driver.vehicleModel} ({booking.driver.vehiclePlate})
                  </div>
                  <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: '700', marginTop: '4px' }}>
                    ★ {booking.driver.rating} • {booking.driver.phone}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#F59E0B', fontWeight: '600' }}>No Driver Assigned</span>
                  <button
                    onClick={() => {
                      onClose();
                      onAssignDriver(booking);
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '11.5px', padding: '5px 10px', width: 'fit-content' }}
                  >
                    Assign Driver Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Route Info */}
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              Route & Distance Specifications
            </div>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>
              <strong>Pickup:</strong> {booking.pickup}
            </div>
            {booking.stops && booking.stops.length > 0 && (
              <div style={{ fontSize: '12px', color: '#6D28D9', margin: '4px 0 6px 14px' }}>
                ↳ Intermediate Stops: {booking.stops.join(' → ')}
              </div>
            )}
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <strong>Drop:</strong> {booking.drop}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
              <span>Distance: <strong>{booking.distanceKm} KM</strong></span>
              <span>Duration: <strong>{booking.durationMinutes} mins</strong></span>
              <span>Service: <strong>{booking.serviceName}</strong></span>
            </div>
          </div>

          {/* Immutable Fare Snapshot Breakdown (Section 23) */}
          <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Immutable Fare Snapshot Breakdown
              </div>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>
                Snapshot Locked
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Fare:</span>
                <span>{formatRupee(snap.baseFare)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Distance Fare:</span>
                <span>{formatRupee(snap.distanceFare)}</span>
              </div>
              {snap.driverAllowance > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Driver Daily Allowance:</span>
                  <span>{formatRupee(snap.driverAllowance)}</span>
                </div>
              )}
              {snap.toll > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Toll Booth Charges:</span>
                  <span>{formatRupee(snap.toll)}</span>
                </div>
              )}
              {snap.parking > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Parking Fee:</span>
                  <span>{formatRupee(snap.parking)}</span>
                </div>
              )}
              {snap.nightCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Night Charges:</span>
                  <span>{formatRupee(snap.nightCharge)}</span>
                </div>
              )}
              {snap.surgeCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                  <span>Surge Surcharge:</span>
                  <span>+{formatRupee(snap.surgeCharge)}</span>
                </div>
              )}
              {snap.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                  <span>Coupon Discount ({snap.couponCode}):</span>
                  <span>-{formatRupee(snap.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Tax (GST):</span>
                <span>{formatRupee(snap.tax)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                marginTop: '4px',
                borderTop: '2px solid var(--border-color)',
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--primary)'
              }}>
                <span>Total Customer Paid:</span>
                <span>{formatRupee(snap.totalFare)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Driver Payout: <strong>{formatRupee(snap.driverEarnings)}</strong></span>
                <span>Platform Margin: <strong>{formatRupee(snap.companyCommission)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
