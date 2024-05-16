import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
console.log("Starting...");

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

let corsOptions = {
    origin: ['*'],
}

app.use(cors(corsOptions));

const server = http.createServer(app);
const wss = new WebSocketServer({server});

wss.on('connection', function connection(ws){
    ws.on('error', console.error);
    ws.on('close', function close(data){
        console.log("Connection closed");
    });
    ws.on('message', function message(data){
        console.log("received %s", data);
    });
});

server.listen(PORT, ()=>{
    console.log(`Server listening on ${PORT}`);
})