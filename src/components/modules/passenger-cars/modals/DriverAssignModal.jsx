import React, { useState, useContext } from 'react';
import {
  X, Truck, Car, Star, CheckCircle2, Search,
  Navigation, AlertCircle
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function DriverAssignModal({ booking, onClose }) {
  const { drivers, assignDriverToBooking } = useContext(PassengerCarContext);
  const [filterCategoryOnly, setFilterCategoryOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (!booking) return null;

  // Filter drivers
  const eligibleDrivers = drivers.filter(d => {
    if (filterCategoryOnly && d.vehicleCategory !== booking.vehicleCategoryId) {
      return false;
    }
    const q = searchQuery.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.vehicleModel || '').toLowerCase().includes(q) ||
      (d.vehiclePlate || '').toLowerCase().includes(q) ||
      (d.currentLocation || '').toLowerCase().includes(q)
    );
  });

  const handleAssign = (driverId) => {
    const res = assignDriverToBooking(booking.id, driverId);
    if (res.success) {
      onClose();
    }
  };

  const handleAutoAssign = () => {
    const bestMatch = eligibleDrivers.find(d => d.status === 'available') || drivers.find(d => d.status === 'available') || drivers[0];
    if (bestMatch) {
      handleAssign(bestMatch.id);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
              Dispatch Console
            </span>
            <h3 className="modal-title" style={{ margin: 0 }}>
              Assign Driver to Booking {booking.id}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Trip Brief Banner */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700' }}>
                Required: {booking.vehicleName} ({booking.passengerCount} Pax)
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                📍 {booking.pickup}
              </div>
            </div>
            <button
              onClick={handleAutoAssign}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              ⚡ Smart Auto-Assign
            </button>
          </div>

          {/* Controls: Search & Category Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search className="header-search-icon" size={14} />
              <input
                type="text"
                placeholder="Search drivers by name, model, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <label style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={filterCategoryOnly}
                onChange={(e) => setFilterCategoryOnly(e.target.checked)}
              />
              Only {booking.vehicleName}s
            </label>
          </div>

          {/* Drivers List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {eligibleDrivers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No eligible drivers found. Try unchecking the vehicle category filter.
              </div>
            ) : (
              eligibleDrivers.map(d => {
                const isAvailable = d.status === 'available';
                return (
                  <div
                    key={d.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{d.name}</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          backgroundColor: isAvailable ? '#D1FAE5' : '#E2E8F0',
                          color: isAvailable ? '#047857' : '#475569',
                          fontWeight: '700'
                        }}>
                          {d.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {d.vehicleModel} • <strong style={{ color: 'var(--text-main)' }}>{d.vehiclePlate}</strong>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {d.currentLocation} ({d.distanceKm} KM away)
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <div style={{ color: '#F59E0B', fontWeight: '800', fontSize: '13.5px' }}>
                        ★ {d.rating} ({d.totalTrips} trips)
                      </div>
                      <button
                        onClick={() => handleAssign(d.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '11.5px', padding: '5px 12px' }}
                      >
                        Assign Driver
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
