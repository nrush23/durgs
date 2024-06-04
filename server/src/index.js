import express from 'express';
import cors from 'cors';
import http, { get } from 'http';
import { WebSocketServer } from 'ws';
import Player from "./player.js";
import { v4 as uuidv4 } from 'uuid';
import { Vector3, HavokPlugin } from '@babylonjs/core';
import HavokPhysics from "@babylonjs/havok";
import { Restock_Manager } from './restock_manager.js';
console.log("Starting...");

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

let corsOptions = {
    origin: ['*'],
}

app.use(cors(corsOptions));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let players = new Map();

const restock_manager = new Restock_Manager();

// const hk = await HavokPhysics();
// const havokPlugin = new HavokPlugin(true, hk);
// this.scene.enablePhysics(new Vector3(0, -9.81,0), havokPlugin);

// HavokPhysics().then((hk)=>{
//     const havokPlugin = new HavokPlugin(true, hk);
// });

function broadcast(msg) {
    console.log("Broadcast starting...");
    console.log(players.size)
    for (let player of players.values()) {
        console.log("Sending to %s", player.username);
        player.socket.send(msg);
    }
}

function getTexture() {
    return "skin" + Math.floor((Math.random() * 2) + 1);
}

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('close', function close(data) {
        /* TODO: Add in code to delete the player from the players and socket list */
        // let player = players.g
        if (ws.ID) {
            broadcast(JSON.stringify({
                timestamp: Date.now(),
                type: "delete",
                username: players.get(ws.ID).username
            }));
            players.delete(ws.ID);
            console.log("Player%s deleted", ws.ID);
        }
        console.log("Connection closed");
    });
    ws.on('message', function message(data) {
        // console.log("received %s", data);
        const msg = JSON.parse(data);

        switch (msg.type) {
            case "join":
                var player = new Player();
                player.PID = uuidv4();
                ws.ID = player.PID;
                player.username = "player" + player.PID;
                player.socket = ws;
                player.texture = getTexture();
                if (players.size > 0) {
                    for (let member of players.values()) {
                        member.socket.send(JSON.stringify({
                            timestamp: Date.now(),
                            type: "new_member",
                            username: player.username,
                            position: new Vector3(0, 0, 0),
                            texture: player.texture,
                        }));
                        ws.send(JSON.stringify({
                            timestamp: Date.now(),
                            type: "new_member",
                            username: member.username,
                            position: member.position,
                            texture: member.texture,
                        }));
                    }
                }
                players.set(player.PID, player);
                console.log(players.get(player.PID));
                ws.send(JSON.stringify({
                    type: msg.type,
                    PID: player.PID,
                    username: player.username,
                    texture: player.texture
                }));
                break;
            case "movement":
                // console.log("movement recevied %s", data);
                players.get(msg.PID).updatePosition(msg.position);
                broadcast(JSON.stringify({
                    timestamp: Date.now(),
                    type: "member_movement",
                    username: players.get(msg.PID).username,
                    position: msg.position,
                    rotation: msg.rotation,
                }));
                break;
            case "grab":
                console.log(msg);
                //When a player grabs, get the associated player using the msg.PID
                //and the item they grabbed
                var player = players.get(msg.PID);
                player.right_hand = msg.item;

                //Next, broadcast the update to the other players so their scene
                //can parent the item to necessary player
                broadcast(JSON.stringify({
                    timestamp: Date.now(),
                    type: "member_grabbed",
                    item: msg.item,
                    username: player.username
                }));

                //Finally, give the okay to the player who grabbed to pick it up
                ws.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "grabbed",
                    item: msg.item
                }));
                break;
            case "release":
                var player = players.get(msg.PID);
                player.right_hand = "";

                //Next, broadcast the update to the other players so their scene
                //can parent the item to necessary player
                broadcast(JSON.stringify({
                    timestamp: Date.now(),
                    type: "member_released",
                    item: msg.item,
                    username: player.username
                }));

                //Finally, give the okay to the player who grabbed to pick it up
                ws.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "released"
                }));
                break;
            case "spawn_request":
                let pool = restock_manager.restock(msg.item);
                if (pool) {
                    broadcast(JSON.stringify({
                        timestamp: Date.now(),
                        type: "spawn_response",
                        item: msg.item,
                        pool: pool,
                    }));
                    restock_manager.timer = 1000;
                    setTimeout(()=>{restock_manager.timer = 0}, restock_manager.timer);
                }
                break;
            default:
                console.log("Invalid request type: %s", msg.type);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
})