import React, { useEffect, useState } from 'react';
import { Shield, MapPin, Lock, Trash2, Mail, Calendar, ArrowLeft, Building2 } from 'lucide-react';

export default function PrivacyPolicy() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Add page title
    document.title = "Privacy Policy – Anusha Porter Driver";
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@anushaporter.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      color: '#F8FAFC',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* ─── HEADER CONTAINER ─── */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.pathname = '/';
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '10px 16px',
            borderRadius: '12px',
            color: '#94A3B8',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#F8FAFC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            padding: '8px 12px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '18px',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>AP</span>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(to right, #FFFFFF, #94A3B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Anusha Porter</span>
        </div>
      </div>

      {/* ─── MAIN POLICY CARD ─── */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Title */}
        <div style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '24px',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 12px 0',
            color: '#FFFFFF',
            letterSpacing: '-0.5px'
          }}>Privacy Policy</h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#3B82F6',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              <span>Anusha Porter Driver App</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94A3B8',
              fontSize: '14px'
            }}>
              <Calendar size={14} />
              <span>Last Updated: August 10, 2026</span>
            </div>
          </div>
        </div>

        {/* Intro */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.7',
          color: '#CBD5E1',
          marginBottom: '32px'
        }}>
          Anusha Bazaar Technologies Pvt. Ltd. operates the <strong>Anusha Porter Driver</strong> app. We are committed to protecting your privacy. This policy outlines how we collect, use, and secure your personal information to provide efficient delivery and logistics services.
        </p>

        {/* Sections Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}>
          
          {/* Section 1: Information Collection */}
          <div style={{
            display: 'flex',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              height: 'fit-content'
            }}>
              <Shield size={22} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFFFFF' }}>Information We Collect</h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#94A3B8', margin: 0 }}>
                We collect information such as your <strong>name, phone number, driver/vehicle details, order information, and location data</strong> to facilitate seamless driver registration, verification, and order execution.
              </p>
            </div>
          </div>

          {/* Section 2: Location Data */}
          <div style={{
            display: 'flex',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              height: 'fit-content'
            }}>
              <MapPin size={22} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFFFFF' }}>Location Data Usage</h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#94A3B8', margin: 0 }}>
                The app collects your location to provide <strong>real-time driver tracking, order assignment, delivery coordination, and navigation-related services</strong>. 
                <span style={{ display: 'block', marginTop: '8px', color: '#F1F5F9', fontWeight: '500' }}>
                  When required for active driver services, location may be collected while the app is running in the background or is not actively displayed.
                </span>
                Location data may be securely transmitted to our backend systems and authorized service providers required to provide the service. We do not sell location data or use it for advertising.
              </p>
            </div>
          </div>

          {/* Section 3: Data Security */}
          <div style={{
            display: 'flex',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              height: 'fit-content'
            }}>
              <Lock size={22} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFFFFF' }}>Data Security</h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#94A3B8', margin: 0 }}>
                We take industry-standard technical and organizational measures to protect your personal information from unauthorized access, loss, alteration, or misuse.
              </p>
            </div>
          </div>

          {/* Section 4: Data Deletion */}
          <div style={{
            display: 'flex',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              height: 'fit-content'
            }}>
              <Trash2 size={22} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFFFFF' }}>Account & Data Deletion</h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#94A3B8', margin: 0 }}>
                You may request deletion of your account and personal data at any time by contacting our support team. Upon verification, we will purge your data in accordance with regulatory retention policies.
              </p>
            </div>
          </div>

          {/* Section 5: Contact */}
          <div style={{
            display: 'flex',
            gap: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '28px',
            marginTop: '12px'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              height: 'fit-content'
            }}>
              <Building2 size={22} style={{ color: '#8B5CF6' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFFFFF' }}>Contact Information</h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#94A3B8', margin: '0 0 16px 0' }}>
                For questions or deletion requests, please contact:
              </p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#FFFFFF', fontSize: '15px' }}>Anusha Bazaar Technologies Pvt. Ltd.</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Official Operator and Publisher</div>
                </div>
                
                <button
                  onClick={handleCopyEmail}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    border: copied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    color: copied ? '#10B981' : '#60A5FA',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Mail size={14} />
                  <span>{copied ? "Copied!" : "support@anushaporter.com"}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '13px',
          color: '#64748B'
        }}>
          We may update this Privacy Policy from time to time. We encourage drivers to periodically review this page for the latest updates.
        </div>
      </div>
    </div>
  );
}
