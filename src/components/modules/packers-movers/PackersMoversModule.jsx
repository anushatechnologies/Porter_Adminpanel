import React, { useState, useContext } from 'react';
import {
  Package, LayoutDashboard, Layers, MapPin, Clock, ShoppingBag,
  Wrench, Truck, Calculator, Tag, FileText, Users, Navigation,
  CheckSquare, AlertOctagon, DollarSign, MessageSquare, Bell, Sliders, Zap
} from 'lucide-react';
import { PackersMoversProvider, PackersMoversContext } from './PackersMoversContext';
import PMDashboard from './sections/PMDashboard';
import PMServiceConfig from './sections/PMServiceConfig';
import PMServiceAreas from './sections/PMServiceAreas';
import PMTimeSlots from './sections/PMTimeSlots';
import PMItemCatalogue from './sections/PMItemCatalogue';
import PMPackingServices from './sections/PMPackingServices';
import PMAmbientServices from './sections/PMAmbientServices';
import PMVehiclesLabour from './sections/PMVehiclesLabour';
import PMPricingEngine from './sections/PMPricingEngine';
import PMQuotesManager from './sections/PMQuotesManager';
import PMBookingsManager from './sections/PMBookingsManager';
import PMTeamAssignment from './sections/PMTeamAssignment';
import PMLiveOperations from './sections/PMLiveOperations';
import PMInventoryVerification from './sections/PMInventoryVerification';
import PMCancellationRefunds from './sections/PMCancellationRefunds';
import PMCoupons from './sections/PMCoupons';
import PMPaymentsLedger from './sections/PMPaymentsLedger';
import PMComplaintsReviews from './sections/PMComplaintsReviews';
import PMNotificationSettings from './sections/PMNotificationSettings';
import PMAppSettings from './sections/PMAppSettings';
import PMApiIntegration from './sections/PMApiIntegration';
import BookingDetailModal from './components/BookingDetailModal';
import QuoteEditorModal from './components/QuoteEditorModal';
import TeamAssignModal from './components/TeamAssignModal';

const SUB_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, category: 'Operations' },
  { id: 'bookings', name: 'Bookings Hub', icon: ShoppingBag, category: 'Operations' },
  { id: 'quotes', name: 'Quotes Desk', icon: FileText, category: 'Operations' },
  { id: 'live_ops', name: 'Live Move Radar', icon: Navigation, category: 'Operations' },
  { id: 'teams', name: 'Crews & Trucks', icon: Users, category: 'Operations' },
  { id: 'inventory_check', name: 'Inventory & Extra Charges', icon: CheckSquare, category: 'Operations' },
  { id: 'payments', name: 'Payments Ledger', icon: DollarSign, category: 'Operations' },
  { id: 'services', name: 'Service Types', icon: Layers, category: 'Catalogue & Rates' },
  { id: 'areas', name: 'Areas & Routes', icon: MapPin, category: 'Catalogue & Rates' },
  { id: 'slots', name: 'Time Slots', icon: Clock, category: 'Catalogue & Rates' },
  { id: 'items', name: 'Item Catalogue', icon: Package, category: 'Catalogue & Rates' },
  { id: 'packing', name: 'Packing Services', icon: Package, category: 'Catalogue & Rates' },
  { id: 'ambient', name: 'Floor & Extra Surcharges', icon: Wrench, category: 'Catalogue & Rates' },
  { id: 'vehicles', name: 'Trucks & Labour', icon: Truck, category: 'Catalogue & Rates' },
  { id: 'pricing_engine', name: 'Pricing Engine', icon: Calculator, category: 'Catalogue & Rates' },
  { id: 'coupons', name: 'Coupons', icon: Tag, category: 'Settings & Rules' },
  { id: 'cancellations', name: 'Cancellations & Refunds', icon: AlertOctagon, category: 'Settings & Rules' },
  { id: 'complaints', name: 'Complaints & Reviews', icon: MessageSquare, category: 'Settings & Rules' },
  { id: 'notifications', name: 'SMS & Alerts', icon: Bell, category: 'Settings & Rules' },
  { id: 'app_settings', name: 'User App Settings', icon: Sliders, category: 'Settings & Rules' },
  { id: 'api_integration', name: 'API Integration', icon: Zap, category: 'Developer Tools' }
];

