import React, { useState, useEffect, useContext } from 'react';
import { AppStateProvider, AppStateContext } from './context/AppState';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginFlow from './components/modules/LoginFlow';
import DashboardHome from './components/modules/DashboardHome';
import OrdersModule from './components/modules/OrdersModule';
import DriversModule from './components/modules/DriversModule';
import VehiclesModule from './components/modules/VehiclesModule';
import CustomersModule from './components/modules/CustomersModule';
import LiveTracking from './components/modules/LiveTracking';
import FinanceModule from './components/modules/FinanceModule';
import SupportModule from './components/modules/SupportModule';
import NotificationsModule from './components/modules/NotificationsModule';
import FranchiseModule from './components/modules/FranchiseModule';
import ServicesModule from './components/modules/ServicesModule';
import SettingsModule from './components/modules/SettingsModule';
import PricingManagement from './components/modules/PricingManagement';
import BannersModule from './components/modules/BannersModule';
import PrivacyPolicy from './components/public/PrivacyPolicy';

const getStateFromURL = () => {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean); // e.g. ['admin', 'orders', 'active']

  if (segments.length === 0 || segments[0] !== 'admin') {
    return { mainTab: 'dashboard' };
  }

  if (segments.length === 1) {
    return { mainTab: 'dashboard' };
  }

  const mainSeg = segments[1].toLowerCase();

  // Map segments back to mainTab
  let mainTab = 'dashboard';
  if (mainSeg === 'dashboard') mainTab = 'dashboard';
  else if (mainSeg === 'orders') mainTab = 'orders';
  else if (mainSeg === 'drivers') mainTab = 'drivers';
  else if (mainSeg === 'vehicles') mainTab = 'vehicles';
  else if (mainSeg === 'services') mainTab = 'services';
  else if (mainSeg === 'customers') mainTab = 'customers';
  else if (mainSeg === 'live-tracking') mainTab = 'tracking';
  else if (mainSeg === 'finance') mainTab = 'finance';
  else if (mainSeg === 'support') mainTab = 'support';
  else if (mainSeg === 'notifications') mainTab = 'notifications';
  else if (mainSeg === 'franchise') mainTab = 'franchise';
  else if (mainSeg === 'pricing') mainTab = 'pricing';
  else if (mainSeg === 'settings') mainTab = 'settings';
  else if (mainSeg === 'banners') mainTab = 'banners';

  // If there's a sub-segment, set it in localStorage
  if (segments.length > 2) {
    const subSeg = segments[2].toLowerCase();
    if (mainTab === 'orders') {
      if (['active', 'scheduled', 'cancelled', 'completed', 'all'].includes(subSeg)) {
        localStorage.setItem('porter_orders_active_tab', subSeg);
      }
    } else if (mainTab === 'drivers') {
      if (['online', 'verification', 'all'].includes(subSeg)) {
        localStorage.setItem('porter_drivers_active_tab', subSeg);
      }
    } else if (mainTab === 'vehicles') {
      if (['pending', 'all'].includes(subSeg)) {
        localStorage.setItem('porter_vehicles_active_tab', subSeg);
      }
    } else if (mainTab === 'support') {
      if (['open', 'pending', 'resolved', 'all'].includes(subSeg)) {
        localStorage.setItem('porter_support_active_tab', subSeg);
      }
    } else if (mainTab === 'settings') {
      const subVal = {
        'general': 'general',
        'pricing': 'pricing',
        'backoffice-users': 'users',
        'roles': 'roles',
        'keys': 'keys',
        'legal': 'legal'
      }[subSeg];
      if (subVal) localStorage.setItem('porter_settings_active_tab', subVal);
    }
  } else {
    // If no sub-segment, reset to default
    if (mainTab === 'orders') localStorage.setItem('porter_orders_active_tab', 'all');
    else if (mainTab === 'drivers') localStorage.setItem('porter_drivers_active_tab', 'all');
    else if (mainTab === 'vehicles') localStorage.setItem('porter_vehicles_active_tab', 'all');
    else if (mainTab === 'support') localStorage.setItem('porter_support_active_tab', 'pending');
    else if (mainTab === 'settings') localStorage.setItem('porter_settings_active_tab', 'general');
  }

  return { mainTab };
};

