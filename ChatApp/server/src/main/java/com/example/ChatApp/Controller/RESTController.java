package com.example.ChatApp.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ChatApp.Model.AuthenticationResponse;
import com.example.ChatApp.Model.User;
import com.example.ChatApp.Repository.UserRepository;
import com.example.ChatApp.Service.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/")
public class RESTController {

    @Autowired
    UserRepository repository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public RESTController(JwtService jwtService, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/api/users/auth/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        // users are registered and added to the database
        if (user.getPassword().length() >= 6) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            repository.insert(user);
            return ResponseEntity.ok("Success");
        } 
        return ResponseEntity.status(403).body("Bad Password");
    }

    @PostMapping("/api/users/auth/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody User user) {
        // authenticates the user by checking the user's email and password are correct
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        user.getPassword()));

        var jwtToken = jwtService.generateToken(user);

        return ResponseEntity.ok(
                AuthenticationResponse.builder()
                        .token(jwtToken)
                        .build());
    }

    @GetMapping(path = "/api/users/{email}")
    public ResponseEntity<Object> getUserByEmail(@PathVariable("email") String email,
            HttpServletRequest request) {
        
        // Returns the user's information as identified by the email
        if (request.getSession().getAttribute("id").toString().equals(email)) {
            return ResponseEntity.ok(repository.findUserByEmail(email));
        }
        return ResponseEntity.status(403).body("Unauthorised");
    }

    @PutMapping(path = "/api/users/{email}")
    public ResponseEntity<Object> updateUserByEmail(@PathVariable("email") String email,
            @RequestBody User user, HttpServletRequest request) {
        
        // user's session must match the email described in the url path
        if (request.getSession().getAttribute("id").toString().equals(email)) {
            Optional<User> current = repository.findUserByEmail(email);

            // updates the user of the email's informaion based on details in the request body
            if (current.isPresent()) {
                if (user.getPassword() != null) {
                    if (user.getPassword().length() >= 6)
                        current.get().setPassword(passwordEncoder.encode(user.getPassword()));
                    else
                        return ResponseEntity.status(403).body("Bad Password");
                }

                if (user.getName() != null) {
                    current.get().setName(user.getName());
                }

                if (user.getPhoneString() != null) {
                    current.get().setPhoneString(user.getPhoneString());
                }

                // save the user's new details to the database
                repository.save(current.get());
                return ResponseEntity.ok("Success");
            }
        }

        return ResponseEntity.status(403).body("Update failed");
    }

    @DeleteMapping(path = "/api/users/{email}")
    public ResponseEntity<Object> deleteUserByEmail(@PathVariable("email") String email, HttpServletRequest request) {
        if (request.getSession().getAttribute("id").toString().equals(email)) {
            repository.deleteUserByEmail(email);
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.status(403).body("Delete failed");
    }

}