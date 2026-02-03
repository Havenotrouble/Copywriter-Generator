package com.copywriter.generator.service;

import com.copywriter.generator.config.PlatformConfig;
import org.springframework.stereotype.Service;

/**
 * Service for handling platform-specific prompt generation
 */
@Service
public class PlatformService {

    /**
     * Get platform configuration by platform name
     *
     * @param platformName The name of the platform (e.g., "AMAZON", "TIKTOK_SHOP")
     * @return PlatformConfig for the specified platform
     * @throws IllegalArgumentException if platform name is invalid
     */
    public PlatformConfig getPlatformConfig(String platformName) {
        try {
            return PlatformConfig.valueOf(platformName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid platform name: " + platformName +
                    ". Valid platforms are: " + getValidPlatforms());
        }
    }

    /**
     * Build the complete system prompt for a specific platform
     *
     * @param platformName The name of the platform
     * @param originalContent The original product description
     * @param targetLanguage The target language for translation
     * @return Complete system prompt ready for AI processing
     */
    public String buildSystemPrompt(String platformName, String originalContent, String targetLanguage) {
        PlatformConfig config = getPlatformConfig(platformName);
        return config.buildPrompt(originalContent, targetLanguage);
    }

    /**
     * Get a comma-separated string of all valid platform names
     */
    private String getValidPlatforms() {
        return String.join(", ",
                java.util.Arrays.stream(PlatformConfig.values())
                        .map(Enum::name)
                        .toArray(String[]::new)
        );
    }

    /**
     * Validate if a platform name is valid
     *
     * @param platformName The platform name to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidPlatform(String platformName) {
        try {
            PlatformConfig.valueOf(platformName.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