const updateURLFromState = (mainTab) => {
  let path = '/admin/dashboard';
  switch (mainTab) {
    case 'dashboard':
      path = '/admin/dashboard';
      break;
    case 'orders': {
      const sub = localStorage.getItem('porter_orders_active_tab') || 'all';
      if (sub === 'all') path = '/admin/orders';
      else path = `/admin/orders/${sub}`;
      break;
    }
    case 'drivers': {
      const sub = localStorage.getItem('porter_drivers_active_tab') || 'all';
      if (sub === 'all') path = '/admin/drivers';
      else path = `/admin/drivers/${sub}`;
      break;
    }
    case 'vehicles': {
      const sub = localStorage.getItem('porter_vehicles_active_tab') || 'all';
      if (sub === 'all') path = '/admin/vehicles';
      else path = `/admin/vehicles/${sub}`;
      break;
    }
    case 'services':
      path = '/admin/services';
      break;
    case 'customers':
      path = '/admin/customers';
      break;
    case 'tracking':
      path = '/admin/live-tracking';
      break;
    case 'finance':
      path = '/admin/finance';
      break;
    case 'support': {
      const sub = localStorage.getItem('porter_support_active_tab') || 'pending';
      if (sub === 'pending') path = '/admin/support';
      else path = `/admin/support/${sub}`;
      break;
    }
    case 'notifications':
      path = '/admin/notifications';
      break;
    case 'franchise':
      path = '/admin/franchise';
      break;
    case 'pricing':
      path = '/admin/pricing';
      break;
    case 'banners':
      path = '/admin/banners';
      break;
    case 'settings': {
      const sub = localStorage.getItem('porter_settings_active_tab') || 'general';
      const subPath = {
        general: 'general',
        pricing: 'pricing',
        users: 'backoffice-users',
        roles: 'roles',
        keys: 'keys',
        legal: 'legal'
      }[sub] || 'general';
      path = `/admin/settings/${subPath}`;
      break;
    }
    default:
      path = '/admin/dashboard';
  }
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
};

function AppContent() {
  const { user } = useContext(AppStateContext);
  const [activeTab, setActiveTab] = useState(() => {
    const { mainTab } = getStateFromURL();
    if (window.location.pathname === '/' || window.location.pathname === '' || !window.location.pathname.startsWith('/admin')) {
      return localStorage.getItem('porter_active_tab') || 'dashboard';
    }
    return mainTab;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem('porter_active_tab', activeTab);
    updateURLFromState(activeTab);
    window.dispatchEvent(new Event('storage-update'));
  }, [activeTab]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      updateURLFromState(activeTab);
    };
    window.addEventListener('storage-update', handleStorageUpdate);

    const handlePopState = () => {
      const { mainTab } = getStateFromURL();
      setActiveTab(mainTab);
      window.dispatchEvent(new Event('storage-update'));
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('storage-update', handleStorageUpdate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab]);

  // If no admin user is authenticated, route them through the Login Flow
  if (!user) {
    return <LoginFlow />;
  }

  // Render the Admin workspace console
  return (
    <div className="app-container">
      {/* Sidebar Nav */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
      />

      {/* Workspace wrapper */}
      <div className="app-content-wrapper">
        {/* Header */}
        <Header
          activeTab={activeTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          setActiveTab={setActiveTab}
        />

        {/* Active Page View Component */}
        <main className="page-content">
          {activeTab === 'dashboard' && <DashboardHome setActiveTab={setActiveTab} />}
          {activeTab === 'orders' && <OrdersModule />}
          {activeTab === 'drivers' && <DriversModule />}
          {activeTab === 'vehicles' && <VehiclesModule />}
          {activeTab === 'services' && <ServicesModule />}
          {activeTab === 'customers' && <CustomersModule />}
          {activeTab === 'tracking' && <LiveTracking />}
          {activeTab === 'finance' && <FinanceModule />}
          {activeTab === 'support' && <SupportModule />}
          {activeTab === 'notifications' && <NotificationsModule />}
          {activeTab === 'franchise' && <FranchiseModule />}
          {activeTab === 'pricing' && <PricingManagement />}
          {activeTab === 'banners' && <BannersModule />}
          {activeTab === 'settings' && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const isPrivacyPage = window.location.pathname === '/privacy-policy' || window.location.pathname === '/privacy';
  if (isPrivacyPage) {
    return <PrivacyPolicy />;
  }

  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}