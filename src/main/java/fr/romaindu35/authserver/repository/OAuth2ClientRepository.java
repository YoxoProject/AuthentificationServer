package fr.romaindu35.authserver.repository;

import fr.romaindu35.authserver.entity.OAuth2Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OAuth2ClientRepository extends JpaRepository<OAuth2Client, String> {
    OAuth2Client findByClientId(String clientId);
}