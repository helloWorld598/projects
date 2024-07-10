'''
models
defines sql alchemy data models
also contains the definition for the room class used to keep track of socket.io rooms

Just a sidenote, using SQLAlchemy is a pain. If you want to go above and beyond, 
do this whole project in Node.js + Express and use Prisma instead, 
Prisma docs also looks so much better in comparison

or use SQLite, if you're not into fancy ORMs (but be mindful of Injection attacks :) )
'''

from sqlalchemy import String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import Dict

# data models
class Base(DeclarativeBase):
    pass

# model to store user information
class User(Base):
    __tablename__ = "user"
    
    # looks complicated but basically means
    # I want a username column of type string,
    # and I want this column to be my primary key
    # then accessing john.username -> will give me some data of type string
    # in other words we've mapped the username Python object property to an SQL column of type String 
    username: Mapped[str] = mapped_column(String, primary_key=True)
    password: Mapped[str] = mapped_column(String)
    friends: Mapped[str] = mapped_column(String, nullable=True)
    group_chats: Mapped[str] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, nullable=True)
    units: Mapped[str] = mapped_column(String, nullable=True)
    keySalt: Mapped[str] = mapped_column(String)
    publicKey: Mapped[str] = mapped_column(String, nullable=True)
    privateKey: Mapped[str] = mapped_column(String, nullable=True)

# model to store sent friend requests
class FriendRequest(Base):
    __tablename__ = "requests"

    request_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender: Mapped[str] = mapped_column(String, ForeignKey('user.username'))
    receiver: Mapped[str] = mapped_column(String, ForeignKey('user.username'))
    status: Mapped[int] = mapped_column(Integer)
    room: Mapped[str] = mapped_column(String)
    chat_type: Mapped[Integer] = mapped_column(Integer)

# model to store all messages sent over the web server
class Message(Base):
    __tablename__ = "messages"

    message_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender: Mapped[str] = mapped_column(String, ForeignKey('user.username'))
    content: Mapped[str] = mapped_column(String)
    users: Mapped[str] = mapped_column(String)

# model to store the room id for all chat rooms
class ChatRoom(Base):
    __tablename__ = "rooms"

    room_id: Mapped[int] = mapped_column(Integer)
    room_name: Mapped[str] = mapped_column(String, primary_key=True)
    users: Mapped[str] = mapped_column(String)
    room_type: Mapped[int] = mapped_column(Integer)
    public: Mapped[bool] = mapped_column(Boolean)

# model to store articles
class Article(Base):
    __tablename__ = "articles"

    article_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[String] = mapped_column(String)
    author: Mapped[String] = mapped_column(String, ForeignKey('user.username'))
    content: Mapped[String] = mapped_column(String)

# model to store comments to articles
class Comment(Base):
    __tablename__ = "comments"

    comment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    author: Mapped[String] = mapped_column(String, ForeignKey('user.username'))
    content: Mapped[String] = mapped_column(String)
    article_id: Mapped[int] = mapped_column(Integer, ForeignKey('articles.article_id'))

# model to store blacklists of users prevent from either joining a 
# chat room or posting an article
class Blacklist(Base):
    __tablename__ = "blacklists"

    blacklist_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student: Mapped[String] = mapped_column(String, ForeignKey('user.username'))
    blacklist_type: Mapped[String] = mapped_column(String)
    room: Mapped[String] = mapped_column(String, ForeignKey('rooms.room_name'), nullable=True)

# stateful counter used to generate the room id
class Counter():
    def __init__(self):
        self.counter = 0
    
    def get(self):
        self.counter += 1
        return self.counter

# Room class, used to keep track of which username is in which room
class Room():
    def __init__(self):
        self.counter = Counter()
        # dictionary that maps the username to the room id
        # for example self.dict["John"] -> gives you the room id of 
        # the room where John is in
        self.dict: Dict[str, int] = {}

    def create_room(self, sender: str) -> int:
        room_id = self.counter.get()
        self.dict[sender] = room_id
        return room_id
    
    def join_room(self,  sender: str, room_id: int) -> int:
        self.dict[sender] = room_id

    def leave_room(self, user):
        if user not in self.dict.keys():
            return
        del self.dict[user]

    # gets the room id from a user
    def get_room_id(self, user: str):
        if user not in self.dict.keys():
            return None
        return self.dict[user]
