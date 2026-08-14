import React, { useContext } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Car,
  Layers,
  Users,
  MapPin,
  DollarSign,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Building,
  IndianRupee,
  Image as ImageIcon
} from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

import logoImg from '../../assets/logo.jpg';

export default function Sidebar({ activeTab, setActiveTab, collapsed }) {
  const { user, handleLogout, notifications, tickets } = useContext(AppStateContext);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, category: 'Management' },
    { id: 'drivers', name: 'Drivers', icon: Truck, category: 'Management' },
    { id: 'vehicles', name: 'Vehicles', icon: Car, category: 'Management' },
    { id: 'services', name: 'Our Services', icon: Layers, category: 'Management' },
    { id: 'customers', name: 'Customers', icon: Users, category: 'Management' },
    { id: 'tracking', name: 'Live Tracking', icon: MapPin, category: 'Operations' },
    { id: 'finance', name: 'Finance', icon: DollarSign, category: 'Operations' },
    { id: 'support', name: 'Support', icon: MessageSquare, category: 'Operations', badge: tickets.filter(t => t.status !== 'resolved').length },
    { id: 'notifications', name: 'Notifications', icon: Bell, category: 'Operations', badge: notifications.filter(n => !n.read).length },
    { id: 'franchise', name: 'Franchise', icon: Building, category: 'Settings' },
    { id: 'pricing', name: 'Pricing Engine', icon: IndianRupee, category: 'Settings' },
    { id: 'banners', name: 'Banners', icon: ImageIcon, category: 'Settings' },
    { id: 'settings', name: 'Settings', icon: Settings, category: 'Settings' }
  ];

  // Group menu items by category
  const categories = ['Main', 'Management', 'Operations', 'Settings'];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand" style={{ padding: collapsed ? '0 17px' : '0 24px', gap: '12px' }}>
        <img
          src={logoImg}
          alt="Anusha Porter Logo"
          style={{
            height: '36px',
            width: '36px',
            objectFit: 'contain',
            flexShrink: 0
          }}
        />
        {!collapsed && (
          <div className="sidebar-logo" style={{ fontSize: '16px', letterSpacing: '0.5px', fontWeight: '800', color: 'var(--text-white)' }}>
            ANUSHA <span style={{ color: 'var(--primary)' }}>PORTER</span>
          </div>
        )}
      </div>

      <div className="sidebar-menu">
        {categories.map(cat => {
          const itemsInCat = menuItems.filter(item => item.category === cat);
          return (
            <React.Fragment key={cat}>
              {!collapsed && <div className="sidebar-group-title">{cat}</div>}
              {itemsInCat.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    title={item.name}
                  >
                    <IconComponent size={20} />
                    {!collapsed && (
                      <span style={{ flex: 1 }}>{item.name}</span>
                    )}
                    {!collapsed && item.badge > 0 && (
                      <span className="badge-count" style={{ position: 'relative', top: 'auto', right: 'auto' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <img
          src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
          alt="Profile"
          className="sidebar-footer-avatar"
        />
        {!collapsed && (
          <div className="sidebar-footer-info" style={{ flex: 1 }}>
            <span className="sidebar-footer-name">{user?.name || "Admin User"}</span>
            <span className="sidebar-footer-role">{user?.role || "Super Admin"}</span>
          </div>
        )}
        {!collapsed && (
          <button
            className="icon-btn"
            style={{ border: 'none', background: 'transparent', padding: 0, minWidth: 'auto', width: 'auto', height: 'auto', color: '#EF4444' }}
            onClick={handleLogout}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}