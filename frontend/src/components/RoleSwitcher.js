import React, { useState } from 'react';
import { authAPI } from '../services/api';

const RoleSwitcher = ({ currentRole, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'applicant',
      label: 'Job Seeker / Applicant',
      icon: '👨‍💼',
      description: 'Search for jobs, create resumes, practice interviews'
    },
    {
      value: 'recruiter',
      label: 'Recruiter',
      icon: '🏢',
      description: 'Post jobs, review applications, schedule interviews'
    },
    {
      value: 'career_trainer',
      label: 'Career Trainer / Coach',
      icon: '🎓',
      description: 'Provide career guidance, training, and resources'
    }
  ];

  const handleSwitch = async () => {
    if (selectedRole === currentRole) {
      setError('Please select a different role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.switchRole(selectedRole);

      if (response.success) {
        // Update stored user data
        localStorage.setItem('yaake_token', response.data.token);
        localStorage.setItem('yaake_user', JSON.stringify(response.data.user));

        // Call success callback to refresh the UI
        if (onSuccess) {
          onSuccess(response.data.user);
        }

        // Close modal
        if (onClose) {
          onClose();
        }

        // Reload page to update UI with new role
        window.location.reload();
      }
    } catch (err) {
      console.error('Role switch error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to switch role. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Switch Your Role</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <p className="modal-description">
            Choose a different role to explore YAAKE from another perspective.
            Your current data will be preserved.
          </p>

          <div className="role-options">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`role-option ${selectedRole === role.value ? 'selected' : ''} ${currentRole === role.value ? 'current' : ''}`}
                onClick={() => setSelectedRole(role.value)}
              >
                <div className="role-icon">{role.icon}</div>
                <div className="role-info">
                  <div className="role-header">
                    <h3>{role.label}</h3>
                    {currentRole === role.value && (
                      <span className="current-badge">Current</span>
                    )}
                  </div>
                  <p>{role.description}</p>
                </div>
                <div className="radio-indicator">
                  {selectedRole === role.value && <span className="radio-dot"></span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="button-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSwitch}
            className="button-primary"
            disabled={loading || selectedRole === currentRole}
          >
            {loading ? 'Switching...' : 'Switch Role'}
          </button>
        </div>
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
          max-width: 600px;
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
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #FEE2E2;
          border: 2px solid #DC2626;
          border-radius: 8px;
          color: #991B1B;
          margin-bottom: 20px;
        }

        .error-icon {
          font-size: 18px;
        }

        .error-banner p {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .modal-description {
          margin: 0 0 24px 0;
          font-size: 15px;
          color: #6B6358;
          line-height: 1.6;
        }

        .role-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px;
          border: 2px solid #E5DDD1;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #FAFAF8;
        }

        .role-option:hover {
          border-color: #B39C7D;
          background: #FFFFFF;
          transform: translateX(4px);
        }

        .role-option.selected {
          border-color: #6366F1;
          background: #EEF2FF;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .role-option.current {
          background: #F5F0E8;
        }

        .role-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .role-info {
          flex: 1;
        }

        .role-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .role-header h3 {
          margin: 0;
          font-size: 16px;
          color: #3E362E;
          font-weight: 700;
        }

        .current-badge {
          padding: 4px 10px;
          background: #B39C7D;
          color: #FFFFFF;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-info p {
          margin: 0;
          font-size: 13px;
          color: #6B6358;
          line-height: 1.5;
        }

        .radio-indicator {
          width: 24px;
          height: 24px;
          border: 2px solid #E5DDD1;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .role-option.selected .radio-indicator {
          border-color: #6366F1;
          background: #6366F1;
        }

        .radio-dot {
          width: 10px;
          height: 10px;
          background: #FFFFFF;
          border-radius: 50%;
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
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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

          .role-option {
            flex-direction: column;
            text-align: center;
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

export default RoleSwitcher;
