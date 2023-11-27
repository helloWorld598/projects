import Header from "./Header";
import React, { useState } from "react";

// functions creates the menu that is displayed when the user first visits the site 
export default function Menu() {
    const [id, setId] = useState(-1);

    function showInput() {
        // if the user does not have an id set by the session then a field will 
        // appear telling the user to enter the name when they choose to play online
        // otherwise the user needs to submit their name
        if (id === -1) {
            const inputs = document.querySelectorAll(".hidden");
            inputs[0].classList.toggle("visibleInput");
            inputs[1].classList.toggle("visibleInput");
        }
        
        else {
            document.getElementById("form").submit();
        }
    }

    function offlineSubmit() {
        const offlineButton = document.getElementById("offline");
        offlineButton.value = "true";
    }

    function disableEnter(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    }

    function checkInput(event) {
        const element = document.getElementById("nameInput");
        const offlineButton = document.getElementById("offline");
        // if the user enters an empty name when choosing to play online, do not submit
        if (element.value.trim() === "" && offlineButton.value === "false") {
            event.preventDefault();
        }
    }

    React.useEffect(() => {
        // checks with the server whether the user already has a session
        fetch("/api")
            .then(res => res.json())
            .then(data => setId(data.id === undefined ? -1 : data.id))
    })

    return (
        <React.Fragment>
            <Header />

            <form method="POST" id="form" onSubmit={checkInput}>
                <button name="offline" value="false" style={{ marginRight: "10px" }} id="offline" onClick={offlineSubmit}>Play offline with a friend</button>
                <button type="button" onClick={showInput} style={{ marginLeft: "10px" }}>Play online</button> <br /><br />
                <input type="text" name="name" placeholder="type in your name" id="nameInput" className="hidden" onKeyDown={disableEnter} /> <br />
                <input type="submit" name="online" value="submit" id="sendName" className="hidden" />
            </form>
        </React.Fragment>
    )
}