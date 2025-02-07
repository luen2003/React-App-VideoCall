import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import { socket } from '../communication';

function useClientID() {
  const [clientID, setClientID] = useState('');

  useEffect(() => {
    socket.on('init', ({ id }) => {
      document.title = `${id} - VideoCall`;
      setClientID(id);
    });

    return () => {
      socket.off('init');
    };
  }, []);

  const updateClientID = (newID) => {
    setClientID(newID);
    socket.emit('updateID', newID);  // Gửi ID mới đến server
  };

  return [clientID, updateClientID];
}

function MainWindow({ startCall }) {
  const [clientID, updateClientID] = useClientID();
  const [friendID, setFriendID] = useState(null);

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
            onChange={(e) => updateClientID(e.target.value)}  // Cập nhật ID khi người dùng thay đổi
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
