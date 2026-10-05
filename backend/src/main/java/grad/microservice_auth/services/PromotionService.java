package grad.microservice_auth.services;

import grad.microservice_auth.dto.PromotionRequest;
import grad.microservice_auth.dto.PromotionResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Promotion;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Grade;
import grad.microservice_auth.repositories.PromotionRepository;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final AgentRepository agentRepository;
    private final GradeRepository gradeRepository;

    public PromotionResponse createPromotion(PromotionRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));
        Grade grade = gradeRepository.findById(request.getIdGrade())
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + request.getIdGrade()));

        Promotion promotion = new Promotion();
        promotion.setAgent(agent);
        promotion.setGrade(grade);
        promotion.setDateDebut(request.getDateDebut());
        promotion.setDateFin(request.getDateFin());
        promotion.setReference(request.getReference());

        promotion = promotionRepository.save(promotion);
        return mapToResponse(promotion);
    }

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<PromotionResponse> getAllPromotionsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Promotion> promotionPage = promotionRepository.findAll(pageable);
        List<PromotionResponse> content = promotionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, promotionPage.getNumber(), promotionPage.getSize(),
                promotionPage.getTotalElements(), promotionPage.getTotalPages(), promotionPage.isLast());
    }

    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion introuvable avec l'id: " + id));
        return mapToResponse(promotion);
    }

    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion introuvable avec l'id: " + id));

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable avec l'id: " + request.getIdAgent()));
        Grade grade = gradeRepository.findById(request.getIdGrade())
                .orElseThrow(() -> new RuntimeException("Grade introuvable avec l'id: " + request.getIdGrade()));

        promotion.setAgent(agent);
        promotion.setGrade(grade);
        promotion.setDateDebut(request.getDateDebut());
        promotion.setDateFin(request.getDateFin());
        promotion.setReference(request.getReference());

        promotion = promotionRepository.save(promotion);
        return mapToResponse(promotion);
    }

    public String deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion introuvable avec l'id: " + id);
        }
        promotionRepository.deleteById(id);
        return "Promotion supprimée avec succès";
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getAgent().getId(),
                promotion.getAgent().getNom(),
                promotion.getAgent().getPostnom(),
                promotion.getAgent().getPrenom(),
                promotion.getGrade().getId(),
                promotion.getGrade().getSigle(),
                promotion.getGrade().getNom(),
                promotion.getDateDebut(),
                promotion.getDateFin(),
                promotion.getReference()
        );
    }
}