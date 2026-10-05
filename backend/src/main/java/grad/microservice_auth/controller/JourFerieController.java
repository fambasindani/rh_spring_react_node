package grad.microservice_auth.controller;

import grad.microservice_auth.entities.JourFerie;
import grad.microservice_auth.services.JourFerieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jours-feries")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JourFerieController {

    private final JourFerieService jourFerieService;

    @GetMapping
    public ResponseEntity<List<JourFerie>> listerTous() {
        return ResponseEntity.ok(jourFerieService.listerTous());
    }

    @PostMapping
    public ResponseEntity<JourFerie> creer(@RequestBody JourFerie jourFerie) {
        return ResponseEntity.ok(jourFerieService.creer(jourFerie));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JourFerie> modifier(@PathVariable Long id, @RequestBody JourFerie jourFerie) {
        return ResponseEntity.ok(jourFerieService.modifier(id, jourFerie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        jourFerieService.supprimer(id);
        return ResponseEntity.ok().build();
    }
}
