package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.AgentFormationRequest;
import grad.microservice_auth.dto.AgentFormationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.AgentFormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent-formations")
@RequiredArgsConstructor
public class AgentFormationController {

    private final AgentFormationService agentFormationService;

    @PostMapping
    public ResponseEntity<AgentFormationResponse> create(@Valid @RequestBody AgentFormationRequest request) {
        return new ResponseEntity<>(agentFormationService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AgentFormationResponse>> getAll() {
        return ResponseEntity.ok(agentFormationService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<AgentFormationResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(agentFormationService.searchByKeyword(keyword, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgentFormationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(agentFormationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgentFormationResponse> update(@PathVariable Long id, @Valid @RequestBody AgentFormationRequest request) {
        return ResponseEntity.ok(agentFormationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        agentFormationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}