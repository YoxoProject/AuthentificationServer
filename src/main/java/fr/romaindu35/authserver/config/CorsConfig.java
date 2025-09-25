package fr.romaindu35.authserver.config;

import fr.romaindu35.authserver.service.CorsRequestAnalyzer;
import fr.romaindu35.authserver.service.CorsService;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@AllArgsConstructor
public class CorsConfig {

    private final CorsService corsService;
    private final CorsRequestAnalyzer corsRequestAnalyzer;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return new DynamicCorsConfigurationSource(corsService, corsRequestAnalyzer);
    }
}