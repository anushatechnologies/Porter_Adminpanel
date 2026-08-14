import React, { useState, useContext } from 'react';
import { IndianRupee, TrendingUp, ArrowUpRight, Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function FinanceModule() {
  const { orders, payouts, releasePayout, darkMode, drivers, vehicles } = useContext(AppStateContext);

  const getOrderCommission = (o) => {
    let commPct = 5.0; // default fallback
    if (drivers && vehicles) {
      const driver = drivers.find(d => d.email === o.driverEmail || d.name === o.driver);
      if (driver) {
        const vehicle = vehicles.find(v => v.vehicleId === driver.vehicleType || v.name === driver.vehicle);
        if (vehicle && vehicle.commissionPercentage != null) {
          commPct = vehicle.commissionPercentage;
        }
      }
    }
    return (o.amount || 0) * (commPct / 100);
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic transactions list from database orders
  const transactions = orders.map(o => {
    let method = o.paymentMethod || 'UPI';
    let txnStatus = 'Pending';
    if (o.status === 'completed') {
      txnStatus = 'Success';
    } else if (o.status === 'cancelled') {
      txnStatus = 'Refunded';
    }
    
    let dateStr = 'Today';
    try {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        dateStr = d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch(e){}

    return {
      id: o.id || `TXN-${o.backendId}`,
      customer: o.customer,
      amount: o.amount,
      method: method,
      status: txnStatus,
      date: dateStr
    };
  });

  // Dynamic daily revenue chart data
  const getRevenueChartData = () => {
    const dailyMap = {};
    orders.forEach(o => {
      if (o.status !== 'completed' || !o.createdAt) return;
      try {
        const d = new Date(o.createdAt);
        const dayStr = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
        if (!dailyMap[dayStr]) {
          dailyMap[dayStr] = { Revenue: 0, Commission: 0 };
        }
        dailyMap[dayStr].Revenue += (o.amount || 0);
        dailyMap[dayStr].Commission += getOrderCommission(o);
      } catch (e) {}
    });

    const chartData = Object.keys(dailyMap).map(key => ({
      name: key,
      Revenue: dailyMap[key].Revenue,
      Commission: dailyMap[key].Commission
    }));

    if (chartData.length === 0) {
      return [{ name: 'Today', Revenue: 0, Commission: 0 }];
    }
    return chartData;
  };

  const revenueData = getRevenueChartData();

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const settledPayouts = payouts.filter(p => p.status === 'settled');

  // Stats calculations dynamically
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRev = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalComm = completedOrders.reduce((sum, o) => sum + getOrderCommission(o), 0);
  const driverPayoutsSum = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const netProfit = totalComm - driverPayoutsSum;

  return (
    <div className="animate-fade">
      {/* Financial stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Revenue</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <span className="stat-value">₹{totalRev.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+14.5%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Commission</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <span className="stat-value">₹{totalComm.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+12.3%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Driver Payouts</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <span className="stat-value">₹{driverPayoutsSum.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+10.2%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Net Profit</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <span className="stat-value">₹{netProfit.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+18.7%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last month</span>
          </div>
        </div>
      </div>

      {/* Revenue comparison charts */}
      <div className="dashboard-row-equal">
        <div className="dashboard-card" style={{ height: '340px' }}>
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Revenue & Commission Analytics</h3>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#F1F5F9'} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                    borderColor: darkMode ? '#334155' : '#E2E8F0',
                    color: darkMode ? '#F8FAFC' : '#0F172A',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: darkMode ? '#F8FAFC' : '#0F172A' }}
                  labelStyle={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={3} />
                <Line type="monotone" dataKey="Commission" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver payout release center */}
        <div className="dashboard-card" style={{ height: '340px' }}>
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Driver Payout Release Center</h3>
            <span className="badge badge-pending">{pendingPayouts.length} Pending Payouts</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <table className="custom-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Completed Trips</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(payout => (
                  <tr key={payout.id}>
                    <td style={{ fontWeight: '600' }}>{payout.driverName || payout.driver || 'Driver'}</td>
                    <td>{payout.trips || 0} trips</td>
                    <td style={{ fontWeight: '700' }}>₹{payout.amount}</td>
                    <td>
                      <span className={`badge ${payout.status === 'settled' ? 'badge-online' : 'badge-pending'}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td>
                      {payout.status === 'pending' ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }}
                          onClick={() => releasePayout(payout.id)}
                        >
                          Release
                        </button>
                      ) : (
                        <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}>
                          <CheckCircle2 size={12} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent transactions logs */}
      <div className="table-container" style={{ marginTop: '24px' }}>
        <div className="table-header-controls">
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Financial Transactions</h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id}>
                <td style={{ fontWeight: '700' }}>{txn.id}</td>
                <td>{txn.customer}</td>
                <td>{txn.date}</td>
                <td>{txn.method}</td>
                <td style={{ fontWeight: '600' }}>₹{txn.amount}</td>
                <td>
                  <span className="badge" style={{
                    backgroundColor: txn.status === 'Success' ? '#D1FAE5' : txn.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                    color: txn.status === 'Success' ? '#10B981' : txn.status === 'Pending' ? '#F59E0B' : '#EF4444'
                  }}>{txn.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}