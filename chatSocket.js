const { Server } = require("socket.io");
const Message = require("../models/Message");

function initSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("joinRoom", async ({ username, room }) => {
      socket.join(room);
      const messages = await Message.find({ room }).sort({ timestamp: -1 }).limit(50);
      socket.emit("previousMessages", messages.reverse());
    });

    socket.on("sendMessage", async ({ username, room, content }) => {
      const message = await Message.create({ sender: username, room, content });
      io.to(room).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

module.exports = { initSocket };