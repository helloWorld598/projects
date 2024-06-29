import Header from "./Header";
import React, { useState } from "react";

// function creates the menu that is displayed when the user first visits the site
export default function Menu() {
    const [session, setSession] = useState(-1);

    // function to toggle visibility of input fields based on whether the user has a session
    function showInput() {
        // if the user does not have an session with the server then a field will appear
        // telling the user to enter a username when they choose to play online otherwise
        // the user can join the queue using the username saved in the user session.
        if (session === -1) {
            const inputs = document.querySelectorAll(".hidden");
            inputs[0].classList.toggle("visibleInput");
            inputs[1].classList.toggle("visibleInput");
        } else {
            document.location = document.location + "connect";
        }
    }

    function offlineSubmit() {
        const offlineButton = document.getElementById("offline");
        offlineButton.value = "true";
    }

    // function to prevent form submission on Enter key press
    function disableEnter(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    }

    // function to validate input to username field and handle form submission
    function checkInput(event) {
        const element = document.getElementById("nameInput");
        const offlineButton = document.getElementById("offline");
        // if the user enters an empty name when choosing to play online, do not submit
        if (element.value.trim() !== "" && offlineButton.value === "false") {
            // submit the user's provided username to the server.
            // if the submission was successful redirect the user, otherwise prompt the
            // user to enter another username as the one they chose had already been used
            fetch("/api/add", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": document.getElementById("nameInput").value})
            })
                .then(res => {
                    if (res["status"] === 200) {
                        document.location = document.location + "connect";
                    } else {
                        document.getElementById("error").textContent = "Username is already in use. Please choose another username";
                        document.getElementById("error").style.color = "red";
                    }
                });
        }
        // handles users choosing to play the game without connecting with another user
        else if (offlineButton.value === "true") {
            document.location = document.location + "play";
        }
        event.preventDefault();
    }

    // effect hook to check if user already has a session on page load
    React.useEffect(() => {
        // checks with the server whether the user already has a session
        fetch("/api/get")
            .then(data => {
                if (data["status"] === 200) {
                    return data.json();
                } else {
                    return null;
                }
            })
            .then(data => {
                setSession(data !== null ? data : -1);
            });
    }, [])

    return (
        <React.Fragment>
            <Header />
            <form method="POST" id="form" onSubmit={checkInput}>
                <p id="error"></p>
                <button name="offline" value="false" style={{ marginRight: "10px" }} id="offline" onClick={offlineSubmit}>Play offline with a friend</button>
                <button type="button" onClick={showInput} style={{ marginLeft: "10px" }}>Play online</button> <br /><br />
                <input type="text" name="name" placeholder="type in your name" id="nameInput" className="hidden" onKeyDown={disableEnter} /> <br />
                <input type="submit" name="online" value="submit" id="sendName" className="hidden" />
            </form>
        </React.Fragment>
    )
}