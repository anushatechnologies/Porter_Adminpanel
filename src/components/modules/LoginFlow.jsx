import React, { useState, useContext, useEffect } from 'react';
import { Mail, Lock, Phone, ArrowLeft, ShieldCheck, User, Building2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AppStateContext } from '../../context/AppState';
import logoImg from '../../assets/logo.jpg';

export default function LoginFlow() {
  const { handleLogin, handleSignup, verifyOtp, handleForgotPassword, handleResetPassword, bypassLogin } = useContext(AppStateContext);
  const [step, setStep] = useState('login'); // login, signup, otp, signup-success, forgot, forgot-otp, reset
  const [email, setEmail] = useState('admin@porter.com');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Reset password state
  const [resetData, setResetData] = useState({ email: '', newPassword: '', confirmNewPassword: '' });
  const [resetError, setResetError] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: 'Fleet Manager',
    password: '',
    confirmPassword: ''
  });
  const [signupError, setSignupError] = useState('');

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if ((step === 'otp' || step === 'signup-otp') && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setResetError('');
    if (email && password) {
      const result = await handleLogin(email, password);
      if (!result.success) {
        setSignupError(result.message);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const onOtpSubmit = (e) => {
    e.preventDefault();
    // In future, if 2FA is needed for login, verify here. For now, login doesn't need OTP.
    handleLogin(email, password);
  };

  const onSignupOtpSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    const result = await verifyOtp(email, otp.join(''));
    if (result.success) {
      setStep('signup-success');
    } else {
      setSignupError(result.message);
    }
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetData.email) {
      setResetError('Please enter your email.');
      return;
    }
    const result = await handleForgotPassword(resetData.email);
    if (result.success) {
      setStep('forgot-otp');
      setTimer(59);
      setOtp(['', '', '', '']);
    } else {
      setResetError(result.message || 'Failed to send OTP.');
    }
  };

  const onForgotOtpSubmit = (e) => {
    e.preventDefault();
    setResetError('');
    if (otp.join('').length !== 4) {
      setResetError('Please enter a valid 4-digit OTP.');
      return;
    }
    setStep('reset');
  };

  const onResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (resetData.newPassword !== resetData.confirmNewPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    if (resetData.newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    const result = await handleResetPassword(resetData.email, otp.join(''), resetData.newPassword);
    if (result.success) {
      setStep('login');
      setEmail(resetData.email);
      setPassword('');
      setResetError('');
    } else {
      setResetError(result.message || 'Failed to reset password.');
    }
  };

  const handleSignupChange = (field, value) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    setSignupError('');
  };

  const onSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupData.password.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }
    
    const result = await handleSignup(signupData);
    if (result.success) {
      setEmail(signupData.email);
      setStep('signup-otp');
      setTimer(59);
      setOtp(['', '', '', '']);
    } else {
      setSignupError(result.message);
    }
  };

  const goToLogin = () => {
    setStep('login');
    setSignupError('');
  };

  const stepTitles = {
    login: { title: 'Welcome Back', sub: 'Logistics & Fleet Operator Console' },
    signup: { title: 'Create Account', sub: 'Register as an Operator or Fleet Manager' },
    'signup-otp': { title: 'Verify Your Email', sub: `OTP sent to ${signupData.email || 'your email'}` },
    'signup-success': { title: 'Account Created!', sub: 'Your operator account is ready.' },
    otp: { title: 'Security Verification', sub: 'We sent a 4-digit code to your email' },
    forgot: { title: 'Forgot Password?', sub: 'Enter your email to receive recovery instructions' },
    'forgot-otp': { title: 'Verify Your Email', sub: `OTP sent to ${resetData.email || 'your email'}` },
    reset: { title: 'Reset Password', sub: 'Create a secure password for your operator account' },
  };

  const current = stepTitles[step] || stepTitles['login'];

  return (
    <div className="login-bg">
      <div className="login-card animate-fade" style={{ maxWidth: step === 'signup' ? '480px' : '420px' }}>
        <div className="login-header" style={{ alignItems: 'center' }}>
          <img src={logoImg} alt="Anusha Porter Logo" style={{ height: '80px', width: '80px', objectFit: 'contain', marginBottom: '8px' }} />
          <div className="login-logo">ANUSHA<span>PORTER</span></div>
          <h2 className="login-title">{current.title}</h2>
          <p className="login-subtitle">{current.sub}</p>
        </div>

        {/* ─── LOGIN STEP ─── */}
        {step === 'login' && (
          <form className="login-form" onSubmit={onLoginSubmit}>
            <div className="login-input-group">
              <label>Operator Email</label>
              <div className="login-input-wrapper">
                <Mail className="login-icon" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@porter.com" required />
              </div>
            </div>

            <div className="login-input-group">
              <label>Security Password</label>
              <div className="login-input-wrapper">
                <Lock className="login-icon" size={18} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-extra">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} />
                Remember this device
              </label>
              <span className="login-link" onClick={() => setStep('forgot')}>Forgot Password?</span>
            </div>

            {signupError && (
              <div style={{ color: '#F87171', fontSize: '12px', fontWeight: '600', textAlign: 'center', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
                ⚠ {signupError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Verify Identity
            </button>

            <button 
              type="button" 
              className="btn" 
              onClick={bypassLogin} 
              style={{ 
                justifyContent: 'center', 
                padding: '10px', 
                marginTop: '8px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px dashed rgba(255, 255, 255, 0.2)', 
                color: '#CBD5E1',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Demo Offline Bypass
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '13px', color: '#94A3B8' }}>
              Don't have an account?{' '}
              <span className="login-link" onClick={() => { setStep('signup'); setSignupError(''); }} style={{ fontWeight: '600' }}>
                Create Account
              </span>
            </div>
          </form>
        )}

        {/* ─── SIGNUP STEP ─── */}
        {step === 'signup' && (
          <form className="login-form" onSubmit={onSignupSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="login-input-group" style={{ margin: 0 }}>
                <label>Full Name</label>
                <div className="login-input-wrapper">
                  <User className="login-icon" size={17} />
                  <input type="text" value={signupData.fullName} onChange={e => handleSignupChange('fullName', e.target.value)} placeholder="Rajesh Goud" required />
                </div>
              </div>

              <div className="login-input-group" style={{ margin: 0 }}>
                <label>Phone Number</label>
                <div className="login-input-wrapper">
                  <Phone className="login-icon" size={17} />
                  <input type="tel" value={signupData.phone} onChange={e => handleSignupChange('phone', e.target.value)} placeholder="+91 9XXXXXXXXX" required />
                </div>
              </div>
            </div>

            <div className="login-input-group">
              <label>Email Address</label>
              <div className="login-input-wrapper">
                <Mail className="login-icon" size={17} />
                <input type="email" value={signupData.email} onChange={e => handleSignupChange('email', e.target.value)} placeholder="name@anushaporter.com" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="login-input-group" style={{ margin: 0 }}>
                <label>Company / Depot</label>
                <div className="login-input-wrapper">
                  <Building2 className="login-icon" size={17} />
                  <input type="text" value={signupData.company} onChange={e => handleSignupChange('company', e.target.value)} placeholder="Hyderabad Central" required />
                </div>
              </div>

              <div className="login-input-group" style={{ margin: 0 }}>
                <label>Role</label>
                <div className="login-input-wrapper" style={{ padding: 0 }}>
                  <select
                    value={signupData.role}
                    onChange={e => handleSignupChange('role', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', padding: '10px 12px 10px 40px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    required
                  >
                    <option value="Super Admin" style={{ background: '#1e293b' }}>Super Admin</option>
                    <option value="Fleet Manager" style={{ background: '#1e293b' }}>Fleet Manager</option>
                    <option value="Support Agent" style={{ background: '#1e293b' }}>Support Agent</option>
                    <option value="Finance Officer" style={{ background: '#1e293b' }}>Finance Officer</option>
                  </select>
                  <User className="login-icon" size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="login-input-group" style={{ margin: 0 }}>
                <label>Password</label>
                <div className="login-input-wrapper">
                  <Lock className="login-icon" size={17} />
                  <input type={showPass ? 'text' : 'password'} value={signupData.password} onChange={e => handleSignupChange('password', e.target.value)} placeholder="Min 8 chars" required />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="login-input-group" style={{ margin: 0 }}>
                <label>Confirm Password</label>
                <div className="login-input-wrapper">
                  <Lock className="login-icon" size={17} />
                  <input type={showConfirmPass ? 'text' : 'password'} value={signupData.confirmPassword} onChange={e => handleSignupChange('confirmPassword', e.target.value)} placeholder="Repeat password" required />
                  <button type="button" onClick={() => setShowConfirmPass(p => !p)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {signupError && (
              <div style={{ color: '#F87171', fontSize: '12px', fontWeight: '600', textAlign: 'center', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
                ⚠ {signupError}
              </div>
            )}

            <div style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', lineHeight: '1.5' }}>
              By creating an account, you agree to the{' '}
              <span className="login-link" style={{ fontSize: '11px', cursor: 'pointer' }} onClick={() => window.open('/privacy-policy', '_blank')}>Terms of Service</span>
              {' '}and{' '}
              <span className="login-link" style={{ fontSize: '11px', cursor: 'pointer' }} onClick={() => window.open('/privacy-policy', '_blank')}>Privacy Policy</span>.
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Create Operator Account
            </button>

            <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center', backgroundColor: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }} onClick={goToLogin}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}

        {/* ─── SIGNUP OTP STEP ─── */}
        {step === 'signup-otp' && (
          <form className="login-form" onSubmit={onSignupOtpSubmit}>
            <div className="otp-box">
              {otp.map((digit, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength="1" className="otp-input" value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && digit === '' && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus(); }}
                  required />
              ))}
            </div>

            <div className="login-extra" style={{ justifyContent: 'center', gap: '6px', color: '#94A3B8' }}>
              {timer > 0 ? (
                <span>Resend code in <strong style={{ color: 'white' }}>{timer}s</strong></span>
              ) : (
                <span className="login-link" onClick={() => { setTimer(59); setOtp(['', '', '', '']); }}>Resend OTP</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', gap: '10px' }}>
              <ShieldCheck size={18} /> Verify & Activate Account
            </button>

            <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center', backgroundColor: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setStep('signup')}>
              <ArrowLeft size={16} /> Back
            </button>
          </form>
        )}

        {/* ─── SIGNUP SUCCESS STEP ─── */}
        {step === 'signup-success' && (
          <div className="login-form" style={{ textAlign: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2 size={64} color="#10B981" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.7' }}>
                Welcome, <strong style={{ color: 'white' }}>{signupData.fullName}</strong>!<br />
                Your <strong style={{ color: 'var(--primary)' }}>{signupData.role}</strong> account has been created and is pending admin approval.
              </p>
            </div>
            <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }} onClick={() => {
              setEmail(signupData.email);
              setPassword('');
              setStep('login');
            }}>
              Proceed to Login
            </button>
          </div>
        )}

        {/* ─── LOGIN OTP STEP ─── */}
        {step === 'otp' && (
          <form className="login-form" onSubmit={onOtpSubmit}>
            <div className="otp-box">
              {otp.map((digit, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength="1" className="otp-input" value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && digit === '' && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus(); }}
                  required />
              ))}
            </div>

            <div className="login-extra" style={{ justifyContent: 'center', gap: '6px', color: '#94A3B8' }}>
              {timer > 0 ? (
                <span>Resend code in <strong style={{ color: 'white' }}>{timer}s</strong></span>
              ) : (
                <span className="login-link" onClick={() => { setTimer(59); setOtp(['', '', '', '']); }}>Resend OTP</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', gap: '10px' }}>
              <ShieldCheck size={18} /> Complete Sign In
            </button>

            <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center', backgroundColor: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setStep('login')}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}

        {/* ─── FORGOT PASSWORD STEP ─── */}
        {step === 'forgot' && (
          <form className="login-form" onSubmit={onForgotSubmit}>
            <div className="login-input-group">
              <label>Email Address</label>
              <div className="login-input-wrapper">
                <Mail className="login-icon" size={18} />
                <input type="email" placeholder="name@anushaporter.com" value={resetData.email} onChange={e => setResetData(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            {resetError && (
              <div style={{ color: '#F87171', fontSize: '12px', fontWeight: '600', textAlign: 'center', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
                ⚠ {resetError}
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Request Reset Link
            </button>
            <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center', backgroundColor: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }} onClick={goToLogin}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}

        {/* ─── FORGOT PASSWORD OTP STEP ─── */}
        {step === 'forgot-otp' && (
          <form className="login-form" onSubmit={onForgotOtpSubmit}>
            <div className="otp-box">
              {otp.map((digit, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength="1" className="otp-input" value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && digit === '' && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus(); }}
                  required />
              ))}
            </div>

            <div className="login-extra" style={{ justifyContent: 'center', gap: '6px', color: '#94A3B8' }}>
              {timer > 0 ? (
                <span>Resend code in <strong style={{ color: 'white' }}>{timer}s</strong></span>
              ) : (
                <span className="login-link" onClick={() => { setTimer(59); setOtp(['', '', '', '']); handleForgotPassword(resetData.email); }}>Resend OTP</span>
              )}
            </div>

            {resetError && (
              <div style={{ color: '#F87171', fontSize: '12px', fontWeight: '600', textAlign: 'center', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
                ⚠ {resetError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', gap: '10px' }}>
              <ShieldCheck size={18} /> Verify Code
            </button>

            <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center', backgroundColor: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setStep('forgot')}>
              <ArrowLeft size={16} /> Back
            </button>
          </form>
        )}

        {/* ─── RESET PASSWORD STEP ─── */}
        {step === 'reset' && (
          <form className="login-form" onSubmit={onResetSubmit}>
            <div className="login-input-group">
              <label>New Password</label>
              <div className="login-input-wrapper">
                <Lock className="login-icon" size={18} />
                <input type={showPass ? 'text' : 'password'} placeholder="Min 8 chars" value={resetData.newPassword} onChange={e => setResetData(p => ({ ...p, newPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="login-input-group">
              <label>Confirm Password</label>
              <div className="login-input-wrapper">
                <Lock className="login-icon" size={18} />
                <input type={showConfirmPass ? 'text' : 'password'} placeholder="Repeat password" value={resetData.confirmNewPassword} onChange={e => setResetData(p => ({ ...p, confirmNewPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShowConfirmPass(p => !p)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {resetError && (
              <div style={{ color: '#F87171', fontSize: '12px', fontWeight: '600', textAlign: 'center', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
                ⚠ {resetError}
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Update Password
            </button>
            <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center', backgroundColor: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }} onClick={goToLogin}>
              <ArrowLeft size={16} /> Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}