package kr.codenova.backend.meteor.service.impl;

import kr.codenova.backend.meteor.service.WordService;
import kr.codenova.backend.common.repository.CsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WordServceImpl implements WordService {
    private final CsRepository csRepository;

    @Override
    public List<String> getRandomWords(){
        return csRepository.findRandom50English();
    }

}
