package grad.microservice_auth.controller;

import grad.microservice_auth.entities.ZoneTravail;
import grad.microservice_auth.services.ZoneTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones-travail")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ZoneTravailController {

    private final ZoneTravailService zoneService;

    @GetMapping
    public ResponseEntity<List<ZoneTravail>> listerToutes() {
        return ResponseEntity.ok(zoneService.listerToutes());
    }

    @GetMapping("/actives")
    public ResponseEntity<List<ZoneTravail>> listerActives() {
        return ResponseEntity.ok(zoneService.listerZonesActives());
    }

    @PostMapping
    public ResponseEntity<ZoneTravail> creer(@RequestBody ZoneTravail zone) {
        return ResponseEntity.ok(zoneService.creer(zone));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZoneTravail> modifier(@PathVariable Long id, @RequestBody ZoneTravail zone) {
        return ResponseEntity.ok(zoneService.modifier(id, zone));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        zoneService.supprimer(id);
        return ResponseEntity.ok().build();
    }
}
