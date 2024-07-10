'''
app.py contains all of the server application
this is where you'll find all of the get/post request handlers
the socket event handlers are inside of socket_routes.py
'''

from flask import Flask, render_template, request, abort, url_for, session, Markup, redirect
from flask_socketio import SocketIO
import db
import secrets
import bcrypt
import os
from jinja2 import Environment, FileSystemLoader, select_autoescape

# import logging

# this turns off Flask Logging, uncomment this to turn off Logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)

app = Flask(__name__)
app.jinja_env = Environment(loader=FileSystemLoader('templates'), autoescape=select_autoescape(['html', 'xml', 'jinja']))

# secret key used to sign the session cookie
app.config['SECRET_KEY'] = secrets.token_hex()

# settings to secure session cookie being sent to client
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'strict'

socketio = SocketIO(app)

unit_rooms_id = -1

# generate the server's secret key and iv which will be used
# by client later to encrypt their password derived key
session_keys = {}

# don't remove this!!
import socket_routes

# index page
@app.route("/")
def index():
    if "username" in session:
        return redirect(url_for("friends"))
    return render_template("index.jinja", url_for=url_for)

# login page
@app.route("/login")
def login():    
    return render_template("login.jinja", url_for=url_for)

# handles a post request when the user clicks the log in button
@app.route("/login/user", methods=["POST"])
def login_user():
    if not request.is_json or request.json.get("username") is None or request.json.get("password") is None:
        abort(404)

    username = request.json.get("username")
    password = request.json.get("password")

    user = db.get_user(username)
    if user is None:
        return "Error: User does not exist!"
    
    if not bcrypt.checkpw(password.encode('utf-8'), user.password):
        return "Error: Password does not match!"

    session["username"] = username
    session_keys[session["username"]] = {"key": os.urandom(16).hex(), "iv": os.urandom(16).hex()}

    return url_for('friends')

# handles the user logging out
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# handles a get request to the signup page
@app.route("/signup")
def signup():
    return render_template("signup.jinja", url_for=url_for)

# handles a post request when the user clicks the signup button
@app.route("/signup/user", methods=["POST"])
def signup_user():
    global unit_rooms_id

    if not request.is_json:
        abort(404)

    username = request.json.get("username")
    password = request.json.get("password")
    user_key_salt = request.json.get("salt")
    role = request.json.get("role")
    units = request.json.get("units").lower()

    if "," in username:
        return "Error: Commas not permitted in username!"
    
    if "Unit: " in username:
        return "Error: 'Unit:' not allowed in username!"
    
    if role != "student" and role != "staff":
        return "Error: Invalid role provided"
    
    role = role.replace(" ", "")

    salt = bcrypt.gensalt()
    hashed_pass = bcrypt.hashpw(password.encode('utf-8'), salt)

    if db.get_user(username) is None and db.get_room(room_name=username) is None:
        db.insert_user(username, hashed_pass, ",".join(str(num) for num in user_key_salt), role, units)
        session["username"] = username
        session_keys[session["username"]] = {"key": os.urandom(16).hex(), "iv": os.urandom(16).hex()}

        if role == "staff":
            for unit in units.split(","):
                enrolled_users = db.get_users_in_unit(unit)
                enrolled_users.append(session["username"])
                if db.get_room(room_name=f"Unit: {unit}") is None:
                    db.create_room(unit_rooms_id, enrolled_users, f"Unit: {unit}", True)
                    db.make_users_members(f"Unit: {unit}", enrolled_users, session["username"])
                    unit_rooms_id -= 1
                else:
                    db.make_users_members(f"Unit: {unit}", [session["username"]])
                    db.add_users_to_room(f"Unit: {unit}", [session["username"]])
        
        else:
            for unit in units.split(","):
                room = db.get_room(room_name=f"Unit: {unit}")
                if room:
                    db.make_users_members(f"Unit: {unit}", [session["username"]])
                    db.add_users_to_room(f"Unit: {unit}", [session["username"]])

        return url_for('friends')
    
    return "Error: User already exists!"

# handler when a "404" error happens
@app.errorhandler(404)
def page_not_found(_):
    return render_template('404.jinja'), 404