function InnerPackersMoversContent() {
  const { loading, error, refetch } = useContext(PackersMoversContext);
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [openedBooking, setOpenedBooking] = useState(null);
  const [quoteBooking, setQuoteBooking] = useState(null);
  const [assignBooking, setAssignBooking] = useState(null);

  const renderSection = () => {
    switch (activeSubTab) {
      case 'dashboard':
        return <PMDashboard setActiveSubTab={setActiveSubTab} onOpenBooking={setOpenedBooking} />;
      case 'bookings':
        return <PMBookingsManager />;
      case 'quotes':
        return <PMQuotesManager />;
      case 'live_ops':
        return <PMLiveOperations />;
      case 'teams':
        return <PMTeamAssignment onOpenBooking={setOpenedBooking} />;
      case 'inventory_check':
        return <PMInventoryVerification />;
      case 'payments':
        return <PMPaymentsLedger onOpenBooking={setOpenedBooking} />;
      case 'services':
        return <PMServiceConfig />;
      case 'areas':
        return <PMServiceAreas />;
      case 'slots':
        return <PMTimeSlots />;
      case 'items':
        return <PMItemCatalogue />;
      case 'packing':
        return <PMPackingServices />;
      case 'ambient':
        return <PMAmbientServices />;
      case 'vehicles':
        return <PMVehiclesLabour />;
      case 'pricing_engine':
        return <PMPricingEngine />;
      case 'coupons':
        return <PMCoupons />;
      case 'cancellations':
        return <PMCancellationRefunds />;
      case 'complaints':
        return <PMComplaintsReviews />;
      case 'notifications':
        return <PMNotificationSettings />;
      case 'app_settings':
        return <PMAppSettings />;
      case 'api_integration':
        return <PMApiIntegration />;
      default:
        return <PMDashboard setActiveSubTab={setActiveSubTab} onOpenBooking={setOpenedBooking} />;
    }
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '50px' }}>
      {/* Header */}
      <div className="module-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={26} color="var(--primary)" />
            Packers & Movers Management System
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Central administration control room for home & office shifting, inventory catalog, pricing algorithms, quotes, teams and live moves.
          </p>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Syncing with backend...
          </div>
        )}
      </div>

      {/* API Error Banner */}
      {error && (
        <div style={{ padding: '12px 18px', borderRadius: '8px', backgroundColor: '#FFF5F5', border: '1px solid #FCA5A5', color: '#B91C1C', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span>⚠️ {error}</span>
          <button onClick={refetch} style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #B91C1C', background: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
            Retry
          </button>
        </div>
      )}

      {/* Sub-Navigation Navigation Ribbon */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        padding: '6px',
        backgroundColor: 'var(--bg-main)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        {SUB_MODULES.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFF' : 'var(--text-color)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      <div className="tab-content">
        {renderSection()}
      </div>

      {/* Global Modals for Cross-Navigation */}
      {openedBooking && (
        <BookingDetailModal
          booking={openedBooking}
          onClose={() => setOpenedBooking(null)}
          onAssignTeam={(b) => { setOpenedBooking(null); setAssignBooking(b); }}
          onOpenQuote={(b) => { setOpenedBooking(null); setQuoteBooking(b); }}
        />
      )}

      {assignBooking && (
        <TeamAssignModal
          booking={assignBooking}
          onClose={() => setAssignBooking(null)}
        />
      )}

      {quoteBooking && (
        <QuoteEditorModal
          booking={quoteBooking}
          onClose={() => setQuoteBooking(null)}
        />
      )}
    </div>
  );
}

export default function PackersMoversModule() {
  return (
    <PackersMoversProvider>
      <InnerPackersMoversContent />
    </PackersMoversProvider>
  );
}
