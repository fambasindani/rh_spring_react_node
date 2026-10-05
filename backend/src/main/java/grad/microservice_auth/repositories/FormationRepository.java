package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Formation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    // Recherche par mot-clé (intitulé, organisme, lieu)
    @Query("SELECT f FROM Formation f WHERE " +
            "(:keyword IS NULL OR LOWER(f.intitule) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.organisme) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.lieu) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Formation> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}