'''
socket_routes
file containing all the routes related to socket.io
'''


from flask_socketio import join_room, emit, leave_room
from flask import request, session

try:
    from __main__ import socketio
except ImportError:
    from app import socketio

from models import Room

import db

room = Room()
room.counter.counter = db.get_max_room_id()

user_sids = {}
user_keys = {}

# when the client connects to a socket
# this event is emitted when the io() function is called in JS
@socketio.on('connect')
def connect():
    username = None
    if "username" in session:
        username = session["username"]
        user_sids[username] = request.sid
        online = user_sids.keys()
        emit("connected", (list(online)), broadcast=True)

    room_id = room.get_room_id(username)

    if room_id is None or username is None:
        return
    
    # socket automatically leaves a room on client disconnect
    # so on client connect, the room needs to be rejoined
    join_room(int(room_id))
    emit("room", (f"{username} has connected", room_id), to=int(room_id))

# event when client disconnects
# quite unreliable use sparingly
@socketio.on('disconnect')
def disconnect():
    username = None
    
    if "username" in session:
        username = session["username"]
        if username in user_sids:
            del user_sids[username]

    room_id = room.get_room_id(username)
    if room_id is None or username is None:
        return
    
    emit("incoming", (f"{username} has disconnected", "red"), to=int(room_id))

# send friend request event handler
@socketio.on('request')
def send_friend_request(receiver):
    username = None
    if "username" in session:
        username = session["username"]
    else:
        return "unauthorised friend request"
    
    current_friends = db.get_all_friends(username)
    prior_friend_requests = db.get_friend_requests(sender=username, receiver=receiver, room=",".join(sorted([username, receiver])))
    decided = False

    if not prior_friend_requests:
        if username != receiver:
            if (current_friends is None) or (current_friends is not None and receiver not in current_friends.split(",")):
                if db.get_user(receiver): 
                    created_request_id = db.create_request(username, receiver)
                    emit("request_success", (username, receiver), to=user_sids[username])
                    if receiver in user_sids:
                        emit("new_request", (username, created_request_id, ",".join(sorted([username, receiver])), 0), to=user_sids[receiver])
                    return
    
    elif (current_friends is None) or (current_friends is not None and receiver not in current_friends.split(",")):
        for friend_request in prior_friend_requests:
            if friend_request.status == -1:
                decided = True

        if db.get_user(receiver) and not decided:
            db.update_request_status(prior_friend_requests[0].request_id, receiver, -1)
            emit("request_success", (username, receiver), to=user_sids[username])
            if receiver in user_sids:
                created_request = db.get_friend_requests(room=",".join(sorted([username, receiver])))
                emit("new_request", (username, created_request[0].request_id, ",".join(sorted([username, receiver]), 0)), to=user_sids[receiver])
            return
                
    return "invalid friend request"

@socketio.on('get_request_id')
def get_request_id(sender, receiver):
    requests = db.get_friend_requests(room=",".join(sorted([sender, receiver])))
    if requests:
        emit('request_id', {'request_id': requests[0].request_id, 'sender': sender, 'receiver': receiver})

# update friend request status event handler
@socketio.on('update_request')
def update_friend_request(request_id, request_sender, new_status):
    if "username" in session:
        if new_status == '0' or new_status == '1':
            new_request = db.update_request_status(request_id, session["username"], new_status)
            if new_request:
                if request_sender in user_sids:
                    emit("updated_request", (request_id, session["username"], new_status, new_request["chat_type"], new_request["room"]), to=user_sids[request_sender])

# remove friend event handler
@socketio.on('remove_friend')
def remove_friend(request_id):
    if "username" in session:
        users_affected = db.remove_friend(request_id, session["username"])
        if users_affected:
            for user in users_affected:
                if user in user_sids:
                    emit("update_friends", users_affected, to=user_sids[user])

