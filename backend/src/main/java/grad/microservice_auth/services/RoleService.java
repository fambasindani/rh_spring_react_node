package grad.microservice_auth.services;

import grad.microservice_auth.dto.CreateRoleRequest;
import grad.microservice_auth.dto.RoleDTO;
import grad.microservice_auth.dto.UpdateRoleRequest;
import grad.microservice_auth.entities.Role;
import grad.microservice_auth.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    @PreAuthorize("hasAuthority('MANAGE_ROLES') or hasAuthority('ADMIN')")
    @Transactional
    public RoleDTO create(CreateRoleRequest request) {
        // Vérifier l'unicité du nom
        roleRepository.findByNomRole(request.getNomRole().toUpperCase())
                .ifPresent(r -> {
                    throw new RuntimeException("Un rôle avec ce nom existe déjà");
                });

        Role role = new Role();
        role.setNomRole(request.getNomRole().toUpperCase());
        role.setDescription(request.getDescription());
        role.setDateCreation(LocalDateTime.now());
        role = roleRepository.save(role);

        return mapToDTO(role);
    }

    public List<RoleDTO> getAll() {
        return roleRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RoleDTO getById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + id));
        return mapToDTO(role);
    }

    @PreAuthorize("hasAuthority('MANAGE_ROLES') or hasAuthority('ADMIN')")
    @Transactional
    public RoleDTO update(Long id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + id));

        if (request.getNomRole() != null && !request.getNomRole().isBlank()) {
            String newName = request.getNomRole().toUpperCase();
            if (!role.getNomRole().equals(newName)) {
                roleRepository.findByNomRole(newName)
                        .ifPresent(r -> {
                            throw new RuntimeException("Ce nom de rôle est déjà utilisé");
                        });
                role.setNomRole(newName);
            }
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        role = roleRepository.save(role);
        return mapToDTO(role);
    }

    @PreAuthorize("hasAuthority('MANAGE_ROLES') or hasAuthority('ADMIN')")
    @Transactional
    public void delete(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + id));
        // On pourrait vérifier si le rôle est encore attribué à des utilisateurs
        roleRepository.delete(role);
    }

    // Mappeur
    private RoleDTO mapToDTO(Role role) {
        return new RoleDTO(
                role.getId(),
                role.getNomRole(),
                role.getDescription(),
                role.getDateCreation()
        );
    }
}