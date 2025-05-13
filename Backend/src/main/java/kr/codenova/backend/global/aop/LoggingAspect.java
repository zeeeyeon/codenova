package kr.codenova.backend.global.aop;

import jakarta.servlet.http.HttpServletRequest;
import kr.codenova.backend.global.annotation.Loggable;
import kr.codenova.backend.global.util.ClientIpUtil;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class LoggingAspect {

    private final HttpServletRequest request;

    @Around("@annotation(loggable)")
    public Object logExecution(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {
        Object result = joinPoint.proceed();

        String clientIp = ClientIpUtil.getClientIp(request);

        CustomMemberDetails memberDetails = null;
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof CustomMemberDetails) {
                memberDetails = (CustomMemberDetails) arg;
                break;
            }
        }

        String userId = (memberDetails != null) ? memberDetails.getMember().getId() : "guest";
        String userType = (memberDetails != null) ? "회원" : "비회원";

        log.info("event={} userId={} userType={} ip={}",
                loggable.event(),
                userId,
                userType,
                clientIp);

        return result;
    }
}
