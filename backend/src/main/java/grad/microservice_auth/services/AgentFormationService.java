package grad.microservice_auth.services;

import grad.microservice_auth.dto.AgentFormationRequest;
import grad.microservice_auth.dto.AgentFormationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.AgentFormation;
import grad.microservice_auth.entities.Formation;
import grad.microservice_auth.repositories.AgentFormationRepository;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.FormationRepository;
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
public class AgentFormationService {

    private final AgentFormationRepository agentFormationRepository;
    private final AgentRepository agentRepository;
    private final FormationRepository formationRepository;

    @Transactional
    public AgentFormationResponse create(AgentFormationRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Formation formation = formationRepository.findById(request.getIdFormation())
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        AgentFormation af = new AgentFormation();
        af.setAgent(agent);
        af.setFormation(formation);
        af.setResultat(request.getResultat());
        af.setObservation(request.getObservation());
        af = agentFormationRepository.save(af);
        return mapToResponse(af);
    }

    public List<AgentFormationResponse> getAll() {
        return agentFormationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<AgentFormationResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<AgentFormation> afPage = agentFormationRepository.findAll(pageable);
        List<AgentFormationResponse> content = afPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                afPage.getNumber(),
                afPage.getSize(),
                afPage.getTotalElements(),
                afPage.getTotalPages(),
                afPage.isLast()
        );
    }

    public PageResponse<AgentFormationResponse> searchByKeyword(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<AgentFormation> afPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            afPage = agentFormationRepository.findAll(pageable);
        } else {
            afPage = agentFormationRepository.findByAgentNomOrPrenomOrFormationIntitule(keyword, pageable);
        }
        List<AgentFormationResponse> content = afPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                afPage.getNumber(),
                afPage.getSize(),
                afPage.getTotalElements(),
                afPage.getTotalPages(),
                afPage.isLast()
        );
    }

    public AgentFormationResponse getById(Long id) {
        AgentFormation af = agentFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AgentFormation non trouvé"));
        return mapToResponse(af);
    }

    @Transactional
    public AgentFormationResponse update(Long id, AgentFormationRequest request) {
        AgentFormation af = agentFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AgentFormation non trouvé"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Formation formation = formationRepository.findById(request.getIdFormation())
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        af.setAgent(agent);
        af.setFormation(formation);
        af.setResultat(request.getResultat());
        af.setObservation(request.getObservation());
        af = agentFormationRepository.save(af);
        return mapToResponse(af);
    }

    @Transactional
    public void delete(Long id) {
        agentFormationRepository.deleteById(id);
    }

    private AgentFormationResponse mapToResponse(AgentFormation af) {
        return new AgentFormationResponse(
                af.getId(),
                af.getAgent().getId(),
                af.getAgent().getNom(),
                af.getAgent().getPrenom(),
                af.getFormation().getId(),
                af.getFormation().getIntitule(),
                af.getResultat(),
                af.getObservation()
        );
    }
}