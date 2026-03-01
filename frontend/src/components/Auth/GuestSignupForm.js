import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import AuthLayout from './AuthLayout';
import LoadingTransition from '../LoadingTransition';

const GuestSignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: 'applicant'
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showLoadingTransition, setShowLoadingTransition] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setLoading(true);

    try {
      const response = await authAPI.guestRegister(formData.name, formData.role);

      if (response.success) {
        // Store credentials to display
        setCredentials(response.data.credentials);
        setShowCredentials(true);

        // Store token and user data
        localStorage.setItem('yaake_token', response.data.token);
        localStorage.setItem('yaake_user', JSON.stringify(response.data.user));

        // Auto-navigate after showing credentials for 5 seconds
        setTimeout(() => {
          setShowLoadingTransition(true);
        }, 5000);
      }
    } catch (error) {
      console.error('Guest registration error:', error);
      setApiError(
        error.response?.data?.message ||
        'Guest registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowLoadingTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate('/landing');
  };

  if (showLoadingTransition) {
    return <LoadingTransition onComplete={handleTransitionComplete} />;
  }

  if (showCredentials && credentials) {
    return (
      <AuthLayout
        title="Guest Account Created!"
        subtitle="Save your credentials below"
      >
        <div className="credentials-display">
          <div className="success-banner">
            <span className="success-icon">✅</span>
            <div className="success-content">
              <strong>Welcome to YAAKE!</strong>
              <p>Your guest account has been created successfully.</p>
            </div>
          </div>

          <div className="credentials-box">
            <h3>Your Login Credentials</h3>
            <p className="credentials-note">
              Please save these credentials. You'll need them to log in again.
            </p>

            <div className="credential-item">
              <label>Email:</label>
              <div className="credential-value">
                <code>{credentials.email}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(credentials.email)}
                  className="copy-button"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="credential-item">
              <label>Password:</label>
              <div className="credential-value">
                <code>{credentials.password}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(credentials.password)}
                  className="copy-button"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleContinue} className="continue-button">
            Continue to Dashboard
          </button>

          <p className="auto-redirect-note">
            You'll be automatically redirected in a few seconds...
          </p>
        </div>

        <style>{`
          .credentials-display {
            width: 100%;
          }

          .success-banner {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 18px;
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            border: 2px solid #10B981;
            border-radius: 12px;
            color: #065F46;
            margin-bottom: 24px;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }

          .success-icon {
            font-size: 20px;
            flex-shrink: 0;
          }

          .success-content {
            flex: 1;
          }

          .success-content strong {
            display: block;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #047857;
          }

          .success-content p {
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
          }

          .credentials-box {
            background: #FAFAF8;
            border: 2px solid #E5DDD1;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .credentials-box h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            color: #3E362E;
            font-weight: 700;
          }

          .credentials-note {
            margin: 0 0 20px 0;
            font-size: 14px;
            color: #6B6358;
            line-height: 1.5;
          }

          .credential-item {
            margin-bottom: 16px;
          }

          .credential-item:last-child {
            margin-bottom: 0;
          }

          .credential-item label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #3E362E;
            margin-bottom: 8px;
          }

          .credential-value {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .credential-value code {
            flex: 1;
            padding: 12px 16px;
            background: #FFFFFF;
            border: 1px solid #E5DDD1;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            color: #3E362E;
            word-break: break-all;
          }

          .copy-button {
            padding: 8px 16px;
            background: #B39C7D;
            color: #FFFFFF;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }

          .copy-button:hover {
            background: #9B8A6F;
            transform: translateY(-1px);
          }

          .copy-button:active {
            transform: translateY(0);
          }

          .continue-button {
            width: 100%;
            padding: 14px 20px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: #FFFFFF;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .continue-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
          }

          .continue-button:active {
            transform: translateY(0);
          }

          .auto-redirect-note {
            text-align: center;
            margin-top: 16px;
            font-size: 13px;
            color: #6B6358;
            font-style: italic;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Try YAAKE as Guest"
      subtitle="Quick demo access - no email required"
    >
      <form onSubmit={handleSubmit} className="guest-form">
        {apiError && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <strong>Registration Failed</strong>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <div className="info-banner">
          <span className="info-icon">ℹ️</span>
          <div className="info-content">
            <strong>Guest Account</strong>
            <p>Perfect for demos and networking events. You can upgrade to a full account later.</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Display Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label">
            I am a...
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          >
            <option value="applicant">Job Seeker / Applicant</option>
            <option value="recruiter">Recruiter</option>
            <option value="career_trainer">Career Trainer / Coach</option>
          </select>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating Guest Account...' : 'Create Guest Account'}
        </button>

        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
          <p>
            Want a full account?{' '}
            <Link to="/signup" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </form>

      <style>{`
        .guest-form {
          width: 100%;
        }

        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 18px;
          background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
          border: 2px solid #DC2626;
          border-radius: 12px;
          color: #991B1B;
          margin-bottom: 24px;
          animation: shake 0.5s ease, slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        .info-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 18px;
          background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
          border: 2px solid #3B82F6;
          border-radius: 12px;
          color: #1E3A8A;
          margin-bottom: 24px;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .error-icon, .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .error-content, .info-content {
          flex: 1;
        }

        .error-content strong, .info-content strong {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .error-content strong {
          color: #7F1D1D;
        }

        .info-content strong {
          color: #1E40AF;
        }

        .error-content p, .info-content p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #3E362E;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #E5DDD1;
          border-radius: 12px;
          font-size: 15px;
          color: #3E362E;
          background-color: #FAFAF8;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #B39C7D;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(179, 156, 125, 0.1);
          transform: translateY(-1px);
        }

        .form-input::placeholder {
          color: #ADA399;
        }

        .form-input:disabled {
          background-color: #F5F0E8;
          cursor: not-allowed;
          opacity: 0.6;
        }

        select.form-input {
          cursor: pointer;
        }

        .submit-button {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #B39C7D 0%, #9B8A6F 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(179, 156, 125, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(179, 156, 125, 0.4);
          background: linear-gradient(135deg, #9B8A6F 0%, #8A7A5F 100%);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .form-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #E5DDD1;
        }

        .form-footer p {
          font-size: 14px;
          color: #6B6358;
          margin: 8px 0;
        }

        .link {
          color: #B39C7D;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .link:hover {
          color: #9B8A6F;
          text-decoration: underline;
        }
      `}</style>
    </AuthLayout>
  );
};

export default GuestSignupForm;
