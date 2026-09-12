import React, { useState, useContext } from 'react';
import {
  Layers, Plus, Check, X, Edit, Copy, Trash2, Sliders,
  Navigation, Repeat, Clock, Plane, Map, AlertCircle, Info
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCServicesConfig({ setActiveTab }) {
  const { services, toggleService, bookings } = useContext(PassengerCarContext);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Repeat': return <Repeat size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Plane': return <Plane size={20} />;
      case 'Map': return <Map size={20} />;
      default: return <Navigation size={20} />;
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Passenger Services Management</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Configure active transportation modes, pricing formulas, stops, and scalability parameters
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('pricing')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sliders size={16} />
            Configure Pricing Engine
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {filteredServices.map(service => {
          const serviceBookings = bookings.filter(b => b.serviceType === service.id);
          const isEnabled = service.enabled;

          return (
            <div
              key={service.id}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${isEnabled ? '#1E5DFF' : '#94A3B8'}`,
                opacity: isEnabled ? 1 : 0.75,
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: isEnabled ? 'var(--primary-light)' : '#E2E8F0',
                      color: isEnabled ? 'var(--primary)' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getIconComponent(service.icon)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{service.name}</h4>
                      <span style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        color: 'var(--text-muted)'
                      }}>
                        {service.code}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => toggleService(service.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isEnabled ? '#D1FAE5' : '#FEE2E2',
                        color: isEnabled ? '#047857' : '#B91C1C'
                      }}
                      title="Toggle Service Status"
                    >
                      {isEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px' }}>
                  {service.shortDesc}
                </p>

                {/* Formula Box */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                    Pricing Engine Formula
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#1E40AF', fontWeight: '600' }}>
                    {service.pricingFormula}
                  </div>
                </div>

                {/* Capabilities Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: service.supportsStops ? '#EDE9FE' : '#F1F5F9',
                    color: service.supportsStops ? '#6D28D9' : '#64748B',
                    fontWeight: '600'
                  }}>
                    {service.supportsStops ? '✓ Multi-Stop Support' : '✗ Single Point Only'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: service.supportsRoundTrip ? '#DBEAFE' : '#F1F5F9',
                    color: service.supportsRoundTrip ? '#1D4ED8' : '#64748B',
                    fontWeight: '600'
                  }}>
                    {service.supportsRoundTrip ? '✓ Round Trip Matrix' : '✗ One-Way Flow'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    fontWeight: '600'
                  }}>
                    Category: {service.category}
                  </span>
                </div>
              </div>

              {/* Bottom Card Actions & Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Total Bookings: <strong>{serviceBookings.length}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="action-btn"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    title="Test in Pricing Preview"
                  >
                    Test Pricing
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="action-btn"
                    style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--primary)' }}
                    title="Edit Rate Cards"
                  >
                    Edit Rates
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card: Scalability Architecture */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start'
      }}>
        <Info size={22} color="#1E5DFF" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1E40AF', margin: 0 }}>
            Unified Scalable Transportation Architecture
          </h4>
          <p style={{ fontSize: '12.5px', color: '#1E3A8A', margin: '4px 0 0', lineHeight: '1.5' }}>
            The system uses an extensible formula abstraction. Future modes such as <strong>Bike Taxi</strong>, <strong>Auto</strong>, <strong>Tempo Traveller</strong>, <strong>Outstation</strong>, or <strong>Corporate Pooling</strong> plug directly into the same Dynamic Pricing Engine without altering core database schemas or booking logic.
          </p>
        </div>
      </div>
    </div>
  );
}
