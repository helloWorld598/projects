# Projects

## Chess

ChessApp is a full-stack application that allows players to play Chess against a friend on the same computer when offline, or play against another player connected to the server. The server was created using Express.js while the front-end was created using the ReactJs framework. ChessApp allows multiple users to connect to the server and the server will assign each user into pairs, where they will play online Chess. ChessApp utilises sessions to save the user's session so they do not need to enter their name when connecting to the server. Furthermore, socket.io is used to carry user chess movers to opponents, facilitating an online experience.

## ChatApp

ChatApp is a full-stack CRUD application that enables all users in the server to send messages to one another in a chat room. The backend application was created using the Java Spring Boot Framework, while the front end was developed using the ReactJs framework. Users can send messages to one another because of the server's use of Web Sockets. Furthermore, JSON Web Tokens are utilised within the application to authorise users to access the application after they have authenticated, hence providing security to the site. Users can also update and delete their account details. The server also stores information on a database using MongoDB atlas.


To run either of the above applications, start the server then run npm start in the directory of the client directories.

## Cards

Cards is a game developed using Python and Pygame, a set of modules designed for creating video games. The game is based on the card game "Thirteens" and consists of the user playing against an AI bot that utilises the Minimax algorithm. To run this game, the only dependency required is pygame.

## MazeSolver

MazeSolver is an algorithm created for a Unversity Assignment which is a simulation of a robot navigating a maze without having prior knowledge of what is in the maze and where the exit to the maze will be. The algorithm can adapt to a number of situations including 90-degree turns, dead ends, and curved and slanted walls. The algorithm uses a left-hand wall-following technique, where the robot detects a wall on its left-hand sensor and follows the wall until it reaches an exit. Note: I am not the full author of all the code written in MazeSolver, especially when it comes to drawing the robot to the screen and collision detection, however, I fully authored the algorithm for solving the maze. The program requires SDL2 in order to run.
