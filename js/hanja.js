/* 한자 작명 데이터베이스
 * - 각 한자: 한글음, 한자, 뜻, 오행(목/화/토/금/수), 음양, 성별 적합성, 분류
 * - 오행 분류는 한자의 부수·자원오행(字源五行)을 기준으로 일반화함
 * - 미혼·길자 위주로 추리고, 부정적·종교적·민감 의미는 제외
 *
 * gender:
 *   "공통" = 남녀 모두 / "여" = 여아 추천 / "남" = 남아 추천
 */

const HANJA_LIST = [
  // ========== 木 (목) — 봄·성장·인자함·창의 ==========
  { ko:"민",   han:"敏", meaning:"민첩하고 영민함",       el:"목", yy:"음", g:"공통" },
  { ko:"건",   han:"健", meaning:"굳세고 건강함",         el:"목", yy:"양", g:"남" },
  { ko:"재",   han:"才", meaning:"재능이 뛰어남",         el:"목", yy:"양", g:"공통" },
  { ko:"인",   han:"仁", meaning:"어질고 따뜻함",         el:"목", yy:"양", g:"공통" },
  { ko:"림",   han:"林", meaning:"수풀처럼 넉넉함",       el:"목", yy:"음", g:"공통" },
  { ko:"수",   han:"樹", meaning:"큰 나무처럼 자람",       el:"목", yy:"양", g:"남" },
  { ko:"송",   han:"松", meaning:"소나무처럼 굳건함",     el:"목", yy:"양", g:"남" },
  { ko:"채",   han:"采", meaning:"빛나고 가려 뽑힘",       el:"목", yy:"음", g:"여" },
  { ko:"주",   han:"柱", meaning:"기둥처럼 든든함",       el:"목", yy:"양", g:"남" },
  { ko:"가",   han:"嘉", meaning:"아름답고 경사로움",     el:"목", yy:"양", g:"공통" },
  { ko:"근",   han:"根", meaning:"뿌리 깊고 굳건함",       el:"목", yy:"양", g:"남" },
  { ko:"예",   han:"藝", meaning:"재예가 있고 단아함",     el:"목", yy:"음", g:"여" },
  { ko:"란",   han:"蘭", meaning:"난초처럼 그윽함",       el:"목", yy:"음", g:"여" },
  { ko:"화",   han:"和", meaning:"화목하고 평안함",       el:"목", yy:"음", g:"공통" },

  // ========== 火 (화) — 여름·열정·예의·밝음 ==========
  { ko:"태",   han:"泰", meaning:"크고 평안함",           el:"화", yy:"양", g:"공통" },
  { ko:"열",   han:"烈", meaning:"빛나고 굳셈",           el:"화", yy:"양", g:"남" },
  { ko:"은",   han:"恩", meaning:"은혜롭고 사랑받음",     el:"화", yy:"음", g:"공통" },
  { ko:"명",   han:"明", meaning:"밝고 총명함",           el:"화", yy:"양", g:"공통" },
  { ko:"하",   han:"夏", meaning:"여름처럼 활기참",       el:"화", yy:"양", g:"공통" },
  { ko:"단",   han:"丹", meaning:"붉고 정성스러움",       el:"화", yy:"양", g:"여" },
  { ko:"정",   han:"晶", meaning:"수정처럼 맑게 빛남",     el:"화", yy:"음", g:"공통" },
  { ko:"휘",   han:"輝", meaning:"환하게 빛남",           el:"화", yy:"양", g:"공통" },
  { ko:"람",   han:"嵐", meaning:"산기운처럼 영묘함",     el:"화", yy:"음", g:"여" },
  { ko:"연",   han:"延", meaning:"오래 이어지고 번영함",   el:"화", yy:"음", g:"공통" },
  { ko:"이",   han:"怡", meaning:"기쁘고 즐거움",         el:"화", yy:"음", g:"여" },
  { ko:"진",   han:"晉", meaning:"나아가 번성함",         el:"화", yy:"양", g:"공통" },
  { ko:"노",   han:"魯", meaning:"슬기롭고 너그러움",     el:"화", yy:"양", g:"남" },

  // ========== 土 (토) — 환절기·신의·중후함·안정 ==========
  { ko:"균",   han:"均", meaning:"고르고 평탄함",         el:"토", yy:"양", g:"공통" },
  { ko:"산",   han:"山", meaning:"산처럼 든든함",         el:"토", yy:"양", g:"남" },
  { ko:"기",   han:"基", meaning:"기초가 튼튼함",         el:"토", yy:"양", g:"남" },
  { ko:"성",   han:"城", meaning:"성처럼 굳건함",         el:"토", yy:"양", g:"남" },
  { ko:"우",   han:"宇", meaning:"드넓은 우주처럼",       el:"토", yy:"양", g:"공통" },
  { ko:"안",   han:"安", meaning:"평안하고 든든함",       el:"토", yy:"음", g:"공통" },
  { ko:"원",   han:"垣", meaning:"단단히 둘러싼 담장",     el:"토", yy:"양", g:"공통" },
  { ko:"유",   han:"裕", meaning:"넉넉하고 풍요로움",     el:"토", yy:"음", g:"공통" },
  { ko:"전",   han:"全", meaning:"온전하고 완전함",       el:"토", yy:"양", g:"공통" },
  { ko:"여",   han:"如", meaning:"마음과 같이 이루어짐",   el:"토", yy:"음", g:"여" },
  { ko:"아",   han:"雅", meaning:"우아하고 단정함",       el:"토", yy:"음", g:"여" },
  { ko:"율",   han:"律", meaning:"바르고 절도 있음",       el:"토", yy:"음", g:"공통" },

  // ========== 金 (금) — 가을·의리·결실·강직 ==========
  { ko:"은",   han:"銀", meaning:"은처럼 귀하고 빛남",     el:"금", yy:"음", g:"여" },
  { ko:"석",   han:"錫", meaning:"귀한 금속처럼 단단함",   el:"금", yy:"양", g:"남" },
  { ko:"진",   han:"鎭", meaning:"든든히 자리잡음",       el:"금", yy:"양", g:"남" },
  { ko:"성",   han:"成", meaning:"이루고 완성함",         el:"금", yy:"양", g:"공통" },
  { ko:"승",   han:"勝", meaning:"이기고 뛰어남",         el:"금", yy:"양", g:"남" },
  { ko:"의",   han:"義", meaning:"의롭고 곧음",           el:"금", yy:"음", g:"공통" },
  { ko:"규",   han:"圭", meaning:"옥홀처럼 귀함",         el:"금", yy:"양", g:"공통" },
  { ko:"신",   han:"信", meaning:"믿음직하고 정직함",     el:"금", yy:"음", g:"공통" },
  { ko:"수",   han:"秀", meaning:"빼어나고 우수함",       el:"금", yy:"양", g:"공통" },
  { ko:"서",   han:"瑞", meaning:"상서로운 기운",         el:"금", yy:"양", g:"공통" },
  { ko:"세",   han:"世", meaning:"세상에 두루 떨침",       el:"금", yy:"양", g:"공통" },
  { ko:"옥",   han:"玉", meaning:"옥처럼 맑고 귀함",       el:"금", yy:"음", g:"여" },
  { ko:"보",   han:"寶", meaning:"보배같이 귀함",         el:"금", yy:"음", g:"여" },

  // ========== 水 (수) — 겨울·지혜·유연·총명 ==========
  { ko:"해",   han:"海", meaning:"바다처럼 넓음",         el:"수", yy:"음", g:"공통" },
  { ko:"우",   han:"雨", meaning:"단비처럼 길하게",       el:"수", yy:"음", g:"공통" },
  { ko:"수",   han:"水", meaning:"맑은 물의 지혜",         el:"수", yy:"음", g:"공통" },
  { ko:"하",   han:"河", meaning:"강물처럼 풍부함",       el:"수", yy:"음", g:"공통" },
  { ko:"민",   han:"潤", meaning:"윤택하고 풍요로움",     el:"수", yy:"음", g:"공통" },
  { ko:"준",   han:"浚", meaning:"맑고 깊음",             el:"수", yy:"양", g:"남" },
  { ko:"호",   han:"浩", meaning:"넓고 큰 기운",           el:"수", yy:"양", g:"남" },
  { ko:"연",   han:"沇", meaning:"고요히 흐르는 물",       el:"수", yy:"음", g:"여" },
  { ko:"청",   han:"淸", meaning:"맑고 깨끗함",           el:"수", yy:"음", g:"공통" },
  { ko:"빈",   han:"濱", meaning:"넓은 물가, 너른 품",     el:"수", yy:"양", g:"공통" },
  { ko:"윤",   han:"潤", meaning:"빛나고 윤기 있음",       el:"수", yy:"음", g:"공통" },
  { ko:"지",   han:"智", meaning:"지혜롭고 총명함",       el:"수", yy:"음", g:"공통" },
  { ko:"유",   han:"流", meaning:"막힘없이 흐름",         el:"수", yy:"음", g:"공통" },
  { ko:"수",   han:"洙", meaning:"물가의 맑은 기운",       el:"수", yy:"양", g:"공통" },

  // ========== 자주 쓰이는 길자 (다양한 오행) ==========
  { ko:"서",   han:"舒", meaning:"펼쳐지고 편안함",       el:"금", yy:"음", g:"여" },
  { ko:"아",   han:"娥", meaning:"아름답고 우아함",       el:"토", yy:"음", g:"여" },
  { ko:"율",   han:"栗", meaning:"단단한 열매",           el:"목", yy:"음", g:"여" },
  { ko:"채",   han:"彩", meaning:"고운 빛깔",             el:"화", yy:"음", g:"여" },
  { ko:"하",   han:"霞", meaning:"노을빛 곱고 환함",       el:"수", yy:"음", g:"여" },
  { ko:"영",   han:"瑛", meaning:"옥의 광채",             el:"금", yy:"음", g:"여" },
  { ko:"별",   han:"瞥", meaning:"별처럼 반짝임",         el:"화", yy:"음", g:"여" },
  { ko:"아",   han:"亞", meaning:"두 번째, 견줄 만함",     el:"토", yy:"음", g:"공통" },
  { ko:"진",   han:"眞", meaning:"참되고 진실함",         el:"금", yy:"양", g:"공통" },
  { ko:"솔",   han:"率", meaning:"솔직하고 거짓 없음",     el:"금", yy:"양", g:"공통" },
  { ko:"림",   han:"琳", meaning:"옥처럼 맑음",           el:"금", yy:"음", g:"여" },
  { ko:"준",   han:"俊", meaning:"준수하고 뛰어남",       el:"화", yy:"양", g:"남" },
  { ko:"민",   han:"旼", meaning:"화락하고 따뜻함",       el:"화", yy:"음", g:"공통" },
  { ko:"은",   han:"殷", meaning:"성대하고 풍성함",       el:"토", yy:"음", g:"공통" },
  { ko:"태",   han:"太", meaning:"크고 한없이 넓음",       el:"화", yy:"양", g:"남" },
  { ko:"현",   han:"賢", meaning:"어질고 지혜로움",       el:"수", yy:"음", g:"공통" },
  { ko:"현",   han:"玹", meaning:"옥같이 빛남",           el:"금", yy:"음", g:"공통" },
  { ko:"재",   han:"宰", meaning:"다스리고 이끎",         el:"토", yy:"양", g:"남" },
  { ko:"우",   han:"佑", meaning:"하늘이 도와줌",         el:"토", yy:"음", g:"공통" },
  { ko:"율",   han:"聿", meaning:"붓을 잡듯 학문에 통달",  el:"목", yy:"양", g:"공통" },
];

// 오행 보조 함수
function hanjaByElement(el, gender) {
  return HANJA_LIST.filter(h => h.el === el && (h.g === "공통" || h.g === gender));
}

window.HANJA = {
  list: HANJA_LIST,
  byElement: hanjaByElement,
};
