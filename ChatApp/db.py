'''
db
database file, containing all the logic to interface with the sql database
'''

from sqlalchemy import create_engine
from sqlalchemy import and_
from sqlalchemy.orm import Session
from models import *

from pathlib import Path

# creates the database directory
Path("database") \
    .mkdir(exist_ok=True)

# "database/main.db" specifies the database file
# change it if you wish
# turn echo = True to display the sql output
engine = create_engine("sqlite:///database/main.db", echo=False)

# initializes the database
Base.metadata.create_all(engine)

# inserts a user to the database
def insert_user(username: str, password: str, user_salt: str, role: str, units: str):
    with Session(engine) as session:
        user = User(username=username, password=password, keySalt=user_salt, role=role, units=units)
        session.add(user)
        session.commit()

# gets a user from the database
def get_user(username: str):
    with Session(engine) as session:
        return session.get(User, username)
    
# save the user's encrypted private key and public key
def save_user_keys(username: str, private_key: str, public_key: str):
    with Session(engine) as session:
        user = session.get(User, username)
        user.privateKey = private_key
        user.publicKey = public_key
        session.commit()

# create friend request
def create_request(sender: str, receiver: str, room: str = None):
    with Session(engine) as session:
        friend_request = None

        if room is None:
            friend_request = FriendRequest(sender=sender, receiver=receiver, status=-1, chat_type=0, room=",".join(sorted([sender, receiver])))
        else:
            friend_request = FriendRequest(sender=sender, receiver=receiver, status=-1, chat_type=1, room=room)

        session.add(friend_request)
        session.commit()

        return friend_request.request_id
        
# create room for chat user
def create_room(room_id: int, users: list[str], room_name: str = None, public: bool = False):
    with Session(engine) as session:
        chat_room = None
        
        if room_name:
            chat_room = ChatRoom(room_id=room_id, users=",".join(sorted(users)), public=public, room_type=1, room_name=room_name)
            creator = session.get(User, users[-1])
            if creator.group_chats:
                if room_name not in creator.group_chats.split(","):
                    creator.group_chats += "," + room_name
            else:
                creator.group_chats = room_name
        else:
            chat_room = ChatRoom(room_id=room_id, users=",".join(sorted(users)), room_type=0, room_name=",".join(sorted(users)), public=public)
        
        session.add(chat_room)
        session.commit()

# make users invited to a public group chat be part of the chat room
def make_users_members(room_name: str, users: list[str], room_owner: str = None):
    with Session(engine) as session:
        chat_room = session.get(ChatRoom, room_name)
        if chat_room.public:
            for username in users:
                if room_owner and username == room_owner:
                    continue
                user = session.get(User, username)
                if user.group_chats:
                    user.group_chats += "," + room_name
                else:
                    user.group_chats = room_name
        session.commit()

# get the chat room
def get_room(room_name: str = None, room_id: int = None):
    with Session(engine) as session:
        if room_name:
            return session.get(ChatRoom, room_name)
        elif room_id:
            return session.query(ChatRoom).filter_by(room_id=room_id).first()

# get max room number
def get_max_room_id():
    with Session(engine) as session:
        chat_rooms = session.query(ChatRoom).all()
        max_room_id = 0
        for chat_room in chat_rooms:
            max_room_id = max(chat_room.room_id, max_room_id)
        return max_room_id

# update the status of a friend request
def update_request_status(request_id: int, receiver: str, new_status: int):
    with Session(engine) as session:
        friend_request = session.get(FriendRequest, request_id)

        if receiver == friend_request.receiver:
            new_status = int(new_status)
            friend_request.status = new_status
            
            if new_status == 1:
                sender = session.get(User, friend_request.sender)
                receiver = session.get(User, friend_request.receiver)

                if friend_request.chat_type == 0:
                    if sender.friends:
                        sender.friends += "," + friend_request.receiver
                    else:
                        sender.friends = friend_request.receiver

                    if receiver.friends:
                        receiver.friends += "," + friend_request.sender
                    else:
                        receiver.friends = friend_request.sender
                    
                else:
                    if receiver.group_chats:
                        receiver.group_chats += "," + friend_request.room
                    else:
                        receiver.group_chats = friend_request.room

            elif new_status == 0:
                sender = session.get(User, friend_request.sender)
                receiver = session.get(User, friend_request.receiver)

                if friend_request.chat_type == 0:
                    sender_friends = sender.friends.split(",")
                    receiver_friends = receiver.friends.split(",")
                    if friend_request.receiver in sender_friends and friend_request.sender in receiver_friends:
                        sender_friends.pop(sender_friends.index(friend_request.receiver))
                        receiver_friends.pop(receiver_friends.index(friend_request.sender))
                        sender.friends = ",".join(sender_friends)
                        receiver.friends = ",".join(receiver_friends)

                else:
                    receiver_group_chats = receiver.group_chats.split(",")
                    if friend_request.room in receiver_group_chats:
                        receiver_group_chats.pop(receiver_group_chats.index(friend_request.room))
                        receiver.group_chats = ",".join(receiver_group_chats)

            session.commit()

            return {"request_id": friend_request.request_id, "sender": friend_request.sender, "receiver": friend_request.receiver, "status": friend_request.status, "room": friend_request.room, "chat_type": friend_request.chat_type}
            
