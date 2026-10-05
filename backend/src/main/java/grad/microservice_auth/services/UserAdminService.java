package grad.microservice_auth.services;

import grad.microservice_auth.dto.RoleDTO;
import grad.microservice_auth.dto.UserAdminDTO;
import grad.microservice_auth.dto.UserCreateRequest;
import grad.microservice_auth.dto.UserUpdateRequest;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Role;
import grad.microservice_auth.entities.User;
import grad.microservice_auth.entities.UserRole;
import grad.microservice_auth.entities.UserRoleId;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.RoleRepository;
import grad.microservice_auth.repositories.UserRepository;
import grad.microservice_auth.repositories.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserAdminDTO createUser(UserCreateRequest request) {
        // Vérifier que l'agent existe
        Agent agent = agentRepository.findById(request.getAgentId())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        // Vérifier que l'agent n'a pas déjà un compte
        if (userRepository.findByAgent(agent).isPresent()) {
            throw new RuntimeException("Cet agent a déjà un compte");
        }

        // Créer l'utilisateur
        User user = new User();
        user.setAgent(agent);
        user.setUsername(agent.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActif(request.getActif() != null ? request.getActif() : true);
        user.setDateCreation(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Attribuer les rôles
        if (request.getRoleIds() != null) {
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Rôle non trouvé: " + roleId));
                UserRole userRole = new UserRole();
                userRole.setUser(savedUser);
                userRole.setRole(role);
                userRole.setDateAttribution(LocalDateTime.now());
                userRole.setId(new UserRoleId(savedUser.getId(), roleId));
                userRoleRepository.save(userRole);
            }
        }

        // Recharger pour avoir les rôles
        User freshUser = userRepository.findById(savedUser.getId()).orElseThrow();
        return toDTO(freshUser);
    }


    @Transactional
    public UserAdminDTO updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        // Mettre à jour les champs simples
        if (request.getActif() != null) {
            user.setActif(request.getActif());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        // Mettre à jour les rôles
        if (request.getRoleIds() != null) {
            // Supprimer tous les rôles existants pour cet utilisateur
            userRoleRepository.deleteByUser(user);
            // Vider la collection pour éviter les conflits
            user.getUserRoles().clear();
            // Ajouter les nouveaux rôles
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Rôle non trouvé: " + roleId));
                UserRole userRole = new UserRole();
                userRole.setUser(user);
                userRole.setRole(role);
                userRole.setDateAttribution(LocalDateTime.now());
                userRole.setId(new UserRoleId(user.getId(), roleId));
                userRoleRepository.save(userRole);
                user.getUserRoles().add(userRole);
            }
        }
        User updatedUser = userRepository.save(user);
        // Recharger pour avoir les rôles à jour
        User freshUser = userRepository.findById(updatedUser.getId()).orElseThrow();
        return toDTO(freshUser);
    }
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public Page<UserAdminDTO> getUsers(String keyword, Pageable pageable) {
        List<User> allUsers;
        if (keyword != null && !keyword.isEmpty()) {
            allUsers = userRepository.findUsersByKeyword(keyword);
        } else {
            allUsers = userRepository.findAll();
        }
        allUsers.sort(Comparator.comparing(User::getId).reversed());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allUsers.size());
        List<UserAdminDTO> pageContent = allUsers.subList(start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, allUsers.size());
    }

    private UserAdminDTO toDTO(User user) {
        UserAdminDTO dto = new UserAdminDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setAgentId(user.getAgent().getId());
        dto.setAgentNom(user.getAgent().getNom());
        dto.setAgentPrenom(user.getAgent().getPrenom());
        dto.setAgentMatricule(user.getAgent().getMatricule());
        dto.setActif(user.getActif());
        dto.setDateCreation(user.getDateCreation());
        dto.setRoles(user.getUserRoles().stream()
                .map(ur -> new RoleDTO(ur.getRole().getId(), ur.getRole().getNomRole()))
                .collect(Collectors.toList()));
        return dto;
    }
}