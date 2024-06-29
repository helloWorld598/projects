package com.example.Chess.Controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
// import org.springframework.web.bind.annotation.CrossOrigin; uncomment for testing react client
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.Chess.Service.Users;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/")
public class RESTController {
    @Autowired
    private Users users;

    /**
     * Forwards all get requests, except those beginning with a request to /api,
     * to index.html, which performs its own routing.
     * @return the string that forwards requests to index.html.
     */
    @GetMapping({
        "/",
        "/{path:^(?!static|api|.*\\.html$).*}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }

    /**
     * GET request endpoint which provides the user's username and security number
     * to the user requesting this data.
     * @param session the user's HTTP session with the user
     * @return a 200 status containing the user's username and security number or
     * a 403 error indicating the user has not submitted their username yet
     * @throws Exception deals with any exceptions that may be thrown in the function
     */
    // @CrossOrigin(origins = "http://localhost:3000") uncomment for testing react client
    @GetMapping(path = "/api/get")
    public ResponseEntity<Object> getUsername(HttpSession session) throws Exception {
        String user = (String) session.getAttribute("username");
        int num = users.getUser(user);
        
        if (num != 0) {
            HashMap<String, Integer> response = new HashMap<String, Integer>();
            response.put(user, num);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
    }

    /**
     * POST request endpoint which reads the user's submitted username, checks that it has not
     * yet been used, then establishes a session with the user and records the user's username
     * and their generated security number
     * @param jsonString the request body containing the submitted username
     * @param session the user's username
     * @param response the http response
     * @return a response entity indicating 200 if the username is submitted correctly or a
     * 403 error which indicates that the username has already been chosen
     * @throws Exception deals with any exceptions that may be thrown in the function
     */
    // @CrossOrigin(origins = "http://localhost:3000") uncomment for testing react client
    @PostMapping(path = "/api/add")
    public ResponseEntity<Object> setUsername(@RequestBody String jsonString, HttpSession session, HttpServletResponse response) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        TypeReference<HashMap<String, String>> typeRef = new TypeReference<HashMap<String, String>>() {};
        HashMap<String, String> json = objectMapper.readValue(jsonString, typeRef);

        String username = json.get("username"); 

        if (users.getUser(username) == 0) {
            session.setAttribute("username", username);
            users.addUser(username);
            return ResponseEntity.ok(null);
        }
         
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
    }
}