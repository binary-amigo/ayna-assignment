"use strict";
const { Server } = require("socket.io");
const axios = require("axios");

module.exports = {
  register() {},

  bootstrap({ strapi }) {
    if (!strapi.server || !strapi.server.httpServer) {
      console.error("Strapi HTTP server not found.");
      return;
    }

    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "http://localhost:5174",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join", ({ username }) => {
        console.log("Username:", username);

        if (username) {
          socket.join("group");
          socket.emit("welcome", {
            user: "bot",
            text: `${username}, Welcome to the group chat!`,
            userData: username,
          });
        } else {
          console.error("Error: Username is missing!");
          socket.emit("error", { message: "Username is required to join." });
        }
      });

      socket.on("sendMessage", async (data) => {
        try {
          const strapiData = { data: { user: data.user, message: data.message } };
          await axios.post("http://localhost:1337/api/messages", strapiData);

          io.to("group").emit("message", {
            user: data.user, // Fixed username issue
            text: data.message,
          });
        } catch (error) {
          console.error("Message saving error:", error.message);
          socket.emit("error", { message: "Failed to send message." });
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    strapi.io = io; // Attach Socket.IO instance to Strapi
  },
};
