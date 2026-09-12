import React, { useContext, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Download, FileSpreadsheet, TrendingUp, DollarSign,
  Car, Users, Calendar, Filter
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCReportsAnalytics() {
  const { bookings, pricingConfig, formatRupee } = useContext(PassengerCarContext);
  const [reportType, setReportType] = useState('bookings'); // 'bookings' | 'revenue' | 'earnings'

  // Vehicle Category Distribution Data for Chart
  const vehicleStats = {};
  bookings.forEach(b => {
    const v = b.vehicleName || 'Sedan';
    vehicleStats[v] = (vehicleStats[v] || 0) + 1;
  });

  const pieData = Object.keys(vehicleStats).map(name => ({
    name,
    value: vehicleStats[name]
  }));

  const PIE_COLORS = ['#1E5DFF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Service Type Distribution Data
  const serviceStats = {};
  bookings.forEach(b => {
    const s = b.serviceName || 'One-Way Ride';
    serviceStats[s] = (serviceStats[s] || 0) + 1;
  });

  const barData = Object.keys(serviceStats).map(service => ({
    service,
    trips: serviceStats[service]
  }));

  // CSV Export function (Section 46)
  const handleExportCSV = () => {
    const headers = [
      'Booking ID',
      'Created At',
      'Customer Name',
      'Customer Phone',
      'Service Type',
      'Vehicle Category',
      'Pickup Location',
      'Drop Location',
      'Distance KM',
      'Total Fare (INR)',
      'Driver Earnings (INR)',
      'Company Commission (INR)',
      'Payment Status',
      'Payment Mode',
      'Trip Status',
      'Pricing Version'
    ];

    const rows = bookings.map(b => [
      b.id,
      `"${new Date(b.createdAt).toLocaleString('en-IN')}"`,
      `"${b.customer?.name || ''}"`,
      `"${b.customer?.phone || ''}"`,
      `"${b.serviceName || ''}"`,
      `"${b.vehicleName || ''}"`,
      `"${b.pickup || ''}"`,
      `"${b.drop || ''}"`,
      b.distanceKm,
      b.pricingSnapshot?.totalFare || 0,
      b.pricingSnapshot?.driverEarnings || 0,
      b.pricingSnapshot?.companyCommission || 0,
      b.payment?.status || '',
      `"${b.payment?.method || ''}"`,
      b.status,
      b.pricingSnapshot?.pricingVersion || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `anusha_porter_passenger_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Export Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
            Passenger Analytics & Financial Reports (Sections 45 & 46)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Comprehensive operational intelligence, fleet utilization, and downloadable financial ledgers
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={16} />
          Export Report (CSV / Excel)
        </button>
      </div>

      {/* Analytics Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Service Distribution Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
            Trips by Service Type
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            One-Way rides vs Round Trips vs Airport transfers vs Hourly Rentals
          </p>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="trips" fill="#1E5DFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Category Distribution Pie Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
            Fleet Share by Vehicle Category
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Volume split between Sedan, Hatchback, SUV and Premium
          </p>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
