package grad.microservice_auth.services;

import grad.microservice_auth.dto.AuthResponse;
import grad.microservice_auth.dto.LoginRequest;
import grad.microservice_auth.dto.RegisterRequest;
import grad.microservice_auth.entities.*;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.RoleRepository;
import grad.microservice_auth.repositories.UserRepository;
import grad.microservice_auth.repositories.UserRoleRepository;
import grad.microservice_auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));
        user.setActif(false);
        userRepository.save(user);
    }




    @Transactional
    public void updateUsername(Long userId, String newUsername) {
        if (newUsername == null || newUsername.isBlank()) {
            throw new IllegalArgumentException("Le nouveau nom d'utilisateur est obligatoire");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));
        if (!user.getUsername().equals(newUsername)) {
            userRepository.findByUsername(newUsername)
                    .ifPresent(existingUser -> {
                        throw new RuntimeException("Ce nom d'utilisateur est déjà utilisé par un autre compte");
                    });
            user.setUsername(newUsername);
            userRepository.save(user);
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Validations
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("L'email est obligatoire");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire");
        }
        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new IllegalArgumentException("Le rôle est obligatoire");
        }

        // 2. Récupération de l'agent
        Agent agent = agentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Aucun agent trouvé avec cet email : " + request.getEmail()));

        // 3. Vérifier que l'agent n'a pas déjà un compte
        if (userRepository.findByAgent(agent).isPresent()) {
            throw new RuntimeException("Cet agent a déjà un compte utilisateur");
        }

        // 4. Récupération du rôle
        String roleName = request.getRole().toUpperCase().trim();
        Role role = roleRepository.findByNomRole(roleName)
                .orElseThrow(() -> new RuntimeException("Rôle invalide : " + request.getRole()));

        // 5. Création de l'utilisateur (sans userRoles)
        User user = new User();
        user.setAgent(agent);
        user.setUsername(agent.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActif(true);
        user.setDateCreation(LocalDateTime.now());

        // 6. Sauvegarde de l'utilisateur pour obtenir son ID
        User savedUser = userRepository.save(user);

        // 7. Création de la liaison UserRole avec ID explicite
        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(role);
        userRole.setDateAttribution(LocalDateTime.now());

        UserRoleId id = new UserRoleId(savedUser.getId(), role.getId());
        userRole.setId(id);

        // 8. Sauvegarde de la liaison
        userRoleRepository.save(userRole);

        // 9. Recharger l'utilisateur avec ses rôles pour éviter le chargement paresseux
        User userWithRoles = userRepository.findById(savedUser.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé après sauvegarde"));

        // 10. Générer le token avec la nouvelle méthode utilisant User
        String token = jwtService.generateToken(userWithRoles);

        // 11. Extraire les noms des rôles
        List<String> roles = userWithRoles.getUserRoles().stream()
                .map(ur -> ur.getRole().getNomRole())
                .collect(Collectors.toList());

        List<String> droits = userWithRoles.getUserRoles().stream()
                .flatMap(ur -> ur.getRole().getRoleDroits().stream())
                .map(rd -> rd.getDroit().getNomDroit())
                .distinct()
                .collect(Collectors.toList());

        for (String r : roles) {
            if (!droits.contains(r)) {
                droits.add(r);
            }
        }

        return new AuthResponse(
                token,
                userWithRoles.getUsername(),
                roles,
                droits,
                userWithRoles.getId(),
                userWithRoles.getAgent().getId()
        );
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("L'email est obligatoire");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire");
        }

        try {
            // 1. Authentification via Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // 2. Récupérer le UserDetails
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // 3. Charger l'utilisateur complet avec ses rôles
            User user = userRepository.findByUsername(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // 4. Générer le token avec la nouvelle méthode utilisant User
            String token = jwtService.generateToken(user);

            // 5. Extraire les noms des rôles
            List<String> roles = user.getUserRoles().stream()
                    .map(ur -> ur.getRole().getNomRole())
                    .collect(Collectors.toList());

            List<String> droits = user.getUserRoles().stream()
                    .flatMap(ur -> ur.getRole().getRoleDroits().stream())
                    .map(rd -> rd.getDroit().getNomDroit())
                    .distinct()
                    .collect(Collectors.toList());

            // Ajouter les noms de rôles dans les droits (pour le filtrage sidebar)
            for (String role : roles) {
                if (!droits.contains(role)) {
                    droits.add(role);
                }
            }

            return new AuthResponse(
                    token,
                    user.getUsername(),
                    roles,
                    droits,
                    user.getId(),
                    user.getAgent().getId()
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
    }
}