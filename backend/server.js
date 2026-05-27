import express from 'express'
import {createServer} from 'http'
import {Server } from 'socket.io'
import {YSocketIO} from 'y-socket.io/dist/server'
import axios from 'axios'
import cors from 'cors'


const app=express()
const httpServer=createServer(app)
app.use(express.json())

app.use(express.static("public"))

app.use(express.urlencoded({extended:true}))
app.use(cors())
const io=new Server(httpServer,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

const ysocketio = new YSocketIO(io)

ysocketio.initialize()

// app.get("/",(req,res)=>{
//     res.status(200).json({
//         message:"Working fine",
//         success:true
//     })
// })

app.post('/run',async(req,res)=>{
    const {code,id}=req.body;
   const response = await axios.post(
  "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
  {
    language_id: id,
    source_code: code
  }
)
    res.json(response.data)
})


httpServer.listen(3000,()=>{
    console.log("server running on port 3000")
})