import { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      console.log('[DEBUG] Token received:', res.data.token);

      // ✅ Store token in localStorage
      localStorage.setItem('token', res.data.token);

      // ✅ Trigger login flow
      onLogin();
    } catch (err) {
      console.error('[DEBUG] Login error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
