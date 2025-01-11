import React, { Component } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import { useDispatch, useSelector } from 'react-redux';  // Import for Redux
import { logout } from './actions/userActions';  // Import the logout action

// Functional NavBar Component
const NavBar = () => {
  const dispatch = useDispatch();

  // Get user login status
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Handle logout
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
            <span style={{ margin: '0 10px', color:'black' }}>Hi, {userInfo.name}</span> {/* Display user name */}
            <button onClick={logoutHandler} style={linkStyles}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

// Styles for NavBar
const navStyles = {
  display: 'flex',
  justifyContent: 'center', // Centering the content horizontally
  padding: '10px 20px',
  background: '#f4f4f4',
  width: '100%',
  boxSizing: 'border-box',
};

const navContentStyles = {
  display: 'flex',
  justifyContent: 'center', // Center the links
  alignItems: 'center',
  gap: '20px', // Spacing between the links
};

const linkStyles = {
  margin: '0 10px',
  textDecoration: 'none',
  color: 'black',
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      userName: '', // Added for managing display name
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }

  componentDidMount() {
    // Get the user name from localStorage or Redux store for initialization
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.setState({ userName }); // Set the user's name
    }

    socket
      .on('request', ({ from: callFrom }) => {
        this.setState({ callModal: 'active', callFrom });
      })
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller);
  }

  rejectCall() {
    const { callFrom } = this.state;
    socket.emit('end', { to: callFrom });
    this.setState({ callModal: '' });
  }

  endCall(isStarter) {
    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }
    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null
    });
  }

  render() {
    const { callFrom, callModal, callWindow, localSrc, peerSrc, userName } = this.state;
    return (
      <div>
        <NavBar />  {/* Add the NavBar here */}
        <MainWindow startCall={this.startCallHandler} />
        <div>
          {userName && <h3>Welcome, {userName}</h3>} {/* Display the user's name */}
        </div>
        {!_.isEmpty(this.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        )}
        <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={callFrom}
        />
      </div>
    );
  }
}

export default App;
