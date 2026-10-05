package grad.microservice_auth.services;

import grad.microservice_auth.dto.EtudeRequest;
import grad.microservice_auth.dto.EtudeResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Etude;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.EtudeRepository;
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
public class EtudeService {

    private final EtudeRepository etudeRepository;
    private final AgentRepository agentRepository;

    public EtudeResponse createEtude(EtudeRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));

        Etude etude = new Etude();
        etude.setAgent(agent);
        etude.setNombreAnnee(request.getNombreAnnee());
        etude.setLieu(request.getLieu());
        etude.setEtablissement(request.getEtablissement());

        etude = etudeRepository.save(etude);
        return mapToResponse(etude);
    }

    public List<EtudeResponse> getAllEtudes() {
        return etudeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<EtudeResponse> getAllEtudesPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Etude> etudePage = etudeRepository.findAll(pageable);
        List<EtudeResponse> content = etudePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, etudePage.getNumber(), etudePage.getSize(),
                etudePage.getTotalElements(), etudePage.getTotalPages(), etudePage.isLast());
    }

    public EtudeResponse getEtudeById(Long id) {
        Etude etude = etudeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Etude introuvable avec l'id: " + id));
        return mapToResponse(etude);
    }

    public EtudeResponse updateEtude(Long id, EtudeRequest request) {
        Etude etude = etudeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Etude introuvable avec l'id: " + id));

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));

        etude.setAgent(agent);
        etude.setNombreAnnee(request.getNombreAnnee());
        etude.setLieu(request.getLieu());
        etude.setEtablissement(request.getEtablissement());

        etude = etudeRepository.save(etude);
        return mapToResponse(etude);
    }

    public String deleteEtude(Long id) {
        if (!etudeRepository.existsById(id)) {
            throw new RuntimeException("Etude introuvable avec l'id: " + id);
        }
        etudeRepository.deleteById(id);
        return "Etude supprimée avec succès";
    }

    private EtudeResponse mapToResponse(Etude etude) {
        return new EtudeResponse(
                etude.getId(),
                etude.getAgent().getId(),
                etude.getAgent().getNom(),
                etude.getAgent().getPostnom(),
                etude.getAgent().getPrenom(),
                etude.getNombreAnnee(),
                etude.getLieu(),
                etude.getEtablissement()
        );
    }
}