# home page, where the messaging app is
@app.route("/home")
def home():
    if "username" not in session or request.args.get("chatwith") is None:
        abort(403)

    friend = request.args.get("chatwith")
    user_friends = db.get_all_friends(session["username"])
    user_chat_groups = db.get_all_chat_groups(session["username"])
    unescaped_username = Markup(session["username"].replace('"', '\\"').replace("</script>", "<\/script>"))

    if (user_friends and friend in user_friends.split(",")) or (user_chat_groups and friend in user_chat_groups.split(",")):
        chat_room = db.get_room(room_name=friend)
        retrieved_msgs = None

        if chat_room is None:
            retrieved_msgs = db.get_msg_history(session["username"], [session["username"], friend])
        else:
            retrieved_msgs = db.get_msg_history(session["username"], [db.get_room(room_name=friend).room_name])

        chat_history = []
        for message in retrieved_msgs:
            chat_history.append(message[0])

        if user_chat_groups:
            user_chat_groups = user_chat_groups.split(",")
        else:
            user_chat_groups = []

        friends = []
        if user_friends:
            for friend in user_friends.split(","):
                friend_role = db.get_user(friend).role
                friends.append({"username": friend, "role": friend_role}) 

        return render_template("home.jinja", username=session["username"], role=db.get_user(session["username"]).role, chat_with=friend, unescaped=unescaped_username, chat_history=Markup(chat_history), group_chats=user_chat_groups, friends=friends, url_for=url_for)
    
    else:
        abort(403)

# friend list page
@app.route("/friends")
def friends():
    if "username" not in session:
        abort(403)

    user = session["username"]

    user_obj = db.get_user(user)
    received_requests = db.get_friend_requests(receiver=user)
    sent_requests = db.get_friend_requests(sender=user)
    current_friends = db.get_all_friends(user)
    group_chats = db.get_all_chat_groups(user)
    friends = []

    if group_chats:
        group_chats = group_chats.split(",")
    else:
        group_chats = []

    if current_friends:
        for friend in current_friends.split(","):
            friend_role = db.get_user(friend).role
            friends.append({"username": friend, "role": friend_role})

    return render_template("friends.jinja", received_requests=received_requests, sent_requests=sent_requests, group_chats=group_chats, friends=friends, user=user_obj, url_for=url_for)

# display all articles created by users
@app.route("/articles")
def articles():
    if "username" not in session:
        abort(403)

    db_articles = db.get_all_articles()

    user = session["username"]

    current_friends = db.get_all_friends(user)
    group_chats = db.get_all_chat_groups(user)
    friends = []

    if group_chats:
        group_chats = group_chats.split(",")
    else:
        group_chats = []

    if current_friends:
        for friend in current_friends.split(","):
            friend_role = db.get_user(friend).role
            friends.append({"username": friend, "role": friend_role})
    
    articles = []
    for article in db_articles:
        articles.append({"article_id": article.article_id, "title": article.title, "author": article.author, "content": article.content})
    
    return render_template("articles.jinja", user=db.get_user(user), articles=articles, friends=friends, group_chats=group_chats, url_for=url_for)

@app.route("/publish")
def publish():
    if "username" not in session:
        abort(403)

    user = session["username"]

    current_friends = db.get_all_friends(user)
    group_chats = db.get_all_chat_groups(user)
    friends = []

    if group_chats:
        group_chats = group_chats.split(",")
    else:
        group_chats = []

    if current_friends:
        for friend in current_friends.split(","):
            friend_role = db.get_user(friend).role
            friends.append({"username": friend, "role": friend_role})

    return render_template("publish.jinja", user=db.get_user(user), friends=friends, group_chats=group_chats, url_for=url_for)

@app.route("/editor")
def editor():
    if request.args.get("article_id") is None:
        abort(404)

    if "username" not in session:
        abort(403)

    try:
        article = db.get_article(int(request.args.get("article_id")))

        user = session["username"]

        current_friends = db.get_all_friends(user)
        group_chats = db.get_all_chat_groups(user)
        friends = []

        if group_chats:
            group_chats = group_chats.split(",")
        else:
            group_chats = []

        if current_friends:
            for friend in current_friends.split(","):
                friend_role = db.get_user(friend).role
                friends.append({"username": friend, "role": friend_role})

        return render_template("editor.jinja", 
            article_id=article.article_id, 
            title=article.title, 
            author=article.author, 
            content=article.content,
            user=db.get_user(user),
            friends=friends, 
            group_chats=group_chats, 
            url_for=url_for
        )
    
    except:
        return "invalid article id"


# view a specific article
@app.route("/articles/view")
def view_article():
    if request.args.get("article_id") is None:
        abort(404)

    if "username" not in session:
        abort(403)

    try:
        user = session["username"]
        user_obj = db.get_user(user)
        db_comments = db.get_comments(request.args.get("article_id"))

        comments = []
        for comment in db_comments:
            comments.append({"comment_id": comment.comment_id, "author": comment.author, "content": comment.content, "article_id": comment.article_id})

        article = db.get_article(int(request.args.get("article_id")))

        current_friends = db.get_all_friends(user)
        group_chats = db.get_all_chat_groups(session["username"])
        friends = []

        if group_chats:
            group_chats = group_chats.split(",")
        else:
            group_chats = []

        if current_friends:
            for friend in current_friends.split(","):
                friend_role = db.get_user(friend).role
                friends.append({"username": friend, "role": friend_role})

        return render_template("article.jinja", 
            article_id=article.article_id, 
            title=article.title, 
            author=article.author, 
            content=article.content,
            comments=comments,
            user=user_obj,
            friends=friends, 
            group_chats=group_chats, 
            url_for=url_for
        )
    
    except:
        return "invalid article id"
    