# create a group chat
@socketio.on('create_group')
def create_group_chat(group_name, receivers):
    if "username" in session:
        if ',' in group_name:
            return "commas not permitted in name of group chat"
        
        for user in receivers:
            if db.get_user(user) is None:
                return "some invited users do not exist"
            elif user == session["username"]:
                return "cannot have yourself as one of the invited users"
 
        receivers.append(session["username"])

        chat_room = db.get_room(room_name=group_name)
        
        if chat_room is not None:
            room_id = chat_room.room_id
            new_users = []

            for user in receivers[:-1]:
                if user not in chat_room.users.split(","):
                    new_users.append(user)
                    created_request_id = db.create_request(session["username"], user, group_name)
                    if user in user_sids:
                        emit("new_request", (session["username"], created_request_id, group_name, 1), to=user_sids[user])

            db.add_users_to_room(group_name, new_users)

            return

        elif chat_room is None and db.get_user(group_name) is None:
            room_id = room.create_room(session["username"])
            db.create_room(room_id, receivers, group_name)
            emit("request_success", (session["username"], group_name, 1), to=user_sids[session["username"]])
            
            for user in receivers[:-1]:
                created_request_id = db.create_request(session["username"], user, group_name)
                if user in user_sids:
                    emit("new_request", (session["username"], created_request_id, group_name, 1),  to=user_sids[user])
            
            return
        
        else:
            return "name of group chat must be unique and cannot match name of other users"

    return "unauthorised access to create group chats"

# create article event handler
@socketio.on("create_article")
def create_article(title, content):
    if "username" not in session:
        return "unauthorised access to post article"
    
    if not db.get_blacklists(session["username"], "articles"):
        db.create_article(title=title, content=content, author=session["username"])

        db_articles = db.get_all_articles()
        articles = []

        for article in db_articles:
            articles.append({"article_id": article.article_id, "title": article.title, "author": article.author, "content": article.content})

        emit("update_articles", articles, broadcast=True)

        return "article successfully posted"
    
    return "user prevented from posting an article"

# edit article event handler
@socketio.on("edit_article")
def edit_article(article_id, new_title, new_content):
    if "username" not in session:
        return
    
    user = db.get_user(session["username"])

    db.update_article(article_id, new_title, new_content, user)

    db_articles = db.get_all_articles()
    articles = []
    for article in db_articles:
        articles.append({"article_id": article.article_id, "title": article.title, "author": article.author, "content": article.content})

    emit("update_articles", articles, broadcast=True)

# delete article event handler
@socketio.on("delete_article")
def delete_article(article_id):
    if "username" not in session:
        return

    db.delete_article(article_id)

    db_articles = db.get_all_articles()
    articles = []
    for article in db_articles:
        articles.append({"article_id": article.article_id, "title": article.title, "author": article.author, "content": article.content})

    emit("update_articles", articles, broadcast=True)

# send a comment to an article event handler
@socketio.on("comment")
def create_comment(article_id, content):
    if "username" not in session:
        return
    
    user = session["username"]
    db.create_comment(user, article_id, content)

    db_comments = db.get_comments(article_id)

    comments = []
    for comment in db_comments:
        comments.append({"comment_id": comment.comment_id, "author": comment.author, "content": comment.content, "article_id": comment.article_id})

    emit("update_comments", {"article_id": article_id, "comments": comments}, broadcast=True)

# delete a comment from an article event handler
@socketio.on("delete_comment")
def delete_comment(comment_id, article_id):
    if "username" not in session:
        return

    user = session["username"]
    db.delete_comment(comment_id, user)

    db_comments = db.get_comments(article_id)

    comments = []
    for comment in db_comments:
        comments.append({"comment_id": comment.comment_id, "author": comment.author, "content": comment.content, "article_id": comment.article_id})

    emit("update_comments", {"article_id": article_id, "comments": comments}, broadcast=True)