# remove a friend from list of friends
def remove_friend(request_id: int, user: str):
    with Session(engine) as session:
        friend_request = session.get(FriendRequest, request_id)

        if user == friend_request.receiver or user == friend_request.sender:
            friend_request.status = 0
            
            sender = session.get(User, friend_request.sender)
            receiver = session.get(User, friend_request.receiver)

            if friend_request.chat_type == 0:
                sender_friends = sender.friends.split(",")
                receiver_friends = receiver.friends.split(",")
                if friend_request.receiver in sender_friends and friend_request.sender in receiver_friends:
                    sender_friends.pop(sender_friends.index(friend_request.receiver))
                    receiver_friends.pop(receiver_friends.index(friend_request.sender))
                    sender.friends = ",".join(sender_friends)
                    receiver.friends = ",".join(receiver_friends)
                    
                    session.delete(friend_request)
                    session.commit()
                    
                    return [friend_request.receiver, friend_request.sender]

            else:
                receiver_group_chats = receiver.group_chats.split(",")
                if friend_request.room in receiver_group_chats:
                    receiver_group_chats.pop(receiver_group_chats.index(friend_request.room))
                    receiver.group_chats = ",".join(receiver_group_chats)

            session.delete(friend_request)

            session.commit()
    
# Get the request ID between two users
def get_request_id(sender: str, receiver: str):
    with Session(engine) as session:
        friend_request = session.query(FriendRequest.request_id) \
                                .filter(
                                    FriendRequest.room ==
                                    ",".join(sorted([sender, receiver]))
                                ) \
                                .first()
        if friend_request:
            return friend_request.request_id
        else:
            return None
    
# add room users
def add_users_to_room(group_name: str, new_users: list[str]):
    with Session(engine) as session:
        chat_room = session.get(ChatRoom, group_name)
        current_users = chat_room.users.split(",")
        current_users += new_users
        chat_room.users = ",".join(sorted(current_users))
        session.commit()

# get all friend requests sent to a user
def get_friend_requests(sender:str=None, receiver:str=None, room:str=None):
    with Session(engine) as session:
        if room is not None and receiver is not None and sender is not None:
            return session.query(FriendRequest).filter_by(room=room, receiver=receiver, sender=sender).all()
        elif room is not None:
            return session.query(FriendRequest).filter_by(room=room).all()
        elif sender is not None and receiver is not None:
            return session.query(FriendRequest).filter_by(receiver=receiver, sender=sender).all()
        elif sender is not None:
            return session.query(FriendRequest).filter_by(sender=sender).all() 
        elif receiver is not None:
            return session.query(FriendRequest).filter_by(receiver=receiver).all()
        
# Get all users from the database
def get_all_users():
    with Session(engine) as session:
        return session.query(User).all()

# get all friends of a user
def get_all_friends(username: str):
    with Session(engine) as session:
        return session.query(User.friends).filter(User.username == username).scalar()
    
# get all group chats the user is part of
def get_all_chat_groups(username: str):
    with Session(engine) as session:
        return session.query(User.group_chats).filter(User.username == username).scalar()

# create message
def create_message(sender, content, users):
    with Session(engine) as session:
        message = Message(sender=sender, content=content, users=users)
        session.add(message)
        session.commit()

