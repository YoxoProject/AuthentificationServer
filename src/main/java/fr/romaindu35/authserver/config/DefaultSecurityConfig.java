package fr.romaindu35.authserver.config;

import com.vaadin.flow.spring.security.VaadinWebSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class DefaultSecurityConfig extends VaadinWebSecurity {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    @Order(2)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers(HttpMethod.GET, "/auth/callback/nationsglory").permitAll();
                    authorize.requestMatchers(HttpMethod.GET, "/images/**").permitAll(); // Autorise l'accès aux images
                    authorize.requestMatchers(HttpMethod.GET, "/").authenticated();
                    authorize.requestMatchers(HttpMethod.GET,
                            "/android-chrome-192x192.png",
                            "/android-chrome-512x512.png",
                            "/apple-touch-icon.png",
                            "/favicon-32x32.png",
                            "/favicon-16x16.png",
                            "/site.webmanifest",
                            "/safari-pinned-tab.svg").permitAll();
                }
        );
        http.formLogin(
                form -> form.loginPage("/login").permitAll().defaultSuccessUrl("/", false)
        );
        return super.filterChain(http);
    }
}