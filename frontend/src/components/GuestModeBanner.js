import React, { useState } from 'react';

const GuestModeBanner = ({ user, onRoleSwitch, onUpgrade }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!user || !user.isGuest) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="guest-banner-minimized">
        <button
          onClick={() => setIsMinimized(false)}
          className="expand-button"
          title="Expand guest mode banner"
        >
          👤 Guest Mode
        </button>

        <style>{`
          .guest-banner-minimized {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }

          .expand-button {
            padding: 8px 16px;
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            color: #FFFFFF;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            transition: all 0.2s ease;
          }

          .expand-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          }
        `}</style>
      </div>
    );
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'applicant': 'Job Seeker',
      'recruiter': 'Recruiter',
      'career_trainer': 'Career Trainer'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="guest-banner">
      <div className="guest-banner-content">
        <div className="guest-info">
          <span className="guest-badge">
            <span className="badge-icon">👤</span>
            Guest Mode
          </span>
          <div className="guest-details">
            <p className="guest-message">
              You're exploring YAAKE as a <strong>{getRoleDisplayName(user.role)}</strong>
            </p>
            <p className="guest-submessage">
              Your data is temporary and will not be saved long-term
            </p>
          </div>
        </div>

        <div className="guest-actions">
          {onRoleSwitch && (
            <button
              onClick={onRoleSwitch}
              className="action-button secondary"
              title="Switch to a different role"
            >
              <span className="button-icon">🔄</span>
              Switch Role
            </button>
          )}
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="action-button primary"
              title="Create a permanent account"
            >
              <span className="button-icon">⭐</span>
              Upgrade Account
            </button>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="minimize-button"
            title="Minimize this banner"
          >
            ✕
          </button>
        </div>
      </div>

      <style>{`
        .guest-banner {
          position: sticky;
          top: 0;
          z-index: 999;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          border-bottom: 3px solid #4338CA;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .guest-banner-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .guest-banner-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
          }
        }

        .guest-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        @media (max-width: 768px) {
          .guest-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        .guest-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          backdrop-filter: blur(10px);
        }

        .badge-icon {
          font-size: 16px;
        }

        .guest-details {
          color: #FFFFFF;
        }

        .guest-message {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
        }

        .guest-message strong {
          font-weight: 800;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 2px;
        }

        .guest-submessage {
          margin: 0;
          font-size: 13px;
          opacity: 0.9;
          line-height: 1.4;
        }

        .guest-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .guest-actions {
            width: 100%;
            flex-wrap: wrap;
          }
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .action-button {
            flex: 1;
            justify-content: center;
          }
        }

        .action-button.primary {
          background: #FFFFFF;
          color: #4F46E5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .action-button.primary:hover {
          background: #F5F5FF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-button.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .action-button.secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .action-button:active {
          transform: translateY(0);
        }

        .button-icon {
          font-size: 16px;
        }

        .minimize-button {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1;
        }

        .minimize-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
          .minimize-button {
            position: absolute;
            top: 16px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default GuestModeBanner;
