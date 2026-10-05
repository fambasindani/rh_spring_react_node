// MissionService.java (complet)
package grad.microservice_auth.services;

import grad.microservice_auth.dto.MissionRequest;
import grad.microservice_auth.dto.MissionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Mission;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.MissionRepository;
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
public class MissionService {

    private final MissionRepository missionRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public MissionResponse create(MissionRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Mission mission = new Mission();
        mission.setAgent(agent);
        mission.setLieu(request.getLieu());
        mission.setMotif(request.getMotif());
        mission.setDateDepart(request.getDateDepart());
        mission.setDateRetour(request.getDateRetour());
        mission.setReference(request.getReference());
        mission = missionRepository.save(mission);
        return mapToResponse(mission);
    }

    public List<MissionResponse> getAll() {
        return missionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<MissionResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Mission> missionPage = missionRepository.findAll(pageable);
        List<MissionResponse> content = missionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                missionPage.getNumber(),
                missionPage.getSize(),
                missionPage.getTotalElements(),
                missionPage.getTotalPages(),
                missionPage.isLast()
        );
    }

    public PageResponse<MissionResponse> searchMissions(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Mission> missionPage = missionRepository.searchByAgentName(keyword, pageable);
        List<MissionResponse> content = missionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                missionPage.getNumber(),
                missionPage.getSize(),
                missionPage.getTotalElements(),
                missionPage.getTotalPages(),
                missionPage.isLast()
        );
    }

    public MissionResponse getById(Long id) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        return mapToResponse(mission);
    }

    @Transactional
    public MissionResponse update(Long id, MissionRequest request) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        mission.setAgent(agent);
        mission.setLieu(request.getLieu());
        mission.setMotif(request.getMotif());
        mission.setDateDepart(request.getDateDepart());
        mission.setDateRetour(request.getDateRetour());
        mission.setReference(request.getReference());
        mission = missionRepository.save(mission);
        return mapToResponse(mission);
    }

    @Transactional
    public void delete(Long id) {
        missionRepository.deleteById(id);
    }

    private MissionResponse mapToResponse(Mission mission) {
        return new MissionResponse(
                mission.getId(),
                mission.getAgent().getId(),
                mission.getAgent().getNom(),
                mission.getAgent().getPrenom(),
                mission.getLieu(),
                mission.getMotif(),
                mission.getDateDepart(),
                mission.getDateRetour(),
                mission.getReference()
        );
    }
}