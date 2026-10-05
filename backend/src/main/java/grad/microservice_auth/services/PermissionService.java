package grad.microservice_auth.services;

import grad.microservice_auth.Enum.StatutConge;
import grad.microservice_auth.dto.PermissionRequest;
import grad.microservice_auth.dto.PermissionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Permission;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public PermissionResponse create(PermissionRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Permission permission = new Permission();
        permission.setAgent(agent);
        permission.setDatePermission(request.getDatePermission());
        permission.setHeureSortie(request.getHeureSortie());
        permission.setHeureRetour(request.getHeureRetour());
        permission.setMotif(request.getMotif());
        permission.setStatut(request.getStatut() != null ?
                StatutConge.valueOf(request.getStatut()) : StatutConge.EN_ATTENTE);
        permission = permissionRepository.save(permission);
        return mapToResponse(permission);
    }

    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<PermissionResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Permission> permissionPage = permissionRepository.findAll(pageable);
        List<PermissionResponse> content = permissionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                permissionPage.getNumber(),
                permissionPage.getSize(),
                permissionPage.getTotalElements(),
                permissionPage.getTotalPages(),
                permissionPage.isLast()
        );
    }

    public PageResponse<PermissionResponse> searchByAgentName(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Permission> permissionPage = permissionRepository.findByAgentNomOrPrenomContainingIgnoreCase(keyword, pageable);
        List<PermissionResponse> content = permissionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                permissionPage.getNumber(),
                permissionPage.getSize(),
                permissionPage.getTotalElements(),
                permissionPage.getTotalPages(),
                permissionPage.isLast()
        );
    }

    public PermissionResponse getById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission non trouvée"));
        return mapToResponse(permission);
    }

    @Transactional
    public PermissionResponse update(Long id, PermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        permission.setAgent(agent);
        permission.setDatePermission(request.getDatePermission());
        permission.setHeureSortie(request.getHeureSortie());
        permission.setHeureRetour(request.getHeureRetour());
        permission.setMotif(request.getMotif());
        permission.setStatut(request.getStatut() != null ?
                StatutConge.valueOf(request.getStatut()) : StatutConge.EN_ATTENTE);
        permission = permissionRepository.save(permission);
        return mapToResponse(permission);
    }

    @Transactional
    public void delete(Long id) {
        permissionRepository.deleteById(id);
    }

    private PermissionResponse mapToResponse(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getAgent().getId(),
                permission.getAgent().getNom(),
                permission.getAgent().getPrenom(),
                permission.getDatePermission(),
                permission.getHeureSortie(),
                permission.getHeureRetour(),
                permission.getMotif(),
                permission.getStatut().name()
        );
    }
}