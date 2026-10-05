package grad.microservice_auth.services;

import grad.microservice_auth.dto.AgentDetailsResponse;
import grad.microservice_auth.dto.AgentRequest;
import grad.microservice_auth.dto.AgentResponse;
import grad.microservice_auth.dto.AffiliationRequest;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.*;
import grad.microservice_auth.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final GradeRepository gradeRepository;
    private final FonctionRepository fonctionRepository;
    private final DirectionRepository directionRepository;
    // Repositories pour les relations
    private final AffectationRepository affectationRepository;
    private final PromotionRepository promotionRepository;
    private final AffiliationRepository affiliationRepository;
    private final EtudeRepository etudeRepository;
    private final DocumentRepository documentRepository;
    // Service d'affiliation pour la création atomique
    private final AffiliationService affiliationService;

    public Agent saveAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    // Vérifie l'unicité du matricule : seule la chaîne "NU" peut être dupliquée
    private void checkMatriculeUniqueness(String matricule, Long currentAgentId) {
        if (matricule == null || matricule.isBlank()) {
            return; // pas de valeur = pas de contrainte
        }
        String trimmed = matricule.trim();
        if ("NU".equals(trimmed)) {
            return; // "NU" est duplicable
        }
        // Toute autre valeur doit être unique
        Agent existing = agentRepository.findByMatricule(trimmed).orElse(null);
        if (existing != null && (currentAgentId == null || !existing.getId().equals(currentAgentId))) {
            throw new DataIntegrityViolationException("Le matricule '" + trimmed + "' existe déjà.");
        }
    }

    @PreAuthorize("hasAuthority('CREATE_AGENT') or hasAuthority('ADMIN')")
    public AgentResponse createAgent(AgentRequest request) {
        // Vérifier l'unicité de l'email
        if (agentRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("L'email '" + request.getEmail() + "' est déjà utilisé.");
        }

        // Vérifier l'unicité du matricule selon la règle
        checkMatriculeUniqueness(request.getMatricule(), null);

        // Récupérer les entités liées
        Grade grade = gradeRepository.findById(request.getIdGrade())
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + request.getIdGrade()));
        Fonction fonction = fonctionRepository.findById(request.getIdFonction())
                .orElseThrow(() -> new RuntimeException("Fonction introuvable avec l'id: " + request.getIdFonction()));
        Direction direction = directionRepository.findById(request.getIdDirection())
                .orElseThrow(() -> new RuntimeException("Direction introuvable avec l'id: " + request.getIdDirection()));

        Agent agent = new Agent();
        agent.setMatricule(request.getMatricule() != null ? request.getMatricule().trim() : null);
        agent.setGrade(grade);
        agent.setFonction(fonction);
        agent.setDirection(direction);
        agent.setNom(request.getNom());
        agent.setPostnom(request.getPostnom());
        agent.setPrenom(request.getPrenom());
        agent.setSexe(request.getSexe());
        agent.setDateNaissance(request.getDateNaissance());
        agent.setEmail(request.getEmail());
        agent.setTelephone(request.getTelephone());
        agent.setEtatCivil(request.getEtatCivil());
        agent.setStatut(request.getStatut());
        agent.setReferenceEngagement(request.getReferenceEngagement());
        agent.setDateEngagement(request.getDateEngagement());
        agent.setProvince(request.getProvince());
        agent.setTerritoire(request.getTerritoire());
        agent.setVillage(request.getVillage());
        agent.setPhoto(request.getPhoto());

        agent = agentRepository.save(agent);
        return mapToResponse(agent);
    }

    public List<AgentResponse> getAllAgents() {
        return agentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<AgentResponse> getAllAgentsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Agent> agentPage = agentRepository.findAll(pageable);
        List<AgentResponse> content = agentPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, agentPage.getNumber(), agentPage.getSize(),
                agentPage.getTotalElements(), agentPage.getTotalPages(), agentPage.isLast());
    }

    public AgentResponse getAgentById(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + id));
        return mapToResponse(agent);
    }

    @PreAuthorize("hasAuthority('UPDATE_AGENT') or hasAuthority('ADMIN')")
    public AgentResponse updateAgent(Long id, AgentRequest request) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + id));

        // Vérifier l'unicité de l'email (si modifié)
        if (!agent.getEmail().equals(request.getEmail()) &&
                agentRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("L'email '" + request.getEmail() + "' est déjà utilisé.");
        }

        // Vérifier l'unicité du matricule (en ignorant l'agent courant)
        checkMatriculeUniqueness(request.getMatricule(), id);

        // Récupérer les nouvelles relations (si elles ont changé)
        Grade grade = gradeRepository.findById(request.getIdGrade())
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + request.getIdGrade()));
        Fonction fonction = fonctionRepository.findById(request.getIdFonction())
                .orElseThrow(() -> new RuntimeException("Fonction introuvable avec l'id: " + request.getIdFonction()));
        Direction direction = directionRepository.findById(request.getIdDirection())
                .orElseThrow(() -> new RuntimeException("Direction introuvable avec l'id: " + request.getIdDirection()));

        agent.setMatricule(request.getMatricule() != null ? request.getMatricule().trim() : null);
        agent.setGrade(grade);
        agent.setFonction(fonction);
        agent.setDirection(direction);
        agent.setNom(request.getNom());
        agent.setPostnom(request.getPostnom());
        agent.setPrenom(request.getPrenom());
        agent.setSexe(request.getSexe());
        agent.setDateNaissance(request.getDateNaissance());
        agent.setEmail(request.getEmail());
        agent.setTelephone(request.getTelephone());
        agent.setEtatCivil(request.getEtatCivil());
        agent.setStatut(request.getStatut());
        agent.setReferenceEngagement(request.getReferenceEngagement());
        agent.setDateEngagement(request.getDateEngagement());
        agent.setProvince(request.getProvince());
        agent.setTerritoire(request.getTerritoire());
        agent.setVillage(request.getVillage());
        agent.setPhoto(request.getPhoto());

        agent = agentRepository.save(agent);
        return mapToResponse(agent);
    }

    @PreAuthorize("hasAuthority('DELETE_AGENT') or hasAuthority('ADMIN')")
    public String deleteAgent(Long id) {
        if (!agentRepository.existsById(id)) {
            throw new RuntimeException("Agent introuvable avec l'id: " + id);
        }
        agentRepository.deleteById(id);
        return "Agent supprimé avec succès";
    }

    // ========== DÉTAILS COMPLETS ==========
    public AgentDetailsResponse getAgentDetailsById(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + id));

        List<Affectation> affectations = affectationRepository.findByAgentId(id);
        List<Promotion> promotions = promotionRepository.findByAgentId(id);
        List<Affiliation> affiliations = affiliationRepository.findByAgentId(id);
        List<Etude> etudes = etudeRepository.findByAgentId(id);
        List<Document> documents = documentRepository.findByAgentId(id);

        return new AgentDetailsResponse(
                agent.getId(),
                agent.getMatricule(),
                agent.getNom(),
                agent.getPostnom(),
                agent.getPrenom(),
                agent.getSexe(),
                agent.getDateNaissance(),
                agent.getEmail(),
                agent.getTelephone(),
                agent.getEtatCivil(),
                agent.getStatut(),
                agent.getReferenceEngagement(),
                agent.getDateEngagement(),
                agent.getProvince(),
                agent.getTerritoire(),
                agent.getVillage(),
                agent.getPhoto(),
                agent.getGrade().getId(),
                agent.getGrade().getSigle(),
                agent.getGrade().getNom(),
                agent.getFonction().getId(),
                agent.getFonction().getNom(),
                agent.getDirection().getId(),
                agent.getDirection().getSigle(),
                agent.getDirection().getNom(),
                mapAffectations(affectations),
                mapPromotions(promotions),
                mapAffiliations(affiliations),
                mapEtudes(etudes),
                mapDocuments(documents)
        );
    }

    // ========== MAPPINGS POUR LES DÉTAILS ==========
    private List<AgentDetailsResponse.AffectationDto> mapAffectations(List<Affectation> list) {
        return list.stream()
                .map(a -> new AgentDetailsResponse.AffectationDto(
                        a.getId(),
                        a.getDirection().getId(),
                        a.getDirection().getSigle(),
                        a.getDirection().getNom(),
                        a.getDateDebut(),
                        a.getDateFin()
                ))
                .collect(Collectors.toList());
    }

    private List<AgentDetailsResponse.PromotionDto> mapPromotions(List<Promotion> list) {
        return list.stream()
                .map(p -> new AgentDetailsResponse.PromotionDto(
                        p.getId(),
                        p.getGrade().getId(),
                        p.getGrade().getSigle(),
                        p.getGrade().getNom(),
                        p.getDateDebut(),
                        p.getDateFin(),
                        p.getReference()
                ))
                .collect(Collectors.toList());
    }

    private List<AgentDetailsResponse.AffiliationDto> mapAffiliations(List<Affiliation> list) {
        return list.stream()
                .map(aff -> new AgentDetailsResponse.AffiliationDto(
                        aff.getId(),
                        aff.getNom(),
                        aff.getPostnom(),
                        aff.getPrenom(),
                        aff.getDateNaissance(),
                        aff.getLieuNaissance(),
                        aff.getEtat(),
                        aff.getRelation(),
                        aff.getStatut()
                ))
                .collect(Collectors.toList());
    }

    private List<AgentDetailsResponse.EtudeDto> mapEtudes(List<Etude> list) {
        return list.stream()
                .map(e -> new AgentDetailsResponse.EtudeDto(
                        e.getId(),
                        e.getNombreAnnee(),
                        e.getLieu(),
                        e.getEtablissement()
                ))
                .collect(Collectors.toList());
    }

    private List<AgentDetailsResponse.DocumentDto> mapDocuments(List<Document> list) {
        return list.stream()
                .map(d -> new AgentDetailsResponse.DocumentDto(
                        d.getId(),
                        d.getIntitule(),
                        d.getCheminFichier()
                ))
                .collect(Collectors.toList());
    }

    // ========== RECHERCHE ==========
    public PageResponse<AgentResponse> searchAgents(String keyword, Long gradeId, Long fonctionId, Long directionId, Boolean statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Agent> agentPage = agentRepository.searchAgents(keyword, gradeId, fonctionId, directionId, statut, pageable);
        List<AgentResponse> content = agentPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, agentPage.getNumber(), agentPage.getSize(),
                agentPage.getTotalElements(), agentPage.getTotalPages(), agentPage.isLast());
    }

    // ========== UTILITAIRE ==========
    public Agent getAgentByEmail(String email) {
        return agentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé avec l'email: " + email));
    }

    // ========== CRÉATION AVEC PHOTO ET AFFILIATIONS (TRANSACTIONNELLE) ==========



    @Transactional(rollbackFor = Exception.class)
    public AgentResponse createAgentWithAffiliationsAndPhoto(AgentRequest agentRequest,
                                                             List<AffiliationRequest> affiliations,
                                                             String photoPath) {
        // Validation des champs obligatoires (selon @NotBlank/@NotNull dans AgentRequest)
        if (agentRequest.getNom() == null || agentRequest.getNom().isBlank()) {
            throw new DataIntegrityViolationException("Le nom est obligatoire.");
        }
        if (agentRequest.getPostnom() == null || agentRequest.getPostnom().isBlank()) {
            throw new DataIntegrityViolationException("Le postnom est obligatoire.");
        }
        if (agentRequest.getPrenom() == null || agentRequest.getPrenom().isBlank()) {
            throw new DataIntegrityViolationException("Le prénom est obligatoire.");
        }
        if (agentRequest.getSexe() == null || agentRequest.getSexe().isBlank()) {
            throw new DataIntegrityViolationException("Le sexe est obligatoire.");
        }
        if (agentRequest.getDateNaissance() == null) {
            throw new DataIntegrityViolationException("La date de naissance est obligatoire.");
        }
        if (agentRequest.getEmail() == null || agentRequest.getEmail().isBlank()) {
            throw new DataIntegrityViolationException("L'email est obligatoire.");
        }
        if (agentRequest.getTelephone() == null || agentRequest.getTelephone().isBlank()) {
            throw new DataIntegrityViolationException("Le téléphone est obligatoire.");
        }
        if (agentRequest.getEtatCivil() == null || agentRequest.getEtatCivil().isBlank()) {
            throw new DataIntegrityViolationException("L'état civil est obligatoire.");
        }
        if (agentRequest.getReferenceEngagement() == null || agentRequest.getReferenceEngagement().isBlank()) {
            throw new DataIntegrityViolationException("La référence d'engagement est obligatoire.");
        }
        if (agentRequest.getDateEngagement() == null) {
            throw new DataIntegrityViolationException("La date d'engagement est obligatoire.");
        }
        if (agentRequest.getProvince() == null || agentRequest.getProvince().isBlank()) {
            throw new DataIntegrityViolationException("La province est obligatoire.");
        }
        if (agentRequest.getTerritoire() == null || agentRequest.getTerritoire().isBlank()) {
            throw new DataIntegrityViolationException("Le territoire est obligatoire.");
        }
        if (agentRequest.getVillage() == null || agentRequest.getVillage().isBlank()) {
            throw new DataIntegrityViolationException("Le village est obligatoire.");
        }
        if (agentRequest.getIdGrade() == null) {
            throw new DataIntegrityViolationException("L'ID du grade est obligatoire.");
        }
        if (agentRequest.getIdFonction() == null) {
            throw new DataIntegrityViolationException("L'ID de la fonction est obligatoire.");
        }
        if (agentRequest.getIdDirection() == null) {
            throw new DataIntegrityViolationException("L'ID de la direction est obligatoire.");
        }

        // Définir le chemin de la photo
        agentRequest.setPhoto(photoPath);

        // Créer l'agent
        AgentResponse agentResponse = createAgent(agentRequest);

        // Créer les affiliations si présentes
        if (affiliations != null && !affiliations.isEmpty()) {
            for (AffiliationRequest affReq : affiliations) {
                affReq.setIdAgent(agentResponse.getId());
                affiliationService.createAffiliation(affReq);
            }
        }

        return agentResponse;
    }




    private AgentResponse mapToResponse(Agent agent) {
        return new AgentResponse(
                agent.getId(),
                agent.getMatricule(),
                agent.getGrade() != null ? agent.getGrade().getId() : null,
                agent.getGrade() != null ? agent.getGrade().getSigle() : null,
                agent.getGrade() != null ? agent.getGrade().getNom() : null,
                agent.getFonction() != null ? agent.getFonction().getId() : null,
                agent.getFonction() != null ? agent.getFonction().getNom() : null,
                agent.getDirection() != null ? agent.getDirection().getId() : null,
                agent.getDirection() != null ? agent.getDirection().getSigle() : null,
                agent.getDirection() != null ? agent.getDirection().getNom() : null,
                agent.getNom(),
                agent.getPostnom(),
                agent.getPrenom(),
                agent.getSexe(),
                agent.getDateNaissance(),
                agent.getEmail(),
                agent.getTelephone(),
                agent.getEtatCivil(),
                agent.getStatut(),
                agent.getReferenceEngagement(),
                agent.getDateEngagement(),
                agent.getProvince(),
                agent.getTerritoire(),
                agent.getVillage(),
                agent.getPhoto()
        );
    }















    // AgentService.java
    @Transactional(rollbackFor = Exception.class)
    public AgentResponse updateAgentWithAffiliationsAndPhoto(Long id, AgentRequest agentRequest,
                                                             List<AffiliationRequest> affiliations,
                                                             String photoPath) {
        // 1. Validation des champs obligatoires (factorisée dans une méthode privée)
        validateAgentRequest(agentRequest);

        // 2. Récupérer l'agent existant
        Agent existingAgent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + id));

        // 3. Gérer la photo
        if (photoPath != null && !photoPath.isBlank()) {
            agentRequest.setPhoto(photoPath);
            // Optionnel : supprimer l'ancienne photo physique (à implémenter)
        } else {
            agentRequest.setPhoto(existingAgent.getPhoto());
        }

        // 4. Récupérer les relations mises à jour
        Grade grade = gradeRepository.findById(agentRequest.getIdGrade())
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + agentRequest.getIdGrade()));
        Fonction fonction = fonctionRepository.findById(agentRequest.getIdFonction())
                .orElseThrow(() -> new RuntimeException("Fonction introuvable avec l'id: " + agentRequest.getIdFonction()));
        Direction direction = directionRepository.findById(agentRequest.getIdDirection())
                .orElseThrow(() -> new RuntimeException("Direction introuvable avec l'id: " + agentRequest.getIdDirection()));

        // 5. Mettre à jour les champs de l'agent
        existingAgent.setMatricule(agentRequest.getMatricule());
        existingAgent.setGrade(grade);
        existingAgent.setFonction(fonction);
        existingAgent.setDirection(direction);
        existingAgent.setNom(agentRequest.getNom());
        existingAgent.setPostnom(agentRequest.getPostnom());
        existingAgent.setPrenom(agentRequest.getPrenom());
        existingAgent.setSexe(agentRequest.getSexe());
        existingAgent.setDateNaissance(agentRequest.getDateNaissance());
        existingAgent.setEmail(agentRequest.getEmail());
        existingAgent.setTelephone(agentRequest.getTelephone());
        existingAgent.setEtatCivil(agentRequest.getEtatCivil());
        existingAgent.setStatut(agentRequest.getStatut());
        existingAgent.setReferenceEngagement(agentRequest.getReferenceEngagement());
        existingAgent.setDateEngagement(agentRequest.getDateEngagement());
        existingAgent.setProvince(agentRequest.getProvince());
        existingAgent.setTerritoire(agentRequest.getTerritoire());
        existingAgent.setVillage(agentRequest.getVillage());
        existingAgent.setPhoto(agentRequest.getPhoto());

        existingAgent = agentRepository.save(existingAgent);

        // 6. Gérer les affiliations : supprimer les anciennes et ajouter les nouvelles
        if (affiliations != null) {
            affiliationRepository.deleteByAgentId(id);
            for (AffiliationRequest affReq : affiliations) {
                affReq.setIdAgent(id);
                affiliationService.createAffiliation(affReq);
            }
        }

        return mapToResponse(existingAgent);
    }

    // Méthode privée de validation (à placer dans la classe)
    private void validateAgentRequest(AgentRequest request) {
        if (request.getNom() == null || request.getNom().isBlank()) {
            throw new DataIntegrityViolationException("Le nom est obligatoire.");
        }
        if (request.getPostnom() == null || request.getPostnom().isBlank()) {
            throw new DataIntegrityViolationException("Le postnom est obligatoire.");
        }
        if (request.getPrenom() == null || request.getPrenom().isBlank()) {
            throw new DataIntegrityViolationException("Le prénom est obligatoire.");
        }
        if (request.getSexe() == null || request.getSexe().isBlank()) {
            throw new DataIntegrityViolationException("Le sexe est obligatoire.");
        }
        if (request.getDateNaissance() == null) {
            throw new DataIntegrityViolationException("La date de naissance est obligatoire.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new DataIntegrityViolationException("L'email est obligatoire.");
        }
        if (request.getTelephone() == null || request.getTelephone().isBlank()) {
            throw new DataIntegrityViolationException("Le téléphone est obligatoire.");
        }
        if (request.getEtatCivil() == null || request.getEtatCivil().isBlank()) {
            throw new DataIntegrityViolationException("L'état civil est obligatoire.");
        }
        if (request.getReferenceEngagement() == null || request.getReferenceEngagement().isBlank()) {
            throw new DataIntegrityViolationException("La référence d'engagement est obligatoire.");
        }
        if (request.getDateEngagement() == null) {
            throw new DataIntegrityViolationException("La date d'engagement est obligatoire.");
        }
        if (request.getProvince() == null || request.getProvince().isBlank()) {
            throw new DataIntegrityViolationException("La province est obligatoire.");
        }
        if (request.getTerritoire() == null || request.getTerritoire().isBlank()) {
            throw new DataIntegrityViolationException("Le territoire est obligatoire.");
        }
        if (request.getVillage() == null || request.getVillage().isBlank()) {
            throw new DataIntegrityViolationException("Le village est obligatoire.");
        }
        if (request.getIdGrade() == null) {
            throw new DataIntegrityViolationException("L'ID du grade est obligatoire.");
        }
        if (request.getIdFonction() == null) {
            throw new DataIntegrityViolationException("L'ID de la fonction est obligatoire.");
        }
        if (request.getIdDirection() == null) {
            throw new DataIntegrityViolationException("L'ID de la direction est obligatoire.");
        }
    }



}