package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.AffectationRequest;
import grad.microservice_auth.dto.AffectationResponse;
import grad.microservice_auth.dto.MessageResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.AffectationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@RequiredArgsConstructor
public class AffectationController {

    private final AffectationService affectationService;

    @PostMapping
    public ResponseEntity<AffectationResponse> createAffectation(@Valid @RequestBody AffectationRequest request) {
        return new ResponseEntity<>(affectationService.createAffectation(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AffectationResponse>> getAllAffectations() {
        return ResponseEntity.ok(affectationService.getAllAffectations());
    }

    @GetMapping
    public ResponseEntity<PageResponse<AffectationResponse>> getAllAffectationsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(affectationService.getAllAffectationsPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AffectationResponse> getAffectationById(@PathVariable Long id) {
        return ResponseEntity.ok(affectationService.getAffectationById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AffectationResponse> updateAffectation(@PathVariable Long id, @Valid @RequestBody AffectationRequest request) {
        return ResponseEntity.ok(affectationService.updateAffectation(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteAffectation(@PathVariable Long id) {
        String message = affectationService.deleteAffectation(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }
}