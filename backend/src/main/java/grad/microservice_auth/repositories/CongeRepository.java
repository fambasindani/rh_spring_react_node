package grad.microservice_auth.repositories;

import grad.microservice_auth.Enum.StatutConge;
import grad.microservice_auth.entities.Conge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CongeRepository extends JpaRepository<Conge, Long> {

    @Query("SELECT c FROM Conge c WHERE " +
            "LOWER(c.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Conge> findByAgentNomOrPrenomContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);
    Page<Conge> findByAgentId(Long agentId, Pageable pageable);

    long countByStatut(StatutConge statut);

    List<Conge> findTop5ByOrderByDateDemandeDesc();
}