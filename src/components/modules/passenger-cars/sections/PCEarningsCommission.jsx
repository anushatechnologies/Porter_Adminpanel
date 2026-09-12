import React, { useContext } from 'react';
import {
  DollarSign, TrendingUp, Users, ShieldCheck,
  Percent, FileText, Download, ArrowUpRight
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCEarningsCommission({ setActiveTab }) {
  const { bookings, pricingConfig, formatRupee } = useContext(PassengerCarContext);

  const completed = bookings.filter(b => b.status === 'TRIP_COMPLETED');
  const grossCustomerPaid = completed.reduce((acc, b) => acc + (b.pricingSnapshot?.totalFare || 0), 0);
  const totalCompanyMargin = completed.reduce((acc, b) => acc + (b.pricingSnapshot?.companyCommission || 0), 0);
  const totalDriverEarnings = completed.reduce((acc, b) => acc + (b.pricingSnapshot?.driverEarnings || 0), 0);
  const totalTaxes = completed.reduce((acc, b) => acc + (b.pricingSnapshot?.tax || 0), 0);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
            Driver Earnings & Company Commission Ledger (Section 28)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Transparent separation between customer payments, driver partner net revenue, and platform commissions
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pricing')}
          className="btn btn-secondary"
          style={{ fontSize: '13px' }}
        >
          Adjust Commission Rates
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #1E5DFF' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Gross Customer Paid
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
            {formatRupee(grossCustomerPaid)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Across {completed.length} Completed Rides
          </div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Driver Partner Payouts (80%)
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#10B981' }}>
            {formatRupee(totalDriverEarnings)}
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px' }}>
            Net Disbursed to Fleet
          </div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Platform Commission (20%)
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#8B5CF6' }}>
            {formatRupee(totalCompanyMargin)}
          </div>
          <div style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '8px' }}>
            Company Take Rate Margin
          </div>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            GST Collected (5%)
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px', color: '#F59E0B' }}>
            {formatRupee(totalTaxes)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Statutory Remittance Due
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="table-container">
        <h4 style={{ fontSize: '16px', fontWeight: '700', padding: '18px 20px 8px', margin: 0 }}>
          Completed Trip Financial Settlement Ledger
        </h4>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Service & Vehicle</th>
              <th>Customer Paid</th>
              <th>Driver Share</th>
              <th>Company Take</th>
              <th>Toll/Parking</th>
              <th>Tax (GST)</th>
              <th>Payment Gateway</th>
            </tr>
          </thead>
          <tbody>
            {completed.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No completed settlements recorded yet.
                </td>
              </tr>
            ) : (
              completed.map(b => {
                const snap = b.pricingSnapshot || {};
                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: '700', fontFamily: 'monospace' }}>{b.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {b.driver ? b.driver.name : 'Unassigned'}
                      </div>
                    </td>
                    <td>{b.vehicleName} ({b.serviceName})</td>
                    <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      {formatRupee(snap.totalFare)}
                    </td>
                    <td style={{ fontWeight: '700', color: '#10B981' }}>
                      {formatRupee(snap.driverEarnings)}
                    </td>
                    <td style={{ fontWeight: '700', color: '#8B5CF6' }}>
                      {formatRupee(snap.companyCommission)}
                    </td>
                    <td>{formatRupee((snap.toll || 0) + (snap.parking || 0))}</td>
                    <td>{formatRupee(snap.tax)}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: '#D1FAE5',
                        color: '#047857',
                        fontSize: '11.5px',
                        fontWeight: '600'
                      }}>
                        {b.payment?.method || 'UPI'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
