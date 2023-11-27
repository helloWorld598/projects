const socket = new SockJS('chatting');
const stompClient = Stomp.over(socket);

const sendMsg = (e) => {
    msg = JSON.parse(document.getElementById("msg").value);

    if (msg["to"] === "all") {
        stompClient.send("/app/chatting", {}, JSON.stringify(msg));
    }
    else {
        stompClient.send("/app/user/chatting", {}, JSON.stringify(msg));
        showMsg(msg);
    }

    e.preventDefault();
}

const initilising = () => {
    msg = JSON.parse(document.getElementById("init").value);
    stompClient.send("/app/initialising", {}, JSON.stringify(msg));
}

stompClient.connect({}, function () {
    stompClient.subscribe('/user/chat', function (msg) {
        showMsg(msg.body);
    });

    stompClient.subscribe('/chat', function (msg) {
        showMsg(msg.body);
    });
});

const showMsg = (msg) => {
    const p = document.createElement("p");
    p.textContent = JSON.stringify(msg);
    document.getElementById("chat").appendChild(p);
}

document.getElementById("sender").onclick = sendMsg;
document.getElementById("initialise").onclick = initilising;