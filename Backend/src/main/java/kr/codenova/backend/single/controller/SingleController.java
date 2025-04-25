package kr.codenova.backend.single.controller;

import kr.codenova.backend.common.enums.CsCategory;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.service.SingleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static kr.codenova.backend.global.response.ResponseCode.GET_CS_CATEGORIES_SUCCESS;
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

    @GetMapping("/cs/categories")
    public ResponseEntity<?> getCsCategories() {
        List<String> categories = CsCategory.toCsList();
        return new ResponseEntity<>(Response.create(GET_CS_CATEGORIES_SUCCESS, categories), GET_CS_CATEGORIES_SUCCESS.getHttpStatus());
    }

}
