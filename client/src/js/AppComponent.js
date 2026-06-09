import React, { Component } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import { useDispatch, useSelector } from 'react-redux';  // Import for Redux
import { logout } from './actions/userActions';  // Import the logout action
import { useEffect } from 'react';
// Functional NavBar Component
const NavBar = () => {
  const dispatch = useDispatch();

  // Get user login status
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  window.location.reload();

  useEffect(() => {
    // Check if user is logged in and trigger reload only once
    if (userInfo && !sessionStorage.getItem('pageReloaded')) {
      // Mark page as reloaded to prevent multiple reloads
      sessionStorage.setItem('pageReloaded', 'true');
      window.location.reload();
    }
  }, [userInfo]); // Trigger the effect when userInfo changes


  // Handle logout
  const logoutHandler = () => {
    dispatch(logout());
    sessionStorage.removeItem('pageReloaded'); // Reset page reload flag on logout

  };



  return (
    <nav style={{ display: 'flex', justifyContent: 'space-evenly', padding: '10px', background: '#f4f4f4' }}>
      <div>
        {!userInfo ? (
          <>
            <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
            <Link to="/signup" style={{ margin: '0 10px' }}>Sign Up</Link>
          </>
        ) : (
          <>
            <span style={{ margin: '0 10px', color: 'black' }}>Hi, {userInfo.name}</span> {/* Display user name */}
            <button onClick={logoutHandler} style={{ margin: '0 10px' }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

class AppComponent extends Component {
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

  startCall(isCaller, friendID, config, callFrom) {
    console.log('Starting call from:', callFrom, 'to:', friendID); // Log để kiểm tra các tham số

    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller);

    // Lưu clientID (callFrom) và friendID vào state
    this.setState({ callFrom, friendID });
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

export default AppComponent;
