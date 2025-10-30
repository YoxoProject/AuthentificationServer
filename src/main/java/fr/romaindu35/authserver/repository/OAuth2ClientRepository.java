package fr.romaindu35.authserver.repository;

import fr.romaindu35.authserver.entity.OAuth2Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OAuth2ClientRepository extends JpaRepository<OAuth2Client, String> {
    OAuth2Client findByClientId(String clientId);
    List<OAuth2Client> findAllByOwnerId(java.util.UUID ownerId);
}