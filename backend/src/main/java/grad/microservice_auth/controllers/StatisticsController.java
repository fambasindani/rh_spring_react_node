package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.DashboardStatistics;
import grad.microservice_auth.services.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatistics> getDashboardStatistics() {
        return ResponseEntity.ok(statisticsService.getDashboardStatistics());
    }
}