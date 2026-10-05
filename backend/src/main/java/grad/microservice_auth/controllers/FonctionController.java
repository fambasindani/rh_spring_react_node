package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.services.FonctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fonctions")
@RequiredArgsConstructor
public class FonctionController {

    private final FonctionService fonctionService;

    @PostMapping
    public ResponseEntity<FonctionResponse> createFonction(@Valid @RequestBody FonctionRequest request) {
        return new ResponseEntity<>(fonctionService.createFonction(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<FonctionResponse>> getAllFonctions() {
        return ResponseEntity.ok(fonctionService.getAllFonctions());
    }

    @GetMapping
    public ResponseEntity<PageResponse<FonctionResponse>> getAllFonctionsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(fonctionService.getAllFonctionsPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FonctionResponse> getFonctionById(@PathVariable Long id) {
        return ResponseEntity.ok(fonctionService.getFonctionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FonctionResponse> updateFonction(@PathVariable Long id, @Valid @RequestBody FonctionRequest request) {
        return ResponseEntity.ok(fonctionService.updateFonction(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFonction(@PathVariable Long id) {
        String message = fonctionService.deleteFonction(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    // Recherche (POST)
    @PostMapping("/search")
    public ResponseEntity<PageResponse<FonctionResponse>> searchFonctions(@RequestBody SearchRequest request) {
        return ResponseEntity.ok(fonctionService.searchFonctions(
                request.getKeyword(),
                request.getPage(),
                request.getSize()
        ));
    }
}