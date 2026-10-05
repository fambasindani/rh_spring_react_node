package grad.microservice_auth.controller;

import grad.microservice_auth.dto.PointageRequest;
import grad.microservice_auth.dto.PointageResponse;
import grad.microservice_auth.entities.Pointage;
import grad.microservice_auth.services.PointageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pointages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PointageController {

    private final PointageService pointageService;

    @PostMapping
    public ResponseEntity<PointageResponse> effectuerPointage(
            @RequestBody PointageRequest request,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(pointageService.effectuerPointage(request, ip));
    }

    @GetMapping("/historique/{agentId}")
    public ResponseEntity<List<PointageResponse>> historique(
            @PathVariable Long agentId,
            @RequestParam String debut,
            @RequestParam String fin) {
        LocalDate debutDate = LocalDate.parse(debut);
        LocalDate finDate = LocalDate.parse(fin);
        return ResponseEntity.ok(pointageService.historique(agentId, debutDate, finDate));
    }

    @GetMapping("/historique-brut/{agentId}")
    public ResponseEntity<List<Pointage>> historiqueBrut(
            @PathVariable Long agentId,
            @RequestParam String debut,
            @RequestParam String fin) {
        LocalDate debutDate = LocalDate.parse(debut);
        LocalDate finDate = LocalDate.parse(fin);
        return ResponseEntity.ok(pointageService.historiqueBrut(agentId, debutDate, finDate));
    }

    @GetMapping("/presences-du-jour")
    public ResponseEntity<List<Map<String, Object>>> presencesDuJour(
            @RequestParam(required = false) String date) {
        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(pointageService.presencesDuJour(d));
    }

    @GetMapping("/absences-du-jour")
    public ResponseEntity<List<Map<String, Object>>> absencesDuJour(
            @RequestParam(required = false) String date) {
        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(pointageService.absencesDuJour(d));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PointageResponse>> tousLesPointages(
            @RequestParam(required = false) String date) {
        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<Map<String, Object>> presences = pointageService.presencesDuJour(d);
        List<PointageResponse> responses = new java.util.ArrayList<>();
        for (Map<String, Object> p : presences) {
            if (p.get("pointageArrivee") != null) {
                responses.add((PointageResponse) p.get("pointageArrivee"));
            }
            if (p.get("pointageDepart") != null) {
                responses.add((PointageResponse) p.get("pointageDepart"));
            }
        }
        return ResponseEntity.ok(responses);
    }
}
