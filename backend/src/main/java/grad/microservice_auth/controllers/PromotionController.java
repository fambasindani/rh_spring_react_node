package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.PromotionRequest;
import grad.microservice_auth.dto.PromotionResponse;
import grad.microservice_auth.dto.MessageResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.services.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return new ResponseEntity<>(promotionService.createPromotion(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping
    public ResponseEntity<PageResponse<PromotionResponse>> getAllPromotionsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(promotionService.getAllPromotionsPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponse> updatePromotion(@PathVariable Long id, @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deletePromotion(@PathVariable Long id) {
        String message = promotionService.deletePromotion(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }
}