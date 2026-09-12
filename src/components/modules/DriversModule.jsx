import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Eye, Check, X, ShieldAlert, Phone, Truck, Car, Star, Award, 
  Calendar, Search, Trash2, Plus, Upload, User, CheckCircle2, 
  AlertCircle, FileText, RefreshCw, Filter, Layers
} from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

export default function DriversModule() {
  const { 
    drivers: contextDrivers, orders, vehicles, 
    approveDriverVerification, rejectDriverVerification, deleteDriver, 
    createDriverManually, updateDriverStatus, uploadDocumentFile, 
    validateDocumentQuality, uploadDriverPhoto, authFetch 
  } = useContext(AppStateContext);

  // 1. Service Type Tab: 'our-services' | 'passengers'
  const [serviceTab, setServiceTab] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin/drivers/passengers')) return 'passengers';
    if (path.includes('/admin/drivers/our-services')) return 'our-services';
    return localStorage.getItem('porter_drivers_service_tab') || 'our-services';
  });

  // Filter Bar States (status: all | online | offline, kyc: all | approved | pending | rejected)
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drivers List State from Dedicated Endpoints
  const [driverList, setDriverList] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Modals and Drawer State
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview | trips | docs
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Reject Modal State
  const [rejectModalDriver, setRejectModalDriver] = useState(null);
  const [rejectedDocKeys, setRejectedDocKeys] = useState(['license', 'rc']);
  const [selectedReasonTemplate, setSelectedReasonTemplate] = useState('Blurry or unreadable document photo');
  const [customRejectionNote, setCustomRejectionNote] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Add Driver Form State
  const [addDriverForm, setAddDriverForm] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    serviceType: 'OUR_SERVICES',
    vehicleType: 'Tata Ace (750kg)',
    vehicleNumber: '',
    rcNumber: '',
    licenseNumber: '',
    aadhaarNumber: '',
    addressLine1: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    profilePhotoUri: '',
    licenseUri: '',
    rcUri: '',
    aadhaarUri: '',
    bankPassbookUri: '',
  });

  // Keep URL and LocalStorage synchronized when tab changes
  const handleTabChange = (newTab) => {
    setServiceTab(newTab);
    localStorage.setItem('porter_drivers_service_tab', newTab);
    localStorage.setItem('porter_drivers_active_tab', newTab);
    const newPath = `/admin/drivers/${newTab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
    window.dispatchEvent(new Event('storage-update'));
  };

  // Helper to normalize and categorize context drivers if offline fallback is needed
  const isPassengerDriver = (d) => {
    const sType = String(d.serviceType || d.serviceCategory || '').toUpperCase();
    if (sType === 'PASSENGER' || sType.includes('PASSENGER')) return true;
    const v = String(d.vehicle || d.vehicleType || '').toLowerCase();
    return v.includes('cab') || v.includes('sedan') || v.includes('hatchback') || v.includes('suv') || v.includes('bike taxi') || v.includes('auto taxi');
  };

  const isOurServicesDriver = (d) => {
    const sType = String(d.serviceType || d.serviceCategory || '').toUpperCase();
    if (sType === 'OUR_SERVICES' || sType.includes('OUR_SERVICES') || sType.includes('GOODS')) return true;
    return !isPassengerDriver(d);
  };

  const isPendingKYC = (d) => {
    const k = String(d.kyc || d.kycStatus || d.status || '').toLowerCase();
    return !d.docs?.verified && (k === 'pending' || k === 'verification_requests' || k === 'unverified');
  };

  const isApprovedKYC = (d) => {
    const k = String(d.kyc || d.kycStatus || '').toLowerCase();
    return d.docs?.verified || k === 'approved' || k === 'verified';
  };

  const isRejectedKYC = (d) => {
    const k = String(d.kyc || d.kycStatus || d.status || '').toLowerCase();
    return k === 'rejected';
  };

  // Fetch Drivers from the dedicated Backend API:
  // Tab 1 -> GET /api/admin/drivers/our-services
  // Tab 2 -> GET /api/admin/drivers/passengers
  const fetchDrivers = useCallback(async () => {
    setLoadingDrivers(true);
    const endpoint = serviceTab === 'passengers'
      ? '/api/admin/drivers/passengers'
      : '/api/admin/drivers/our-services';

    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (kycFilter !== 'all') params.append('kyc', kycFilter);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    const queryString = params.toString();
    const targetUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

    try {
      let rawList = null;
      if (authFetch) {
        let res = await authFetch(targetUrl).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          rawList = Array.isArray(data) ? data : (data.drivers || data.data || data.items || []);
        } else {
          // Fallback with serviceType query param
          const fallbackEndpoint = `/api/admin/drivers?serviceType=${serviceTab === 'passengers' ? 'PASSENGER' : 'OUR_SERVICES'}&${queryString}`;
          let resFallback = await authFetch(fallbackEndpoint).catch(() => null);
          if (resFallback && resFallback.ok) {
            const fbData = await resFallback.json();
            rawList = Array.isArray(fbData) ? fbData : (fbData.drivers || fbData.data || []);
          }
        }
      }

      // If backend returned valid list, map and use it
      if (Array.isArray(rawList) && rawList.length > 0) {
        const mapped = rawList.map(d => {
          const isKycAppr = d.kyc === 'approved' || d.kycStatus === 'approved' || d.kyc === 'verified' || d.kycStatus === 'verified' || d.docs?.verified;
          const isKycRej = d.kyc === 'rejected' || d.kycStatus === 'rejected' || d.status === 'rejected';
          const kycLabel = isKycRej ? 'rejected' : isKycAppr ? 'approved' : 'pending';

          return {
            ...d,
            id: d.id || d.driverId || `DRV-${Math.floor(100 + Math.random() * 900)}`,
            driverId: d.driverId || d.id,
            name: d.name || d.fullName || null,
            phone: d.phone || d.phoneNumber || 'N/A',
            email: d.email || '',
            serviceType: d.serviceType || (serviceTab === 'passengers' ? 'PASSENGER' : 'OUR_SERVICES'),
            serviceCategory: d.serviceCategory || (serviceTab === 'passengers' ? 'Passenger Rides' : 'Our Services'),
            vehicle: d.vehicle || d.vehicleType || (serviceTab === 'passengers' ? 'Cab' : 'Tata Ace'),
            vehicleType: d.vehicleType || d.vehicle || (serviceTab === 'passengers' ? 'Cab' : 'Tata Ace'),
            vehicleNumber: d.vehicleNumber || d.vehicleNo || 'N/A',
            status: (d.status || 'offline').toLowerCase(),
            kyc: kycLabel,
            kycStatus: kycLabel,
            rating: d.rating ? String(d.rating) : '4.8',
            trips: d.trips != null ? d.trips : 0,
            profilePhotoUri: d.profilePhotoUri || d.avatar || null,
            docs: d.docs || {
              verified: isKycAppr,
              license: isKycAppr ? 'Verified' : isKycRej ? 'Rejected' : 'Pending',
              rc: isKycAppr ? 'Verified' : isKycRej ? 'Rejected' : 'Pending',
              licenseUrl: d.licenseUri || d.licenseUrl,
              rcUrl: d.rcUri || d.rcUrl,
              aadhaarUrl: d.aadhaarUri || d.aadhaarUrl,
              bankPassbookUrl: d.bankPassbookUri || d.bankPassbookUrl
            }
          };
        });
        setDriverList(mapped);
      } else {
        // Fallback to filtering contextDrivers
        let filtered = contextDrivers.filter(d => {
          if (serviceTab === 'passengers') {
            return isPassengerDriver(d);
          } else {
            return isOurServicesDriver(d);
          }
        });

        if (statusFilter !== 'all') {
          filtered = filtered.filter(d => d.status === statusFilter);
        }

        if (kycFilter === 'approved') {
          filtered = filtered.filter(isApprovedKYC);
        } else if (kycFilter === 'pending') {
          filtered = filtered.filter(isPendingKYC);
        } else if (kycFilter === 'rejected') {
          filtered = filtered.filter(isRejectedKYC);
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(d =>
            (d.name || '').toLowerCase().includes(q) ||
            (d.phone || '').includes(q) ||
            (d.email || '').toLowerCase().includes(q) ||
            (d.vehicleNumber || d.vehicleNo || '').toLowerCase().includes(q) ||
            (d.vehicleType || d.vehicle || '').toLowerCase().includes(q) ||
            String(d.id || '').toLowerCase().includes(q)
          );
        }

        setDriverList(filtered);
      }
    } catch (err) {
      console.warn('Error fetching drivers from backend:', err);
    } finally {
      setLoadingDrivers(false);
    }
  }, [serviceTab, statusFilter, kycFilter, searchQuery, contextDrivers, authFetch]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Total counts for top tab badges
  const ourServicesCount = contextDrivers.filter(isOurServicesDriver).length;
  const passengersCount = contextDrivers.filter(isPassengerDriver).length;

  const handleOpenDetails = (driver) => {
    setSelectedDriver(driver);
    setDetailTab('overview');
  };

  const handleApprove = async (driverId) => {
    const cleanId = String(driverId).replace(/^DRV-/, '');
    setDriverList(prev => prev.map(d => (d.id === driverId || String(d.id) === cleanId) ? {
      ...d,
      status: 'offline',
      kyc: 'approved',
      kycStatus: 'approved',
      docs: { ...(d.docs || {}), license: 'Verified', rc: 'Verified', verified: true }
    } : d));

    if (selectedDriver && (selectedDriver.id === driverId || String(selectedDriver.id) === cleanId)) {
      setSelectedDriver(prev => ({
        ...prev,
        status: 'offline',
        kyc: 'approved',
        kycStatus: 'approved',
        docs: { ...(prev.docs || {}), license: 'Verified', rc: 'Verified', verified: true }
      }));
    }

    if (approveDriverVerification) {
      await approveDriverVerification(cleanId);
    }
  };

  const openRejectModal = (driver) => {
    setRejectModalDriver(driver);
    setRejectedDocKeys(['license', 'rc']);
    setSelectedReasonTemplate('Blurry or unreadable document photo');
    setCustomRejectionNote('');
  };

  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!rejectModalDriver) return;
    if (rejectedDocKeys.length === 0) {
      alert('Please select at least one document to mark for re-upload.');
      return;
    }

    const finalReason = selectedReasonTemplate === 'Custom Reason' 
      ? (customRejectionNote.trim() || 'Documents invalid. Please re-upload clear copies.')
      : (customRejectionNote.trim() ? `${selectedReasonTemplate} - ${customRejectionNote.trim()}` : selectedReasonTemplate);

    setIsRejecting(true);
    const cleanId = String(rejectModalDriver.id || rejectModalDriver.driverId).replace(/^DRV-/, '');

    setDriverList(prev => prev.map(d => (d.id === rejectModalDriver.id || String(d.id) === cleanId) ? {
      ...d,
      status: 'rejected',
      kyc: 'rejected',
      kycStatus: 'rejected',
      rejectionReason: finalReason,
      requireReupload: true,
      docs: { ...(d.docs || {}), verified: false }
    } : d));

    if (selectedDriver && (selectedDriver.id === rejectModalDriver.id || String(selectedDriver.id) === cleanId)) {
      setSelectedDriver(prev => ({
        ...prev,
        status: 'rejected',
        kyc: 'rejected',
        kycStatus: 'rejected',
        rejectionReason: finalReason,
        requireReupload: true,
        docs: { ...(prev.docs || {}), verified: false }
      }));
    }

    if (rejectDriverVerification) {
      await rejectDriverVerification(cleanId, {
        reason: finalReason,
        rejectedDocs: rejectedDocKeys,
        notes: customRejectionNote,
        requireReupload: true
      });
    }

    setIsRejecting(false);
    setRejectModalDriver(null);
    alert(`🚫 Driver verification marked as Rejected.\n\nDriver "${rejectModalDriver.name}" has been notified to re-upload: ${rejectedDocKeys.map(k => k.toUpperCase()).join(', ')}.`);
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm(`Are you sure you want to permanently delete driver #${driverId}?`)) {
      setDriverList(prev => prev.filter(d => d.id !== driverId && d.driverId !== driverId));
      if (deleteDriver) {
        deleteDriver(driverId);
      }
    }
  };

  const handleDocFileUpload = async (e, fieldKey, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(prev => ({ ...prev, [fieldKey]: 'validating' }));

    if (validateDocumentQuality) {
      const valRes = await validateDocumentQuality(file, docType);
      if (valRes && valRes.valid === false) {
        alert(`⚠️ Document Notice: ${valRes.message || 'Image quality check failed'}`);
      }
    }

    setUploadProgress(prev => ({ ...prev, [fieldKey]: 'uploading' }));

    if (fieldKey === 'profilePhotoUri' && uploadDriverPhoto) {
      const res = await uploadDriverPhoto(file, '', addDriverForm.phone);
      if (res && res.success) {
        setAddDriverForm(prev => ({ ...prev, profilePhotoUri: res.photoUrl }));
        setUploadProgress(prev => ({ ...prev, [fieldKey]: 'done' }));
        return;
      }
    }

    if (uploadDocumentFile) {
      const res = await uploadDocumentFile(file);
      if (res && res.success) {
        setAddDriverForm(prev => ({ ...prev, [fieldKey]: res.url }));
        setUploadProgress(prev => ({ ...prev, [fieldKey]: 'done' }));
      } else {
        setUploadProgress(prev => ({ ...prev, [fieldKey]: 'error' }));
      }
    }
  };

  const handleCreateDriverSubmit = async (e) => {
    e.preventDefault();
    if (!addDriverForm.name.trim() || !addDriverForm.phone.trim()) {
      alert('Driver Name and Phone Number are required.');
      return;
    }
    setIsSubmittingDriver(true);

    const isPass = serviceTab === 'passengers';
    const driverPayload = {
      name: addDriverForm.name.trim(),
      phone: addDriverForm.phone.trim(),
      email: addDriverForm.email.trim() || `${addDriverForm.phone.trim()}@porter.in`,
      dob: addDriverForm.dob || '1995-01-01',
      gender: addDriverForm.gender || 'Male',
      serviceType: isPass ? 'PASSENGER' : 'OUR_SERVICES',
      serviceCategory: isPass ? 'Passenger Rides' : 'Our Services',
      vehicleType: addDriverForm.vehicleType,
      vehicle: addDriverForm.vehicleType,
      vehicleNumber: addDriverForm.vehicleNumber.trim().toUpperCase(),
      rcNumber: addDriverForm.rcNumber.trim().toUpperCase(),
      licenseNumber: addDriverForm.licenseNumber.trim().toUpperCase(),
      aadhaarNumber: addDriverForm.aadhaarNumber.trim(),
      addressLine1: addDriverForm.addressLine1.trim(),
      city: addDriverForm.city.trim() || 'Hyderabad',
      state: addDriverForm.state.trim() || 'Telangana',
      pincode: addDriverForm.pincode.trim() || '500081',
      bankName: addDriverForm.bankName.trim(),
      accountHolderName: addDriverForm.accountHolderName.trim() || addDriverForm.name.trim(),
      accountNumber: addDriverForm.accountNumber.trim(),
      ifscCode: addDriverForm.ifscCode.trim().toUpperCase(),
      status: 'offline',
      kyc: 'approved',
      kycStatus: 'approved',
      profilePhotoUri: addDriverForm.profilePhotoUri,
      licenseUri: addDriverForm.licenseUri,
      rcUri: addDriverForm.rcUri,
      aadhaarUri: addDriverForm.aadhaarUri,
      bankPassbookUri: addDriverForm.bankPassbookUri,
    };

    const res = await createDriverManually(driverPayload);
    setIsSubmittingDriver(false);
    if (res && res.success) {
      alert(`✅ Driver "${addDriverForm.name}" created and verified successfully!`);
      setShowAddDriverModal(false);
      setAddDriverForm({
        name: '',
        phone: '',
        email: '',
        dob: '',
        gender: 'Male',
        serviceType: isPass ? 'PASSENGER' : 'OUR_SERVICES',
        vehicleType: isPass ? 'Cab (Sedan)' : 'Tata Ace (750kg)',
        vehicleNumber: '',
        rcNumber: '',
        licenseNumber: '',
        aadhaarNumber: '',
        addressLine1: '',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '',
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        profilePhotoUri: '',
        licenseUri: '',
        rcUri: '',
        aadhaarUri: '',
        bankPassbookUri: '',
      });
      setUploadProgress({});
      fetchDrivers();
    } else {
      alert(`⚠️ Failed to create driver: ${res?.message || 'Server error'}`);
    }
  };

  const getDriverTrips = (name) => {
    if (!name) return [];
    return orders.filter(o => o.driver === name || o.driverName === name);
  };

  return (
    <div className="animate-fade">
      {/* ─── 1. TOP DEDICATED TABS: OUR SERVICES vs PASSENGER DRIVERS ─── */}
      <div className="tab-group" style={{ marginBottom: '18px', display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className={`tab-btn ${serviceTab === 'our-services' ? 'active' : ''}`}
          onClick={() => handleTabChange('our-services')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '700',
            borderBottom: serviceTab === 'our-services' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <Truck size={17} color={serviceTab === 'our-services' ? 'var(--primary)' : 'currentColor'} />
          <span>Our Services Drivers (Goods, Freight, Trucks, Parcel)</span>
          <span className="badge-count" style={{ marginLeft: '4px' }}>
            {ourServicesCount}
          </span>
        </button>

        <button
          type="button"
          className={`tab-btn ${serviceTab === 'passengers' ? 'active' : ''}`}
          onClick={() => handleTabChange('passengers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '700',
            borderBottom: serviceTab === 'passengers' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <Car size={17} color={serviceTab === 'passengers' ? 'var(--primary)' : 'currentColor'} />
          <span>Passenger Drivers (Bike Taxi, Auto Taxi, Cabs)</span>
          <span className="badge-count" style={{ marginLeft: '4px' }}>
            {passengersCount}
          </span>
        </button>
      </div>

      {/* ─── 2. FILTERS BAR: STATUS, KYC, SEARCH & ADD BUTTON ─── */}
      <div className="table-container">
        <div 
          className="table-header-controls" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px',
            marginBottom: '16px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Status:</span>
              <select
                className="custom-input"
                style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', minWidth: '120px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* KYC Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>KYC:</span>
              <select
                className="custom-input"
                style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', minWidth: '130px' }}
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <option value="all">All KYC</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '220px', maxWidth: '380px' }}>
              <Search className="header-search-icon" size={14} />
              <input
                type="text"
                placeholder="Search ID, Name, Phone, Vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              className="action-btn"
              onClick={fetchDrivers}
              title="Refresh drivers list"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={15} className={loadingDrivers ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Right Action: Add Driver */}
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600' }}
            onClick={() => {
              setAddDriverForm(prev => ({
                ...prev,
                serviceType: serviceTab === 'passengers' ? 'PASSENGER' : 'OUR_SERVICES',
                vehicleType: serviceTab === 'passengers' ? 'Cab' : 'Tata Ace (750kg)'
              }));
              setShowAddDriverModal(true);
            }}
          >
            <Plus size={16} /> Add Driver
          </button>
        </div>

        {/* ─── 3. TABLE: ID | Name | Phone | Vehicle | KYC Status | Online | Actions ─── */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>KYC Status</th>
              <th>Online</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingDrivers ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                  Loading {serviceTab === 'passengers' ? 'passenger drivers' : 'our services drivers'}...
                </td>
              </tr>
            ) : driverList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No {serviceTab === 'passengers' ? 'passenger drivers' : 'goods / freight drivers'} found for current filters.
                </td>
              </tr>
            ) : (
              driverList.map(driver => {
                const isOnline = driver.status === 'online';
                const isKycAppr = driver.kyc === 'approved' || driver.kycStatus === 'approved' || driver.kyc === 'verified' || driver.docs?.verified;
                const isKycRej = driver.kyc === 'rejected' || driver.kycStatus === 'rejected' || driver.status === 'rejected';
                const isKycPend = !isKycAppr && !isKycRej;

                return (
                  <tr key={driver.id || driver.driverId}>
                    {/* ID */}
                    <td>
                      <span 
                        className="badge" 
                        style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: '700', 
                          fontSize: '11px',
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)'
                        }}
                      >
                        {driver.id || driver.driverId || 'DRV-N/A'}
                      </span>
                    </td>

                    {/* Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          overflow: 'hidden', 
                          backgroundColor: '#F1F5F9', 
                          flexShrink: 0, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid var(--border-color)'
                        }}>
                          {driver.profilePhotoUri && !driver.profilePhotoUri.startsWith('blob:') ? (
                            <img 
                              src={driver.profilePhotoUri} 
                              alt={driver.name || 'Driver'} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                              {(driver.name || 'D')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                            {driver.name ? driver.name : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>null</span>}
                          </div>
                          {driver.email && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{driver.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ fontWeight: '500' }}>
                      {driver.phone || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                    </td>

                    {/* Vehicle */}
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {driver.vehicle || driver.vehicleType || 'N/A'}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {driver.vehicleNumber || driver.vehicleNo || 'No Plate'}
                      </div>
                    </td>

                    {/* KYC Status */}
                    <td>
                      {isKycAppr ? (
                        <span className="badge badge-online" style={{ backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                          ✓ Approved
                        </span>
                      ) : isKycRej ? (
                        <span className="badge badge-cancelled" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                          ✕ Rejected
                        </span>
                      ) : (
                        <span className="badge badge-pending" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                          ● Pending
                        </span>
                      )}
                    </td>

                    {/* Online */}
                    <td>
                      {isOnline ? (
                        <span className="badge badge-online" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                          Online
                        </span>
                      ) : (
                        <span className="badge badge-offline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#94A3B8', display: 'inline-block' }}></span>
                          Offline
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-row" style={{ justifyContent: 'flex-end', display: 'flex', gap: '6px' }}>
                        <button
                          className="action-btn btn-view"
                          title="View Driver Details & Documents"
                          onClick={() => handleOpenDetails(driver)}
                        >
                          <Eye size={15} />
                        </button>

                        {/* If KYC is pending or unverified, show quick Approve & Reject buttons */}
                        {isKycPend && (
                          <>
                            <button
                              className="action-btn"
                              style={{ color: '#059669', backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }}
                              title="Approve KYC"
                              onClick={() => handleApprove(driver.id || driver.driverId)}
                            >
                              <Check size={15} />
                            </button>
                            <button
                              className="action-btn"
                              style={{ color: '#DC2626', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                              title="Reject KYC"
                              onClick={() => openRejectModal(driver)}
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}

                        <button
                          className="action-btn"
                          style={{ color: '#DC2626', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}
                          title="Delete Driver"
                          onClick={() => handleDeleteDriver(driver.id || driver.driverId)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── DRIVER DETAIL MODAL (DRAWER) ─── */}
      {selectedDriver && (
        <div className="modal-backdrop" onClick={() => setSelectedDriver(null)}>
          <div className="modal-container" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Driver Profile - {selectedDriver.name || 'Driver'}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedDriver(null)}><X size={20} /></button>
            </div>

            {/* Modal Sub-Tabs */}
            <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <button className={`tab-btn ${detailTab === 'overview' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('overview')}>Overview</button>
              <button className={`tab-btn ${detailTab === 'trips' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('trips')}>Trips History</button>
              <button className={`tab-btn ${detailTab === 'docs' ? 'active' : ''}`} style={{ fontSize: '13px', padding: '10px 14px' }} onClick={() => setDetailTab('docs')}>Documents</button>
            </div>

            <div className="modal-body" style={{ minHeight: '300px' }}>
              {/* TAB 1: OVERVIEW */}
              {detailTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                      {selectedDriver.profilePhotoUri ? (
                        <img src={selectedDriver.profilePhotoUri} alt={selectedDriver.name || 'Driver'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>{(selectedDriver.name || 'D')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedDriver.name || 'Driver'}</h3>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {selectedDriver.phone}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> {selectedDriver.vehicleType || selectedDriver.vehicle} ({selectedDriver.vehicleNumber || selectedDriver.vehicleNo || 'N/A'})</span>
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                        <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: '700' }}>
                          {selectedDriver.serviceCategory || (selectedDriver.serviceType === 'PASSENGER' ? 'Passenger Rides' : 'Our Services')}
                        </span>
                        <span className={`badge ${selectedDriver.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                          {selectedDriver.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={15} fill="#F59E0B" color="#F59E0B" /> {selectedDriver.rating ? parseFloat(selectedDriver.rating).toFixed(1) : '4.8'}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trips Completed</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{selectedDriver.trips || 0}</div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>KYC Status</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', textTransform: 'capitalize', color: selectedDriver.kyc === 'approved' || selectedDriver.kycStatus === 'approved' ? '#059669' : '#D97706' }}>
                        {selectedDriver.kyc || selectedDriver.kycStatus || 'Pending'}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Vehicle Specifications</h4>
                    <table className="custom-table" style={{ border: '1px solid var(--border-color)' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)', width: '30%' }}>Service Category</td>
                          <td>{selectedDriver.serviceCategory || (selectedDriver.serviceType === 'PASSENGER' ? 'Passenger Rides' : 'Our Services')}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Vehicle Type</td>
                          <td>{selectedDriver.vehicleType || selectedDriver.vehicle || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>License Plate</td>
                          <td>{selectedDriver.vehicleNumber || selectedDriver.vehicleNo || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Identity & Bank Details */}
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', marginTop: '10px' }}>Identity & Bank Details</h4>
                    <table className="custom-table" style={{ border: '1px solid var(--border-color)' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)', width: '30%' }}>Email</td>
                          <td>{selectedDriver.email || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Driving License</td>
                          <td>{selectedDriver.licenseNumber || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>RC Number</td>
                          <td>{selectedDriver.rcNumber || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Aadhaar Number</td>
                          <td>{selectedDriver.aadhaarNumber || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600', backgroundColor: 'var(--bg-main)' }}>Bank Name / Account</td>
                          <td>{selectedDriver.bankName ? `${selectedDriver.bankName} (${selectedDriver.accountNumber || 'N/A'})` : 'Not provided'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: TRIPS */}
              {detailTab === 'trips' && (
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Recent Order Logs</h4>
                  {getDriverTrips(selectedDriver.name).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No active or completed orders logged for this driver.
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Route</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDriverTrips(selectedDriver.name).map(trip => (
                            <tr key={trip.id}>
                              <td style={{ fontWeight: '700' }}>#{trip.id}</td>
                              <td>{trip.customer}</td>
                              <td>{trip.pickup ? trip.pickup.split(',')[0] : 'Origin'} → {trip.drop ? trip.drop.split(',')[0] : 'Destination'}</td>
                              <td>₹{trip.amount}</td>
                              <td>
                                <span className="badge badge-online">{trip.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DOCUMENTS */}
              {detailTab === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '14px', margin: 0 }}>KYC Document Scans & Verification</h4>
                    <span className="badge" style={{
                      backgroundColor: selectedDriver.docs?.verified || selectedDriver.kyc === 'approved' ? '#D1FAE5' : '#FEF3C7',
                      color: selectedDriver.docs?.verified || selectedDriver.kyc === 'approved' ? '#10B981' : '#F59E0B',
                      fontWeight: '700'
                    }}>
                      {selectedDriver.docs?.verified || selectedDriver.kyc === 'approved' ? '● Verified Partner' : '● Verification Pending'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* License */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                      <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>Driving License (DL)</span>
                        <span className="badge" style={{ fontSize: '10px' }}>{selectedDriver.docs?.license || 'Pending'}</span>
                      </div>
                      <div style={{ height: '160px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(selectedDriver.licenseUri || selectedDriver.docs?.licenseUrl) ? (
                          <img src={selectedDriver.licenseUri || selectedDriver.docs?.licenseUrl} alt="License Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <FileText size={28} color="#94A3B8" />
                        )}
                      </div>
                    </div>

                    {/* RC */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                      <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>Vehicle RC</span>
                        <span className="badge" style={{ fontSize: '10px' }}>{selectedDriver.docs?.rc || 'Pending'}</span>
                      </div>
                      <div style={{ height: '160px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(selectedDriver.rcUri || selectedDriver.docs?.rcUrl) ? (
                          <img src={selectedDriver.rcUri || selectedDriver.docs?.rcUrl} alt="RC Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <Truck size={28} color="#94A3B8" />
                        )}
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                      <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>Profile Photo</span>
                        <span className="badge badge-online" style={{ fontSize: '10px' }}>Active</span>
                      </div>
                      <div style={{ height: '160px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedDriver.profilePhotoUri ? (
                          <img src={selectedDriver.profilePhotoUri} alt="Face Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <User size={28} color="#94A3B8" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Decision Buttons */}
                  {selectedDriver.kyc !== 'approved' && selectedDriver.kycStatus !== 'approved' && !selectedDriver.docs?.verified && (
                    <div style={{ padding: '16px', border: '1px solid #C084FC', backgroundColor: '#EDE9FE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <ShieldAlert size={20} color="#8B5CF6" />
                        <span style={{ fontSize: '13px', color: '#6B21A8', fontWeight: '600' }}>Admin Verification Decision:</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', backgroundColor: '#10B981', borderColor: '#059669' }} onClick={() => handleApprove(selectedDriver.id || selectedDriver.driverId)}>
                          <Check size={14} /> Approve KYC Verification
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => openRejectModal(selectedDriver)}>
                          <X size={14} /> Reject & Request Re-upload
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDriver(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECT MODAL ─── */}
      {rejectModalDriver && (
        <div className="modal-backdrop" onClick={() => setRejectModalDriver(null)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#DC2626" /> Reject Documents & Request Re-upload
              </h3>
              <button className="modal-close-btn" onClick={() => setRejectModalDriver(null)}><X size={20} /></button>
            </div>

            <form onSubmit={handleConfirmRejection} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '12px', color: '#991B1B', lineHeight: '1.5' }}>
                The driver partner will be required to re-upload clear document scans before verification can be approved.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  Select Documents to Mark for Re-upload <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'license', label: 'Driving License (DL)' },
                    { key: 'rc', label: 'Vehicle Registration (RC)' },
                    { key: 'aadhaar', label: 'Aadhaar Card' },
                    { key: 'permit', label: 'Commercial Road Permit' }
                  ].map(doc => {
                    const isChecked = rejectedDocKeys.includes(doc.key);
                    return (
                      <label
                        key={doc.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: isChecked ? '1px solid #F87171' : '1px solid var(--border-color)',
                          backgroundColor: isChecked ? '#FFF1F2' : 'var(--bg-main)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? '700' : '500',
                          color: isChecked ? '#991B1B' : 'var(--text-color)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setRejectedDocKeys(prev => prev.filter(k => k !== doc.key));
                            } else {
                              setRejectedDocKeys(prev => [...prev, doc.key]);
                            }
                          }}
                        />
                        {doc.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  Primary Rejection Reason
                </label>
                <select
                  value={selectedReasonTemplate}
                  onChange={(e) => setSelectedReasonTemplate(e.target.value)}
                  className="custom-input"
                >
                  <option value="Blurry or unreadable document photo">📷 Blurry or unreadable document photo</option>
                  <option value="Document has expired / validity ended">📅 Document has expired / validity ended</option>
                  <option value="Name / details mismatch between License and RC">⚠️ Name / details mismatch between License and RC</option>
                  <option value="Document image cropped / edges not visible">✂️ Document image cropped / edges not visible</option>
                  <option value="Custom Reason">✏️ Custom Specific Reason</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  Operator Instructions to Driver
                </label>
                <textarea
                  rows="3"
                  value={customRejectionNote}
                  onChange={(e) => setCustomRejectionNote(e.target.value)}
                  placeholder="e.g. Please capture clear physical copies with all 4 corners visible..."
                  className="custom-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModalDriver(null)} disabled={isRejecting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={isRejecting || rejectedDocKeys.length === 0}>
                  {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD DRIVER MODAL ─── */}
      {showAddDriverModal && (
        <div className="modal-backdrop" onClick={() => setShowAddDriverModal(false)}>
          <div className="modal-container" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--primary)" /> Add Driver ({serviceTab === 'passengers' ? 'Passenger Fleet' : 'Our Services Fleet'})
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAddDriverModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateDriverSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={addDriverForm.name}
                    onChange={(e) => setAddDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    className="custom-input"
                  />
                </div>
                <div>
                  <label className="form-label">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="e.g. 9876543210"
                    value={addDriverForm.phone}
                    onChange={(e) => setAddDriverForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    className="custom-input"
                  />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@porter.in"
                    value={addDriverForm.email}
                    onChange={(e) => setAddDriverForm(prev => ({ ...prev, email: e.target.value }))}
                    className="custom-input"
                  />
                </div>
                <div>
                  <label className="form-label">Vehicle Type *</label>
                  <select
                    value={addDriverForm.vehicleType}
                    onChange={(e) => setAddDriverForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="custom-input"
                  >
                    {serviceTab === 'passengers' ? (
                      <>
                        <option value="Cab (Sedan)">Cab (Sedan)</option>
                        <option value="Cab (Hatchback)">Cab (Hatchback)</option>
                        <option value="Cab (SUV)">Cab (SUV)</option>
                        <option value="Auto Taxi">Auto Taxi</option>
                        <option value="Bike Taxi">Bike Taxi</option>
                      </>
                    ) : (
                      <>
                        <option value="Tata Ace (750kg)">Tata Ace (750kg)</option>
                        <option value="2 Wheeler (Goods)">2 Wheeler (Goods)</option>
                        <option value="3 Wheeler (500kg)">3 Wheeler (500kg)</option>
                        <option value="Pickup 8ft (1200kg)">Pickup 8ft (1200kg)</option>
                        <option value="Tata 407 (2500kg)">Tata 407 (2500kg)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="form-label">License Plate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TS 09 AB 1234"
                    value={addDriverForm.vehicleNumber}
                    onChange={(e) => setAddDriverForm(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                    className="custom-input"
                  />
                </div>
                <div>
                  <label className="form-label">Driving License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-1420110012345"
                    value={addDriverForm.licenseNumber}
                    onChange={(e) => setAddDriverForm(prev => ({ ...prev, licenseNumber: e.target.value.toUpperCase() }))}
                    className="custom-input"
                  />
                </div>
              </div>

              {/* Uploads */}
              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>Documents & Photo (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ border: '1px dashed var(--border-color)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>License (DL)</div>
                    <label className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={12} /> {uploadProgress['licenseUri'] === 'done' ? '✓ Uploaded' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDocFileUpload(e, 'licenseUri', 'DRIVING_LICENCE')} />
                    </label>
                  </div>
                  <div style={{ border: '1px dashed var(--border-color)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>Vehicle RC</div>
                    <label className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={12} /> {uploadProgress['rcUri'] === 'done' ? '✓ Uploaded' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDocFileUpload(e, 'rcUri', 'RC')} />
                    </label>
                  </div>
                  <div style={{ border: '1px dashed var(--border-color)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>Profile Photo</div>
                    <label className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={12} /> {uploadProgress['profilePhotoUri'] === 'done' ? '✓ Uploaded' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDocFileUpload(e, 'profilePhotoUri', 'FACE')} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDriverModal(false)} disabled={isSubmittingDriver}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingDriver}>
                  {isSubmittingDriver ? 'Saving Driver...' : 'Create Driver Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}