# get all messages between two people
def get_msg_history(sender, friends: list[str]):
    friends.sort()
    if friends is not None:
        with Session(engine) as session:
            return session.query(Message.content) \
                        .filter(
                            and_(
                                Message.users == ",".join(friends),
                                Message.sender == sender
                            )
                        ) \
                        .order_by(Message.message_id).all()

# create an article
def create_article(title: str, author: str, content: str):
    with Session(engine) as session:
        article = Article(title=title, author=author, content=content)
        session.add(article)
        session.commit()

# get all articles
def get_all_articles():
    with Session(engine) as session:
        return session.query(Article).all()
    
# get an article
def get_article(article_id: int):
    with Session(engine) as session:
        return session.get(Article, article_id)
    
# update an article
def update_article(article_id: int, new_title: str, new_content: str, user: User):
    with Session(engine) as session:
        article = session.get(Article, article_id)
        if article.author == user.username or user.role == "staff":
            article.title = new_title
            article.content = new_content
            session.commit()

# delete an article
def delete_article(article_id: int):
    with Session(engine) as session:
        article = session.get(Article, article_id)
        session.delete(article)
        session.commit()

# create a comment under an article
def create_comment(author: str, article_id: int, content: str):
    with Session(engine) as session:
        comment = Comment(author=author, content=content, article_id=article_id)
        session.add(comment)
        session.commit()

# get all comments for an article
def get_comments(article_id: int):
    with Session(engine) as session:
        return session.query(Comment).filter(Comment.article_id == article_id).all()
    
# delete a comment
def delete_comment(comment_id: int, user: str):
    with Session(engine) as session:
        comment = session.get(Comment, comment_id)

        session.delete(comment)
        session.commit()

# get all users doing a particular unit
def get_users_in_unit(unit: str):
    with Session(engine) as session:
        users = session.query(User).all()
        users_enrolled = []
        for user in users:
            if unit in user.units.split(","):
                users_enrolled.append(user.username)
        return users_enrolled

# mute users from posting articles
def mute_user_from_posting(username: str):
    with Session(engine) as session:
        user = session.get(User, username)
        if user and user.role == "student":
            blacklist = Blacklist(student=username, blacklist_type="articles")
            session.add(blacklist)
            session.commit()

# mute users from joining a chat room
def mute_user_from_chatroom(username: str, room_name: str):
    with Session(engine) as session:
        user = session.get(User, username)
        room = session.get(ChatRoom, room_name)
        if user and room and user.role == "student":
            blacklist = Blacklist(student=username, blacklist_type="chat_rooms", room=room_name)
            session.add(blacklist)
            session.commit()

# mute users from joining any chat room
def mute_user_from_all_chatrooms(username: str):
    with Session(engine) as session:
        user = session.get(User, username)
        if user and user.role == "student":
            blacklist = Blacklist(student=username, blacklist_type="all_rooms")
            session.add(blacklist)
            session.commit()

# remove blacklist for user posting articles
def unmute_user_from_posting(username: str):
    with Session(engine) as session:
        blacklist = session.query(Blacklist).filter(Blacklist.student == username, 
                                                    Blacklist.blacklist_type == "articles").first()
        session.delete(blacklist)
        session.commit()

# remove blacklist for user joining a chat room
def unmute_user_from_joining(username: str, room_name: str):
    with Session(engine) as session:
        blacklist = session.query(Blacklist).filter(Blacklist.student == username, 
                                                    Blacklist.blacklist_type == "chat_rooms",
                                                    Blacklist.room == room_name).first()
        session.delete(blacklist)
        session.commit()

# remove blacklist for user joining any chat room
def unmute_user_from_global_ban(username: str):
    with Session(engine) as session:
        blacklist = session.query(Blacklist).filter(Blacklist.student == username, 
                                                    Blacklist.blacklist_type == "all_rooms").first()
        session.delete(blacklist)
        session.commit()

# search for blacklists
def get_blacklists(username: str, blacklist_type: str, room: str = None):
    with Session(engine) as session:
        blacklist = None
        if room:
            blacklist = session.query(Blacklist).filter(
                    Blacklist.student == username, 
                    Blacklist.blacklist_type == blacklist_type, 
                    Blacklist.room == room
                ).all()
        else:
            blacklist = session.query(Blacklist).filter(
                    Blacklist.student == username, 
                    Blacklist.blacklist_type == blacklist_type, 
                ).all()
        return blacklist
