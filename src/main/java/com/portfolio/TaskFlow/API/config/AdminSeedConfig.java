package com.portfolio.TaskFlow.API.config;

import com.portfolio.TaskFlow.API.Entities.User;
import com.portfolio.TaskFlow.API.Entities.enums.Role;
import com.portfolio.TaskFlow.API.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garante a existência de um usuário administrador padrão no startup.
 *
 * <p>A senha nunca é versionada: deve ser fornecida via variável de ambiente
 * {@code ADMIN_PASSWORD}. Quando ela não está definida, o seed apenas registra
 * um log informativo e segue com o startup normalmente.</p>
 */
@Component
public class AdminSeedConfig implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedConfig.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeedConfig(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.email:admin@sistema.com}") String adminEmail,
            @Value("${admin.password:}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            log.info("ADMIN_PASSWORD não configurada. Criação do usuário administrador padrão ignorada.");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Usuário administrador já existe para o e-mail {}. Nenhuma ação necessária.", adminEmail);
            return;
        }

        User admin = new User("Administrador", adminEmail, passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        log.info("Usuário administrador padrão criado com sucesso para o e-mail {}.", adminEmail);
    }
}
