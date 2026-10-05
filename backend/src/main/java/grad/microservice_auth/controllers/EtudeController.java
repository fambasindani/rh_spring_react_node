package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.EtudeRequest;
import grad.microservice_auth.dto.EtudeResponse;
import grad.microservice_auth.dto.MessageResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.EtudeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etudes")
@RequiredArgsConstructor
public class EtudeController {

    private final EtudeService etudeService;

    @PostMapping
    public ResponseEntity<EtudeResponse> createEtude(@Valid @RequestBody EtudeRequest request) {
        return new ResponseEntity<>(etudeService.createEtude(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<EtudeResponse>> getAllEtudes() {
        return ResponseEntity.ok(etudeService.getAllEtudes());
    }

    @GetMapping
    public ResponseEntity<PageResponse<EtudeResponse>> getAllEtudesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(etudeService.getAllEtudesPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EtudeResponse> getEtudeById(@PathVariable Long id) {
        return ResponseEntity.ok(etudeService.getEtudeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EtudeResponse> updateEtude(@PathVariable Long id, @Valid @RequestBody EtudeRequest request) {
        return ResponseEntity.ok(etudeService.updateEtude(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteEtude(@PathVariable Long id) {
        String message = etudeService.deleteEtude(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }
}