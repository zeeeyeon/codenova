package kr.codenova.backend.single.controller;

import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.service.SingleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kr.codenova.backend.global.response.ResponseCode.GET_LANGUAGE_CATEGORIES_SUCCESS;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/single")
public class SingleController {

    private final SingleService singleService;

    @GetMapping("/languages")
    public ResponseEntity<?> getLanguageCategories() {
        LanguageCategory categories = singleService.getLanguageCategories();
        return new ResponseEntity<>(Response.create(GET_LANGUAGE_CATEGORIES_SUCCESS, categories), GET_LANGUAGE_CATEGORIES_SUCCESS.getHttpStatus());
    }
}
