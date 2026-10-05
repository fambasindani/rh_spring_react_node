package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.User;
import grad.microservice_auth.entities.UserRole;
import grad.microservice_auth.entities.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    // Récupérer tous les rôles d'un utilisateur
    List<UserRole> findByUserId(Long userId);
    void deleteByUser(User user);
    // Récupérer une association spécifique
    Optional<UserRole> findByUserIdAndRoleId(Long userId, Long roleId);

    // Supprimer un rôle d'un utilisateur
    @Modifying
    @Transactional
    @Query("DELETE FROM UserRole ur WHERE ur.user.id = :userId AND ur.role.id = :roleId")
    void deleteByUserIdAndRoleId(@Param("userId") Long userId, @Param("roleId") Long roleId);
}