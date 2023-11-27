const express = require("express");
const app = express();
const Session = require("express-session");
const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});
const players = {};
const queue = [];
var ID = 0;

// cors is enabled so that the server is able to receive requests and socket
// messages from the client which is at localhost:3000
app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use(Session({ secret: "big secret", saveUninitialized: false, resave: false }));

app.post("/", (req, res) => {
    // if the user has chosen to play offer direct them to /play
    if (req.body.offline === "true") {
        res.redirect("/play");
    }

    // if the user chooses to play online, a session will be created
    // for the user and they will wait in a queue 
    else if (req.body.online === "submit") {
        req.session.num = ID;
        req.session.name = req.body.name;
        ID++;
        queue.push({ id: req.session.num, name: req.body.name });
        res.redirect("/wait");
    }

    // if the client already has a session then they can just be added
    // straight to the queue
    else if (req.session.num !== undefined) {
        // if the user's id is already in the queue do not add them again
        // this allows the user to leave the webpage and return and their 
        // position in the queue would not be affected
        let userInQueue = false;
        const userObj = { id: req.session.num, name: req.session.name };
        
        for (let i = 0; i < queue.length; i++) {
            if (JSON.stringify(queue[i]) === JSON.stringify(userObj)) {
                userInQueue = true;
                break;
            }
        }

        if (!userInQueue)
            queue.push(userObj);

        res.redirect("/wait");
    }
})

app.get("/api", (req, res) => {
    // send the user their id or information when requesting it
    if (req.session.num !== undefined) {
        // if not in the queue just send them their id
        if (players[req.session.num] === undefined) {
            res.json({ id: req.session.num });
        }

        else {
            res.json(players[req.session.num]);
        }
    }
})

io.on("connection", (socket) => {
    // upon receiving a connection from a socket client the server checks
    // that there is at least two users in the queue 
    if (queue.length >= 2) {
        const pair = queue.splice(0, 2);

        // the two users are then taken out of the queue and will be assigned as adversaries to one another
        // and a message will be broadcast telling the two players to start and also assigning them their colours,
        // and opponents name

        players[pair[0].id] = { id: pair[0].id, name: pair[0].name, opponent: pair[1].name, opponID: pair[1].id, colour: "white" };
        players[pair[1].id] = { id: pair[1].id, name: pair[1].name, opponent: pair[0].name, opponID: pair[0].id, colour: "black" };

        setTimeout(() => {
            io.emit('start', [{ to: pair[0].id, info: players[pair[0].id] }, { to: pair[1].id, info: players[pair[1].id] }]);
        }, 3000);
    }

    socket.on("play", (message) => {
        socket.broadcast.emit("move", message);
    })

    socket.on("concede", (message) => {
        socket.broadcast.emit("win", message);
    })

    socket.on("offer", (message) => {
        socket.broadcast.emit("offering", message);
    })

    socket.on("res", (message) => {
        socket.broadcast.emit("outcome", message);
    })
})

server.listen(3001);