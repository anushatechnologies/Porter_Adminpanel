import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, MapPin, Truck, Bike, Car, Navigation, Key, Globe, Layers, Settings, X } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';

// Dark Mode Google Maps Styling JSON
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e5dff" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f8fafc" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#38bdf8" }] }
];

export default function LiveTracking() {
  const { drivers, orders, driverLocations, darkMode } = useContext(AppStateContext);

  const [filterType, setFilterType] = useState('All'); // All, Tata Ace, Pickup Truck, Bike
  const [statusFilter, setStatusFilter] = useState('all'); // all, online, offline
  const [searchQuery, setSearchQuery] = useState('');

  // Selected driver for popup details
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  // Map Mode: 'google' or 'vector'
  const [mapMode, setMapMode] = useState('google');

  // Google Maps API Key State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('porter_google_maps_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  // Dynamic status counters
  const activeDeliveriesCount = orders.filter(o => ['transit', 'assigned'].includes(o.status)).length;
  const onlineDriversCount = drivers.filter(d => d.status === 'online').length;

  // Filter list
  const filteredDrivers = drivers.filter(driver => {
    if (statusFilter === 'online' && driver.status !== 'online') return false;
    if (statusFilter === 'offline' && driver.status !== 'offline') return false;
    if (driver.status === 'verification_requests') return false;

    const vType = driver.vehicleType || driver.vehicle || '';
    if (filterType !== 'All' && !vType.toLowerCase().includes(filterType.toLowerCase())) return false;

    const query = searchQuery.toLowerCase();
    return (
      (driver.name || '').toLowerCase().includes(query) ||
      (driver.vehicleNo || driver.vehicleNumber || '').toLowerCase().includes(query) ||
      (driver.phone || '').toLowerCase().includes(query)
    );
  });

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'Bike': return Bike;
      case 'Pickup Truck': return Car;
      default: return Truck;
    }
  };

  const parseSpeed = (d, loc) => {
    // Filter backend static fallback mock speed (24.5) for stationary drivers
    const rawSpeed = loc?.speed !== undefined ? loc.speed : (d?.speed !== undefined ? d.speed : (d?.location?.speed ?? 0));
    if (!rawSpeed || rawSpeed === 0 || rawSpeed === '0' || rawSpeed === 24.5 || rawSpeed === '24.5') return 0;
    const val = parseFloat(rawSpeed);
    return isNaN(val) ? 0 : val;
  };

  // Extract Lat/Lng for Google Maps
  const getDriverLatLng = (d, idx) => {
    const key = d.id || d.driverId;
    const loc = driverLocations[key] || driverLocations[d.id] || driverLocations[d.driverId] || d.location;

    let lat = 17.4483;
    let lng = 78.3915;

    if (loc) {
      if (typeof loc === 'object') {
        const rawLat = parseFloat(loc.lat || loc.latitude || loc.x);
        const rawLng = parseFloat(loc.lng || loc.longitude || loc.y);
        if (rawLat > 10 && rawLat < 35 && rawLng > 60 && rawLng < 95) {
          lat = rawLat;
          lng = rawLng;
        }
      } else if (typeof loc === 'string') {
        const parts = loc.split(',').map(p => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }
    }

    const baseOffsets = [
      { lat: 17.4483, lng: 78.3915, street: 'Madhapur Main Rd' },
      { lat: 17.4350, lng: 78.4100, street: 'Jubilee Hills Checkpost' },
      { lat: 17.4365, lng: 78.3725, street: 'IKEA Store Hyderabad, Raidurg' },
      { lat: 17.4600, lng: 78.3700, street: 'Kukatpally Main Rd' },
      { lat: 17.4500, lng: 78.4300, street: 'Banjara Hills Rd No 1' },
      { lat: 17.4200, lng: 78.4000, street: 'Panjagutta Flyover' }
    ];

    if (lat === 17.4483 && lng === 78.3915) {
      const base = baseOffsets[idx % baseOffsets.length];
      lat = base.lat;
      lng = base.lng;
    }

    const currentSpeed = parseSpeed(d, loc);

    return {
      lat,
      lng,
      speed: currentSpeed,
      angle: loc?.angle || loc?.heading || 0,
      street: loc?.street || 'Hyderabad Active Route'
    };
  };

  // Project coordinates to 800x500 Vector Canvas
  const projectCoords = (rawLoc, idx) => {
    const baseCoords = [
      { x: 260, y: 180, speed: 0, angle: 45, street: 'Banjara Hills Rd No 2' },
      { x: 380, y: 220, speed: 0, angle: 90, street: 'Jubilee Hills Checkpost' },
      { x: 520, y: 310, speed: 0, angle: 120, street: 'Gachibowli Ring Rd' },
      { x: 420, y: 150, speed: 0, angle: 30, street: 'Madhapur Metro Stn' },
      { x: 600, y: 280, speed: 0, angle: 75, street: 'Hitech City Phase 2' },
      { x: 300, y: 320, speed: 0, angle: 60, street: 'Kukatpally Main Rd' }
    ];

    if (!rawLoc) return baseCoords[idx % baseCoords.length];

    let rawX = parseFloat(rawLoc.x || rawLoc.lat || rawLoc.latitude || 0);
    let rawY = parseFloat(rawLoc.y || rawLoc.lng || rawLoc.longitude || 0);

    const currentSpeed = parseSpeed(rawLoc);

    if (rawX > 10 && rawX < 35 && rawY > 60 && rawY < 95) {
      const lat = rawX;
      const lng = rawY;
      const minLat = 17.35, maxLat = 17.52;
      const minLng = 78.30, maxLng = 78.55;

      const normX = Math.min(Math.max((lng - minLng) / (maxLng - minLng), 0), 1);
      const normY = Math.min(Math.max((maxLat - lat) / (maxLat - minLat), 0), 1);

      const pxX = 140 + normX * 520;
      const pxY = 90 + normY * 320;

      return {
        x: pxX,
        y: pxY,
        speed: currentSpeed,
        angle: rawLoc.angle || rawLoc.heading || 0,
        street: rawLoc.street || 'Hyderabad Active Route'
      };
    }

    if (rawX >= 50 && rawX <= 750 && rawY >= 50 && rawY <= 450) {
      return {
        x: rawX,
        y: rawY,
        speed: currentSpeed,
        angle: rawLoc.angle || rawLoc.heading || 0,
        street: rawLoc.street || 'Hyderabad Active Route'
      };
    }

    return baseCoords[idx % baseCoords.length];
  };

  const getDriverCoords = (d, idx) => {
    const key = d.id || d.driverId;
    const rawLoc = driverLocations[key] || driverLocations[d.id] || driverLocations[d.driverId] || d.location;
    return projectCoords(rawLoc, idx);
  };

  // Google Maps JS Script Dynamic Loader
  useEffect(() => {
    if (mapMode !== 'google') return;

    let isMounted = true;
    const scriptId = 'google-maps-js-sdk';

    // Intercept Google Maps Auth/Billing failures automatically
    window.gm_authFailure = () => {
      console.warn('Google Maps API Key requires billing or key setup. Auto-switching to Vector Map.');
      setMapMode('vector');
    };

    const initMap = async () => {
      if (!isMounted || !mapRef.current) return;
      if (window.google && window.google.maps) {
        try {
          let MapClass = window.google.maps.Map;
          if (!MapClass && window.google.maps.importLibrary) {
            const { Map } = await window.google.maps.importLibrary("maps");
            MapClass = Map;
          }

          if (MapClass && !mapInstance.current && mapRef.current) {
            mapInstance.current = new MapClass(mapRef.current, {
              center: { lat: 17.4483, lng: 78.3915 }, // Hyderabad Center
              zoom: 13,
              mapId: 'DEMO_MAP_ID', // Official Google Maps Demo Map ID for Advanced Markers
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false
            });
            setGoogleScriptLoaded(true);
          }
        } catch (e) {
          console.warn('Google Maps initialization fallback:', e);
          setMapMode('vector');
        }
      }
    };

    const timer = setTimeout(initMap, 100);

    if (!window.google || !window.google.maps) {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        const keyParam = apiKey ? `&key=${apiKey}` : '';
        script.src = `https://maps.googleapis.com/maps/api/js?v=weekly&loading=async&libraries=marker${keyParam}`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        script.onerror = () => setMapMode('vector');
        document.head.appendChild(script);
      } else {
        existingScript.onload = initMap;
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mapMode, apiKey, darkMode]);

  // Sync Markers on Google Maps
  useEffect(() => {
    if (mapMode !== 'google' || !mapInstance.current || !window.google || !window.google.maps) return;

    const map = mapInstance.current;
    const activeIds = new Set();

    filteredDrivers.forEach((driver, idx) => {
      if (driver.status !== 'online') return;

      const driverKey = String(driver.id || driver.driverId);
      activeIds.add(driverKey);

      const latLng = getDriverLatLng(driver, idx);
      const isSelected = activeMarkerId === driver.id;

      const getInfoWindowHtml = (d, speedVal, latVal, lngVal) => `
        <div style="padding: 8px 12px; font-family: system-ui, sans-serif; min-width: 170px;">
          <strong style="font-size: 13px; color: #0F172A; display: block; margin-bottom: 2px;">${d.name}</strong>
          <span style="font-size: 11px; color: #64748B; display: block;">${d.vehicleNo || d.vehicleNumber || 'Commercial'}</span>
          <div style="margin-top: 6px; padding: 4px 6px; background-color: #F1F5F9; border-radius: 4px; font-family: monospace; font-size: 10px; color: #334155;">
            📍 Lat: ${latVal ? latVal.toFixed(6) : 'N/A'}<br/>📍 Lng: ${lngVal ? lngVal.toFixed(6) : 'N/A'}
          </div>
          <span style="font-size: 11px; color: ${speedVal > 0 ? '#10B981' : '#64748B'}; font-weight: 700; margin-top: 6px; display: block;">
            ${speedVal > 0 ? `In Transit • ${speedVal} km/h` : 'Parked • 0 km/h'}
          </span>
        </div>
      `;

      if (markersRef.current[driverKey]) {
        const existingMarker = markersRef.current[driverKey];
        if (existingMarker.setPosition) {
          existingMarker.setPosition({ lat: latLng.lat, lng: latLng.lng });
        } else if ('position' in existingMarker) {
          existingMarker.position = { lat: latLng.lat, lng: latLng.lng };
        }

        if (existingMarker.getIcon && typeof existingMarker.getIcon === 'function') {
          const currentIcon = existingMarker.getIcon();
          if (currentIcon && typeof currentIcon === 'object') {
            existingMarker.setIcon({
              ...currentIcon,
              rotation: latLng.angle || 0,
              fillColor: isSelected ? '#1E5DFF' : '#10B981'
            });
          }
        }

        if (existingMarker.infoWindow) {
          existingMarker.infoWindow.setContent(getInfoWindowHtml(driver, latLng.speed, latLng.lat, latLng.lng));
        }
      } else {
        let marker = null;
        let isAdvanced = false;

        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          const pinEl = document.createElement('div');
          pinEl.style.width = '24px';
          pinEl.style.height = '24px';
          pinEl.style.borderRadius = '50%';
          pinEl.style.backgroundColor = isSelected ? '#1E5DFF' : '#10B981';
          pinEl.style.border = '2px solid #FFFFFF';
          pinEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
          pinEl.style.display = 'flex';
          pinEl.style.alignItems = 'center';
          pinEl.style.justifyContent = 'center';
          pinEl.style.transform = `rotate(${latLng.angle || 0}deg)`;
          pinEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>`;

          marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: latLng.lat, lng: latLng.lng },
            map: map,
            title: driver.name,
            content: pinEl
          });
          isAdvanced = true;
        } else {
          const markerIcon = {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: isSelected ? '#1E5DFF' : '#10B981',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            rotation: latLng.angle || 0
          };

          marker = new window.google.maps.Marker({
            position: { lat: latLng.lat, lng: latLng.lng },
            map: map,
            title: driver.name,
            icon: markerIcon
          });
        }

        const infoWindow = new window.google.maps.InfoWindow({
          content: getInfoWindowHtml(driver, latLng.speed, latLng.lat, latLng.lng)
        });

        marker.infoWindow = infoWindow;

        const eventType = isAdvanced ? 'gmp-click' : 'click';
        marker.addListener(eventType, () => {
          setActiveMarkerId(driver.id);
          infoWindow.open(map, marker);
        });

        markersRef.current[driverKey] = marker;
      }
    });

    Object.keys(markersRef.current).forEach(id => {
      if (!activeIds.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });
  }, [drivers, driverLocations, mapMode, activeMarkerId]);

  const handleDriverClick = (driverId) => {
    setActiveMarkerId(driverId);
    if (mapMode === 'google' && mapInstance.current && window.google) {
      const d = drivers.find(drv => drv.id === driverId);
      if (d) {
        const idx = drivers.indexOf(d);
        const latLng = getDriverLatLng(d, idx);
        mapInstance.current.panTo({ lat: latLng.lat, lng: latLng.lng });
        mapInstance.current.setZoom(15);
      }
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setApiKey(tempApiKey);
    localStorage.setItem('porter_google_maps_key', tempApiKey);
    setShowKeyModal(false);
    // Reload script with new API key
    const scriptId = 'google-maps-js-sdk';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) oldScript.remove();
    window.location.reload();
  };

  return (
    <div className="map-view-container animate-fade">
      {/* Left sidebar panel */}
      <div className="map-sidebar">
        <div className="map-sidebar-search">
          <div className="search-input-wrapper" style={{ width: '100%' }}>
            <Search className="header-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search active drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
            <select
              className="custom-select"
              style={{ flex: 1, padding: '6px 10px', fontSize: '12px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Vehicles</option>
              <option value="Tata Ace">Tata Ace</option>
              <option value="Pickup Truck">Pickup Truck</option>
              <option value="Bike">Bike</option>
            </select>

            <div style={{ display: 'flex', gap: '2px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', backgroundColor: 'var(--bg-main)' }}>
              <button
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  backgroundColor: statusFilter === 'all' ? (darkMode ? 'var(--bg-card)' : '#FFFFFF') : 'transparent',
                  color: statusFilter === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: statusFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  backgroundColor: statusFilter === 'online' ? (darkMode ? 'var(--bg-card)' : '#FFFFFF') : 'transparent',
                  color: statusFilter === 'online' ? '#10B981' : 'var(--text-muted)',
                  boxShadow: statusFilter === 'online' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
                onClick={() => setStatusFilter('online')}
              >
                On
              </button>
              <button
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  backgroundColor: statusFilter === 'offline' ? (darkMode ? 'var(--bg-card)' : '#FFFFFF') : 'transparent',
                  color: statusFilter === 'offline' ? (darkMode ? '#94A3B8' : '#64748B') : 'var(--text-muted)',
                  boxShadow: statusFilter === 'offline' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
                onClick={() => setStatusFilter('offline')}
              >
                Off
              </button>
            </div>
          </div>
        </div>

        <div className="map-sidebar-list">
          {filteredDrivers.map((driver, idx) => {
            const isOnline = driver.status === 'online';
            const loc = getDriverCoords(driver, idx);

            return (
              <div
                key={driver.id}
                className={`driver-item ${activeMarkerId === driver.id ? 'active' : ''}`}
                onClick={() => handleDriverClick(driver.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: isOnline ? '#D1FAE5' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.createElement(getVehicleIcon(driver.vehicleType || driver.vehicle), { size: 18, color: isOnline ? '#10B981' : '#64748B' })}
                  </div>
                  <span style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isOnline ? '#10B981' : '#64748B', border: '2px solid white' }}></span>
                </div>

                <div className="driver-item-details">
                  <div className="driver-item-name">{driver.name}</div>
                  <div className="driver-item-sub">{driver.vehicleType || driver.vehicle || 'Commercial'} • {driver.vehicleNo || driver.vehicleNumber}</div>
                  {isOnline && (
                    <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Navigation size={10} style={{ transform: `rotate(${loc.angle || 45}deg)` }} /> Active Tracking Online
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isOnline ? '#10B981' : 'var(--text-muted)' }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isOnline ? 'Available' : 'Idle'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="map-canvas-area" style={{ position: 'relative' }}>
        {/* Top Control Bar: Mode Switcher & API Key settings */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setMapMode('google')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mapMode === 'google' ? 'var(--primary)' : 'transparent',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Globe size={14} /> Google Maps
            </button>
            <button
              onClick={() => setMapMode('vector')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mapMode === 'vector' ? 'var(--primary)' : 'transparent',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} /> Vector Map
            </button>
          </div>

          {mapMode === 'google' && (
            <button
              onClick={() => setShowKeyModal(true)}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Configure Google Maps API Key"
            >
              <Key size={14} color="#F59E0B" /> API Key
            </button>
          )}
        </div>

        {/* 1. Real Google Maps Container */}
        {mapMode === 'google' ? (
          <div
            ref={mapRef}
            style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
          />
        ) : (
          /* 2. Vector Map SVG Fallback */
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 500"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <rect width="800" height="500" fill={darkMode ? "#0F172A" : "#F1F5F9"} />

            <path d="M 0,350 C 200,320 350,280 400,220 C 450,160 550,120 800,100" fill="none" stroke={darkMode ? "#1E293B" : "#E2E8F0"} strokeWidth="50" strokeLinecap="round" />
            <path d="M 0,350 C 200,320 350,280 400,220 C 450,160 550,120 800,100" fill="none" stroke={darkMode ? "#1E3A8A" : "#BFDBFE"} strokeWidth="20" strokeLinecap="round" />

            <circle cx="250" cy="180" r="120" className="map-zone" fill="rgba(30, 93, 255, 0.03)" />
            <text x="250" y="100" fill="#94A3B8" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.5">ZONE A - BANJARA HILLS</text>

            <circle cx="550" cy="320" r="140" className="map-zone" fill="rgba(16, 185, 129, 0.03)" />
            <text x="550" y="240" fill="#94A3B8" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.5">ZONE B - GACHIBOWLI</text>

            <path d="M 50,50 L 750,450" className="map-road-main" />
            <path d="M 50,450 L 750,50" className="map-road-main" />
            <path d="M 400,50 L 400,450" className="map-road-main" />
            <path d="M 50,250 L 750,250" className="map-road-main" />
            <path d="M 200,50 C 200,200 600,200 600,450" className="map-road-main" />

            <path d="M 100,100 L 100,400" className="map-road-minor" />
            <path d="M 700,100 L 700,400" className="map-road-minor" />
            <path d="M 250,250 L 250,380" className="map-road-minor" />
            <path d="M 550,120 L 550,250" className="map-road-minor" />

            <text x="140" y="130" transform="rotate(30 140 130)" fill="#64748B" fontSize="10" fontWeight="600">Outer Ring Road</text>
            <text x="500" y="260" fill="#64748B" fontSize="10" fontWeight="600">Hitech City Road</text>

            {filteredDrivers.map((driver, idx) => {
              if (driver.status !== 'online') return null;
              const loc = getDriverCoords(driver, idx);
              const isSelected = activeMarkerId === driver.id;
              const VehicleIcon = getVehicleIcon(driver.vehicleType || driver.vehicle);

              return (
                <g
                  key={driver.id}
                  className="map-marker"
                  transform={`translate(${loc.x}, ${loc.y})`}
                  onClick={() => handleDriverClick(driver.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle r="12" fill="none" stroke="var(--primary)" strokeWidth="2" className="map-marker-pulse" />
                  <path d="M 0,0 C -8,-8 -12,-16 -12,-24 C -12,-34 -4,-42 8,-42 C 20,-42 28,-34 28,-24 C 28,-16 24,-8 16,0 Z" fill="white" transform="translate(-8, 14)" opacity="0.15" />
                  <path d="M 0,0 C -8,-8 -12,-16 -12,-24 C -12,-34 -4,-42 8,-42 C 20,-42 28,-34 28,-24 C 28,-16 24,-8 16,0 Z" fill={isSelected ? '#1E5DFF' : '#1E293B'} transform="translate(-8, 12)" />

                  <g transform="translate(0, -18)" fill="none">
                    <circle cx="0" cy="0" r="10" fill="white" />
                    <g transform="translate(-6, -6)">
                      <VehicleIcon size={12} color={isSelected ? '#1E5DFF' : '#1E293B'} />
                    </g>
                  </g>
                </g>
              );
            })}

            {activeMarkerId && (
              (() => {
                const driverIdx = filteredDrivers.findIndex(d => d.id === activeMarkerId);
                const driver = filteredDrivers.find(d => d.id === activeMarkerId);
                if (!driver) return null;
                const loc = getDriverCoords(driver, driverIdx >= 0 ? driverIdx : 0);

                const popupWidth = 220;
                const popupHeight = 150;
                const popupX = Math.min(Math.max(loc.x - popupWidth / 2, 10), 800 - popupWidth - 10);
                const popupY = Math.min(Math.max(loc.y - popupHeight - 20, 10), 500 - popupHeight - 10);

                return (
                  <foreignObject
                    x={popupX}
                    y={popupY}
                    width={popupWidth}
                    height={popupHeight}
                    style={{ overflow: 'visible', zIndex: 100 }}
                  >
                    <div className="map-popup" style={{ position: 'static', width: '100%', margin: 0, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{driver.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{driver.vehicleNo || driver.vehicleNumber}</div>
                        </div>
                        <button onClick={() => setActiveMarkerId(null)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <MapPin size={12} color="var(--primary)" />
                          <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{loc.street || 'Hyderabad Active Route'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>SPEED</div>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginTop: '1px', color: 'var(--text-main)' }}>{loc.speed || 30} km/h</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>STATUS</div>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginTop: '1px', textAlign: 'right', color: '#10B981' }}>{driver.status}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </foreignObject>
                );
              })()
            )}
          </svg>
        )}

        {/* Floating panel HUD (Dynamic Counters) */}
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: 'white', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '16px', alignItems: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>{activeDeliveriesCount} ACTIVE DELIVERIES</span>
          </div>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)' }}></div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'inline-block' }}></span>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>{onlineDriversCount} DRIVERS ONLINE</span>
          </div>
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowKeyModal(false)} style={{ zIndex: 300 }}>
          <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="#F59E0B" /> Google Maps API Key
              </h3>
              <button className="modal-close-btn" onClick={() => setShowKeyModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveApiKey} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Enter your Google Maps JavaScript API Key to enable real Google Maps satellite/roadmap tiles and location search.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowKeyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Key & Reload Map</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}