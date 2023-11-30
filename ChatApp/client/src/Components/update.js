import React from 'react';
import '../App.css';

export default function Update() {
    const [data, setData] = React.useState({});
    const [userData, setUserData] = React.useState({});
    const [authorised, setAuthorised] = React.useState(true);
    const urlParams = new URLSearchParams(window.location.search);
    const token = localStorage.getItem("token");
    const email = urlParams.get("user");
  
    function handleChange(event) {
      const { name, value } = event.target;
      setData({ ...data, [name]: value });
    }

    async function update(event) {
      event.preventDefault();

      // send a put request with the user's updated details
      const response = await fetch("/api/users/" + email, {
        method: "PUT",
        cache: "no-cache",
        headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token},
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
        credentials: "same-origin",
      });

      const responseText = await response.text();

      // if the response code is not 200 then there is an issue with the user's details,
      // the password may not be 6 letters or the phone number is not valid
      const errorMsg = document.getElementById("error");

      if (response["status"] !== 200) {
        if (responseText === "Bad Password")
            errorMsg.textContent = "Your password must be of at least length 6"
        else
            errorMsg.textContent = "Make sure your phone number is valid";
      }
      else {
        window.location.href = "/chat?user=" + email;
      }
    }

    async function deleteAccount(event) {
      event.preventDefault();

      await fetch("/api/users/" + email, {
        method: "DELETE",
        cache: "no-cache",
        headers: {"Authorization": "Bearer " + token},
        redirect: "follow",
        referrerPolicy: "no-referrer",
        credentials: "same-origin",
      });

      window.location.href = "/";
    }

    React.useEffect(() => {
        fetch("/api/users/" + email, {
            headers: {"Authorization": "Bearer " + token}
        })
            .then(res => {
                if (res.ok) {
                    return res.json()
                } 
                else {
                    return Promise.reject("Unauthorised");
                }
            })
            .then(data => setUserData(data))
            .catch(_ => {
                setAuthorised(false);
            });
    }, []);

    return (
        authorised ? (
            <div className="App">
                <h1>Update your details</h1>
                <form>
                    <p id="error"></p>
                    <p>Your email is {userData && userData.email}</p>
                    <input placeholder="Full Name" name="name" type="text" onChange={handleChange} /><br />
                    <input placeholder="Password" name="password" type="password" onChange={handleChange} /><br />
                    <input placeholder="Phone Number" name="phoneString" type="text" onChange={handleChange} /><br />
                    <button onClick={update}>Update details</button><br /> <br />
                    <button style={{backgroundColor: "red"}} onClick={deleteAccount}>Delete account</button>
                </form>
                <br />
            </div>
        ) : (
            <div className="App">
                <h3>You are not authorised to access this page</h3>
            </div>
        )
    );
}