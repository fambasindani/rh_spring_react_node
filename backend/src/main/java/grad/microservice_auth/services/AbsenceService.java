// AbsenceService.java (complet)
package grad.microservice_auth.services;

import grad.microservice_auth.dto.AbsenceRequest;
import grad.microservice_auth.dto.AbsenceResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Absence;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.repositories.AbsenceRepository;
import grad.microservice_auth.repositories.AgentRepository;
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
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public AbsenceResponse create(AbsenceRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Absence absence = new Absence();
        absence.setAgent(agent);
        absence.setDateDebut(request.getDateDebut());
        absence.setDateFin(request.getDateFin());
        absence.setMotif(request.getMotif());
        absence.setJustification(request.getJustification());
        absence.setStatut(request.getStatut() != null ? request.getStatut() : true);
        absence = absenceRepository.save(absence);
        return mapToResponse(absence);
    }

    public List<AbsenceResponse> getAll() {
        return absenceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<AbsenceResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Absence> absencePage = absenceRepository.findAll(pageable);
        List<AbsenceResponse> content = absencePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                absencePage.getNumber(),
                absencePage.getSize(),
                absencePage.getTotalElements(),
                absencePage.getTotalPages(),
                absencePage.isLast()
        );
    }

    public PageResponse<AbsenceResponse> searchByAgentName(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Absence> absencePage = absenceRepository.findByAgentNomOrPrenomContainingIgnoreCase(keyword, pageable);
        List<AbsenceResponse> content = absencePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                absencePage.getNumber(),
                absencePage.getSize(),
                absencePage.getTotalElements(),
                absencePage.getTotalPages(),
                absencePage.isLast()
        );
    }

    public AbsenceResponse getById(Long id) {
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée"));
        return mapToResponse(absence);
    }

    @Transactional
    public AbsenceResponse update(Long id, AbsenceRequest request) {
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        absence.setAgent(agent);
        absence.setDateDebut(request.getDateDebut());
        absence.setDateFin(request.getDateFin());
        absence.setMotif(request.getMotif());
        absence.setJustification(request.getJustification());
        absence.setStatut(request.getStatut());
        absence = absenceRepository.save(absence);
        return mapToResponse(absence);
    }

    @Transactional
    public void delete(Long id) {
        absenceRepository.deleteById(id);
    }

    private AbsenceResponse mapToResponse(Absence absence) {
        return new AbsenceResponse(
                absence.getId(),
                absence.getAgent().getId(),
                absence.getAgent().getNom(),
                absence.getAgent().getPrenom(),
                absence.getDateDebut(),
                absence.getDateFin(),
                absence.getMotif(),
                absence.getJustification(),
                absence.getStatut()
        );
    }
}