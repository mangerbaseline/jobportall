"use client"
import { useEffect, useState } from "react";
import { useSocket } from "@/lib/hook/useSocket";

function Test() {
  const socket = useSocket();

  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  const receiverId = "18b7a6de-e85a-4f06-b3bb-dc190934c9ea";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const tokenRes = await fetch("/api/auth/token");
        const { token } = await tokenRes.json();
        if (!token) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
        const res = await fetch(`${socketUrl}/api/conversations/${receiverId}`, {
          headers: { token: token }
        });

        if (res.ok) {
          const history = await res.json();
          setMessages(history);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [receiverId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      console.log("Message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on('messageSent', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageSent');
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!socket || !messageText.trim()) return;
    socket.emit('sendMessage', {
      receiverId: receiverId,
      content: messageText
    });
    setMessageText("");
  };

  return (
    <div className="p-4 border mt-15 rounded max-w-md">
      <div className="h-64 overflow-y-auto mb-4 border-b">
        {loading ? (
          <p className="text-gray-400 text-sm p-2">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-sm p-2">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id ?? idx} className="p-2 bg-gray-100 mb-2 rounded">
              {msg.content}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="border p-2 grow rounded"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Test;
