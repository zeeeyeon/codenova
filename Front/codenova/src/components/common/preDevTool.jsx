/**
 * - 개발자 도구를 완전히 막는건 불가능해서 불편하게라도 만들려면 쓰자
 * - 단축키 랑 우클릭 차단 코드 window and mac
 */
export const preventDevTool = () => {

    document.addEventListener("keydown", (e) => { 
        const key = e.key.toLowerCase()

        if (
            e.key === "F12" ||
            ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'i') || //ctrl + shift + i 개발자도구
            ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'c') || //ctrl + shift + c 서식 복사사
            ((e.ctrlKey || e.metaKey) && key === "u") ||               //ctrl + u 소스코드 보기
            ((e.ctrlKey || e.metaKey) && key === "s")                  //ctrl + s 파일저장
        ) {
            e.preventDefault();
        }
    })

    // 마우스 우클릭 차단
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
}