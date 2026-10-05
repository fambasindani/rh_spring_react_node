package grad.microservice_auth.services;

import grad.microservice_auth.dto.EvaluationRequest;
import grad.microservice_auth.dto.EvaluationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Evaluation;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.EvaluationRepository;
import lombok.RequiredArgsConstructor;
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
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final AgentRepository agentRepository;

    @PreAuthorize("hasAuthority('MANAGE_EVALUATIONS') or hasAuthority('ADMIN') or hasAuthority('RH') or hasAuthority('DIRECTEUR')")
    @Transactional
    public EvaluationResponse create(EvaluationRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Evaluation evaluation = new Evaluation();
        evaluation.setAgent(agent);
        evaluation.setDateEvaluation(request.getDateEvaluation());
        evaluation.setNote(request.getNote());
        evaluation.setAppreciation(request.getAppreciation());
        evaluation.setEvaluateur(request.getEvaluateur());
        evaluation = evaluationRepository.save(evaluation);
        return mapToResponse(evaluation);
    }

    public List<EvaluationResponse> getAll() {
        return evaluationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<EvaluationResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Evaluation> evaluationPage = evaluationRepository.findAll(pageable);
        List<EvaluationResponse> content = evaluationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                evaluationPage.getNumber(),
                evaluationPage.getSize(),
                evaluationPage.getTotalElements(),
                evaluationPage.getTotalPages(),
                evaluationPage.isLast()
        );
    }

    public PageResponse<EvaluationResponse> searchEvaluations(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Evaluation> evaluationPage = evaluationRepository.searchByAgentName(keyword, pageable);
        List<EvaluationResponse> content = evaluationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                evaluationPage.getNumber(),
                evaluationPage.getSize(),
                evaluationPage.getTotalElements(),
                evaluationPage.getTotalPages(),
                evaluationPage.isLast()
        );
    }

    public EvaluationResponse getById(Long id) {
        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));
        return mapToResponse(evaluation);
    }

    @PreAuthorize("hasAuthority('MANAGE_EVALUATIONS') or hasAuthority('ADMIN') or hasAuthority('RH') or hasAuthority('DIRECTEUR')")
    @Transactional
    public EvaluationResponse update(Long id, EvaluationRequest request) {
        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        evaluation.setAgent(agent);
        evaluation.setDateEvaluation(request.getDateEvaluation());
        evaluation.setNote(request.getNote());
        evaluation.setAppreciation(request.getAppreciation());
        evaluation.setEvaluateur(request.getEvaluateur());
        evaluation = evaluationRepository.save(evaluation);
        return mapToResponse(evaluation);
    }

    @PreAuthorize("hasAuthority('MANAGE_EVALUATIONS') or hasAuthority('ADMIN')")
    @Transactional
    public void delete(Long id) {
        evaluationRepository.deleteById(id);
    }

    private EvaluationResponse mapToResponse(Evaluation evaluation) {
        return new EvaluationResponse(
                evaluation.getId(),
                evaluation.getAgent().getId(),
                evaluation.getAgent().getNom(),
                evaluation.getAgent().getPrenom(),
                evaluation.getDateEvaluation(),
                evaluation.getNote(),
                evaluation.getAppreciation(),
                evaluation.getEvaluateur()
        );
    }
}