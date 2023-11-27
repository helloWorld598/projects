import React from 'react';
import '../App.css';

export default function Message(props) {
    // logic deals with whether the message was broadcasted or sent to a specific user and handles this in the message's text accordingly
    return (
        <section className={props.mine ? 'message-container mine':'message-container not-mine'}>
            <div className='message-content'>{props.content} {(props.to !== "all" && <span>{props.mine ? "(sent to " + props.to + ")" : "(private)"}</span>)}</div>
            <p className='sender'>{props.from}</p>
        </section>
    )
}