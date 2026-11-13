import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DirectMessages() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      const otherUsers = res.data.filter(u => u.id !== user?.id);
      setUsers(otherUsers);
      if (otherUsers.length > 0 && !selectedUser) {
        setSelectedUser(otherUsers[0]);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchMessages = async (otherId) => {
    try {
      const res = await axios.get(`/api/messages/${otherId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await axios.post('/api/messages', {
        receiverId: selectedUser.id,
        text: text.trim()
      });
      setMessages([...messages, res.data]);
      setText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="messages-container">
      <div className="chat-user-list">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '15px' }}>
          Messages
        </div>
        {users.map(u => (
          <div 
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: selectedUser?.id === u.id ? 'var(--bg-hover)' : 'transparent',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <img src={u.avatar} alt={u.name} className="user-avatar" style={{ width: '38px', height: '38px' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {u.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{u.username}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-thread">
        {selectedUser ? (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={selectedUser.avatar} alt={selectedUser.name} className="user-avatar" style={{ width: '34px', height: '34px' }} />
              <div>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedUser.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>@{selectedUser.username}</span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                  No messages yet. Say hi to {selectedUser.name}! 👋
                </div>
              ) : (
                messages.map(m => (
                  <div 
                    key={m.id} 
                    className={`message-bubble ${m.senderId === user?.id ? 'mine' : 'theirs'}`}
                  >
                    {m.text}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="chat-input-bar">
              <input 
                type="text" 
                placeholder={`Message @${selectedUser.username}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="play-toggle-btn" style={{ width: '40px', height: '40px' }}>
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>Select a conversation</div>
        )}
      </div>
    </div>
  );
}
