import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const UserSearch = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userList, setUserList] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // Track input focus

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`/api/users?search=${searchTerm}`);
        setUserList(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setUserList([]);
      }
    };

    if (isFocused) {
      const debounce = setTimeout(fetchUsers, 200);
      return () => clearTimeout(debounce);
    }
  }, [searchTerm, isFocused]);

  return (
    <div>
      <input
        type="text"
        placeholder="Type a name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Slight delay to allow click on button before hiding
          setTimeout(() => setIsFocused(false), 150);
        }}
        style={{ padding: '6px', width: '100%' }}
      />
      {isFocused && userList.length > 0 && (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {userList.map((user, index) => (
            <li key={index}>
              <button
                onClick={() => onSelect(user.name)}
                style={{
                  padding: '5px 10px',
                  margin: '2px 0',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {user.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

UserSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default UserSearch;
