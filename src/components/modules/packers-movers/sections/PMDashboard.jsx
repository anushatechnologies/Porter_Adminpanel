import React, { useState, useContext } from 'react';
import {
  Package, ShoppingBag, Clock, CheckCircle, Truck, DollarSign,
  AlertCircle, Users, Car, MessageSquare, Calendar, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { PackersMoversContext } from '../PackersMoversContext';

export default function PMDashboard({ setActiveSubTab, onOpenBooking }) {
  const { bookings, teams, vehicles, complaints, coupons } = useContext(PackersMoversContext);
  const [dateFilter, setDateFilter] = useState('ALL');

  // Compute Metrics
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => b.moveDate === '2026-08-26' || b.moveDate === '2026-08-27').length;
  const pendingQuotes = bookings.filter(b => b.status === 'QUOTE_PENDING').length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const activeMoves = bookings.filter(b => ['TEAM_ASSIGNED', 'PACKING', 'LOADING', 'TRANSIT'].includes(b.status)).length;
  const completedMoves = bookings.filter(b => b.status === 'DELIVERED').length;
  const cancelledMoves = bookings.filter(b => b.status === 'CANCELLED').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
  const pendingPayments = bookings.reduce((sum, b) => sum + (b.pricing?.pendingAmount || 0), 0);
  const activeTeamsCount = teams.filter(t => !t.isAvailable).length;
  const availableTeamsCount = teams.filter(t => t.isAvailable).length;
  const availableVehiclesCount = vehicles.filter(v => v.isActive).length;
  const openComplaintsCount = complaints.filter(c => c.status === 'OPEN').length;

  const kpis = [
    { title: 'Total Bookings', val: totalBookings, icon: ShoppingBag, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', tab: 'bookings' },
    { title: "Today's Moves", val: todayBookings, icon: Calendar, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', tab: 'bookings' },
    { title: 'Pending Quotes', val: pendingQuotes, icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', tab: 'quotes', alert: pendingQuotes > 0 },
    { title: 'Confirmed Moves', val: confirmedBookings, icon: CheckCircle, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', tab: 'bookings' },
    { title: 'Active in Transit', val: activeMoves, icon: Truck, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)', tab: 'live_ops' },
    { title: 'Completed Moves', val: completedMoves, icon: CheckCircle, color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', tab: 'bookings' },
    { title: 'Cancelled Moves', val: cancelledMoves, icon: AlertCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', tab: 'cancellations' },
    { title: 'Total Gross Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', tab: 'payments' },
    { title: 'Pending Payments', val: `₹${pendingPayments.toLocaleString()}`, icon: DollarSign, color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', tab: 'payments' },
    { title: 'Active Moving Teams', val: `${activeTeamsCount} / ${teams.length}`, icon: Users, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)', tab: 'teams' },
    { title: 'Fleet Trucks Ready', val: availableVehiclesCount, icon: Car, color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.1)', tab: 'vehicles' },
    { title: 'Open Complaints', val: openComplaintsCount, icon: MessageSquare, color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)', tab: 'complaints', alert: openComplaintsCount > 0 }
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Date Filter & Status Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={22} color="var(--primary)" /> Packers & Movers Executive Dashboard
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time operations, booking pipelines, fleet deployment, and financial telemetry.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['ALL', 'TODAY', 'THIS_WEEK', 'THIS_MONTH'].map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid var(--border-color)',
                backgroundColor: dateFilter === f ? 'var(--primary)' : 'var(--bg-main)',
                color: dateFilter === f ? '#FFF' : 'var(--text-color)',
                cursor: 'pointer'
              }}
            >
              {f === 'ALL' ? 'All Time' : f === 'TODAY' ? 'Today' : f === 'THIS_WEEK' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="card"
              onClick={() => kpi.tab && setActiveSubTab(kpi.tab)}
              style={{
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                border: kpi.alert ? '1px solid #FCA5A5' : '1px solid var(--border-color)',
                backgroundColor: kpi.alert ? '#FFF5F5' : 'var(--card-bg)'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{kpi.title}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '6px', color: kpi.color }}>{kpi.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  View details <ArrowUpRight size={12} />
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={kpi.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Operations & Quick Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Active Moves Pipeline */}
        <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--primary)" /> Live & Upcoming Relocations
            </h4>
            <button className="btn btn-secondary" onClick={() => setActiveSubTab('bookings')} style={{ fontSize: '12px', padding: '4px 10px' }}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bookings.slice(0, 4).map(b => (
              <div
                key={b.id}
                onClick={() => onOpenBooking(b)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>#{b.bookingId}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{b.customer?.name}</span>
                    <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '10px' }}>{b.serviceTypeName}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {b.pickup?.address?.split(',')[0]} ➔ {b.drop?.address?.split(',')[0]} • Slot: {b.timeSlot}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803D' }}>₹{b.pricing?.totalAmount?.toLocaleString()}</div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: b.status === 'TRANSIT' ? '#DBEAFE' : b.status === 'CONFIRMED' ? '#DCFCE7' : '#FEF3C7', color: b.status === 'TRANSIT' ? '#1D4ED8' : b.status === 'CONFIRMED' ? '#15803D' : '#B45309', fontWeight: '700' }}>
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crew & Fleet Status */}
        <div className="card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--primary)" /> Moving Crew Status
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {teams.map(team => (
              <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>{team.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead: {team.leaderName} ({team.phone})</div>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: team.isAvailable ? '#DCFCE7' : '#FEF3C7', color: team.isAvailable ? '#15803D' : '#B45309', fontWeight: '700' }}>
                  {team.isAvailable ? '🟢 Available' : '🚚 On Move'}
                </span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => setActiveSubTab('teams')} style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
            Manage Teams & Vehicle Crews
          </button>
        </div>
      </div>
    </div>
  );
}
