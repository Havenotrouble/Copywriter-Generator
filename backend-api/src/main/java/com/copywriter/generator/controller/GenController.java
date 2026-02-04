package com.copywriter.generator.controller;

import com.copywriter.generator.dto.ListingRequest;
import com.copywriter.generator.service.ListingGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * Controller for handling listing generation requests
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GenController {

    private final ListingGeneratorService listingGeneratorService;

    /**
     * Generate platform-specific listings with AI streaming
     *
     * @param request ListingRequest containing content, platforms, and target language
     * @return Server-Sent Events stream of formatted chunks
     */
    @PostMapping(value = "/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> generateListings(@RequestBody ListingRequest request,
                                         org.springframework.http.server.reactive.ServerHttpResponse response) {
        log.info("Received generation request for platforms: {} in language: {}",
                request.getPlatforms(), request.getLanguage());

        // 设置响应头，禁用缓冲
        response.getHeaders().set("Cache-Control", "no-cache");
        response.getHeaders().set("X-Accel-Buffering", "no");

        // Validate request
        if (request.getContent() == null || request.getContent().isBlank()) {
            return Flux.just("data: {\"id\":\"error\",\"text\":\"Content cannot be empty\"}\n\n");
        }

        if (request.getPlatforms() == null || request.getPlatforms().isEmpty()) {
            return Flux.just("data: {\"id\":\"error\",\"text\":\"At least one platform must be specified\"}\n\n");
        }

        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            return Flux.just("data: {\"id\":\"error\",\"text\":\"Language must be specified\"}\n\n");
        }

        // Generate listings - Service 层已经格式化为 SSE 格式
        return listingGeneratorService.generateListings(
                request.getContent(),
                request.getPlatforms(),
                request.getLanguage()
        ).doOnNext(chunk -> {
            // 添加日志监控发送的数据
            log.debug("Sending SSE chunk: {}", chunk.substring(0, Math.min(100, chunk.length())));
        });
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
