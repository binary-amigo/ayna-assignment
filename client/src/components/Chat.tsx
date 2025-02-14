import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { Send, User } from "lucide-react";

const socket = io(import.meta.env.VITE_BACKEND_URI);

const Chat: React.FC = () => {
  const [room, setRoom] = useState<string>("group");
  const [messages, setMessages] = useState<{ text: string; user: string }[]>([]);
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("User" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const roomParam = queryParams.get("room");
    const usernameParam = queryParams.get("username");

    if (roomParam) setRoom(roomParam);
    if (usernameParam) setUsername(usernameParam);
  }, []);

  useEffect(() => {
    socket.emit("join", { username });

    const handleMessage = (newMessage: { text: string; user: string }) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [username]);

  const sendMessage = useCallback(() => {
    if (message.trim()) {
      socket.emit("sendMessage", {
        user: username,
        message: message,
      });
      setMessage("");
    }
  }, [message, username]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">{username}</h2>
            </div>
            <span className="px-3 py-1 bg-indigo-500 rounded-full text-sm text-white">
              {room}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.user === username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.user === username
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="text-xs mb-1 opacity-70">{msg.user}</div>
                <div className="break-words">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;