import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Register</h2>
      <input className="border p-2 mb-2 w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-2 mb-2 w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister} className="bg-green-500 text-white px-4 py-2 rounded">Register</button>
      <p className="mt-2">{message}</p>
    </div>
  );
}
