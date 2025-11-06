package fr.romaindu35.authserver.repository;

import fr.romaindu35.authserver.entity.OAuth2AuthorizationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for managing OAuth2 authorization history.
 * Provides methods to track, query, and manage authorization grants.
 */
@Repository
public interface OAuth2AuthorizationHistoryRepository extends JpaRepository<OAuth2AuthorizationHistory, UUID> {

    /**
     * Finds the currently active authorization for a specific user and client combination.
     * There should be at most one active authorization per user-client pair.
     *
     * @param userId the user's UUID
     * @param clientId the OAuth2 client ID
     * @return Optional containing the active authorization if found
     */
    Optional<OAuth2AuthorizationHistory> findByUserIdAndClientIdAndIsActiveTrue(UUID userId, UUID clientId);

    /**
     * Finds all authorization history entries for a specific user and client,
     * ordered by grant time (less recent first).
     * Includes both active and inactive/revoked authorizations.
     *
     * @param userId the user's UUID
     * @param clientId the OAuth2 client ID
     * @return List of authorization history entries, ordered by granted_at ASC
     */
    List<OAuth2AuthorizationHistory> findByUserIdAndClientIdOrderByGrantedAtAsc(UUID userId, UUID clientId);

    /**
     * Finds all active authorizations for a specific user.
     * Uses native SQL query for optimal performance.
     *
     * @param userId the user's UUID
     * @return List of active authorization history entries, ordered by granted_at DESC
     */
    @Query(value = "SELECT * FROM oauth2_authorization_history WHERE user_id = :userId AND is_active = true ORDER BY granted_at DESC", nativeQuery = true)
    List<OAuth2AuthorizationHistory> findActiveAuthorizationsByUserId(@Param("userId") UUID userId);

    /**
     * Finds the most recent inactive authorization for each client where the user has NO active authorization.
     * Uses a CTE to identify (user_id, client_id) pairs without any active authorization,
     * then retrieves the most recent inactive authorization for each such pair.
     *
     * Performance optimized: filters at database level instead of application level.
     *
     * @param userId the user's UUID
     * @return List of most recent inactive authorizations (one per client), ordered by revoked_at DESC
     */
    @Query(value = """
        WITH inactive_pairs AS (
            SELECT DISTINCT user_id, client_id
            FROM oauth2_authorization_history
            WHERE is_active = false

            EXCEPT

            SELECT DISTINCT user_id, client_id
            FROM oauth2_authorization_history
            WHERE is_active = true
        )
        SELECT DISTINCT ON (h.user_id, h.client_id) h.*
        FROM oauth2_authorization_history h, inactive_pairs ip
        WHERE h.user_id = ip.user_id
          AND h.client_id = ip.client_id
          AND h.user_id = :userId
        ORDER BY h.user_id, h.client_id, h.revoked_at DESC NULLS LAST
        """, nativeQuery = true)
    List<OAuth2AuthorizationHistory> findInactiveAuthorizationsWithoutActiveByUserId(@Param("userId") UUID userId);
}
