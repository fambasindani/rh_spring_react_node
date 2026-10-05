package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.MissionRequest;
import grad.microservice_auth.dto.MissionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.MissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
// MissionController.java
@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PostMapping
    public ResponseEntity<MissionResponse> create(@Valid @RequestBody MissionRequest request) {
        return new ResponseEntity<>(missionService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<MissionResponse>> getAll() {
        return ResponseEntity.ok(missionService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<MissionResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<MissionResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = missionService.searchMissions(keyword, page, size);
        } else {
            response = missionService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MissionResponse> update(@PathVariable Long id, @Valid @RequestBody MissionRequest request) {
        return ResponseEntity.ok(missionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        missionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}