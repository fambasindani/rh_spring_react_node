package grad.microservice_auth.services;

import grad.microservice_auth.Enum.StatutContrat;
import grad.microservice_auth.Enum.TypeContrat;
import grad.microservice_auth.dto.ContratRequest;
import grad.microservice_auth.dto.ContratResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Contrat;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.ContratRepository;
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
public class ContratService {

    private final ContratRepository contratRepository;
    private final AgentRepository agentRepository;

    @PreAuthorize("hasAuthority('MANAGE_CONTRATS') or hasAuthority('ADMIN') or hasAuthority('RH')")
    @Transactional
    public ContratResponse create(ContratRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Contrat contrat = new Contrat();
        contrat.setAgent(agent);
        contrat.setTypeContrat(TypeContrat.valueOf(request.getTypeContrat().toUpperCase()));
        contrat.setReference(request.getReference());
        contrat.setDateDebut(request.getDateDebut());
        contrat.setDateFin(request.getDateFin());
        contrat.setStatut(StatutContrat.valueOf(request.getStatut().toUpperCase()));
        contrat = contratRepository.save(contrat);
        return mapToResponse(contrat);
    }

    // Liste sans pagination (si besoin)
    public List<ContratResponse> getAll() {
        return contratRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Pagination simple
    public PageResponse<ContratResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Contrat> contratPage = contratRepository.findAll(pageable);
        List<ContratResponse> content = contratPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                contratPage.getNumber(),
                contratPage.getSize(),
                contratPage.getTotalElements(),
                contratPage.getTotalPages(),
                contratPage.isLast()
        );
    }

    // Recherche paginée
    public PageResponse<ContratResponse> searchContrats(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Contrat> contratPage = contratRepository.searchByKeyword(keyword, pageable);
        List<ContratResponse> content = contratPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                contratPage.getNumber(),
                contratPage.getSize(),
                contratPage.getTotalElements(),
                contratPage.getTotalPages(),
                contratPage.isLast()
        );
    }

    public ContratResponse getById(Long id) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));
        return mapToResponse(contrat);
    }

    @PreAuthorize("hasAuthority('MANAGE_CONTRATS') or hasAuthority('ADMIN') or hasAuthority('RH')")
    @Transactional
    public ContratResponse update(Long id, ContratRequest request) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        contrat.setAgent(agent);
        contrat.setTypeContrat(TypeContrat.valueOf(request.getTypeContrat().toUpperCase()));
        contrat.setReference(request.getReference());
        contrat.setDateDebut(request.getDateDebut());
        contrat.setDateFin(request.getDateFin());
        contrat.setStatut(StatutContrat.valueOf(request.getStatut().toUpperCase()));
        contrat = contratRepository.save(contrat);
        return mapToResponse(contrat);
    }

    @PreAuthorize("hasAuthority('MANAGE_CONTRATS') or hasAuthority('ADMIN')")
    @Transactional
    public void delete(Long id) {
        contratRepository.deleteById(id);
    }

    private ContratResponse mapToResponse(Contrat contrat) {
        return new ContratResponse(
                contrat.getId(),
                contrat.getAgent().getId(),
                contrat.getAgent().getNom(),
                contrat.getAgent().getPrenom(),
                contrat.getTypeContrat().name(),
                contrat.getReference(),
                contrat.getDateDebut(),
                contrat.getDateFin(),
                contrat.getStatut().name()
        );
    }
}