import React, { useContext } from 'react';
import {
  Car, TrendingUp, DollarSign, Users, Clock, ShieldCheck,
  AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight, Navigation,
  Repeat, Calendar, Award
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCOverview({ setActiveTab }) {
  const { bookings, pricingConfig, drivers, formatRupee } = useContext(PassengerCarContext);

  // Computed metrics
  const totalBookings = bookings.length;
  const completedTrips = bookings.filter(b => b.status === 'TRIP_COMPLETED');
  const ongoingTrips = bookings.filter(b => ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'TRIP_STARTED'].includes(b.status));
  const pendingDispatch = bookings.filter(b => ['REQUESTED', 'DRIVER_SEARCHING'].includes(b.status));
  const cancelledTrips = bookings.filter(b => b.status.startsWith('CANCELLED'));

  const totalRevenue = completedTrips.reduce((acc, b) => acc + (b.pricingSnapshot?.totalFare || 0), 0);
  const companyCommission = completedTrips.reduce((acc, b) => acc + (b.pricingSnapshot?.companyCommission || 0), 0);
  const driverEarnings = completedTrips.reduce((acc, b) => acc + (b.pricingSnapshot?.driverEarnings || 0), 0);
  const avgFare = completedTrips.length > 0 ? totalRevenue / completedTrips.length : 0;
  const cancellationRate = totalBookings > 0 ? ((cancelledTrips.length / totalBookings) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #1E5DFF 0%, #0A4BE2 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(30, 93, 255, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              LIVE PASSENGER HUB
            </span>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>
              Active Pricing Engine Version: <strong>{pricingConfig.versionId}</strong>
            </span>
          </div>
          <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: '700', margin: 0 }}>
            Passenger Car Services & Dynamic Pricing Engine
          </h2>
          <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '13.5px', maxWidth: '650px' }}>
            Centralized transportation management for City Cabs, Round Trips, Hourly Rentals & Airport Transfers.
            All fares calculated via minor-unit precision with immutable historical pricing versioning.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              background: '#FFFFFF',
              color: '#1E5DFF',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Car size={18} />
            Test Booking Simulator
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={18} />
            Pricing Preview Tool
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Bookings */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #1E5DFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Bookings
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
                {totalBookings}
              </div>
            </div>
            <div style={{ background: '#EFF6FF', color: '#1E5DFF', padding: '10px', borderRadius: '10px' }}>
              <Car size={22} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> {ongoingTrips.length} Active / Ongoing Rides
          </div>
        </div>

        {/* Total Completed Revenue */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Customer Gross Paid
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#10B981' }}>
                {formatRupee(totalRevenue)}
              </div>
            </div>
            <div style={{ background: '#ECFDF5', color: '#10B981', padding: '10px', borderRadius: '10px' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Avg. Ticket Value: <strong>{formatRupee(avgFare)}</strong>
          </div>
        </div>

        {/* Company Commission */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Company Margin (20%)
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#8B5CF6' }}>
                {formatRupee(companyCommission)}
              </div>
            </div>
            <div style={{ background: '#F5F3FF', color: '#8B5CF6', padding: '10px', borderRadius: '10px' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Net Platform Take-Rate
          </div>
        </div>

        {/* Driver Earnings */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Driver Payouts (80%)
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#F59E0B' }}>
                {formatRupee(driverEarnings)}
              </div>
            </div>
            <div style={{ background: '#FEF3C7', color: '#F59E0B', padding: '10px', borderRadius: '10px' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Disbursed to Car Partners
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Needs Dispatch
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: pendingDispatch.length > 0 ? '#EF4444' : 'var(--text-main)' }}>
                {pendingDispatch.length}
              </div>
            </div>
            <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '10px', borderRadius: '10px' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Cancellation Rate: <strong>{cancellationRate}%</strong>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Dispatch Queue & Fleet Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Recent / Active Bookings Queue */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Recent Passenger Bookings</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Live dispatch queue with state machine progression
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                fontSize: '13px',
                color: 'var(--primary)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All Bookings <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.slice(0, 5).map(booking => {
              const statusColor = {
                REQUESTED: { bg: '#FEF3C7', color: '#D97706', label: 'Requested' },
                DRIVER_SEARCHING: { bg: '#FEF3C7', color: '#B45309', label: 'Searching Driver' },
                DRIVER_ASSIGNED: { bg: '#EDE9FE', color: '#6D28D9', label: 'Driver Assigned' },
                DRIVER_ARRIVED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Driver Arrived' },
                TRIP_STARTED: { bg: '#E0F2FE', color: '#0369A1', label: 'In Progress' },
                TRIP_COMPLETED: { bg: '#D1FAE5', color: '#047857', label: 'Completed' },
                CANCELLED_BY_CUSTOMER: { bg: '#FEE2E2', color: '#B91C1C', label: 'Cancelled (Customer)' },
                CANCELLED_BY_ADMIN: { bg: '#FEE2E2', color: '#B91C1C', label: 'Cancelled (Admin)' }
              }[booking.status] || { bg: '#E2E8F0', color: '#475569', label: booking.status };

              return (
                <div
                  key={booking.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      <Car size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{booking.id}</span>
                        <span style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.color,
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {statusColor.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {booking.customer.name} • {booking.vehicleName} • {booking.serviceName}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>
                      {formatRupee(booking.pricingSnapshot?.totalFare)}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {booking.distanceKm} KM • {booking.payment.method}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Fleet Status & Surge Mode Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Surge Pricing Status Widget */}
          <div className="card" style={{ padding: '22px' }}>
            {(() => {
              const surgeRules = pricingConfig?.surgeRules || {};
              const currentMultiplier = surgeRules.currentMultiplier ?? surgeRules.multipliers?.[surgeRules.activeMode] ?? 1.0;
              const activeModeKey = surgeRules.activeMode || 'normal';
              const activeModeObj = surgeRules.modes?.[activeModeKey];
              const activeModeLabel = activeModeObj?.label || (activeModeKey ? activeModeKey.charAt(0).toUpperCase() + activeModeKey.slice(1).replace('_', ' ') : 'Normal');
              const activeModeDesc = activeModeObj?.description || 'Standard fare rates with no surge multiplier applied.';

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={18} color="#F59E0B" />
                      <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Surge Engine Status</h4>
                    </div>
                    <span style={{
                      backgroundColor: currentMultiplier > 1.0 ? '#FEF3C7' : '#D1FAE5',
                      color: currentMultiplier > 1.0 ? '#B45309' : '#065F46',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {currentMultiplier}x MULTIPLIER
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                    Active Demand Profile: <strong>{activeModeLabel}</strong>
                  </p>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-main)',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }}>
                    {activeModeDesc}
                  </div>
                </>
              );
            })()}
            <button
              onClick={() => setActiveTab('pricing')}
              style={{
                marginTop: '14px',
                width: '100%',
                padding: '9px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '12.5px',
                fontWeight: '600',
                color: 'var(--text-main)',
                backgroundColor: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              Configure Surge Settings
            </button>
          </div>

          {/* Available Drivers Fleet Card */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Car Fleet Live Status</h4>
              <button
                onClick={() => setActiveTab('categories')}
                style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: '600' }}
              >
                Manage Fleet
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {drivers.slice(0, 4).map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{d.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{d.vehicleModel} • {d.vehiclePlate}</div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: d.status === 'available' ? '#D1FAE5' : d.status === 'on_trip' ? '#DBEAFE' : '#E2E8F0',
                    color: d.status === 'available' ? '#047857' : d.status === 'on_trip' ? '#1D4ED8' : '#475569'
                  }}>
                    {d.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
