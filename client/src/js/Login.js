import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from './actions/userActions'; // Assuming the action for login
import avatarImage from '../../../client/avatar.png';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect); // Redirect after login
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(name, password)); // Dispatch login action
  };

  // Responsive Styles (inline)
  const loginContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '0 20px',
    flexDirection: 'row', // Default to row for larger screens
    flexWrap: 'wrap', // Allow wrapping for smaller screens
  };

  const loginLeftStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
  };

  const loginRightStyle = {
    flex: 1,
    maxWidth: '400px',
    backgroundColor: '#f9f9f9',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
  };

  const inputGroupStyle = {
    marginBottom: '20px',
    textAlign: 'left',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff', // Đổi sang xanh dương
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  };

  const linksStyle = {
    marginTop: '20px',
    fontSize: '14px',
  };

  const inputTextStyle = {
    color: 'black',
    marginTop: '10px',
    textAlign: 'center',  // Centering the text
  };

  const linkActionStyle = {
    color: '#007bff', // Màu xanh dương
    textDecoration: 'none', // Bỏ gạch chân
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
            color: #fff;
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .login-container {
              flex-direction: column !important; /* Change to column on mobile */
            }

            .login-left {
              display: none !important; /* Hide image section on mobile */
            }

            .login-right {
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

      <div style={loginContainerStyle} className="login-container">
        <div style={loginLeftStyle} className="login-left">
          <img
            src={avatarImage}
            alt="Login"
            style={{ width: '100%', height: 'auto', maxWidth: '400px', borderRadius: '8px' }}
          />
        </div>
        <div style={loginRightStyle} className="login-right">
          <h3 style={{ color: 'black', textAlign: 'center' }}>Log In</h3>
          <form onSubmit={submitHandler}>
            <div style={inputGroupStyle}>
              <input
                type="text"
                required
                placeholder="Enter username"
                style={inputStyle}
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div style={inputGroupStyle}>
              <input
                type="password"
                required
                placeholder="Enter password"
                style={inputStyle}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'} {/* Đổi chữ */}
            </button>
            <div style={linksStyle}>
              <p style={inputTextStyle}>
                Don't have an account? <a href="/signup" style={linkActionStyle}>Sign up</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;