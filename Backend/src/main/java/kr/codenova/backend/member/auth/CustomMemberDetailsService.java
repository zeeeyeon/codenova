package kr.codenova.backend.member.auth;

import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomMemberDetailsService implements UserDetailsService {

    private final MemberRepository userRepository;
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        log.debug("로그인 시도한 username: {}", id);

        Member member = userRepository.findByIdColumn(id)
                .orElseThrow(() ->
                        new UsernameNotFoundException("유저를 찾을 수 없습니다"));

        log.debug("로그인 성공한 user: {}", member.getId());

        return new CustomMemberDetails(member);
    }
}
