import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';
import { Link } from 'react-router-dom';  
import { useDispatch, useSelector } from 'react-redux';  
import { logout } from './actions/userActions';

const NavBar = () => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <nav style={navStyles}>
      <div style={navContentStyles}>
        {!userInfo ? (
          <>
            <Link to="/login" style={linkStyles}>Login</Link>
            <Link to="/signup" style={linkStyles}>Sign Up</Link>
          </>
        ) : (
          <>
            <span style={{ margin: '0 10px', color:'black' }}>Hi, {userInfo.name}</span> 
            <button onClick={logoutHandler} style={linkStyles}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const navStyles = {
  display: 'flex',
  justifyContent: 'center', 
  padding: '10px 20px',
  background: '#f4f4f4',
  width: '100%',
  boxSizing: 'border-box',
};

const navContentStyles = {
  display: 'flex',
  justifyContent: 'center', 
  alignItems: 'center',
  gap: '20px', 
};

const linkStyles = {
  margin: '0 10px',
  textDecoration: 'none',
  color: 'black',
};

const App = () => {
  const [callWindow, setCallWindow] = useState('');
  const [callModal, setCallModal] = useState('');
  const [callFrom, setCallFrom] = useState('');
  const [localSrc, setLocalSrc] = useState(null);
  const [peerSrc, setPeerSrc] = useState(null);
  const [userName, setUserName] = useState('');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  let pc = {};  // Reference for PeerConnection
  let config = null;  // Config for media options

  useEffect(() => {
    // Check if userName exists in localStorage and update state if so
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }

    socket
      .on('request', ({ from: callFrom }) => {
        setCallModal('active');
        setCallFrom(callFrom);
      })
      .on('call', (data) => {
        if (data.sdp) {
          pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') pc.createAnswer();
        } else {
          pc.addIceCandidate(data.candidate);
        }
      })
      .on('end', endCall.bind(this, false))
      .emit('init');
  }, []);

  useEffect(() => {
    // When userInfo changes, update localStorage and userName state
    if (userInfo && userInfo.name && userInfo.name !== userName) {
      localStorage.setItem('userName', userInfo.name);
      setUserName(userInfo.name);
    }
  }, [userInfo, userName]);

  const startCall = (isCaller, friendID, config) => {
    this.config = config;
    pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        setLocalSrc(src);
        setCallWindow('active');
        setCallModal('');
      })
      .on('peerStream', (src) => setPeerSrc(src))
      .start(isCaller);
  };

  const rejectCall = () => {
    socket.emit('end', { to: callFrom });
    setCallModal('');
  };

  const endCall = (isStarter) => {
    if (_.isFunction(pc.stop)) {
      pc.stop(isStarter);
    }
    pc = {};
    setConfig(null);
    setCallWindow('');
    setCallModal('');
    setLocalSrc(null);
    setPeerSrc(null);
  };

  return (
    <div>
      <NavBar />
      <MainWindow startCall={startCall} />
      <div>
        {userName && <h3>Welcome, {userName}</h3>}
      </div>
      {!_.isEmpty(config) && (
        <CallWindow
          status={callWindow}
          localSrc={localSrc}
          peerSrc={peerSrc}
          config={config}
          mediaDevice={pc.mediaDevice}
          endCall={endCall}
        />
      )}
      <CallModal
        status={callModal}
        startCall={startCall}
        rejectCall={rejectCall}
        callFrom={callFrom}
      />
    </div>
  );
};

export default App;
