package com.portfolio.TaskFlow.API.Services;

import com.portfolio.TaskFlow.API.Dto.AuthResponse;
import com.portfolio.TaskFlow.API.Dto.LoginRequest;
import com.portfolio.TaskFlow.API.Dto.RegisterRequest;
import com.portfolio.TaskFlow.API.Entities.User;
import com.portfolio.TaskFlow.API.Entities.enums.Role;
import com.portfolio.TaskFlow.API.Repositories.UserRepository;
import com.portfolio.TaskFlow.API.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        // A role nunca vem do cliente: cadastro público sempre cria USER.
        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
        user.setRole(Role.USER);
        userRepository.save(user);

        return new AuthResponse(null, null, user.getId(), user.getName(),
                user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        return new AuthResponse(jwtService.generateToken(user.getEmail()), "Bearer",
                user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
