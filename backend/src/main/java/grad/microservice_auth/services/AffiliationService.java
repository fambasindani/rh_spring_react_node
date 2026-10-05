package grad.microservice_auth.services;

import grad.microservice_auth.dto.AffiliationRequest;
import grad.microservice_auth.dto.AffiliationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Affiliation;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.repositories.AffiliationRepository;
import grad.microservice_auth.repositories.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AffiliationService {

    private final AffiliationRepository affiliationRepository;
    private final AgentRepository agentRepository;

    public AffiliationResponse createAffiliation(AffiliationRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));

        Affiliation affiliation = new Affiliation();
        affiliation.setAgent(agent);
        affiliation.setNom(request.getNom());
        affiliation.setPostnom(request.getPostnom());
        affiliation.setPrenom(request.getPrenom());
        affiliation.setDateNaissance(request.getDateNaissance());
        affiliation.setLieuNaissance(request.getLieuNaissance());
        affiliation.setEtat(request.getEtat());
        affiliation.setRelation(request.getRelation());
        affiliation.setStatut(request.getStatut());

        affiliation = affiliationRepository.save(affiliation);
        return mapToResponse(affiliation);
    }

    public List<AffiliationResponse> getAllAffiliations() {
        return affiliationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<AffiliationResponse> getAllAffiliationsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Affiliation> affiliationPage = affiliationRepository.findAll(pageable);
        List<AffiliationResponse> content = affiliationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, affiliationPage.getNumber(), affiliationPage.getSize(),
                affiliationPage.getTotalElements(), affiliationPage.getTotalPages(), affiliationPage.isLast());
    }

    public AffiliationResponse getAffiliationById(Long id) {
        Affiliation affiliation = affiliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affiliation introuvable avec l'id: " + id));
        return mapToResponse(affiliation);
    }

    public AffiliationResponse updateAffiliation(Long id, AffiliationRequest request) {
        Affiliation affiliation = affiliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affiliation introuvable avec l'id: " + id));

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));

        affiliation.setAgent(agent);
        affiliation.setNom(request.getNom());
        affiliation.setPostnom(request.getPostnom());
        affiliation.setPrenom(request.getPrenom());
        affiliation.setDateNaissance(request.getDateNaissance());
        affiliation.setLieuNaissance(request.getLieuNaissance());
        affiliation.setEtat(request.getEtat());
        affiliation.setRelation(request.getRelation());
        affiliation.setStatut(request.getStatut());

        affiliation = affiliationRepository.save(affiliation);
        return mapToResponse(affiliation);
    }

    public String deleteAffiliation(Long id) {
        if (!affiliationRepository.existsById(id)) {
            throw new RuntimeException("Affiliation introuvable avec l'id: " + id);
        }
        affiliationRepository.deleteById(id);
        return "Affiliation supprimée avec succès";
    }

    // Recherche
    public PageResponse<AffiliationResponse> searchAffiliations(String keyword, Long agentId, String etat, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Affiliation> affiliationPage = affiliationRepository.searchAffiliations(keyword, agentId, etat, pageable);
        List<AffiliationResponse> content = affiliationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, affiliationPage.getNumber(), affiliationPage.getSize(),
                affiliationPage.getTotalElements(), affiliationPage.getTotalPages(), affiliationPage.isLast());
    }

    private AffiliationResponse mapToResponse(Affiliation affiliation) {
        return new AffiliationResponse(
                affiliation.getId(),
                affiliation.getAgent().getId(),
                affiliation.getAgent().getNom(),
                affiliation.getAgent().getPostnom(),
                affiliation.getAgent().getPrenom(),
                affiliation.getNom(),
                affiliation.getPostnom(),
                affiliation.getPrenom(),
                affiliation.getDateNaissance(),
                affiliation.getLieuNaissance(),
                affiliation.getEtat(),
                affiliation.getRelation(),
                affiliation.getStatut()
        );
    }
}