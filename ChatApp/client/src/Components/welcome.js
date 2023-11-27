import React from 'react';
import '../App.css';

export default function Welcome() {
  const [data, setData] = React.useState({
    email: "",
    password: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  }

  async function login(event) {
    event.preventDefault();
    // send a POST request to server with the user's login details
    const response = await fetch("/api/users/auth/login", {
      method: "POST",
      cache: "no-cache",
      headers: {"Content-Type": "application/json"},
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
      credentials: "same-origin",
    });

    // direct the user to the chat room if a valid response is received
    // and save the token to local storage
    if (response["status"] !== 403) {
      const responseData = await response.json();
      localStorage.setItem("token", responseData["token"]);
      window.location.href = "/chat?user=" + data["email"];
    }
    else {
      const errorMsg = document.getElementById("error");
      errorMsg.textContent = "Login details are incorrect";
    }
  }

  return (
    <div className="App">
      <h1>Login to Chat</h1>
      <form>
        <p id="error"></p>
        <input placeholder="Email" name="email" type="text" onChange={handleChange} /><br />
        <input placeholder="Password" name="password" type="password" onChange={handleChange} /><br />
        <button onClick={login}>Login</button>
      </form>
      <br />
      <a href="/register">Don't have an account?</a>
    </div>
  );
}