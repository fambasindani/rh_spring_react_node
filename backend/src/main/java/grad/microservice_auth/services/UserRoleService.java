package grad.microservice_auth.services;

import grad.microservice_auth.dto.AssignRoleRequest;
import grad.microservice_auth.dto.UserRoleDTO;
import grad.microservice_auth.entities.Role;
import grad.microservice_auth.entities.User;
import grad.microservice_auth.entities.UserRole;
import grad.microservice_auth.entities.UserRoleId;
import grad.microservice_auth.repositories.RoleRepository;
import grad.microservice_auth.repositories.UserRepository;
import grad.microservice_auth.repositories.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserRoleService {

    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public UserRoleDTO assignRole(Long userId, AssignRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + request.getRoleId()));

        // Vérifier si l'association existe déjà
        userRoleRepository.findByUserIdAndRoleId(userId, role.getId())
                .ifPresent(ur -> {
                    throw new RuntimeException("Ce rôle est déjà attribué à cet utilisateur");
                });

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setDateAttribution(LocalDateTime.now());
        // L'ID composite sera généré automatiquement via les annotations @MapsId

        userRole = userRoleRepository.save(userRole);

        return mapToDTO(userRole);
    }

    public List<UserRoleDTO> getRolesForUser(Long userId) {
        // Vérifier que l'utilisateur existe
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));

        return userRoleRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + roleId));

        // Vérifier que l'association existe
        userRoleRepository.findByUserIdAndRoleId(userId, roleId)
                .orElseThrow(() -> new RuntimeException("Cet utilisateur n'a pas ce rôle"));

        userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);
    }

    @Transactional
    public void removeAllRolesForUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + userId));

        // Supprimer toutes les associations (cascade ? on le fait manuellement)
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        userRoleRepository.deleteAll(userRoles);
    }

    // Mappeur
    private UserRoleDTO mapToDTO(UserRole userRole) {
        return new UserRoleDTO(
                userRole.getUser().getId(),
                userRole.getRole().getId(),
                userRole.getRole().getNomRole(),
                userRole.getUser().getUsername(),
                userRole.getDateAttribution()
        );
    }
}