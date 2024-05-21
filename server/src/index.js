import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import Player from "./player.js";
import { v4 as uuidv4 } from 'uuid';
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

let players = new Map();
let sockets = new Map();

wss.on('connection', function connection(ws){
    ws.on('error', console.error);
    ws.on('close', function close(data){
        console.log("Connection closed");
    });
    ws.on('message', function message(data){
        console.log("received %s", data);
        const msg = JSON.parse(data);

        switch(msg.type){
            case "join":
                let player = new Player();
                player.PID = players.size;
                player.username = "player" + player.PID;
                player.WID = uuidv4();
                players.set(player.PID, player);
                sockets.set(player.WID, ws);

                ws.send(JSON.stringify({
                    type: msg.type,
                    pid: player.PID,
                    username: player.username
                }));
                break;
            default:
                console.log("Invalid request type: %s", msg.type);
        }
    });
});

server.listen(PORT, ()=>{
    console.log(`Server listening on ${PORT}`);
})