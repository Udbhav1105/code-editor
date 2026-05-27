import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const httpServer = createServer(app);
app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(cors());
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const ysocketio = new YSocketIO(io);

ysocketio.initialize();
app.post("/run", async (req, res) => {

  try {

    const { code, id } = req.body;

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        language_id: id,
        source_code: code
      }
    );

    res.json(response.data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Execution failed"
    });

  }

});
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const frontendPath = path.join(
  __dirname,
  "../frontend/dist"
);

app.use(express.static(frontendPath));
app.get(/.*/, (req, res) => {

  res.sendFile(
    path.join(frontendPath, "index.html")
  );

});
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, "0.0.0.0", () => {

  console.log(`Server running on port ${PORT}`);

});