# send message event handler
@socketio.on("new_send")
def send(receiver, encrypted_message, room_id):
    if "username" not in session:
        return
    
    chat_room = db.get_room(room_id=room_id)
    blacklists = db.get_blacklists(session["username"], "chat_rooms", chat_room.room_name)
    global_blacklist = db.get_blacklists(session["username"], "all_rooms")

    if chat_room and not blacklists and not global_blacklist:
        db.create_message(receiver, encrypted_message, chat_room.room_name)
        emit("new_incoming_message", {'message': encrypted_message, 'sender': session["username"], 'receiver': receiver}, room=room_id)
    
# join room event handler
# sent when the user joins a room
@socketio.on("join")
def join(receiver_name):
    if "username" not in session:
        return "Unknown sender!"

    receiver = db.get_user(receiver_name)
    chat_room = db.get_room(room_name=receiver_name)

    if receiver is None and chat_room is None:
        return "Unknown receiver!"
    
    sender_name = session["username"]
    
    sender = db.get_user(sender_name)
    if sender is None or sender_name != session["username"]:
        return "Unknown sender!"
    
    if sender_name == receiver_name:
        return "Invalid receiver!"
    
    if sender.friends is None or (sender.friends is not None and receiver_name not in sender.friends.split(",")):
        if sender.group_chats is None or (sender.group_chats is not None and receiver_name not in sender.group_chats.split(",")):
            return f"Not friends with {receiver_name}"

    room_id = room.get_room_id(sender_name)
    if chat_room is None:
        chat_room = db.get_room(room_name=",".join(sorted([sender_name, receiver_name])))

    # if the user is already inside of a room 
    if room_id is not None:
        blacklists = db.get_blacklists(session["username"], "chat_rooms", chat_room.room_name)
        global_blacklist = db.get_blacklists(session["username"], "all_rooms")

        if not blacklists and not global_blacklist:
            join_room(room_id)
            # emit to everyone in the room except the sender
            emit("incoming", (f"{sender_name} has joined the room.", "green"), to=room_id, include_self=False)
            # emit only to the sender
            emit("incoming", (f"{sender_name} has joined the room. Now talking to {receiver_name}.", "green"))

            for username in chat_room.users.split(","):
                user = db.get_user(username)
                if room_id in user_keys:
                    user_keys[room_id][username] = user.publicKey
                else:
                    user_keys[room_id] = {username: user.publicKey}

            emit("public_keys", (user_keys[room_id]), to=room_id)

            return room_id
        
        return "User has been prevented from joining the chat room"
 
    # if the user isn't inside of any room, 
    # perhaps this user has recently left a room
    # or is simply a new user looking to chat with someone
    room_id = None

    if chat_room is None:
        room_id = room.create_room(sender_name)
        db.create_room(room_id, [sender_name, receiver_name])
    else:
        room_id = chat_room.room_id
        room.join_room(sender_name, room_id)

    chat_room = db.get_room(room_id=room_id)
    blacklists = db.get_blacklists(session["username"], "chat_rooms", chat_room.room_name)
    global_blacklist = db.get_blacklists(session["username"], "all_rooms")
    
    if not blacklists and not global_blacklist:
        for username in chat_room.users.split(","):
            user = db.get_user(username)
            if room_id in user_keys:
                user_keys[room_id][username] = user.publicKey
            else:
                user_keys[room_id] = {username: user.publicKey}

        join_room(room_id)
        emit("public_keys", (user_keys[room_id]), to=room_id)
        emit("incoming", (f"{sender_name} has joined the room. Now talking to {receiver_name}.", "green"), to=room_id)

        return room_id
    
    return "User has been prevented from joining the chat room"

# leave room event handler
@socketio.on("leave")
def leave(room_id):
    if "username" not in session:
        return
    
    username = session["username"]
    emit("incoming", (f"{username} has left the room.", "red"), to=room_id)

    leave_room(room_id)
    room.leave_room(username)
