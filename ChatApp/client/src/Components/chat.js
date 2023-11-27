import React from 'react';
import '../App.css';
import Message from './message';

export default function Chat() {
    const [data, setData] = React.useState({});
    const [messages, setMessages] = React.useState([]);
    const [count, setCount] = React.useState(0);
    const [users, setUsers] = React.useState([]);
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = localStorage.getItem("token");
    const email = urlParams.get("user");

    function showMsg(message) {
        if (message["from"] === email) {
            setMessages(prevArray => [...prevArray, <Message mine={true} content={message["content"]} from="You" to={message["to"]} key={count} />]);
        }
        else {
            setMessages(prevArray => [...prevArray, <Message mine={false} content={message["content"]} from={message["from"]} to={message["to"]} key={count} />]);
        }
        setCount(count + 1);
    }

    React.useEffect(() => {
        fetch("/api/users/" + email, {
            headers: {"Authorization": "Bearer " + token}
        })
            .then(res => res.json())
            .then(data => setData(data));
    }, []);

    React.useEffect(() => {
        const client = new WebSocket("ws://localhost:3001/websocket");
        
        // user sends init message to server upon the client entering the chat room
        client.addEventListener('open', () => {
            const toSend = {"to": "all", "from": email, "content": "", "name": "", "type": "INIT"};
            client.send(JSON.stringify(toSend));
        });
        
        // upon receiving a message from the server the client displays it but if it is a
        // 'SERVER_MSG' then the information is added to the list of users currently in chat room
        client.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message["type"] === "SERVER_MSG") {
                setUsers(_ => message["content"].split(" ").slice(0, -1));
            }
            else {
                showMsg(message);
            }
        });

        // creates the message that will be sent to the server and then its intended destination
        const sendMsg = () => {
            const msg = document.getElementById("msg").value;
            const receiver = document.getElementById("selectedUser").value;
            const message = {to: "all", "from": data["email"], content: msg, name: data["name"], "type": ""};
            // if the user specified that the receiver would be an individual, change the message's destination
            if (receiver !== "" && receiver !== "all") {
                message["to"] = receiver;
                showMsg(message);
            }
            client.send(JSON.stringify(message));
            document.getElementById("msg").value = "";
        }

        document.getElementById("send").onclick = sendMsg;

        return () => {
            client.removeEventListener('open', () => {});
            client.removeEventListener('message', () => {});
            client.close();
        }
    }, [data]);

    return (
        <div className="App">
            <section className='messages' id='messages'>
                {messages}
            </section>
            <section className='messaging'>
                <select className='receiver-selection' id="selectedUser">
                    <option value="" selected disabled>Select user to send private message</option>
                    <option value="all">all</option>
                    {users.map((item, _) => (
                        item !== email && <option value={item}>{item}</option>
                    ))}
                </select>
                <input placeholder='Send a message' id='msg' />
                <button id='send'>Send</button>
            </section>
        </div>
    );
}