package com.example.Chess.Service;

import java.util.HashMap;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class Users {
     // stores a username and their associated security number. This is given to users
     // after they submit their username and before joining a game the user must provide
     // their given security number. This enables verification of the individual.
     public HashMap<String, Integer> users = new HashMap<String, Integer>();

     /**
      * Add a new user to the users hashmap alongside their newly generated security number
      * @param user representing the username of the user
      */
     public void addUser(String user) {
        SecureRandom secureRandom = new SecureRandom();
        int num = secureRandom.nextInt();
        this.users.put(user, num);
     }

     /**
      * Returns the security number associated with some username
      * @param user representing the username of the user
      * @return the user's security number
      */
     public Integer getUser(String user) {
        if (this.users.containsKey(user)) {
            return this.users.get(user);
        }
        return 0;
     }

     /**
      * Removes the user from the users hashmap
      * @param user representing the username of the user
      */
     public void removeUser(String user) {
        if (this.users.containsKey(user)) {
            this.users.remove(user);
        }
     }
}