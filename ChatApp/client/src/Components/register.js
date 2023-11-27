import React from 'react';
import '../App.css';

export default function Register() {
  const [data, setData] = React.useState({
      email: "",
      password: "",
      name: "",
      phoneString: "",
      role: "USER"
    });
  
    function handleChange(event) {
      const { name, value } = event.target;
      setData({ ...data, [name]: value });
    }

    async function register(event) {
      event.preventDefault();

      // send a post request with the user's registration details
      const response = await fetch("/api/users/auth/register", {
        method: "POST",
        cache: "no-cache",
        headers: {"Content-Type": "application/json"},
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
        credentials: "same-origin",
      });

      // if the response code is not 200 then there is an issue with the user's details,
      // where one field may be empty or the user's email and phone number are not unique
      const errorMsg = document.getElementById("error");
      if (response["status"] !== 200) {
        errorMsg.textContent = "Make sure your email and phone number are unique and are valid";
      }
      else {
        window.location.href = "/";
      }
    }

  return (
      <div className="App">
          <h1>Register your details</h1>
          <form>
              <p id="error"></p>
              <input placeholder="Full Name" name="name" type="text" onChange={handleChange} /><br />
              <input placeholder="Email" name="email" type="text" onChange={handleChange} /><br />
              <input placeholder="Password" name="password" type="password" onChange={handleChange} /><br />
              <input placeholder="Phone Number" name="phoneString" type="text" onChange={handleChange} /><br />
              <button onClick={register}>Register</button>
          </form>
          <br />
          <a href="/">Already have an account?</a>
      </div>
  );
}