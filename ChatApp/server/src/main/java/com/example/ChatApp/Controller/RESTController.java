package com.example.ChatApp.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    public void createUser(@RequestBody User user) {
        // users are registered and added to the database
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        repository.insert(user);
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
    public ResponseEntity<Optional<User>> getStudentByEmail(@PathVariable("email") String email,
            HttpServletRequest request) {
        
        // Returns the user's information as identified by the email
        if (request.getSession().getAttribute("id").toString().equals(email)) {
            return ResponseEntity.ok(repository.findUserByEmail(email));
        }
        return ResponseEntity.ok(null);
    }

    @PutMapping(path = "/api/users/{email}")
    public ResponseEntity<Object> updateStudentByEmail(@PathVariable("email") String email,
            @RequestBody User user, HttpServletRequest request) {
        
        // user's session must match the email described in the url path
        if (request.getSession().getAttribute("id").toString().equals(email)) {
            Optional<User> current = repository.findUserByEmail(email);

            // updates the user of the email's informaion based on details in the request body
            if (current.isPresent()) {
                if (user.getPassword() != null) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                } else {
                    user.setPassword(current.get().getPassword());
                }
                user.setId(current.get().getId());
                user.setCreated(current.get().getCreated());
                // save the user's new details to the database
                repository.save(user);
                return ResponseEntity.ok("Success");
            }
        }

        return ResponseEntity.ok(null);
    }

}