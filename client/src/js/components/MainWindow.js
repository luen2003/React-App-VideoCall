import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import { socket } from '../communication';
import { useSelector } from 'react-redux';

function useClientID(userInfo) {
  const [clientID, setClientID] = useState('');

  useEffect(() => {
    if (userInfo && userInfo.name) {
      // Use the user's name as the client ID
      setClientID(userInfo.name);
      document.title = `${userInfo.name} - VideoCall`;
      // Emit the initial ID to the backend
      socket.emit('init', { name: userInfo.name });  // Emit with the user's name
    } else {
      // For guests or users without a name, wait for a random ID from the server
      socket.on('init', ({ id }) => {
        setClientID(id);
        document.title = `${id} - VideoCall`;
      });

      // Cleanup the socket listener
      return () => {
        socket.off('init');
      };
    }
  }, [userInfo]);  // Ensure this runs only when `userInfo` changes

  // Function to manually update the client ID
  const updateClientID = (newID) => {
    setClientID(newID);
    document.title = `${newID} - VideoCall`;
    socket.emit('updateID', newID);  // Notify the server of the new ID
  };

  return [clientID, updateClientID];
}

function MainWindow({ startCall }) {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [clientID, updateClientID] = useClientID(userInfo);
  const [friendID, setFriendID] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input element when the component is mounted
    inputRef.current?.focus();
  }, []);

    // Log client ID and friend ID changes
  useEffect(() => {
    if (userInfo) {
      updateClientID(userInfo.name);
    }
    console.log('Client ID updated:', clientID);
  }, [clientID]);  // Log client ID changes

  useEffect(() => {
    console.log('Friend ID updated:', friendID);
  }, [friendID]);  // Log friend ID changes

  /**
   * Start a call with or without video
   * @param {Boolean} video - Whether the call should have video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => {
      if (friendID) {
        startCall(true, friendID, config, clientID);
      }
    };
  };

  return (
    <div className="container main-window">
      <div>
        <h3>
          Hi, your ID is
          <input
            ref={inputRef}  // Reference to the input element
            type="text"
            className="txt-clientId"
            defaultValue={clientID}  // Use defaultValue to avoid controlled component issues
            onBlur={(e) => updateClientID(e.target.value)}  // Update ID only on blur (or manually)
            onChange={(e) => updateClientID(e.target.value)}  
            autoFocus
            readOnly
          />
        </h3>
        <h4>Get started by calling a friend below</h4>
      </div>
      <div>
        <input
          type="text"
          className="txt-clientId"
          spellCheck={false}
          placeholder="Your friend ID"
          onChange={(event) => {setFriendID(event.target.value);updateClientID(clientID);}}
          onBlur={(event) => {setFriendID(event.target.value);updateClientID(clientID);}}
        />
        <div>
          <ActionButton icon={faVideo} onClick={callWithVideo(true)} />
          <ActionButton icon={faPhone} onClick={callWithVideo(false)} />
        </div>
      </div>
    </div>
  );
}

MainWindow.propTypes = {
  startCall: PropTypes.func.isRequired,
};

export default MainWindow;
