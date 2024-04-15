import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import chatBox from "./database/mongodb/chatBoxDB.js";
import connectDb from "./database/mongodb/connectDb.js";
dotenv.config();
const socKetChat = express();
connectDb();
const PORT = process.env.PORT || 4000;
socKetChat.use(cors());
socKetChat.use(express.static("database"));
socKetChat.use(bodyParser.urlencoded({ extended: false }));
socKetChat.use(bodyParser.json());
const server = http.createServer(socKetChat);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  //   console.log("Client connected");
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, messageContent, images } = data;

    try {
      const newMessage = new chatBox({
        senderId,
        receiverId,
        messageContent,
        images,
      });
      await newMessage.save();
      io.emit("message", newMessage);
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

//todo:  Lấy tất cả các tin nhắn
socKetChat.get("/api/chatBox/all", async (req, res) => {
  try {
    const messages = await chatBox.find().sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//todo:  Lấy các tin nhắn giữa hai người dùng cụ thể
socKetChat.get("/api/chatBox/", async (req, res) => {
  const { senderId, receiverId } = req.query;

  try {
    const messages = await chatBox
      .find({
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      })
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//todo:  Xóa tất cả các tin nhắn giữa hai người dùng cụ thể
socKetChat.delete("/api/chatBox/", async (req, res) => {
  const { senderId, receiverId } = req.query;
  try {
    await chatBox.deleteMany({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    res.status(200).json({ message: "Tin nhắn đã được xóa thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
});

// Lắng nghe các kết nối đến cổng 3000
server.listen(PORT, () => {
  console.log("Server chat is running on port 4000");
});

// export default socKetChat;
