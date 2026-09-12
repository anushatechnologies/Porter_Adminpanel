import React, { useState, useContext } from 'react';
import {
  IndianRupee, Save, RotateCcw, Sliders, ShieldAlert,
  CheckCircle2, Clock, MapPin, Zap, TrendingUp, DollarSign,
  AlertCircle, ChevronRight, Percent, Package
} from 'lucide-react';
import { PassengerCarContext } from '../../../../context/PassengerCarContext';

export default function PCPricingHub({ setActiveTab }) {
  const { pricingConfig, updatePricingConfig, formatRupee } = useContext(PassengerCarContext);

  // Local working copy for modifications before publishing
  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(pricingConfig)));
  const [activeTab, setActiveTabLocal] = useState('vehicles'); // 'vehicles' | 'packages' | 'surge' | 'waiting_night' | 'tolls_zones' | 'taxes_commission'
  const [changeReason, setChangeReason] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Handle vehicle pricing change
  const handleVehicleChange = (catId, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: {
        ...prev.vehicles,
        [catId]: {
          ...prev.vehicles[catId],
          [field]: Number(value)
        }
      }
    }));
  };

  // Handle save and publish new version
  const handleSaveAndPublish = (e) => {
    e.preventDefault();
    const reason = changeReason.trim() || 'Updated transportation pricing rules';
    const res = updatePricingConfig(formData, 'Admin User', reason);
    if (res.success) {
      setSaveSuccessMsg(`Pricing published successfully! Version ${res.versionId} is now live.`);
      setChangeReason('');
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Notice & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Dynamic Pricing Engine Hub</h3>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF'
            }}>
              LIVE: {pricingConfig.versionId}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Configure granular rate cards, surge profiles, rental packages, and zone pricing. Modifications create an immutable audit record.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('preview')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sliders size={16} />
            Test in Pricing Preview
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          backgroundColor: '#D1FAE5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={18} />
          {saveSuccessMsg}
        </div>
      )}

      {/* Pricing Sub-Tabs */}
      <div className="tab-group" style={{ margin: 0 }}>
        <button
          className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTabLocal('vehicles')}
        >
          Vehicle Rate Cards & Base
        </button>
        <button
          className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTabLocal('packages')}
        >
          Rental Packages
        </button>
        <button
          className={`tab-btn ${activeTab === 'surge' ? 'active' : ''}`}
          onClick={() => setActiveTabLocal('surge')}
        >
          Surge Pricing Engine
        </button>
        <button
          className={`tab-btn ${activeTab === 'waiting_night' ? 'active' : ''}`}
          onClick={() => setActiveTabLocal('waiting_night')}
        >
          Night & Waiting Charges
        </button>
        <button
          className={`tab-btn ${activeTab === 'tolls_zones' ? 'active' : ''}`}
          onClick={() => setActiveTabLocal('tolls_zones')}
        >
          Zones, Tolls & Airport
        </button>
        <button
          className={`tab-btn ${activeTab === 'taxes_commission' ? 'active' : ''}`}
          onClick={() => setActiveTabLocal('taxes_commission')}
        >
          Taxes & Commission
        </button>
      </div>

      {/* Tab 1: Vehicle Rate Cards & Base Fares */}
      {activeTab === 'vehicles' && (
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
            Base & Per KM Pricing by Vehicle Category
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Formula: If distance ≤ Min KM → Fare = Base Fare. If distance &gt; Min KM → Fare = Base Fare + ((distance - Min KM) × Per KM Rate).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(formData.vehicles || {}).map(vKey => {
              const v = formData.vehicles[vKey];
              return (
                <div
                  key={vKey}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{v.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Cap: {v.maxPassengers} Pax</div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Base Fare (₹)
                    </label>
                    <input
                      type="number"
                      value={v.baseFare}
                      onChange={(e) => handleVehicleChange(vKey, 'baseFare', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Minimum KM
                    </label>
                    <input
                      type="number"
                      value={v.minKm}
                      onChange={(e) => handleVehicleChange(vKey, 'minKm', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Per KM Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={v.perKm}
                      onChange={(e) => handleVehicleChange(vKey, 'perKm', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600', color: '#10B981' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Driver Daily (₹)
                    </label>
                    <input
                      type="number"
                      value={v.driverAllowance}
                      onChange={(e) => handleVehicleChange(vKey, 'driverAllowance', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Per Minute (₹)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={v.perMinute || 0}
                      onChange={(e) => handleVehicleChange(vKey, 'perMinute', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Rental Packages */}
      {activeTab === 'packages' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Hourly Rental Packages</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Customer books vehicle for fixed time and distance blocks. Extra KM and hours billed dynamically.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {formData.rentalPackages?.map((pkg, idx) => (
              <div
                key={pkg.id}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <Package size={20} color="var(--primary)" />
                  <h5 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{pkg.name}</h5>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Base Package Fare (₹)</label>
                    <input
                      type="number"
                      value={pkg.baseFare}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => {
                          const pkgs = [...prev.rentalPackages];
                          pkgs[idx].baseFare = val;
                          return { ...prev, rentalPackages: pkgs };
                        });
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Included KM</label>
                    <input
                      type="number"
                      value={pkg.includedKm}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => {
                          const pkgs = [...prev.rentalPackages];
                          pkgs[idx].includedKm = val;
                          return { ...prev, rentalPackages: pkgs };
                        });
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Extra KM Rate (₹/KM)</label>
                    <input
                      type="number"
                      value={pkg.extraKmRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => {
                          const pkgs = [...prev.rentalPackages];
                          pkgs[idx].extraKmRate = val;
                          return { ...prev, rentalPackages: pkgs };
                        });
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', color: '#10B981' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Extra Hour Rate (₹/hr)</label>
                    <input
                      type="number"
                      value={pkg.extraHourRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => {
                          const pkgs = [...prev.rentalPackages];
                          pkgs[idx].extraHourRate = val;
                          return { ...prev, rentalPackages: pkgs };
                        });
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', color: '#8B5CF6' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Driver Allowance (₹)</label>
                  <input
                    type="number"
                    value={pkg.driverAllowance}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData(prev => {
                        const pkgs = [...prev.rentalPackages];
                        pkgs[idx].driverAllowance = val;
                        return { ...prev, rentalPackages: pkgs };
                      });
                    }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Surge Pricing Engine */}
      {activeTab === 'surge' && (
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
            Dynamic Surge Pricing Profiles & Time Windows
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Control automated demand multipliers applied to Base and Distance fares.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {Object.keys(formData.surgeRules?.modes || {}).map(modeKey => {
              const mode = formData.surgeRules.modes[modeKey];
              const isCurrent = formData.surgeRules.activeMode === modeKey;

              return (
                <div
                  key={modeKey}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${isCurrent ? '#1E5DFF' : 'var(--border-color)'}`,
                    backgroundColor: isCurrent ? '#EFF6FF' : 'var(--bg-main)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14.5px' }}>{mode.label}</div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        surgeRules: {
                          ...prev.surgeRules,
                          activeMode: modeKey,
                          currentMultiplier: mode.multiplier
                        }
                      }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isCurrent ? '#1E5DFF' : '#E2E8F0',
                        color: isCurrent ? '#FFFFFF' : '#475569'
                      }}
                    >
                      {isCurrent ? 'ACTIVE NOW' : 'ACTIVATE'}
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px', minHeight: '36px' }}>
                    {mode.description}
                  </p>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Multiplier Value
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="3.0"
                      value={mode.multiplier}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          surgeRules: {
                            ...prev.surgeRules,
                            currentMultiplier: isCurrent ? val : prev.surgeRules.currentMultiplier,
                            modes: {
                              ...prev.surgeRules.modes,
                              [modeKey]: {
                                ...prev.surgeRules.modes[modeKey],
                                multiplier: val
                              }
                            }
                          }
                        }));
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', fontSize: '14px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Night Charges & Waiting Rules */}
      {activeTab === 'waiting_night' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Night Surcharge Rules */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              Night Time Surcharge
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Automated night fee for rides occurring during late hours (e.g. 11:00 PM – 5:00 AM).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Night Window Start</label>
                  <input
                    type="time"
                    value={formData.nightRules?.start || '23:00'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nightRules: { ...prev.nightRules, start: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Night Window End</label>
                  <input
                    type="time"
                    value={formData.nightRules?.end || '05:00'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nightRules: { ...prev.nightRules, end: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Surcharge Type</label>
                <select
                  value={formData.nightRules?.type || 'fixed'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nightRules: { ...prev.nightRules, type: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                >
                  <option value="fixed">Fixed Charge (Flat ₹)</option>
                  <option value="percentage">Percentage of Fare (%)</option>
                  <option value="per_km">Per KM Surcharge (₹/KM)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formData.nightRules?.type === 'percentage' ? 'Night Percentage (%)' : 'Fixed Night Charge (₹)'}
                </label>
                <input
                  type="number"
                  value={formData.nightRules?.type === 'percentage' ? formData.nightRules.percentage : formData.nightRules.fixedCharge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      nightRules: {
                        ...prev.nightRules,
                        ...(prev.nightRules.type === 'percentage' ? { percentage: val } : { fixedCharge: val })
                      }
                    }));
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>
            </div>
          </div>

          {/* Waiting Time Charges */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              Waiting Time Rules
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Configure driver waiting fee after complimentary grace period.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Free Waiting Minutes (City Ride)</label>
                <input
                  type="number"
                  value={formData.waitingRules?.freeMinutes || 15}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    waitingRules: { ...prev.waitingRules, freeMinutes: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Free Waiting Minutes (Airport Pickup)</label>
                <input
                  type="number"
                  value={formData.waitingRules?.airportFreeMinutes || 30}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    waitingRules: { ...prev.waitingRules, airportFreeMinutes: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Charge per 15 Minutes Waiting (₹)</label>
                <input
                  type="number"
                  value={formData.waitingRules?.ratePer15Min || 50}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    waitingRules: { ...prev.waitingRules, ratePer15Min: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', color: '#1E5DFF' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Zones, Tolls & Airport */}
      {activeTab === 'tolls_zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Airport Surcharges & Parking */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              Airport Transfer Surcharges
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Pickup and drop fees for airport access roads, toll booths, and dedicated terminal parking.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Airport Pickup Surcharge (₹)</label>
                <input
                  type="number"
                  value={formData.airportTransfer?.pickupFee || 150}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    airportTransfer: { ...prev.airportTransfer, pickupFee: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Airport Drop Surcharge (₹)</label>
                <input
                  type="number"
                  value={formData.airportTransfer?.dropFee || 100}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    airportTransfer: { ...prev.airportTransfer, dropFee: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Airport Parking Fee (₹)</label>
                <input
                  type="number"
                  value={formData.airportTransfer?.parkingFee || 100}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    airportTransfer: { ...prev.airportTransfer, parkingFee: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic City Zones */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              Dynamic City Zone Surcharges
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Zones with unique access fees (e.g. IT corridor, Outskirts, Central congestion zones).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(formData.zones || {}).map(zKey => {
                const zone = formData.zones[zKey];
                return (
                  <div
                    key={zKey}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{zone.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zone ID: {zone.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+₹</span>
                      <input
                        type="number"
                        value={zone.surcharge || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            zones: {
                              ...prev.zones,
                              [zKey]: { ...prev.zones[zKey], surcharge: val }
                            }
                          }));
                        }}
                        style={{ width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Taxes & Commission Split */}
      {activeTab === 'taxes_commission' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Goods & Services Tax (GST) */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              Applicable Tax Configuration
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Configure GST percentage dynamically without hardcoding tax rules.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tax Name</label>
                <input
                  type="text"
                  value={formData.taxRules?.name || 'Goods and Services Tax (GST)'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    taxRules: { ...prev.taxRules, name: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tax Rate Percentage (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.taxRules?.percentage || 5}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    taxRules: { ...prev.taxRules, percentage: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', color: '#1E5DFF' }}
                />
              </div>
            </div>
          </div>

          {/* Platform Commission & Driver Payout Split */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              Platform Commission & Driver Split
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Split of gross ride fare between Anusha Porter platform margin and driver partner earnings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Company Platform Commission (%)</label>
                <input
                  type="number"
                  value={formData.commissionRules?.companyRatePercent || 20}
                  onChange={(e) => {
                    const compVal = Number(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      commissionRules: {
                        companyRatePercent: compVal,
                        driverRatePercent: Math.max(0, 100 - compVal)
                      }
                    }));
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', color: '#8B5CF6' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Driver Payout Share (%)</label>
                <input
                  type="number"
                  disabled
                  value={100 - (formData.commissionRules?.companyRatePercent || 20)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '700', backgroundColor: '#F8FAFC' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Save & Publish Bar */}
      <div className="card" style={{ padding: '20px', borderTop: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
            Audit Log Change Reason / Release Note <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Adjusted Sedan per-KM rate from ₹14 to ₹16 for fuel hike"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setFormData(JSON.parse(JSON.stringify(pricingConfig)))}
          >
            Reset Changes
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAndPublish}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: '700' }}
          >
            <Save size={18} />
            Publish New Pricing Version
          </button>
        </div>
      </div>
    </div>
  );
}
