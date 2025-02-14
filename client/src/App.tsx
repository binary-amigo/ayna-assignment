import React from "react";
import Chat from "./components/Chat"; // Import Chat component

const App: React.FC = () => {
  return (
    <div>
      <h1 className="text-black-100 text-5xl text-center">Real-Time Chat App</h1>
      <Chat />
    </div>
  );
};

export default App;
