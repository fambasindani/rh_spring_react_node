package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.services.DirectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directions")
@RequiredArgsConstructor
public class DirectionController {

    private final DirectionService directionService;

    @PostMapping
    public ResponseEntity<DirectionResponse> createDirection(@Valid @RequestBody DirectionRequest request) {
        DirectionResponse response = directionService.createDirection(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DirectionResponse> updateDirection(
            @PathVariable Long id,
            @Valid @RequestBody DirectionRequest request) {
        DirectionResponse response = directionService.updateDirection(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDirection(@PathVariable Long id) {
        directionService.deleteDirection(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DirectionResponse> getDirectionById(@PathVariable Long id) {
        DirectionResponse response = directionService.getDirectionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<DirectionResponse>> getAll() {
        return ResponseEntity.ok(directionService.getAllDirections());
    }

    @PostMapping("/search")
    public ResponseEntity<PageResponse<DirectionResponse>> searchDirections(@RequestBody SearchRequest request) {
        return ResponseEntity.ok(directionService.searchDirections(
                request.getKeyword(),
                request.getPage(),
                request.getSize()
        ));
    }

    @GetMapping
    public ResponseEntity<PageResponse<DirectionResponse>> getAllDirections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(directionService.getAllDirectionPages(page, size));
    }

    @GetMapping("/pages")
    public ResponseEntity<PageResponse<DirectionResponse>> getAllDirectionPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(directionService.getAllDirectionPages(page, size));
    }
}