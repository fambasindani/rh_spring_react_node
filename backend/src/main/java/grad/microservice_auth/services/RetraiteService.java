// RetraiteService.java (complet)
package grad.microservice_auth.services;

import grad.microservice_auth.dto.RetraiteRequest;
import grad.microservice_auth.dto.RetraiteResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Retraite;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.RetraiteRepository;
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
public class RetraiteService {

    private final RetraiteRepository retraiteRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public RetraiteResponse create(RetraiteRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Retraite retraite = new Retraite();
        retraite.setAgent(agent);
        retraite.setDateRetraite(request.getDateRetraite());
        retraite.setReference(request.getReference());
        retraite.setObservation(request.getObservation());
        retraite = retraiteRepository.save(retraite);
        return mapToResponse(retraite);
    }

    public List<RetraiteResponse> getAll() {
        return retraiteRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<RetraiteResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Retraite> retraitePage = retraiteRepository.findAll(pageable);
        List<RetraiteResponse> content = retraitePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                retraitePage.getNumber(),
                retraitePage.getSize(),
                retraitePage.getTotalElements(),
                retraitePage.getTotalPages(),
                retraitePage.isLast()
        );
    }

    public PageResponse<RetraiteResponse> searchRetraites(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Retraite> retraitePage = retraiteRepository.searchByAgentName(keyword, pageable);
        List<RetraiteResponse> content = retraitePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                retraitePage.getNumber(),
                retraitePage.getSize(),
                retraitePage.getTotalElements(),
                retraitePage.getTotalPages(),
                retraitePage.isLast()
        );
    }

    public RetraiteResponse getById(Long id) {
        Retraite retraite = retraiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retraite non trouvée"));
        return mapToResponse(retraite);
    }

    @Transactional
    public RetraiteResponse update(Long id, RetraiteRequest request) {
        Retraite retraite = retraiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retraite non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        retraite.setAgent(agent);
        retraite.setDateRetraite(request.getDateRetraite());
        retraite.setReference(request.getReference());
        retraite.setObservation(request.getObservation());
        retraite = retraiteRepository.save(retraite);
        return mapToResponse(retraite);
    }

    @Transactional
    public void delete(Long id) {
        retraiteRepository.deleteById(id);
    }

    private RetraiteResponse mapToResponse(Retraite retraite) {
        return new RetraiteResponse(
                retraite.getId(),
                retraite.getAgent().getId(),
                retraite.getAgent().getNom(),
                retraite.getAgent().getPrenom(),
                retraite.getDateRetraite(),
                retraite.getReference(),
                retraite.getObservation()
        );
    }
}