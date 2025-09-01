import React, { Component } from 'react';
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
  const { userInfo } = useSelector((state) => state.userLogin);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-evenly', padding: '10px', background: '#f4f4f4' }}>
      {!userInfo ? (
        <>
          <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
          <Link to="/signup" style={{ margin: '0 10px' }}>Sign Up</Link>
        </>
      ) : (
        <>
          <span style={{ margin: '0 10px', color: 'black' }}>Hi, {userInfo.name}</span>
          <button onClick={logoutHandler} style={{ margin: '0 10px' }}>Logout</button>
        </>
      )}
    </nav>
  );
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
      userName: '',
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }

  componentDidMount() {
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.setState({ userName });
    }

    socket
      .on('request', ({ from: callFrom }) => {
        this.setState({ callModal: 'active', callFrom });
      })
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else {
          this.pc.addIceCandidate(data.candidate);
        }
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  startCall(isCaller, friendID, config, callFrom) {
    console.log('Starting call from:', callFrom, 'to:', friendID);

    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller);

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
        <NavBar />
        <MainWindow startCall={this.startCallHandler} />
        <div>
          {userName && <h3>Welcome, {userName}</h3>}
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
