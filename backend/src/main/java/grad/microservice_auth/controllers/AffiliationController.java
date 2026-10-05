package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.services.AffiliationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affiliations")
@RequiredArgsConstructor
public class AffiliationController {

    private final AffiliationService affiliationService;

    @PostMapping
    public ResponseEntity<AffiliationResponse> createAffiliation(@Valid @RequestBody AffiliationRequest request) {
        return new ResponseEntity<>(affiliationService.createAffiliation(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AffiliationResponse>> getAllAffiliations() {
        return ResponseEntity.ok(affiliationService.getAllAffiliations());
    }

    @GetMapping
    public ResponseEntity<PageResponse<AffiliationResponse>> getAllAffiliationsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(affiliationService.getAllAffiliationsPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AffiliationResponse> getAffiliationById(@PathVariable Long id) {
        return ResponseEntity.ok(affiliationService.getAffiliationById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AffiliationResponse> updateAffiliation(@PathVariable Long id, @Valid @RequestBody AffiliationRequest request) {
        return ResponseEntity.ok(affiliationService.updateAffiliation(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteAffiliation(@PathVariable Long id) {
        String message = affiliationService.deleteAffiliation(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    // Recherche
    @PostMapping("/search")
    public ResponseEntity<PageResponse<AffiliationResponse>> searchAffiliations(@RequestBody SearchAffiliationRequest request) {
        return ResponseEntity.ok(affiliationService.searchAffiliations(
                request.getKeyword(),
                request.getAgentId(),
                request.getEtat(),
                request.getPage(),
                request.getSize()
        ));
    }
}