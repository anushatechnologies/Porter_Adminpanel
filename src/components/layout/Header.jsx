import React, { useContext, useState, useEffect } from 'react';
import { Menu, Search, Bell, MessageSquare, ShieldAlert, Sun, Moon, User, Settings, LogOut } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function Header({ activeTab, collapsed, setCollapsed, setActiveTab }) {
  const { user, darkMode, setDarkMode, notifications, tickets, handleLogout } = useContext(AppStateContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [crumbUpdate, setCrumbUpdate] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setCrumbUpdate(prev => prev + 1);
    };
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return ['Main', 'Dashboard'];
      case 'orders': {
        const subTab = localStorage.getItem('porter_orders_active_tab') || 'all';
        const subTabName = {
          all: 'All Orders',
          active: 'Active Orders',
          scheduled: 'Scheduled Orders',
          cancelled: 'Cancelled Orders',
          completed: 'Completed Orders'
        }[subTab] || 'Orders';
        return ['Management', 'Orders', subTabName];
      }
      case 'drivers': {
        const subTab = localStorage.getItem('porter_drivers_active_tab') || 'all';
        const subTabName = {
          all: 'All Drivers',
          online: 'Online Drivers',
          verification: 'Verification Requests'
        }[subTab] || 'Drivers';
        return ['Management', 'Drivers', subTabName];
      }
      case 'vehicles': {
        const subTab = localStorage.getItem('porter_vehicles_active_tab') || 'all';
        const subTabName = {
          all: 'All Vehicles',
          pending: 'Pending Verification'
        }[subTab] || 'Vehicles';
        return ['Management', 'Vehicles', subTabName];
      }
      case 'customers':
        return ['Management', 'Customers'];
      case 'tracking':
        return ['Operations', 'Live Tracking'];
      case 'finance':
        return ['Operations', 'Finance'];
      case 'support':
        return ['Operations', 'Support Desk'];
      case 'notifications':
        return ['Operations', 'Notifications'];
      case 'franchise':
        return ['Settings', 'Franchise'];
      case 'settings': {
        const subTab = localStorage.getItem('porter_settings_active_tab') || 'general';
        const subTabName = {
          general: 'General Settings',
          pricing: 'Pricing Configuration',
          users: 'Backoffice Users',
          roles: 'Roles & Permissions',
          keys: 'API Keys',
          legal: 'Legal & Policies'
        }[subTab] || 'System Settings';
        return ['Settings', 'Settings', subTabName];
      }
      default:
        return ['Console', 'Admin'];
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'orders': return 'Orders Manager';
      case 'drivers': return 'Drivers Registry';
      case 'vehicles': return 'Vehicles Fleet';
      case 'customers': return 'Customers Accounts';
      case 'tracking': return 'Live Fleet Tracking';
      case 'finance': return 'Finance Analytics';
      case 'support': return 'Support Tickets Desk';
      case 'notifications': return 'System Notifications';
      case 'franchise': return 'Franchise Partners';
      case 'settings': return 'System Settings';
      default: return 'Admin Console';
    }
  };

  const pendingSupportCount = tickets.filter(t => t.status !== 'resolved').length;
  const activeNotificationsCount = notifications.filter(n => !n.read).length;

  const crumbs = getBreadcrumb();

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumb-container">
          <div className="breadcrumb-trail">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="breadcrumb-separator">/</span>}
                <span
                  className={idx < crumbs.length - 1 ? 'clickable-crumb' : 'active-crumb'}
                  onClick={() => {
                    if (idx === 1) {
                      setActiveTab(activeTab);
                    }
                  }}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="header-title" style={{ marginTop: 0 }}>{getPageTitle()}</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          {/* Theme Toggle Button */}
          <button
            className="icon-btn"
            title="Toggle Light/Dark Theme"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} style={{ color: '#F59E0B' }} /> : <Moon size={18} />}
          </button>

          <button
            className="icon-btn"
            title="Live Support Chat Desk"
            onClick={() => setActiveTab('support')}
          >
            <MessageSquare size={18} />
            {pendingSupportCount > 0 && (
              <span className="badge-count">{pendingSupportCount}</span>
            )}
          </button>

          <button
            className="icon-btn"
            title="System Notifications Board"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            {activeNotificationsCount > 0 && (
              <span className="badge-count">{activeNotificationsCount}</span>
            )}
          </button>
        </div>

        <div className="header-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Admin"}`}
            alt="User avatar"
            className="header-profile-avatar"
          />
          <div className="header-profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="header-profile-name">{user?.name || "Admin User"}</span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>{user?.role || "Super Admin"}</span>
          </div>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="profile-dropdown-card" onClick={(e) => e.stopPropagation()}>
              <div className="profile-dropdown-header">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Admin"}`}
                  alt="Avatar"
                  className="profile-dropdown-avatar"
                />
                <div className="profile-dropdown-info">
                  <span className="profile-dropdown-name">{user?.name || "Admin User"}</span>
                  <span className="profile-dropdown-email">{user?.email || "admin@anushaporter.com"}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  className="profile-dropdown-item"
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileDropdown(false);
                  }}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </div>

                <div
                  className="profile-dropdown-item logout"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}