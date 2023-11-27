import logo from "../assets/pawnW.png"

// function deals with drawing the header of the website on the top of the screen which includes
// text and an image on the left hand side which when clicked will take the user to the home page
export default function Header() {
    function returnHome() {
        const link = window.location.href.split('/').slice(0, 3);
        window.location.href = link[0] + "//" + link[1] + link[2];
    }
    return (
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" onClick={returnHome} style={{ width: "50px", height: "50px" }} />
            <p className="title" style={{ display: "inline-block", marginLeft: "40%" }}>
                Play Chess
            </p>
        </header>
    )
}