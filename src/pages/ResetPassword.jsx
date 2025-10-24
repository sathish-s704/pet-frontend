import React, { useState } from 'react';
import api from '../utils/api';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    return regex.test(password);
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '40px' }}>
      <h2 className="text-center mb-4">🔒 Reset Password</h2>

      {/* New Password Field */}
      <div className="mb-3">
        <label className="form-label">New Password</label>
        <div className="input-group">
          <input
            type={showNewPassword ? 'text' : 'password'}
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="mb-4">
        <label className="form-label">Confirm Password</label>
        <div className="input-group">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button className="btn btn-primary w-100" onClick={handleReset}>
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
