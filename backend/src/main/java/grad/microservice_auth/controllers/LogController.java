package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.LogResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Log;
import grad.microservice_auth.services.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping
    public ResponseEntity<PageResponse<LogResponse>> getLogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Log> logPage = logService.getLogs(keyword, pageable);
        Page<LogResponse> response = logPage.map(this::toResponse);
        return ResponseEntity.ok(new PageResponse<>(
                response.getContent(),
                response.getNumber(),
                response.getSize(),
                response.getTotalElements(),
                response.getTotalPages(),
                response.isLast()));
    }

    private LogResponse toResponse(Log log) {
        return new LogResponse(
                log.getId(),
                log.getUser() != null ? log.getUser().getId() : null,
                log.getUser() != null ? log.getUser().getUsername() : "Système",
                log.getAction(),
                log.getDescription(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getCreatedAt()
        );
    }
}