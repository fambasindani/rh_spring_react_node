package grad.microservice_auth.services;

import grad.microservice_auth.Enum.TypeSanction;
import grad.microservice_auth.dto.SanctionRequest;
import grad.microservice_auth.dto.SanctionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Sanction;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.SanctionRepository;
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
public class SanctionService {

    private final SanctionRepository sanctionRepository;
    private final AgentRepository agentRepository;

    // Création
    @Transactional
    public SanctionResponse create(SanctionRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Sanction sanction = new Sanction();
        sanction.setAgent(agent);
        if (request.getTypeSanction() != null) {
            try {
                sanction.setTypeSanction(TypeSanction.valueOf(request.getTypeSanction().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Type de sanction invalide : " + request.getTypeSanction());
            }
        } else {
            throw new RuntimeException("Le type de sanction est obligatoire");
        }
        sanction.setMotif(request.getMotif());
        sanction.setDateSanction(request.getDateSanction());
        sanction.setReference(request.getReference());
        sanction = sanctionRepository.save(sanction);
        return mapToResponse(sanction);
    }

    // Récupération sans pagination (si nécessaire)
    public List<SanctionResponse> getAll() {
        return sanctionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Récupération paginée (sans filtre)
    public PageResponse<SanctionResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Sanction> sanctionPage = sanctionRepository.findAll(pageable);
        List<SanctionResponse> content = sanctionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                sanctionPage.getNumber(),
                sanctionPage.getSize(),
                sanctionPage.getTotalElements(),
                sanctionPage.getTotalPages(),
                sanctionPage.isLast()
        );
    }

    // Recherche par nom d'agent (paginée)
    public PageResponse<SanctionResponse> searchByAgentName(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Sanction> sanctionPage = sanctionRepository.findByAgentNomOrPrenomContainingIgnoreCase(keyword, pageable);
        List<SanctionResponse> content = sanctionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                sanctionPage.getNumber(),
                sanctionPage.getSize(),
                sanctionPage.getTotalElements(),
                sanctionPage.getTotalPages(),
                sanctionPage.isLast()
        );
    }

    public SanctionResponse getById(Long id) {
        Sanction sanction = sanctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sanction non trouvée"));
        return mapToResponse(sanction);
    }

    @Transactional
    public SanctionResponse update(Long id, SanctionRequest request) {
        Sanction sanction = sanctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sanction non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        sanction.setAgent(agent);
        if (request.getTypeSanction() != null) {
            try {
                sanction.setTypeSanction(TypeSanction.valueOf(request.getTypeSanction().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Type de sanction invalide : " + request.getTypeSanction());
            }
        }
        sanction.setMotif(request.getMotif());
        sanction.setDateSanction(request.getDateSanction());
        sanction.setReference(request.getReference());
        sanction = sanctionRepository.save(sanction);
        return mapToResponse(sanction);
    }

    @Transactional
    public void delete(Long id) {
        sanctionRepository.deleteById(id);
    }

    private SanctionResponse mapToResponse(Sanction sanction) {
        return new SanctionResponse(
                sanction.getId(),
                sanction.getAgent().getId(),
                sanction.getAgent().getNom(),
                sanction.getAgent().getPrenom(),
                sanction.getTypeSanction().name(),
                sanction.getMotif(),
                sanction.getDateSanction(),
                sanction.getReference()
        );
    }
}