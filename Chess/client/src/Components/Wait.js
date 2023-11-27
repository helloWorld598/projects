import React, { useState } from "react"
import Header from "./Header"
import io from "socket.io-client-latest";

// function will connect to the socket server and create a wait screen that will
// appear when the user is still in the queue waiting for a user to play against
export default function Wait() {
    const socket = io();
    const [id, setId] = useState(-1);

    React.useEffect(() => {
        fetch("/api")
            .then(res => res.json())
            .then(data => { setId(data.id) });
    }, [id]);

    React.useEffect(() => {
        // logic for starting the game when receiving a start message from the server
        socket.on("start", (message) => {
            if (message[0].to === id || message[1].to === id) {
                const link = window.location.href.split('/').slice(0, 3);
                window.location.href = link[0] + "//" + link[1] + link[2] + "/connected";
            }
        })

        return (() => {
            socket.close("start");
        })
    },
        [socket])

    return (
        <React.Fragment>
            <Header />
            <section className="waiting">
                <p>Waiting for another Player to join...</p>
            </section>
        </React.Fragment>
    )
}