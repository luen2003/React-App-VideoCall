import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import { socket } from '../communication';
import { useSelector } from 'react-redux';
import axios from 'axios';

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

      return () => {
        socket.off('init');
      };
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
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [clientID, updateClientID] = useClientID(userInfo);
  const [friendID, setFriendID] = useState(''); 
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // State mới để điều khiển việc ẩn/hiện danh sách
  const [isListVisible, setIsListVisible] = useState(false); 

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    const fetchUsers = async () => {
      try {
        const config = userInfo ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
        const { data } = await axios.get('/api/users', config);
        
        const filteredList = data.filter(u => u.name !== userInfo?.name);
        setUsers(filteredList);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
      }
    };

    fetchUsers();
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      updateClientID(userInfo.name);
    }
  }, [clientID]);

  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => {
      if (friendID) {
        startCall(true, friendID, config, clientID);
      } else {
        alert('Vui lòng chọn một người bạn từ danh sách để gọi.');
      }
    };
  };

  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            readOnly
          />
        </h3>
        <h4>Get started by calling a friend below</h4>
      </div>
      
      <div className="friend-selector">
        <input
          type="text"
          className="txt-clientId search-input"
          spellCheck={false}
          placeholder="Search friend by name..."
          value={searchTerm}
          onFocus={() => setIsListVisible(true)} // Hiển thị list khi click vào ô input
          onBlur={() => setIsListVisible(false)} // Ẩn list khi click ra ngoài
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setFriendID(''); // Xóa friendID nếu user gõ text mới
            setIsListVisible(true);
          }}
        />
        
        {/* Chỉ render danh sách khi isListVisible là true */}
        {isListVisible && (
          <ul className="user-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li 
                  key={user._id} 
                  className={`user-item ${friendID === user.name ? 'selected' : ''}`}
                  // Dùng onMouseDown thay vì onClick để bắt event trước khi input bị onBlur
                  onMouseDown={() => {
                    setFriendID(user.name);
                    setSearchTerm(user.name); // Điền luôn tên vào ô input
                    setIsListVisible(false); // Ẩn danh sách
                  }} 
                >
                  {user.name}
                </li>
              ))
            ) : (
              <li className="no-results">No users found</li>
            )}
          </ul>
        )}
        
        <div className="action-buttons">
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