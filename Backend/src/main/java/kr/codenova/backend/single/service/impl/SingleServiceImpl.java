package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.service.SingleService;
import org.springframework.stereotype.Service;

@Service
public class SingleServiceImpl implements SingleService {

    @Override
    public LanguageCategory getLanguageCategories() {
        return LanguageCategory.withAllCategories();
    }
}
