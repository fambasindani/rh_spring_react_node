package grad.microservice_auth.services;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.entities.Droit;
import grad.microservice_auth.entities.Role;
import grad.microservice_auth.entities.RoleDroit;
import grad.microservice_auth.repositories.DroitRepository;
import grad.microservice_auth.repositories.RoleDroitRepository;
import grad.microservice_auth.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DroitService {

    private final DroitRepository droitRepository;
    private final RoleDroitRepository roleDroitRepository;
    private final RoleRepository roleRepository;

    @PreAuthorize("hasAuthority('MANAGE_DROITS') or hasAuthority('ADMIN')")
    @Transactional
    public DroitDTO create(CreateDroitRequest request) {
        String nomDroit = request.getNomDroit().trim().toUpperCase();
        if (droitRepository.existsByNomDroit(nomDroit)) {
            throw new RuntimeException("Un droit avec ce nom existe déjà");
        }

        Droit droit = new Droit();
        droit.setNomDroit(nomDroit);
        droit.setDescription(request.getDescription());
        droit.setModule(request.getModule());
        droit.setDateCreation(LocalDateTime.now());

        droit = droitRepository.save(droit);
        return mapToDTO(droit);
    }

    public List<DroitDTO> getAll() {
        return droitRepository.findAll(Sort.by("id").descending()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PageResponse<DroitDTO> getAllPaginated(int page, int size) {
        Page<Droit> droitPage = droitRepository.findAll(
                PageRequest.of(page, size, Sort.by("id").descending()));
        List<DroitDTO> content = droitPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                droitPage.getNumber(),
                droitPage.getSize(),
                droitPage.getTotalElements(),
                droitPage.getTotalPages(),
                droitPage.isLast()
        );
    }

    public DroitDTO getById(Long id) {
        Droit droit = droitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Droit non trouvé avec l'ID : " + id));
        return mapToDTO(droit);
    }

    @PreAuthorize("hasAuthority('MANAGE_DROITS') or hasAuthority('ADMIN')")
    @Transactional
    public DroitDTO update(Long id, UpdateDroitRequest request) {
        Droit droit = droitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Droit non trouvé avec l'ID : " + id));

        if (request.getNomDroit() != null && !request.getNomDroit().isBlank()) {
            String newName = request.getNomDroit().trim().toUpperCase();
            if (!droit.getNomDroit().equals(newName)) {
                if (droitRepository.existsByNomDroit(newName)) {
                    throw new RuntimeException("Ce nom de droit est déjà utilisé");
                }
                droit.setNomDroit(newName);
            }
        }
        if (request.getDescription() != null) {
            droit.setDescription(request.getDescription());
        }
        if (request.getModule() != null) {
            droit.setModule(request.getModule());
        }

        droit = droitRepository.save(droit);
        return mapToDTO(droit);
    }

    @PreAuthorize("hasAuthority('MANAGE_DROITS') or hasAuthority('ADMIN')")
    @Transactional
    public void delete(Long id) {
        Droit droit = droitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Droit non trouvé avec l'ID : " + id));
        roleDroitRepository.findByDroitId(id)
                .forEach(roleDroitRepository::delete);
        droitRepository.delete(droit);
    }

    @Transactional
    public void assignToRole(Long droitId, Long roleId) {
        Droit droit = droitRepository.findById(droitId)
                .orElseThrow(() -> new RuntimeException("Droit non trouvé avec l'ID : " + droitId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + roleId));

        if (roleDroitRepository.existsByRoleIdAndDroitId(roleId, droitId)) {
            throw new RuntimeException("Ce droit est déjà assigné à ce rôle");
        }

        RoleDroit rd = new RoleDroit(role, droit);
        roleDroitRepository.save(rd);
    }

    @Transactional
    public void unassignFromRole(Long droitId, Long roleId) {
        if (!roleDroitRepository.existsByRoleIdAndDroitId(roleId, droitId)) {
            throw new RuntimeException("Ce droit n'est pas assigné à ce rôle");
        }
        roleDroitRepository.deleteByRoleIdAndDroitId(roleId, droitId);
    }

    public List<RoleDTO> getRolesByDroit(Long droitId) {
        return roleDroitRepository.findByDroitId(droitId).stream()
                .map(rd -> {
                    RoleDTO dto = new RoleDTO();
                    dto.setId(rd.getRole().getId());
                    dto.setNomRole(rd.getRole().getNomRole());
                    dto.setDescription(rd.getRole().getDescription());
                    dto.setDateCreation(rd.getRole().getDateCreation());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<DroitDTO> getByRoleId(Long roleId) {
        return roleDroitRepository.findByRoleId(roleId).stream()
                .map(rd -> mapToDTO(rd.getDroit()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void bulkAssignToRole(Long roleId, List<Long> droitIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'ID : " + roleId));

        roleDroitRepository.findByRoleId(roleId)
                .forEach(roleDroitRepository::delete);

        for (Long droitId : droitIds) {
            Droit droit = droitRepository.findById(droitId)
                    .orElseThrow(() -> new RuntimeException("Droit non trouvé avec l'ID : " + droitId));
            RoleDroit rd = new RoleDroit(role, droit);
            roleDroitRepository.save(rd);
        }
    }

    @Transactional
    public int initDefaultDroits() {
        Map<String, String> defaultDroits = Map.ofEntries(
            Map.entry("VIEW_AGENTS", "Voir la liste des agents"),
            Map.entry("CREATE_AGENT", "Créer un agent"),
            Map.entry("UPDATE_AGENT", "Modifier un agent"),
            Map.entry("DELETE_AGENT", "Supprimer un agent"),

            Map.entry("VIEW_GRADES", "Voir les grades"),
            Map.entry("MANAGE_GRADES", "Gérer les grades"),

            Map.entry("VIEW_FONCTIONS", "Voir les fonctions"),
            Map.entry("MANAGE_FONCTIONS", "Gérer les fonctions"),

            Map.entry("VIEW_DIRECTIONS", "Voir les directions"),
            Map.entry("MANAGE_DIRECTIONS", "Gérer les directions"),

            Map.entry("VIEW_CONGES", "Voir les congés"),
            Map.entry("CREATE_CONGE", "Demander un congé"),
            Map.entry("VALIDATE_CONGES", "Valider/refuser les congés"),

            Map.entry("VIEW_PRESENCES", "Voir les présences"),
            Map.entry("MANAGE_PRESENCES", "Gérer les présences"),

            Map.entry("VIEW_ABSENCES", "Voir les absences"),
            Map.entry("MANAGE_ABSENCES", "Gérer les absences"),

            Map.entry("VIEW_PERMISSIONS", "Voir les permissions de sortie"),
            Map.entry("MANAGE_PERMISSIONS", "Gérer les permissions de sortie"),

            Map.entry("VIEW_FORMATIONS", "Voir les formations"),
            Map.entry("MANAGE_FORMATIONS", "Gérer les formations"),
            Map.entry("VIEW_CATALOGUE_FORMATIONS", "Voir le catalogue des formations"),
            Map.entry("MANAGE_INSCRIPTIONS", "Gérer les inscriptions aux formations"),

            Map.entry("VIEW_CONTRATS", "Voir les contrats"),
            Map.entry("MANAGE_CONTRATS", "Gérer les contrats"),

            Map.entry("VIEW_EVALUATIONS", "Voir les évaluations"),
            Map.entry("MANAGE_EVALUATIONS", "Gérer les évaluations"),

            Map.entry("VIEW_MISSIONS", "Voir les missions"),
            Map.entry("MANAGE_MISSIONS", "Gérer les missions"),

            Map.entry("VIEW_PRIMES", "Voir les primes"),
            Map.entry("MANAGE_PRIMES", "Gérer les primes"),

            Map.entry("VIEW_RETRAITES", "Voir les retraites"),
            Map.entry("MANAGE_RETRAITES", "Gérer les retraites"),

            Map.entry("VIEW_SANCTIONS", "Voir les sanctions"),
            Map.entry("MANAGE_SANCTIONS", "Gérer les sanctions"),

            Map.entry("VIEW_NOTIFICATIONS", "Voir les notifications"),
            Map.entry("MANAGE_NOTIFICATIONS", "Gérer les notifications"),

            Map.entry("VIEW_UTILISATEURS", "Voir les utilisateurs"),
            Map.entry("MANAGE_UTILISATEURS", "Gérer les utilisateurs"),

            Map.entry("VIEW_ROLES", "Voir les rôles"),
            Map.entry("MANAGE_ROLES", "Gérer les rôles"),

            Map.entry("VIEW_DROITS", "Voir les droits d'accès"),
            Map.entry("MANAGE_DROITS", "Gérer les droits d'accès"),

            Map.entry("VIEW_OWN_PROFILE", "Voir son propre profil"),
            Map.entry("UPDATE_OWN_PROFILE", "Modifier son propre profil"),

            Map.entry("VIEW_LOGS", "Voir les journaux"),
            Map.entry("VIEW_STATISTIQUES", "Voir le tableau de bord")
        );

        int count = 0;
        String[] modules = {
            "AGENTS", "GRADES", "FONCTIONS", "DIRECTIONS",
            "CONGES", "PRESENCES", "ABSENCES", "PERMISSIONS",
            "FORMATIONS", "CONTRATS", "EVALUATIONS", "MISSIONS",
            "PRIMES", "RETRAITES", "SANCTIONS", "NOTIFICATIONS",
            "UTILISATEURS", "ROLES", "DROITS", "STATISTIQUES"
        };

        List<Droit> allDroits = new ArrayList<>();

        for (Map.Entry<String, String> entry : defaultDroits.entrySet()) {
            Droit existing = droitRepository.findByNomDroit(entry.getKey()).orElse(null);
            if (existing == null) {
                String module = "";
                for (String m : modules) {
                    if (entry.getKey().contains(m.substring(0, Math.min(m.length(), 5)).toUpperCase())) {
                        module = m;
                        break;
                    }
                }
                Droit droit = new Droit();
                droit.setNomDroit(entry.getKey());
                droit.setDescription(entry.getValue());
                droit.setModule(module);
                droit.setDateCreation(LocalDateTime.now());
                droit = droitRepository.save(droit);
                allDroits.add(droit);
                count++;
            } else {
                allDroits.add(existing);
            }
        }

        // Auto-assigner tous les droits au rôle ADMIN
        Role adminRole = roleRepository.findByNomRole("ADMIN").orElse(null);
        if (adminRole != null) {
            for (Droit droit : allDroits) {
                if (!roleDroitRepository.existsByRoleIdAndDroitId(adminRole.getId(), droit.getId())) {
                    roleDroitRepository.save(new RoleDroit(adminRole, droit));
                }
            }
        }

        return count;
    }

    private DroitDTO mapToDTO(Droit d) {
        DroitDTO dto = new DroitDTO();
        dto.setId(d.getId());
        dto.setNomDroit(d.getNomDroit());
        dto.setDescription(d.getDescription());
        dto.setModule(d.getModule());
        dto.setDateCreation(d.getDateCreation());
        return dto;
    }
}
