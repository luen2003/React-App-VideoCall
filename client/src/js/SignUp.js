import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from './actions/userActions';
import { useNavigate } from 'react-router-dom';
import avatarImage from '../../../client/avatar.png';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const redirect = window.location.search ? window.location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(register(name, password));
    }
  };

  // Responsive Styles (inline)
  const registerContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '0 20px',
    flexDirection: 'row', // Default to row for larger screens
    flexWrap: 'wrap', // Allow wrapping for smaller screens
  };

  const imageSectionStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
  };

  const formSectionStyle = {
    flex: 1,
    maxWidth: '400px',
    backgroundColor: '#f9f9f9',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff', // Đổi sang xanh dương
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  // Đổi link màu xanh dương và không gạch chân
  const linkStyle = {
    color: '#007bff', 
    textDecoration: 'none', 
  };

  const inputTextStyle = {
    color: 'black',
    marginTop: '10px',
    textAlign: 'center',
  };

  return (
    <>
      <style>
        {`
          /* Nút trở về trang chủ */
          .back-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 10px 15px;
            background-color: #007bff; /* Nền xanh dương */
            color: #fff; /* Chữ trắng */
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            background-color: #007bff; 
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .signup-container {
              flex-direction: column !important; /* Change to column on mobile */
            }

            .signup-left {
              display: none !important; /* Hide image section on mobile */
            }

            .signup-right {
              width: 100% !important;
              padding: 20px !important;
            }
          }
        `}
      </style>

      {/* Nút Back */}
      <button className="back-btn" onClick={() => navigate('/')}>
        &larr; Trở về trang chủ
      </button>

      <div style={registerContainerStyle} className="signup-container">
        <div style={imageSectionStyle} className="signup-left">
          <img
            src={avatarImage}
            alt="Sign Up"
            style={{ width: '100%', height: 'auto', maxWidth: '400px', borderRadius: '8px' }}
          />
        </div>
        <div style={formSectionStyle} className="signup-right">
          <form onSubmit={submitHandler}>
            <h3 style={{ color: 'black', textAlign: 'center' }}>Sign Up</h3>
            {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
            <input
              type="text"
              name="name"
              required
              placeholder="Enter your name"
              style={inputStyle}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              name="password"
              required
              placeholder="Enter password"
              style={inputStyle}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm password"
              style={inputStyle}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input 
              type="submit" 
              style={buttonStyle} 
              value={loading ? 'Signing Up...' : 'Sign Up'} /* Đổi chữ */
              disabled={loading} 
            />
            <p style={inputTextStyle}>
              Already have an account? <a href="/login" style={linkStyle}>Login</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;