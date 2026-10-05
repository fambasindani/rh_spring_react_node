package grad.microservice_auth.services;

import grad.microservice_auth.Enum.StatutConge;
import grad.microservice_auth.dto.CongeRequest;
import grad.microservice_auth.dto.CongeResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Conge;
import grad.microservice_auth.entities.TypeConge;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.CongeRepository;
import grad.microservice_auth.repositories.TypeCongeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CongeService {

    private final CongeRepository congeRepository;
    private final AgentRepository agentRepository;
    private final TypeCongeRepository typeCongeRepository;

    // ==================== MÉTHODES UTILITAIRES DE SÉCURITÉ ====================
    private String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                .findFirst()
                .orElse(null);
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    // ==================== CRÉATION ====================
    @PreAuthorize("hasAuthority('CREATE_CONGE') or hasAuthority('ADMIN') or hasAuthority('AGENT')")
    @Transactional
    public CongeResponse createConge(CongeRequest request) {
        String role = getCurrentUserRole();
        String email = getCurrentUserEmail();
        Agent currentAgent = agentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Agent connecté introuvable"));

        Long agentId;
        if ("AGENT".equals(role)) {
            // Un agent ne peut créer que pour lui-même
            agentId = currentAgent.getId();
        } else {
            // ADMIN ou RH utilise l'ID fourni
            agentId = request.getIdAgent();
        }

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));
        TypeConge typeConge = typeCongeRepository.findById(request.getIdTypeConge())
                .orElseThrow(() -> new RuntimeException("Type de congé introuvable"));

        Conge conge = new Conge();
        conge.setAgent(agent);
        conge.setTypeConge(typeConge);
        conge.setDateDebut(request.getDateDebut());
        conge.setDateFin(request.getDateFin());
        conge.setMotif(request.getMotif());
        conge.setNombreJours((int) ChronoUnit.DAYS.between(request.getDateDebut(), request.getDateFin()) + 1);
        conge.setStatut(StatutConge.EN_ATTENTE);
        conge.setDateDemande(LocalDateTime.now());

        conge = congeRepository.save(conge);
        return mapToResponse(conge);
    }

    // ==================== LECTURE (TOUS) SANS PAGINATION ====================
    public List<CongeResponse> getAllConges() {
        return congeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==================== LECTURE AVEC PAGINATION + FILTRAGE AUTOMATIQUE SELON RÔLE ====================
    public PageResponse<CongeResponse> getAllCongesPaginated(int page, int size, String agentName) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Conge> congePage;

        String role = getCurrentUserRole();
        String email = getCurrentUserEmail();

        if ("AGENT".equals(role)) {
            // Agent : uniquement ses propres congés
            Agent currentAgent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Agent introuvable"));
            congePage = congeRepository.findByAgentId(currentAgent.getId(), pageable);
        } else {
            // ADMIN, RH, DIRECTEUR : tous les congés (ou recherche par nom)
            if (agentName != null && !agentName.isBlank()) {
                congePage = congeRepository.findByAgentNomOrPrenomContainingIgnoreCase(agentName, pageable);
            } else {
                congePage = congeRepository.findAll(pageable);
            }
        }

        List<CongeResponse> content = congePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                congePage.getNumber(),
                congePage.getSize(),
                congePage.getTotalElements(),
                congePage.getTotalPages(),
                congePage.isLast()
        );
    }

    // ==================== LECTURE PAR ID ====================
    public CongeResponse getCongeById(Long id) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Congé non trouvé"));
        return mapToResponse(conge);
    }

    // ==================== MODIFICATION ====================
    @Transactional
    public CongeResponse updateConge(Long id, CongeRequest request) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Congé non trouvé"));

        // Vous pouvez ajouter ici une vérification des droits (ex: l'agent ne modifie que ses propres congés)
        String role = getCurrentUserRole();
        String email = getCurrentUserEmail();
        if ("AGENT".equals(role)) {
            Agent currentAgent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Agent introuvable"));
            if (!conge.getAgent().getId().equals(currentAgent.getId())) {
                throw new RuntimeException("Vous ne pouvez modifier que vos propres demandes");
            }
        }

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));
        TypeConge typeConge = typeCongeRepository.findById(request.getIdTypeConge())
                .orElseThrow(() -> new RuntimeException("Type de congé introuvable"));

        conge.setAgent(agent);
        conge.setTypeConge(typeConge);
        conge.setDateDebut(request.getDateDebut());
        conge.setDateFin(request.getDateFin());
        conge.setMotif(request.getMotif());
        conge.setNombreJours((int) ChronoUnit.DAYS.between(request.getDateDebut(), request.getDateFin()) + 1);

        conge = congeRepository.save(conge);
        return mapToResponse(conge);
    }

    // ==================== SUPPRESSION ====================
    @Transactional
    public void deleteConge(Long id) {
        if (!congeRepository.existsById(id)) {
            throw new RuntimeException("Congé non trouvé");
        }
        congeRepository.deleteById(id);
    }

    // ==================== CHANGEMENT DE STATUT ====================
    @PreAuthorize("hasAuthority('VALIDATE_CONGES') or hasAuthority('ADMIN') or hasAuthority('RH')")
    @Transactional
    public CongeResponse updateStatus(Long id, String newStatut) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Congé non trouvé"));
        try {
            conge.setStatut(StatutConge.valueOf(newStatut));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide");
        }
        conge = congeRepository.save(conge);
        return mapToResponse(conge);
    }

    // ==================== MAPPER ====================
    private CongeResponse mapToResponse(Conge conge) {
        return new CongeResponse(
                conge.getId(),
                conge.getAgent().getId(),
                conge.getAgent().getNom(),
                conge.getAgent().getPrenom(),
                conge.getTypeConge().getId(),
                conge.getTypeConge().getNom(),
                conge.getDateDebut(),
                conge.getDateFin(),
                conge.getNombreJours(),
                conge.getMotif(),
                conge.getStatut().name(),
                conge.getObservation(),
                conge.getDateDemande()
        );
    }
}