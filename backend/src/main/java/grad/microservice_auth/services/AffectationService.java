package grad.microservice_auth.services;

import grad.microservice_auth.dto.AffectationRequest;
import grad.microservice_auth.dto.AffectationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Affectation;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Direction;
import grad.microservice_auth.repositories.AffectationRepository;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.DirectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AffectationService {

    private final AffectationRepository affectationRepository;
    private final AgentRepository agentRepository;
    private final DirectionRepository directionRepository;

    public AffectationResponse createAffectation(AffectationRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));
        Direction direction = directionRepository.findById(request.getIdDirection())
                .orElseThrow(() -> new RuntimeException("Direction introuvable avec l'id: " + request.getIdDirection()));

        Affectation affectation = new Affectation();
        affectation.setAgent(agent);
        affectation.setDirection(direction);
        affectation.setDateDebut(request.getDateDebut());
        affectation.setDateFin(request.getDateFin());

        affectation = affectationRepository.save(affectation);
        return mapToResponse(affectation);
    }

    public List<AffectationResponse> getAllAffectations() {
        return affectationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<AffectationResponse> getAllAffectationsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Affectation> affectationPage = affectationRepository.findAll(pageable);
        List<AffectationResponse> content = affectationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, affectationPage.getNumber(), affectationPage.getSize(),
                affectationPage.getTotalElements(), affectationPage.getTotalPages(), affectationPage.isLast());
    }

    public AffectationResponse getAffectationById(Long id) {
        Affectation affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable avec l'id: " + id));
        return mapToResponse(affectation);
    }

    public AffectationResponse updateAffectation(Long id, AffectationRequest request) {
        Affectation affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable avec l'id: " + id));

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));
        Direction direction = directionRepository.findById(request.getIdDirection())
                .orElseThrow(() -> new RuntimeException("Direction introuvable avec l'id: " + request.getIdDirection()));

        affectation.setAgent(agent);
        affectation.setDirection(direction);
        affectation.setDateDebut(request.getDateDebut());
        affectation.setDateFin(request.getDateFin());

        affectation = affectationRepository.save(affectation);
        return mapToResponse(affectation);
    }

    public String deleteAffectation(Long id) {
        if (!affectationRepository.existsById(id)) {
            throw new RuntimeException("Affectation introuvable avec l'id: " + id);
        }
        affectationRepository.deleteById(id);
        return "Affectation supprimée avec succès";
    }

    private AffectationResponse mapToResponse(Affectation affectation) {
        return new AffectationResponse(
                affectation.getId(),
                affectation.getAgent().getId(),
                affectation.getAgent().getNom(),
                affectation.getAgent().getPostnom(),
                affectation.getAgent().getPrenom(),
                affectation.getDirection().getId(),
                affectation.getDirection().getSigle(),
                affectation.getDirection().getNom(),
                affectation.getDateDebut(),
                affectation.getDateFin()
        );
    }
}