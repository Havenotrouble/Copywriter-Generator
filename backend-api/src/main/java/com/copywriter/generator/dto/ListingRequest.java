package com.copywriter.generator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for generating platform-specific listings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingRequest {

    /**
     * Original product description content
     */
    private String content;

    /**
     * List of target platforms (e.g., "AMAZON", "TIKTOK_SHOP", etc.)
     */
    private List<String> platforms;

    /**
     * Target language for the generated content (e.g., "English", "Chinese", "Spanish")
     */
    private String language;
}