@app.route("/panel")
def panel():
    if "username" not in session:
        abort(403)

    user_obj = db.get_user(session["username"])
    
    if user_obj.role != "staff":
        abort(403)

    users = db.get_all_users()

    current_friends = db.get_all_friends(session["username"])
    group_chats = db.get_all_chat_groups(session["username"])
    friends = []

    if group_chats:
        group_chats = group_chats.split(",")
    else:
        group_chats = []

    if current_friends:
        for friend in current_friends.split(","):
            friend_role = db.get_user(friend).role
            friends.append({"username": friend, "role": friend_role})

    return render_template("panel.jinja", user=user_obj, users=users, friends=friends, group_chats=group_chats, url_for=url_for)

# mute students from publishing an article or joinging a chatroom
@app.route("/control/user", methods=["POST"])
def mute_student():
    if not request.is_json or request.json.get("username") is None or request.json.get("blacklist_type") is None:
        abort(404)

    if "username" not in session:
        abort(403)

    user = db.get_user(session["username"])

    if user:
        if user.role == "staff":
            if request.json.get("blacklist_type") == "articles":
                db.mute_user_from_posting(request.json.get("username"))
                return "mute successful"
            
            elif request.json.get("blacklist_type") == "chat_rooms" and request.json.get("room_name"):
                if db.get_room(room_name=request.json.get("room_name")):
                    db.mute_user_from_chatroom(request.json.get("username"), request.json.get("room_name"))
                    return "mute successful"
                
            elif request.json.get("blacklist_type") == "all_rooms":
                db.mute_user_from_all_chatrooms(request.json.get("username"))
            
            return "Incorrect inputs to mute user"

    return "Unauthorised operation"

# unmute students who have been muted from joining chatrooms or posting
@app.route("/control/user/unmute", methods=["POST"])
def unmute_student():
    if not request.is_json or request.json.get("username") is None or request.json.get("blacklist_type") is None:
        abort(404)

    if "username" not in session:
        abort(403)

    user = db.get_user(session["username"])

    if user:
        if user.role == "staff":
            if request.json.get("blacklist_type") == "articles":
                db.unmute_user_from_posting(request.json.get("username"))
                return "mute successful"
            
            elif request.json.get("blacklist_type") == "chat_rooms" and request.json.get("room_name"):
                if db.get_room(room_name=request.json.get("room_name")):
                    db.unmute_user_from_joining(request.json.get("username"), request.json.get("room_name"))
                    return "mute successful"
                
            elif request.json.get("blacklist_type") == "all_rooms":
                db.unmute_user_from_global_ban(request.json.get("username"))
            
            return "Incorrect inputs to unmute user"

    return "Unauthorised operation"

# retrieve the server's master key for encrypting user's password
# derived key, before it is stored in session storage
@app.route("/key/master")
def get_master_key():
    if "username" not in session:
        abort(403)

    if session["username"] in session_keys:
        return session_keys[session["username"]]
    else:
        abort(403)

# retrieves user key salt for key derivation
@app.route("/key/salt")
def get_user_key_salt():
    if "username" not in session:
        abort(403)

    user = db.get_user(session["username"])

    if user is not None:
        return user.keySalt.split(",")
    else:
        abort(403)
    
# saves the user's public and encrypted private RSA keys
@app.route("/key/pair/save", methods=["POST"])
def save_keys():
    if not request.is_json or request.json.get("public_key") is None or request.json.get("private_key") is None:
        abort(404)

    if "username" not in session:
        abort(403)

    public_key = ",".join(str(num) for num in request.json.get("public_key"))
    private_key = ",".join(str(num) for num in request.json.get("private_key"))

    db.save_user_keys(session["username"], private_key, public_key)

    return "success"

# retrieves the user's public and encrypted private RSA keys
@app.route("/key/pair/get")
def get_keys():
    if "username" not in session:
        abort(403)

    user = db.get_user(session["username"])

    private_key = [int(num) for num in user.privateKey.split(",")]
    public_key = [int(num) for num in user.publicKey.split(",")] 

    return {"private": private_key, "public": public_key}

if __name__ == '__main__':
    socketio.run(app, ssl_context=('./certs/server_cert.crt', './certs/key.pem'))
