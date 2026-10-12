import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Shield, User, BookOpen, Heart, ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin': navigate('/admin'); break;
      case 'teacher': navigate('/teacher'); break;
      case 'student': navigate('/student'); break;
      case 'parent': navigate('/parent'); break;
      default: navigate('/');
    }
  };

  // Quick 1-click Demo Accounts
  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }} className="animate-fade-in">
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-primary-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
              marginBottom: '1rem'
            }}
          >
            <GraduationCap size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Westlake Academic</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            High School Management Portal (Grades 9–12)
          </p>
        </div>

        {/* Login Glass Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-Click Demo Login Bar */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-dim)',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}
            >
              Quick Demo Access (Instant 1-Click Login)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@school.edu', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
              >
                <Shield size={14} color="#f472b6" />
                <span>Admin Vance</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.jenkins@school.edu', 'Teacher@123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
              >
                <BookOpen size={14} color="#818cf8" />
                <span>Dr. Jenkins (Teacher)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('alex.morgan@school.edu', 'Student@123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
              >
                <User size={14} color="#38bdf8" />
                <span>Alex (Grade 10)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('david.morgan@school.edu', 'Parent@123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
              >
                <Heart size={14} color="#34d399" />
                <span>David (Parent)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          School accounts are created by the administration team.
        </div>
      </div>
    </div>
  );
};

export default Login;
