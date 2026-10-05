package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.RoleDroit;
import grad.microservice_auth.entities.RoleDroitId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RoleDroitRepository extends JpaRepository<RoleDroit, RoleDroitId> {
    List<RoleDroit> findByRoleId(Long roleId);
    List<RoleDroit> findByDroitId(Long droitId);
    boolean existsByRoleIdAndDroitId(Long roleId, Long droitId);

    @Modifying
    @Transactional
    void deleteByRoleId(Long roleId);

    @Modifying
    @Transactional
    void deleteByRoleIdAndDroitId(Long roleId, Long droitId);
}
