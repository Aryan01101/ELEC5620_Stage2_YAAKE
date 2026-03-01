import React, { useState } from 'react';
import { authAPI } from '../services/api';

const UpgradeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.upgradeGuest(
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (response.success) {
        // Update stored user data
        localStorage.setItem('yaake_token', response.data.token);
        localStorage.setItem('yaake_user', JSON.stringify(response.data.user));

        setSuccess(true);

        // Auto-close and refresh after 3 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data.user);
          }
          if (onClose) {
            onClose();
          }
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setApiError(
        error.response?.data?.message ||
        'Failed to upgrade account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-animation">
            <span className="success-checkmark">✓</span>
          </div>
          <h2>Account Upgraded!</h2>
          <p>
            Your guest account has been upgraded to a full account.
            A verification email has been sent to <strong>{formData.email}</strong>.
          </p>
          <p className="note">
            Please check your email to verify your account. Refreshing page...
          </p>
        </div>

        <style>{`
          .success-modal {
            text-align: center;
            padding: 48px 32px;
          }

          .success-animation {
            margin: 0 auto 24px auto;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s ease;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }

          .success-checkmark {
            font-size: 48px;
            color: #FFFFFF;
            font-weight: bold;
          }

          .success-modal h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
            color: #3E362E;
            font-weight: 800;
          }

          .success-modal p {
            margin: 0 0 12px 0;
            font-size: 15px;
            color: #6B6358;
            line-height: 1.6;
          }

          .success-modal p.note {
            font-size: 13px;
            font-style: italic;
            color: #ADA399;
          }

          .success-modal strong {
            color: #3E362E;
            font-weight: 700;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upgrade to Full Account</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <div className="error-content">
                  <strong>Upgrade Failed</strong>
                  <p>{apiError}</p>
                </div>
              </div>
            )}

            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <div className="info-content">
                <strong>What happens when you upgrade?</strong>
                <ul>
                  <li>Your data will be permanently saved</li>
                  <li>You'll get email verification for security</li>
                  <li>You can log in from any device</li>
                  <li>All your guest progress will be preserved</li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
              <span className="help-text">
                Min 8 characters, uppercase, lowercase, number, and special character
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading ? 'Upgrading...' : 'Upgrade Account'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
          backdrop-filter: blur(4px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: #FFFFFF;
          border-radius: 16px;
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 24px 28px;
          border-bottom: 2px solid #E5DDD1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 22px;
          color: #3E362E;
          font-weight: 800;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #6B6358;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .close-button:hover {
          background: #F5F0E8;
          color: #3E362E;
        }

        .modal-body {
          padding: 28px;
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
          animation: shake 0.5s ease;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .error-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .error-content {
          flex: 1;
        }

        .error-content strong {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #7F1D1D;
        }

        .error-content p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }

        .info-box {
          display: flex;
          gap: 12px;
          padding: 16px 18px;
          background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
          border: 2px solid #3B82F6;
          border-radius: 12px;
          color: #1E3A8A;
          margin-bottom: 24px;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-content strong {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1E40AF;
        }

        .info-content ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          line-height: 1.8;
        }

        .info-content li {
          margin-bottom: 4px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #3E362E;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5DDD1;
          border-radius: 10px;
          font-size: 15px;
          color: #3E362E;
          background-color: #FAFAF8;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #B39C7D;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(179, 156, 125, 0.1);
        }

        .form-input::placeholder {
          color: #ADA399;
        }

        .form-input.error {
          border-color: #DC2626;
          background-color: #FEF2F2;
        }

        .form-input:disabled {
          background-color: #F5F0E8;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .error-text {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          color: #DC2626;
          font-weight: 600;
        }

        .help-text {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: #6B6358;
          font-style: italic;
        }

        .modal-footer {
          padding: 20px 28px;
          border-top: 2px solid #E5DDD1;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .button-secondary,
        .button-primary {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .button-secondary {
          background: #F5F0E8;
          color: #3E362E;
        }

        .button-secondary:hover:not(:disabled) {
          background: #E5DDD1;
        }

        .button-primary {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .button-primary:active:not(:disabled),
        .button-secondary:active:not(:disabled) {
          transform: translateY(0);
        }

        .button-primary:disabled,
        .button-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 0;
            border-radius: 0;
            max-height: 100vh;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .button-secondary,
          .button-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UpgradeModal;
