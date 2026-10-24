package com.payTrackEdu.application.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final String storageRoot;
    private final String publicBaseUrl;

    public WebMvcConfig(@Value("${app.storage.root}") String storageRoot,
                        @Value("${app.storage.public-base-url:/media}") String publicBaseUrl) {
        this.storageRoot = storageRoot;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String prefix = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;

        String location = Path.of(storageRoot).toAbsolutePath().normalize().toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler(prefix + "/**")
                .addResourceLocations(location);
    }
}
