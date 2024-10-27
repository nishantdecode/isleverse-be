const cors = require("cors");
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const userRoutes = require("./routes/userRoutes");

connectDB();
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Running!");
});

app.use("/api/user", userRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    credentials: true,
  },
  allowEIO3: true,
});

io.on("connection", (socket) => {
  console.log("New connection with ID:", socket.id); 
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    console.log(`Calling user ${userToCall} from ${from}`);
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    console.log(`Answering call to ${data.to}`);
    io.to(data.to).emit("callAccepted", { signal: data.signal, name : data.name, from : data.from });
  });

  socket.on("callEnded", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("sendMessage", ({ to, message }) => {
    io.to(to).emit("receiveMessage", { message });
  });
});

