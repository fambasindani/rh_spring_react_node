package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Conge;
import grad.microservice_auth.entities.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;




@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Long> {
    // Ajoutez des méthodes de recherche si besoin (ex: findByAgentId, findByStatut, etc.)
}
