import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from './actions/userActions';
import { useNavigate } from 'react-router-dom';

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

  const registerContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '0 20px',
    marginRight: '120px',
  };

  const imageSectionStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  };

  const formSectionStyle = {
    flex: 1,
    maxWidth: '400px',
    backgroundColor: '#f9f9f9',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  const linkStyle = {
    color: '#4CAF50',
    textDecoration: 'none',
  };

  const inputTextStyle = {
    color: 'black',
    marginTop: '10px',
    textAlign: 'center',
  };

  return (
    <div style={registerContainerStyle}>
      <div style={imageSectionStyle}>
        <img
          src="https://avatars.githubusercontent.com/u/185040659?v=4"
          alt="Sign Up"
          style={{ width: '100%', height: 'auto', maxWidth: '400px', borderRadius: '8px' }}
        />
      </div>
      <div style={formSectionStyle}>
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
          <input type="submit" style={buttonStyle} value="Sign Up now" />
          <p style={inputTextStyle}>
            Already have an account? <a href="/login" style={linkStyle}>Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
