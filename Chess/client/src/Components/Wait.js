import React from "react"
import Header from "./Header"

export default function Wait() {
    return (
        <React.Fragment>
            <Header />
            <section className="waiting">
                <p>Waiting for another Player to join...</p>
            </section>
        </React.Fragment>
    )
}