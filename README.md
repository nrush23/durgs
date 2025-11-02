# Welcome to Durg's Durgers: Land of the Durg!
<p align="center">
    <img src="client/public/assets/images/thumbnail.PNG" alt="Primordial Durg" width="400"><br>
    <em>Multiplayer Babylon.js fast food simulator using Havok Physics and websockets</em>
</p>

## What is this?
Welcome to Durg's Durgers, a multiplayer fast food simulator built for the web using Babylon.js and Havok Physics.
In this game, control and operate your own yellow guy as you burn burgers and flip chaos. Still largely in development,
this iteration of the game represents Durg's Durgers V0, our first attempt at implementing ragdoll physics and multiplayer servers.
Overall, a lot of significant progress was made and lots learned, but it's time for this prototype to go back to the drawing board.
<p align="center">
    <img src="client/public/assets/images/burger_gif.gif" alt="Burger Gif" width="400">
</p>  

In the next iteration of Durg's Durgers, we will build on all the knowledge we gained here, creating a tighter and cleaner experience.
We will also continue to implement more features and add functionality, hoping to have a full working game within the next 3 years.
Keep track of the latest game updates on [Durg's Durgers: The Blog](https://durgsdurgers.com/)!  

## Legacy Edition

### **To compile this version of Durg's Durgers, read the following instructions:**
1. Download the zip folder of this repository and unzip it somewhere on your computer.
2. Now open a terminal in the root folder of this project: `durgs`
3. Change directory into the `server` folder.
4. Install the server packages with `npm install`  
You have now finished setting up the server backend.  

5. Now open up another terminal in the root project folder `durgs`
6. Change directory into the `client` folder.
7. Install the client packages using `npm install`  
You have now finished setting up the client frontend.

### **To run a local multiplayer server, follow these instructions:**
1. If you have not installed the server and client side packages, follow steps 1 through 7 above.
2. Open a terminal inside the `server` folder.
3. Begin running the server with `npm run debug` Now leave this terminal running in the background
4. Open a terminal inside the `client` folder.
5. Run the application with `npm start`
6. To access a client side portal, click on the link provided in the terminal or go to `http://xxx.xxx.xxx.xxx:8080` where `xxx.xxx.xxx.xxx` is the `IP address` of your `local machine`
Other players on the same network can join by visiting the same link.