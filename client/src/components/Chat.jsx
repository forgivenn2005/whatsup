import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Chat = ({ user, selectedUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef();

  // Load previous chat history
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (selectedUser) {
      axios
        .get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setMessages(res.data);
        });
    }
  }, [selectedUser]);

  // Receive new messages from socket
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (
        (msg.sender === selectedUser._id && msg.receiver === user._id) ||
        (msg.sender === user._id && msg.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_message', handler);
    return () => socket.off('receive_message', handler);
  }, [socket, selectedUser, user]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;

    const msg = {
      sender: user._id,
      receiver: selectedUser._id,
      text,
    };

    // Just emit — server will send back complete saved msg
    socket.emit('send_message', msg);
    setText('');
  };

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Chat with {selectedUser.username}</h3>
      <div className="h-64 overflow-y-auto bg-white p-2 rounded mb-2 border">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-1 ${
              msg.sender === user._id ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block px-3 py-1 rounded text-sm ${
                msg.sender === user._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border rounded px-3 py-1 mr-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
