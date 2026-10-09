package grad.microservice_auth.controllers;

import grad.microservice_auth.Enum.CarteStatut;
import grad.microservice_auth.dto.CarteRequest;
import grad.microservice_auth.dto.CarteResponse;
import grad.microservice_auth.dto.MessageResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.CarteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cartes")
@RequiredArgsConstructor
public class CarteController {

    private final CarteService carteService;

    private CarteStatut parseStatut(String statut) {
        if (statut == null || statut.isBlank() || statut.equalsIgnoreCase("all")) return null;
        try {
            return CarteStatut.valueOf(statut.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // ADMIN / RH / MANAGE_CARTES -> gestion complete ; sinon (AGENT) -> ses propres cartes
    private boolean peutGerer(UserDetails ud) {
        if (ud == null) return false;
        return ud.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ADMIN")
                || a.getAuthority().equals("RH")
                || a.getAuthority().equals("MANAGE_CARTES"));
    }

    @GetMapping
    public ResponseEntity<PageResponse<CarteResponse>> getAll(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long directionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long onlyAgent = peutGerer(userDetails) ? null : carteService.agentIdParEmail(userDetails.getUsername());
        return ResponseEntity.ok(carteService.getAll(parseStatut(statut), keyword, onlyAgent, directionId, page, size));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CarteResponse>> getAllList() {
        return ResponseEntity.ok(carteService.getAllList());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(carteService.stats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(carteService.getById(id));
    }

    // Demande de carte : l'agent cree pour lui-meme, RH/ADMIN pour n'importe qui
    @PostMapping
    public ResponseEntity<CarteResponse> create(@RequestBody CarteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!peutGerer(userDetails)) {
            Long myId = carteService.agentIdParEmail(userDetails.getUsername());
            if (myId == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            request.setIdAgent(myId);
        }
        return new ResponseEntity<>(carteService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarteResponse> update(@PathVariable Long id, @RequestBody CarteRequest request) {
        return ResponseEntity.ok(carteService.update(id, request));
    }

    // Reception de la carte + accuse de reception (RH/ADMIN)
    @PostMapping("/{id}/reception")
    public ResponseEntity<CarteResponse> reception(@PathVariable Long id, @RequestBody CarteRequest request) {
        return ResponseEntity.ok(carteService.reception(id, request));
    }

    // Validation de l'accuse de reception par les RH
    @PostMapping("/{id}/valider")
    public ResponseEntity<CarteResponse> valider(@PathVariable Long id) {
        return ResponseEntity.ok(carteService.valider(id));
    }

    // Signalement de perte : l'agent peut signaler la perte de SA carte
    @PostMapping("/{id}/perte")
    public ResponseEntity<CarteResponse> perte(@PathVariable Long id, @RequestBody CarteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!peutGerer(userDetails) && !carteService.appartientA(id, userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(carteService.signalerPerte(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        carteService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Carte supprimee"));
    }
}
