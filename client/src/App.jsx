import { useEffect, useState } from 'react';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import { io } from 'socket.io-client';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const token = localStorage.getItem('token');

  // Load logged-in user
  useEffect(() => {
    console.log('[DEBUG] Frontend token:', token);

    if (token) {
      axios
        .get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log('[DEBUG] /me response:', res.data);
          setUser(res.data.user);
        })
        .catch((err) => {
          console.error('[DEBUG] /me error:', err.response?.data || err.message);
          localStorage.removeItem('token'); // auto-fix bad token
        });
    }
  }, [token]);

  // Load all users (excluding self)
  useEffect(() => {
    if (user && token) {
      axios
        .get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsers(res.data));
    }
  }, [user, token]);

  // Setup socket connection
  useEffect(() => {
    if (user) {
      const s = io('http://localhost:5000', {
        auth: { token },
      });
      setSocket(s);

      s.on('user_online', (userId) => {
        setOnlineUserIds((prev) => [...new Set([...prev, userId])]);
      });

      s.on('user_offline', (userId) => {
        setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
      });

      return () => s.disconnect();
    }
  }, [user, token]);

  const isOnline = (userId) => onlineUserIds.includes(userId);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {!user ? (
        <>
          <Login onLogin={setUser} />
          <Register />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Welcome, {user.username}</h2>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 underline"
            >
              Logout
            </button>
          </div>

          <p className="text-gray-700 mb-2">Available Users:</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`px-3 py-1 rounded border ${
                  selectedUser?._id === u._id ? 'bg-blue-300' : 'bg-gray-200'
                }`}
              >
                {u.username}
                {isOnline(u._id) ? (
                  <span className="ml-2 text-green-600 text-sm">●</span>
                ) : (
                  <span className="ml-2 text-gray-400 text-sm">●</span>
                )}
              </button>
            ))}
          </div>

          {selectedUser && socket && (
            <Chat user={user} selectedUser={selectedUser} socket={socket} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
