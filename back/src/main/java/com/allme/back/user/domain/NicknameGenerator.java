package com.allme.back.user.domain;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Component;

/**
 * 랜덤 3단어 닉네임 생성기 — "상태 수식어 + 성격 수식어 + 동물" (예: "멀미하는 귀여운 고양이").
 * 40 × 40 × 40 = 64,000 조합. 유니크 보장은 NicknameService가 담당하고 여기선 순수 생성만 한다.
 * 단어는 전부 무해하고 귀여운 톤만 — 조합 시 부정적 뉘앙스가 되는 단어(뚱뚱한·게으른 등)는 넣지 않는다.
 * 최장 조합이 nickname 컬럼 length(30) 안에 들어오도록 단어는 6자 이하로 유지한다.
 */
@Component
public class NicknameGenerator {

    private static final List<String> STATES = List.of(
        "멀미하는", "낮잠자는", "배부른", "콧노래하는", "산책하는", "기지개켜는", "두리번대는", "소풍가는",
        "헤엄치는", "함박웃는", "졸린", "신난", "춤추는", "노래하는", "뒹구는", "달리는",
        "폴짝뛰는", "하품하는", "목욕하는", "요리하는", "책읽는", "여행하는", "별보는", "꿈꾸는",
        "바람쐬는", "딸기먹는", "김밥마는", "빵굽는", "코고는", "재채기하는", "윙크하는", "손흔드는",
        "이불덮은", "우산쓴", "모자쓴", "양치하는", "세수하는", "줄넘기하는", "낙엽밟는", "눈감은"
    );

    private static final List<String> TRAITS = List.of(
        "귀여운", "씩씩한", "다정한", "엉뚱한", "순한", "명랑한", "늠름한", "수줍은",
        "야무진", "포근한", "상냥한", "활발한", "용감한", "차분한", "똑똑한", "재빠른",
        "느긋한", "진지한", "유쾌한", "든든한", "순수한", "발랄한", "온화한", "총명한",
        "정직한", "부지런한", "사려깊은", "당찬", "어여쁜", "해맑은", "슬기로운", "정다운",
        "기특한", "반짝이는", "싱그러운", "향기로운", "보드라운", "단정한", "소탈한", "따뜻한"
    );

    private static final List<String> ANIMALS = List.of(
        "고양이", "강아지", "수달", "펭귄", "알파카", "고슴도치", "물범", "카피바라",
        "다람쥐", "두더지", "토끼", "판다", "코알라", "사막여우", "북극곰", "미어캣",
        "오리", "거북이", "문어", "해파리", "돌고래", "앵무새", "부엉이", "참새",
        "제비", "고래", "여우", "너구리", "오소리", "담비", "순록", "양",
        "염소", "송아지", "망아지", "병아리", "아기곰", "물개", "꿀벌", "달팽이"
    );

    public String generate() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        return pick(STATES, random) + " " + pick(TRAITS, random) + " " + pick(ANIMALS, random);
    }

    private String pick(List<String> words, ThreadLocalRandom random) {
        return words.get(random.nextInt(words.size()));
    }

}
