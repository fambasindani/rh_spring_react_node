package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.NotificationRequest;
import grad.microservice_auth.dto.NotificationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationRequest request) {
        return new ResponseEntity<>(notificationService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<NotificationResponse>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PageResponse<NotificationResponse> response;
        if (keyword != null && !keyword.isBlank()) {
            response = notificationService.searchNotifications(keyword, page, size);
        } else {
            response = notificationService.getAllPaginated(page, size);
        }
        return ResponseEntity.ok(response);
    }

    // Nouvel endpoint : récupérer les notifications d'un agent spécifique (pour "Mes notifications")
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<NotificationResponse>> getByAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(notificationService.getByAgent(agentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationResponse> update(@PathVariable Long id, @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}