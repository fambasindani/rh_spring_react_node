package grad.microservice_auth.controller;

import grad.microservice_auth.entities.HoraireTravail;
import grad.microservice_auth.services.HoraireTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horaires-travail")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HoraireTravailController {

    private final HoraireTravailService horaireService;

    @GetMapping
    public ResponseEntity<List<HoraireTravail>> listerTous() {
        return ResponseEntity.ok(horaireService.listerTous());
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<HoraireTravail>> listerParAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(horaireService.listerParAgent(agentId));
    }

    @PostMapping
    public ResponseEntity<HoraireTravail> creer(@RequestBody HoraireTravail horaire) {
        return ResponseEntity.ok(horaireService.creer(horaire));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HoraireTravail> modifier(@PathVariable Long id, @RequestBody HoraireTravail horaire) {
        return ResponseEntity.ok(horaireService.modifier(id, horaire));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        horaireService.supprimer(id);
        return ResponseEntity.ok().build();
    }
}
