import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import { socket } from '../communication';
import { useSelector } from 'react-redux';

function useClientID(userInfo) {
  const [clientID, setClientID] = useState('');

  useEffect(() => {
    // Update clientID when userInfo is available and set the document title
    if (userInfo) {
      setClientID(userInfo.name);
      document.title = `${userInfo.name} - VideoCall`;
      socket.emit('updateID', userInfo.name);  // Emit new ID to backend
    } else {
      // For guests or unauthenticated users
      socket.on('init', ({ id }) => {
        setClientID(id);
        document.title = `${id} - VideoCall`;
      });
      return () => {
        socket.off('init');
      };
    }
  }, [userInfo]);  // This effect depends on userInfo

  const updateClientID = (newID) => {
    setClientID(newID);
    document.title = `${newID} - VideoCall`;
    socket.emit('updateID', newID);  // Send the updated ID to the server
  };

  return [clientID, updateClientID];
}

function MainWindow({ startCall }) {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [clientID, updateClientID] = useClientID(userInfo);
  const [friendID, setFriendID] = useState(null);

  useEffect(() => {
    if (userInfo) {
      updateClientID(userInfo.name);
      document.title = `${userInfo.name} - VideoCall`; // Ensure the document title is updated
    }
  }, [userInfo]);  // Update title when userInfo changes

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => friendID && startCall(true, friendID, config);
  };

  return (
    <div className="container main-window">
      <div>
        <h3>
          Hi, your ID is
          <input
            type="text"
            className="txt-clientId"
            value={clientID}
            onChange={(e) => updateClientID(e.target.value)}  // Update ID when the user changes it
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
          onChange={(event) => setFriendID(event.target.value)}
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
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
