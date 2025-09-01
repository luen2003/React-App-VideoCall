import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import { socket } from '../communication';
import { useSelector } from 'react-redux';
import UserSearch from '../../UserSearch';

function useClientID(userInfo) {
  const [clientID, setClientID] = useState('');

  useEffect(() => {
    if (userInfo && userInfo.name) {
      setClientID(userInfo.name);
      document.title = `${userInfo.name} - VideoCall`;
      socket.emit('init', { name: userInfo.name });
    } else {
      socket.on('init', ({ id }) => {
        setClientID(id);
        document.title = `${id} - VideoCall`;
      });
      return () => socket.off('init');
    }
  }, [userInfo]);

  const updateClientID = (newID) => {
    setClientID(newID);
    document.title = `${newID} - VideoCall`;
    socket.emit('updateID', newID);
  };

  return [clientID, updateClientID];
}

function MainWindow({ startCall }) {
  const { userInfo } = useSelector((state) => state.userLogin);
  const [clientID, updateClientID] = useClientID(userInfo);
  const [friendID, setFriendID] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (userInfo) {
      updateClientID(userInfo.name);
    }
  }, [userInfo]);

  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => {
      if (friendID) {
        startCall(true, friendID, config, clientID);
      }
    };
  };

  const handleSelectUser = (username) => {
    setFriendID(username);
    startCall(true, username, { video: true, audio: true }, clientID);
  };

  return (
    <div className="container main-window">
      <div>
        <h3>
          Hi, your ID is
          <input
            ref={inputRef}
            type="text"
            className="txt-clientId"
            defaultValue={clientID}
            onBlur={(e) => updateClientID(e.target.value)}
            onChange={(e) => updateClientID(e.target.value)}
            autoFocus
          />
        </h3>
        <h4>Get started by calling a friend</h4>
      </div>

      <div>
        <input
          type="text"
          className="txt-clientId"
          spellCheck={false}
          placeholder="Enter friend ID"
          value={friendID}
          onChange={(e) => setFriendID(e.target.value)}
        />
        <div>
          <ActionButton icon={faVideo} onClick={callWithVideo(true)} />
          <ActionButton icon={faPhone} onClick={callWithVideo(false)} />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Or search username</h4>
        <UserSearch onSelect={handleSelectUser} />
      </div>
    </div>
  );
}

MainWindow.propTypes = {
  startCall: PropTypes.func.isRequired,
};

export default MainWindow;
