import React, { useContext, useState } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { AppStateContext } from '../../context/AppState';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function DashboardHome({ setActiveTab }) {
  const { orders, drivers, payouts, adminMetrics, darkMode } = useContext(AppStateContext);

  const [ordersFilter, setOrdersFilter] = useState('Weekly');
  const [revenueFilter, setRevenueFilter] = useState('Weekly');

  const totalOrdersVal = adminMetrics?.totalOrdersToday !== undefined ? adminMetrics.totalOrdersToday : orders.length;
  const activeOrdersCount = adminMetrics?.activeOrders !== undefined ? adminMetrics.activeOrders : orders.filter(o => ['pending', 'assigned', 'transit'].includes(o.status)).length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const onlineDriversCount = adminMetrics?.totalDrivers !== undefined ? adminMetrics.totalDrivers : drivers.filter(d => d.status === 'online').length;

  const revenueTodaySum = adminMetrics?.revenueToday !== undefined
    ? adminMetrics.revenueToday
    : orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0);

  const pendingPayoutsSum = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  // Group orders by date or month to create chart points dynamically
  const getChartData = (filterType) => {
    const dailyMap = {};
    orders.forEach(o => {
      if (!o.createdAt) return;
      try {
        const d = new Date(o.createdAt);
        let key;
        if (filterType === 'Weekly') {
          key = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
        } else {
          key = d.toLocaleDateString([], { month: 'short' });
        }
        
        if (!dailyMap[key]) {
          dailyMap[key] = { Orders: 0, Revenue: 0 };
        }
        dailyMap[key].Orders += 1;
        if (o.status === 'completed') {
          dailyMap[key].Revenue += (o.amount || 0);
        }
      } catch (e) {}
    });

    const chartData = Object.keys(dailyMap).map(key => ({
      name: key,
      Orders: dailyMap[key].Orders,
      Revenue: dailyMap[key].Revenue
    }));

    if (chartData.length === 0) {
      return [{ name: filterType === 'Weekly' ? 'Today' : 'Current Month', Orders: 0, Revenue: 0 }];
    }
    return chartData;
  };

  const weeklyAnalyticsData = getChartData('Weekly');
  const monthlyAnalyticsData = getChartData('Monthly');

  // Extract cities from address strings
  const getCityFromAddress = (address) => {
    if (!address) return 'Other';
    const addrLower = address.toLowerCase();
    if (addrLower.includes('hyderabad')) return 'Hyderabad';
    if (addrLower.includes('vijayawada')) return 'Vijayawada';
    if (addrLower.includes('guntur')) return 'Guntur';
    if (addrLower.includes('warangal')) return 'Warangal';
    if (addrLower.includes('vizag') || addrLower.includes('visakhapatnam')) return 'Vizag';
    if (addrLower.includes('bengaluru') || addrLower.includes('bangalore')) return 'Bengaluru';
    if (addrLower.includes('mumbai')) return 'Mumbai';
    if (addrLower.includes('chennai')) return 'Chennai';
    if (addrLower.includes('delhi')) return 'Delhi';
    return 'Other';
  };

  // Group top cities by orders
  const getCityAnalyticsData = () => {
    const cityCounts = {};
    orders.forEach(o => {
      const city = getCityFromAddress(o.pickup || o.pickupAddress || o.drop || o.dropAddress);
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const colorsList = ['#1E5DFF', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#30D5C8', '#A0AEC0'];
    const data = Object.keys(cityCounts).map((city, idx) => ({
      name: city,
      value: cityCounts[city],
      color: colorsList[idx % colorsList.length]
    }));

    if (data.length === 0) {
      return [{ name: 'No Orders', value: 0, color: '#1E5DFF' }];
    }
    return data.sort((a, b) => b.value - a.value);
  };

  const cityData = getCityAnalyticsData();

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'transit': return 'badge-transit';
      case 'completed': return 'badge-completed';
      case 'assigned': return 'badge-assigned';
      default: return 'badge-cancelled';
    }
  };

  return (
    <div className="animate-fade">
      {/* Overview Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => { localStorage.setItem('porter_orders_active_tab', 'all'); setActiveTab('orders'); }}>
          <div className="stat-card-header">
            <span className="stat-card-title">Total Orders</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(30, 93, 255, 0.1)', color: 'var(--primary)' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <span className="stat-value">{totalOrdersVal.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+12.5%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last week</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => { localStorage.setItem('porter_orders_active_tab', 'active'); setActiveTab('orders'); }}>
          <div className="stat-card-header">
            <span className="stat-card-title">Active Orders</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Clock size={20} />
            </div>
          </div>
          <span className="stat-value">{activeOrdersCount}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+8.2%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last week</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => { localStorage.setItem('porter_orders_active_tab', 'completed'); setActiveTab('orders'); }}>
          <div className="stat-card-header">
            <span className="stat-card-title">Completed Orders</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <span className="stat-value">{completedOrdersCount}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+15.3%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last week</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => { localStorage.setItem('porter_drivers_active_tab', 'online'); setActiveTab('drivers'); }}>
          <div className="stat-card-header">
            <span className="stat-card-title">Online Drivers</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <Truck size={20} />
            </div>
          </div>
          <span className="stat-value">{onlineDriversCount}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+10.1%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last week</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('finance')}>
          <div className="stat-card-header">
            <span className="stat-card-title">Revenue Today</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <span className="stat-value">₹{revenueTodaySum.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+14.5%</span>
            <span style={{ color: 'var(--text-muted)' }}>from yesterday</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('finance')}>
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Payouts</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <span className="stat-value">₹{pendingPayoutsSum.toLocaleString()}</span>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="stat-trend-up" />
            <span className="stat-trend-up">+5.6%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last week</span>
          </div>
        </div>
      </div>

      {/* Grid Charts & Live Tickers */}
      <div className="dashboard-row">
        {/* Left Column: Analytics Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-card" style={{ height: '360px' }}>
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Orders Overview</h3>
              <select
                className="custom-select"
                style={{ padding: '4px 12px' }}
                value={ordersFilter}
                onChange={(e) => setOrdersFilter(e.target.value)}
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div style={{ flex: 1, height: '280px', minHeight: '280px' }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={ordersFilter === 'Weekly' ? weeklyAnalyticsData : monthlyAnalyticsData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#F1F5F9'} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
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
                  <Line yAxisId="left" type="monotone" dataKey="Orders" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card" style={{ height: '360px' }}>
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Revenue Overview</h3>
              <select
                className="custom-select"
                style={{ padding: '4px 12px' }}
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div style={{ flex: 1, height: '280px', minHeight: '280px' }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueFilter === 'Weekly' ? weeklyAnalyticsData : monthlyAnalyticsData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                  <Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Live Orders and City breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-card" style={{ height: '360px' }}>
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Live Orders</h3>
              <span className="view-all-link" onClick={() => { localStorage.setItem('porter_orders_active_tab', 'all'); setActiveTab('orders'); }}>View All</span>
            </div>
            <div className="live-orders-list">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="live-order-card">
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>#{order.id}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {order.driver ? order.driver : 'Unassigned'} • {order.pickup.split(',')[0]}
                    </div>
                  </div>
                  <span className={`badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card" style={{ height: '360px' }}>
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Top Cities by Orders</h3>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '160px', height: '160px', position: 'relative' }}>
                <PieChart width={160} height={160}>
                  <Pie
                    data={cityData}
                    cx={80}
                    cy={80}
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    isAnimationActive={false}
                  >
                    {cityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                      borderColor: darkMode ? '#334155' : '#E2E8F0',
                      color: darkMode ? '#F8FAFC' : '#0F172A',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: darkMode ? '#F8FAFC' : '#0F172A' }}
                  />
                </PieChart>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{totalOrdersVal.toLocaleString()}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Orders</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                {cityData.map((city, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: city.color }}></span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{city.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({totalOrdersVal > 0 ? Math.round((city.value / totalOrdersVal) * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}