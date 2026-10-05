// PrimeService.java (complet)
package grad.microservice_auth.services;

import grad.microservice_auth.dto.PrimeRequest;
import grad.microservice_auth.dto.PrimeResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Prime;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.PrimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrimeService {

    private final PrimeRepository primeRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public PrimeResponse create(PrimeRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        Prime prime = new Prime();
        prime.setAgent(agent);
        prime.setLibelle(request.getLibelle());
        prime.setMontant(request.getMontant());
        prime.setDatePrime(request.getDatePrime());
        prime = primeRepository.save(prime);
        return mapToResponse(prime);
    }

    public List<PrimeResponse> getAll() {
        return primeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<PrimeResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Prime> primePage = primeRepository.findAll(pageable);
        List<PrimeResponse> content = primePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                primePage.getNumber(),
                primePage.getSize(),
                primePage.getTotalElements(),
                primePage.getTotalPages(),
                primePage.isLast()
        );
    }

    public PageResponse<PrimeResponse> searchPrimes(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Prime> primePage = primeRepository.searchByAgentName(keyword, pageable);
        List<PrimeResponse> content = primePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                primePage.getNumber(),
                primePage.getSize(),
                primePage.getTotalElements(),
                primePage.getTotalPages(),
                primePage.isLast()
        );
    }

    public PrimeResponse getById(Long id) {
        Prime prime = primeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prime non trouvée"));
        return mapToResponse(prime);
    }

    @Transactional
    public PrimeResponse update(Long id, PrimeRequest request) {
        Prime prime = primeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prime non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        prime.setAgent(agent);
        prime.setLibelle(request.getLibelle());
        prime.setMontant(request.getMontant());
        prime.setDatePrime(request.getDatePrime());
        prime = primeRepository.save(prime);
        return mapToResponse(prime);
    }

    @Transactional
    public void delete(Long id) {
        primeRepository.deleteById(id);
    }

    private PrimeResponse mapToResponse(Prime prime) {
        return new PrimeResponse(
                prime.getId(),
                prime.getAgent().getId(),
                prime.getAgent().getNom(),
                prime.getAgent().getPrenom(),
                prime.getLibelle(),
                prime.getMontant(),
                prime.getDatePrime()
        );
    }
}