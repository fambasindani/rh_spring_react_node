package grad.microservice_auth.services;

import grad.microservice_auth.Enum.CarteStatut;
import grad.microservice_auth.dto.CarteRequest;
import grad.microservice_auth.dto.CarteResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Carte;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.CarteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarteService {

    private final CarteRepository carteRepository;
    private final AgentRepository agentRepository;

    private CarteResponse map(Carte c) {
        Agent a = c.getAgent();
        return new CarteResponse(
                c.getId(),
                a != null ? a.getId() : null,
                a != null ? a.getNom() : null,
                a != null ? a.getPostnom() : null,
                a != null ? a.getPrenom() : null,
                a != null ? a.getMatricule() : null,
                (a != null && a.getDirection() != null) ? a.getDirection().getNom() : null,
                c.getNumeroCarte(),
                c.getStatut() != null ? c.getStatut().name() : null,
                c.getDateDemande(),
                c.getDateReception(),
                c.getDateValidation(),
                c.getReferenceAccuse(),
                c.getDatePerte(),
                c.getMotifPerte(),
                c.getObservation()
        );
    }

    public PageResponse<CarteResponse> getAll(CarteStatut statut, String keyword, Long agentId, Long directionId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Carte> cartePage = carteRepository.search(agentId, directionId, statut, keyword, pageable);
        List<CarteResponse> content = cartePage.getContent().stream().map(this::map).collect(Collectors.toList());
        return new PageResponse<>(content, cartePage.getNumber(), cartePage.getSize(),
                cartePage.getTotalElements(), cartePage.getTotalPages(), cartePage.isLast());
    }

    // Id de l'agent correspondant a un email (utilisateur connecte)
    public Long agentIdParEmail(String email) {
        if (email == null) return null;
        return agentRepository.findByEmail(email).map(Agent::getId).orElse(null);
    }

    // Verifie que la carte appartient bien a l'agent (email)
    public boolean appartientA(Long carteId, String email) {
        if (email == null) return false;
        return carteRepository.findById(carteId)
                .map(c -> c.getAgent() != null && email.equalsIgnoreCase(c.getAgent().getEmail()))
                .orElse(false);
    }

    public List<CarteResponse> getAllList() {
        return carteRepository.findAll(Sort.by("id").descending()).stream().map(this::map).collect(Collectors.toList());
    }

    public CarteResponse getById(Long id) {
        return map(carteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carte introuvable avec l'id: " + id)));
    }

    public Map<String, Long> stats() {
        Map<String, Long> m = new LinkedHashMap<>();
        m.put("demandes", carteRepository.countByStatut(CarteStatut.DEMANDE));
        m.put("recues", carteRepository.countByStatut(CarteStatut.RECUE));
        m.put("validees", carteRepository.countByStatut(CarteStatut.VALIDEE));
        m.put("perdues", carteRepository.countByStatut(CarteStatut.PERDUE));
        m.put("total", carteRepository.count());
        return m;
    }

    @Transactional
    public CarteResponse create(CarteRequest request) {
        if (request.getIdAgent() == null) {
            throw new RuntimeException("L'agent est obligatoire");
        }
        // un seul dossier "actif" (DEMANDE/RECUE/VALIDEE) par agent
        if (carteRepository.existsByAgentIdAndStatutIn(request.getIdAgent(),
                Set.of(CarteStatut.DEMANDE, CarteStatut.RECUE, CarteStatut.VALIDEE))) {
            throw new RuntimeException("Cet agent a deja une carte (demande en cours ou deja detenteur)");
        }

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));

        Carte c = new Carte();
        c.setAgent(agent);
        c.setNumeroCarte(request.getNumeroCarte());
        c.setObservation(request.getObservation());
        c.setStatut(CarteStatut.DEMANDE);
        c.setDateDemande(LocalDate.now());
        return map(carteRepository.save(c));
    }

    @Transactional
    public CarteResponse update(Long id, CarteRequest request) {
        Carte c = carteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carte introuvable avec l'id: " + id));
        if (request.getNumeroCarte() != null) c.setNumeroCarte(request.getNumeroCarte());
        if (request.getReferenceAccuse() != null) c.setReferenceAccuse(request.getReferenceAccuse());
        if (request.getObservation() != null) c.setObservation(request.getObservation());
        return map(carteRepository.save(c));
    }

    // Reception de la carte + depot de l'accuse de reception -> en attente de validation RH
    @Transactional
    public CarteResponse reception(Long id, CarteRequest request) {
        Carte c = carteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carte introuvable avec l'id: " + id));
        c.setNumeroCarte(request.getNumeroCarte());
        c.setReferenceAccuse(request.getReferenceAccuse());
        if (request.getObservation() != null) c.setObservation(request.getObservation());
        c.setDateReception(LocalDate.now());
        c.setStatut(CarteStatut.RECUE);
        return map(carteRepository.save(c));
    }

    // Validation par les RH de l'accuse de reception
    @Transactional
    public CarteResponse valider(Long id) {
        Carte c = carteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carte introuvable avec l'id: " + id));
        c.setStatut(CarteStatut.VALIDEE);
        c.setDateValidation(LocalDate.now());
        return map(carteRepository.save(c));
    }

    // Signalement de perte
    @Transactional
    public CarteResponse signalerPerte(Long id, CarteRequest request) {
        Carte c = carteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carte introuvable avec l'id: " + id));
        c.setStatut(CarteStatut.PERDUE);
        c.setDatePerte(request.getDatePerte() != null ? request.getDatePerte() : LocalDate.now());
        c.setMotifPerte(request.getMotifPerte());
        if (request.getObservation() != null) c.setObservation(request.getObservation());
        return map(carteRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        if (!carteRepository.existsById(id)) {
            throw new RuntimeException("Carte introuvable avec l'id: " + id);
        }
        carteRepository.deleteById(id);
    }
}
