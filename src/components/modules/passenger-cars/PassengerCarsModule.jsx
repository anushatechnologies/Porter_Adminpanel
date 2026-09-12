import React, { useState, useContext } from 'react';
import {
  Car, LayoutDashboard, ShoppingBag, DollarSign,
  Calculator, History, Layers, Tag, Percent,
  AlertOctagon, BarChart3, Navigation, ShieldCheck, Zap
} from 'lucide-react';
import { PassengerCarProvider, PassengerCarContext } from '../../../context/PassengerCarContext';

import PCOverview from './sections/PCOverview';
import PCServicesConfig from './sections/PCServicesConfig';
import PCVehiclesConfig from './sections/PCVehiclesConfig';
import PCPricingHub from './sections/PCPricingHub';
import PCPricingPreview from './sections/PCPricingPreview';
import PCAuditVersions from './sections/PCAuditVersions';
import PCBookingsHub from './sections/PCBookingsHub';
import PCCustomerSimulator from './sections/PCCustomerSimulator';
import PCCoupons from './sections/PCCoupons';
import PCEarningsCommission from './sections/PCEarningsCommission';
import PCCancellationRefunds from './sections/PCCancellationRefunds';
import PCReportsAnalytics from './sections/PCReportsAnalytics';
import PCApiIntegration from './sections/PCApiIntegration';

import BookingDetailModal from './modals/BookingDetailModal';
import DriverAssignModal from './modals/DriverAssignModal';
import VehicleCategoryModal from './modals/VehicleCategoryModal';

const SUB_TABS = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, category: 'Operations' },
  { id: 'bookings', name: 'Bookings & Dispatch', icon: ShoppingBag, category: 'Operations' },
  { id: 'simulator', name: 'Booking Simulator', icon: Navigation, category: 'Operations' },
  { id: 'pricing', name: 'Pricing Hub', icon: DollarSign, category: 'Pricing Engine' },
  { id: 'preview', name: 'Pricing Preview (Sec 39)', icon: Calculator, category: 'Pricing Engine' },
  { id: 'audit', name: 'Audit & Versions', icon: History, category: 'Pricing Engine' },
  { id: 'categories', name: 'Vehicle Categories', icon: Car, category: 'Catalogue' },
  { id: 'services', name: 'Passenger Services', icon: Layers, category: 'Catalogue' },
  { id: 'coupons', name: 'Coupons & Promos', icon: Tag, category: 'Rules & Policies' },
  { id: 'earnings', name: 'Earnings & Commission', icon: Percent, category: 'Finance' },
  { id: 'cancellations', name: 'Cancellation Policy', icon: AlertOctagon, category: 'Rules & Policies' },
  { id: 'reports', name: 'Reports & Export', icon: BarChart3, category: 'Finance' },
  { id: 'api_integration', name: 'API Integration', icon: Zap, category: 'Developer' }
];

function InnerPassengerCarsContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const { saveVehicleCategory } = useContext(PassengerCarContext);

  // Modals state
  const [inspectBooking, setInspectBooking] = useState(null);
  const [assignDriverBooking, setAssignDriverBooking] = useState(null);
  const [categoryModalData, setCategoryModalData] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Port 8090 Working Reference Web UIs Banner */}
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ backgroundColor: '#10B981', color: '#FFF', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
            PORT 8090 ACTIVE
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>
            Passenger Car Services Reference UIs & Live API Endpoints
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="http://localhost:8090/passenger-booking.html"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60A5FA',
              border: '1px solid #3B82F6',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📱 Open Customer Flow UI</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>(:8090/passenger-booking.html)</span>
          </a>

          <a
            href="http://localhost:8090/passenger-admin.html"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              border: '1px solid #10B981',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🛠️ Open Admin Flow UI</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>(:8090/passenger-admin.html)</span>
          </a>
        </div>
      </div>

      {/* Sub-navigation Header Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? '700' : '500',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-main)'
              }}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Tab Render */}
      <div>
        {activeTab === 'overview' && <PCOverview setActiveTab={setActiveTab} />}
        {activeTab === 'bookings' && (
          <PCBookingsHub
            onSelectBooking={(b) => setInspectBooking(b)}
            onOpenDriverAssign={(b) => setAssignDriverBooking(b)}
          />
        )}
        {activeTab === 'simulator' && (
          <PCCustomerSimulator
            onBookingCreated={(b) => {
              // Option to inspect or switch
            }}
          />
        )}
        {activeTab === 'pricing' && <PCPricingHub setActiveTab={setActiveTab} />}
        {activeTab === 'preview' && <PCPricingPreview />}
        {activeTab === 'audit' && <PCAuditVersions />}
        {activeTab === 'categories' && (
          <PCVehiclesConfig
            onOpenCategoryModal={(cat) => {
              setCategoryModalData(cat);
              setShowCategoryModal(true);
            }}
          />
        )}
        {activeTab === 'services' && <PCServicesConfig setActiveTab={setActiveTab} />}
        {activeTab === 'coupons' && <PCCoupons />}
        {activeTab === 'earnings' && <PCEarningsCommission setActiveTab={setActiveTab} />}
        {activeTab === 'cancellations' && <PCCancellationRefunds />}
        {activeTab === 'reports' && <PCReportsAnalytics />}
        {activeTab === 'api_integration' && <PCApiIntegration />}
      </div>

      {/* Modals */}
      {inspectBooking && (
        <BookingDetailModal
          booking={inspectBooking}
          onClose={() => setInspectBooking(null)}
          onAssignDriver={(b) => {
            setInspectBooking(null);
            setAssignDriverBooking(b);
          }}
        />
      )}

      {assignDriverBooking && (
        <DriverAssignModal
          booking={assignDriverBooking}
          onClose={() => setAssignDriverBooking(null)}
        />
      )}

      {showCategoryModal && (
        <VehicleCategoryModal
          category={categoryModalData}
          onClose={() => setShowCategoryModal(false)}
          onSave={(savedCat) => {
            if (saveVehicleCategory) {
              saveVehicleCategory(savedCat);
            }
            setShowCategoryModal(false);
          }}
        />
      )}
    </div>
  );
}

export default function PassengerCarsModule() {
  return (
    <PassengerCarProvider>
      <InnerPassengerCarsContent />
    </PassengerCarProvider>
  );
}
