package com.copywriter.generator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for generating platform-specific listings using AI streaming
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ListingGeneratorService {

    private final ChatClient.Builder chatClientBuilder;
    private final PlatformService platformService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate listings for multiple platforms concurrently using streaming
     *
     * @param content Original product description
     * @param platforms List of target platforms
     * @param language Target language
     * @return Flux of JSON-formatted streaming data: {"id": "platform_id", "text": "chunk_content"}
     */
    public Flux<String> generateListings(String content, List<String> platforms, String language) {
        log.info("Starting generation for {} platforms in language: {}", platforms.size(), language);

        return Flux.fromIterable(platforms)
                .flatMap(platform -> generateSinglePlatformListing(platform, content, language))
                .doOnComplete(() -> log.info("Completed generation for all platforms"))
                .doOnError(error -> log.error("Error during generation: {}", error.getMessage()));
    }

    /**
     * Generate listing for a single platform with streaming
     *
     * @param platformName Platform identifier
     * @param content Original content
     * @param language Target language
     * @return Flux of JSON-formatted chunks
     */
    private Flux<String> generateSinglePlatformListing(String platformName, String content, String language) {
        log.info("Generating listing for platform: {}", platformName);

        try {
            // Build the platform-specific prompt
            String systemPrompt = platformService.buildSystemPrompt(platformName, content, language);

            // Create ChatClient instance
            ChatClient chatClient = chatClientBuilder.build();

            // Send streaming request to AI
            return chatClient.prompt()
                    .user(systemPrompt)
                    .stream()
                    .content()
                    .doOnNext(chunk -> {
                        // 添加日志，监控每个 chunk
                        log.debug("Platform {}: received chunk: {}", platformName, chunk.substring(0, Math.min(50, chunk.length())));
                    })
                    .map(chunk -> wrapChunkAsJson(platformName, chunk))
                    .doOnSubscribe(subscription ->
                        log.info("Started streaming for platform: {}", platformName))
                    .doOnComplete(() ->
                        log.info("Completed streaming for platform: {}", platformName))
                    .onErrorResume(error -> {
                        log.error("Error generating for platform {}: {}", platformName, error.getMessage());
                        return Flux.just(wrapChunkAsJson(platformName,
                                "[Error] Failed to generate content for " + platformName));
                    });

        } catch (Exception e) {
            log.error("Error building prompt for platform {}: {}", platformName, e.getMessage());
            return Flux.just(wrapChunkAsJson(platformName,
                    "[Error] Invalid platform or configuration: " + platformName));
        }
    }

    /**
     * Wrap a text chunk as JSON string
     * Spring's TEXT_EVENT_STREAM_VALUE will automatically add "data: " prefix
     *
     * @param platformId Platform identifier
     * @param text Text chunk content
     * @return JSON string (Spring will wrap in SSE format)
     */
    private String wrapChunkAsJson(String platformId, String text) {
        try {
            Map<String, String> data = new HashMap<>();
            data.put("id", platformId);
            data.put("text", text);

            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error wrapping chunk as JSON: {}", e.getMessage());
            return "{\"id\":\"" + platformId + "\",\"text\":\"[Error encoding chunk]\"}";
        }
    }
}
