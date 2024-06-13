import express from 'express';
import cors from 'cors';
import http, { get } from 'http';
import { WebSocketServer } from 'ws';
import Player from "./player.js";
import { v4 as uuidv4 } from 'uuid';
import { Vector3, HavokPlugin, NullEngine, Scene } from '@babylonjs/core';
import HavokPhysics from "@babylonjs/havok";
import { Game } from './game.js';
import xhr2 from 'xhr2';
import '@babylonjs/loaders';

//Begin creating our express server

globalThis.XMLHttpRequest = xhr2;
console.log("Starting...");

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

let corsOptions = {
    origin: ['*'],
}

app.use(cors(corsOptions));

//Create the websocket and the public folder for the assets
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.use(express.static('public'));

//Initialize the game
let players = new Map();
const game = new Game();
game.initializeScene().then((evt)=>{
    console.log("Scene loaded");
});

//Broadcast message to send updates to all players in the room
function broadcast(msg) {
    console.log("Broadcast starting...");
    console.log(game.players.size)
    // for (let player of players.values()) {
    for(let player of game.players.values()){
        console.log("Sending to %s", player.username);
        player.socket.send(msg);
    }
}

//Function to get the texture of a player, not used yet
function getTexture() {
    return "skin" + Math.floor((Math.random() * 2) + 1);
}

//Create our socket functionality
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    //On close, broadcast the delete to the other players and remove them from the server
    ws.on('close', function close(data) {
        if (ws.ID) {
            broadcast(JSON.stringify({
                timestamp: Date.now(),
                type: "delete",
                username: game.players.get(ws.ID).username
            }));
            game.removePlayer(ws.ID);
        }
        console.log("Connection closed");
    });

    //On receiving a message, switch through the different types
    //and pick as necessary
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
                if (game.players.size > 0) {
                    for (let member of game.players.values()) {
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
                game.addPlayer(player);
                ws.send(JSON.stringify({
                    type: msg.type,
                    PID: player.PID,
                    username: player.username,
                    texture: player.texture
                }));
                break;
            case "movement":
                // console.log("movement recevied %s", data);
                // game.players.get(msg.PID).updatePosition(msg.position);
                var player = game.players.get(msg.PID);
                // console.log(player.model);
                player.updatePosition(msg.position, msg.rotation);
                // broadcast(JSON.stringify({
                //     timestamp: Date.now(),
                //     type: "member_movement",
                //     username: player.username,
                //     position: msg.position,
                //     rotation: msg.rotation,
                // }));
                break;
            case "movement_input":
                console.log(msg);
                var player = game.players.get(msg.PID);
                player.addInput(msg.vertical, msg.horizontal, msg.position, msg.rotation);
                break;
            case "grab":
                console.log(msg);
                //When a player grabs, get the associated player using the msg.PID
                //and the item they grabbed
                var player = game.players.get(msg.PID);
                player.right_hand = msg.item;

                //Next, broadcast the update to the other players so their scene
                //can parent the item to necessary player
                if (game.players.size > 1) {
                    broadcast(JSON.stringify({
                        timestamp: Date.now(),
                        type: "member_grabbed",
                        item: msg.item,
                        username: player.username
                    }));
                }

                //Finally, give the okay to the player who grabbed to pick it up
                ws.send(JSON.stringify({
                    timestamp: Date.now(),
                    type: "grabbed",
                    item: msg.item
                }));
                break;
            case "release":
                var player = game.players.get(msg.PID);
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
                let pool = game.restock_manager.restock(msg.item);
                if (pool) {
                    broadcast(JSON.stringify({
                        timestamp: Date.now(),
                        type: "spawn_response",
                        item: msg.item,
                        pool: pool,
                    }));
                    game.restock_manager.timer = 1000;
                    setTimeout(()=>{
                        game.restock_manager.timer = 0
                    }, game.restock_manager.timer);
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