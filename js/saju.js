/* 사주(만세력) 계산 모듈
 * - 양력 생년월일시(시각 옵션) → 4기둥(연주/월주/일주/시주)
 * - 음양·오행 분포
 * - 입춘/절기 근사 보정
 *
 * 기준점:
 *   1900-01-01 (양력) = 갑술일 (60갑자 사이클 인덱스 10)
 *   1984년 = 갑자년 (즉, (year - 4) % 60 == 0)
 *   년주 경계: 입춘(약 2/4), 월주 경계: 절기(아래 표)
 */

const STEMS  = ["갑","을","병","정","무","기","경","신","임","계"];
const STEMS_HAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const BRANCHES_HAN = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const ANIMALS = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];

const STEM_ELEMENT  = ["목","목","화","화","토","토","금","금","수","수"];
const STEM_YIN_YANG = ["양","음","양","음","양","음","양","음","양","음"];

// 지지 오행: 인묘=목, 사오=화, 진술축미=토, 신유=금, 자해=수
const BRANCH_ELEMENT = {
  "자":"수", "축":"토", "인":"목", "묘":"목",
  "진":"토", "사":"화", "오":"화", "미":"토",
  "신":"금", "유":"금", "술":"토", "해":"수"
};
// 지지 음양 (체용 구분에서 '본 음양' 기준)
const BRANCH_YIN_YANG = {
  "자":"양","축":"음","인":"양","묘":"음","진":"양","사":"음",
  "오":"양","미":"음","신":"양","유":"음","술":"양","해":"음"
};

const ELEMENT_COLOR = { "목":"el-목", "화":"el-화", "토":"el-토", "금":"el-금", "수":"el-수" };

// 절기 근사 시작일 (월: 1~12, day) — 양력 기준 평균값
// 입춘=2/4, 경칩=3/6, 청명=4/5, 입하=5/6, 망종=6/6, 소서=7/7,
// 입추=8/8, 백로=9/8, 한로=10/8, 입동=11/7, 대설=12/7, 소한=1/6
const SOLAR_TERMS = [
  { name: "소한", month: 1,  day: 6,  branchIdx: 1  }, // 축
  { name: "입춘", month: 2,  day: 4,  branchIdx: 2  }, // 인 (새해 시작)
  { name: "경칩", month: 3,  day: 6,  branchIdx: 3  }, // 묘
  { name: "청명", month: 4,  day: 5,  branchIdx: 4  }, // 진
  { name: "입하", month: 5,  day: 6,  branchIdx: 5  }, // 사
  { name: "망종", month: 6,  day: 6,  branchIdx: 6  }, // 오
  { name: "소서", month: 7,  day: 7,  branchIdx: 7  }, // 미
  { name: "입추", month: 8,  day: 8,  branchIdx: 8  }, // 신
  { name: "백로", month: 9,  day: 8,  branchIdx: 9  }, // 유
  { name: "한로", month: 10, day: 8,  branchIdx: 10 }, // 술
  { name: "입동", month: 11, day: 7,  branchIdx: 11 }, // 해
  { name: "대설", month: 12, day: 7,  branchIdx: 0  }, // 자
];

function pad2(n){ return n < 10 ? "0"+n : ""+n; }

function daysBetween(d1, d2) {
  const MS = 24*60*60*1000;
  const a = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const b = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((b - a) / MS);
}

// 해당 양력일의 월주 인덱스 (인=0, 묘=1, ..., 축=11)
// 그리고 사주연도 (입춘 보정).
function getSajuYearAndMonthBranch(year, month, day) {
  // 사주 연도: 입춘 이전이면 전년도
  let sajuYear = year;
  if (month === 1 || (month === 2 && day < 4)) sajuYear = year - 1;

  // 월지: 절기 기준
  // 12개의 경계 중 현재 날짜 이하인 가장 최근 경계를 찾는다.
  // 1년 경계를 만들기 위해 [전년 12/7 대설] ~ [올해 1/6 소한] ~ [올해 2/4 입춘] ... 순서로 본다.
  // 단순화: 월/일 비교로 경계 결정
  const md = month * 100 + day;
  // 경계 표 (월간 인덱스: 인=2,묘=3,진=4,사=5,오=6,미=7,신=8,유=9,술=10,해=11,자=0,축=1)
  const cutoffs = [
    { md: 106, branchIdx: 1  }, // 1/6 소한 → 축월
    { md: 204, branchIdx: 2  }, // 2/4 입춘 → 인월
    { md: 306, branchIdx: 3  }, // 3/6 경칩 → 묘월
    { md: 405, branchIdx: 4  }, // 4/5 청명 → 진월
    { md: 506, branchIdx: 5  }, // 5/6 입하 → 사월
    { md: 606, branchIdx: 6  }, // 6/6 망종 → 오월
    { md: 707, branchIdx: 7  }, // 7/7 소서 → 미월
    { md: 808, branchIdx: 8  }, // 8/8 입추 → 신월
    { md: 908, branchIdx: 9  }, // 9/8 백로 → 유월
    { md: 1008,branchIdx: 10 }, // 10/8 한로 → 술월
    { md: 1107,branchIdx: 11 }, // 11/7 입동 → 해월
    { md: 1207,branchIdx: 0  }, // 12/7 대설 → 자월
  ];

  let monthBranchIdx = 0; // 자월 (12/7~1/5)
  // 12/7 이후이거나 1월 ~ 1/5 이전이면 자월
  if (md >= 1207) monthBranchIdx = 0;
  else if (md < 106) monthBranchIdx = 0;
  else {
    for (let i = cutoffs.length - 1; i >= 0; i--) {
      if (md >= cutoffs[i].md) { monthBranchIdx = cutoffs[i].branchIdx; break; }
    }
  }

  return { sajuYear, monthBranchIdx };
}

function getYearPillar(sajuYear) {
  const stemIdx   = ((sajuYear - 4) % 10 + 10) % 10;
  const branchIdx = ((sajuYear - 4) % 12 + 12) % 12;
  return { stemIdx, branchIdx };
}

function getMonthPillar(yearStemIdx, monthBranchIdx) {
  // monthBranchIdx: 인=2, ..., 축=1
  // 인월부터 시작하는 월간 사이클 사용. 인월에서의 시작 stem = (2*yearStem + 2) % 10.
  // 인월의 BRANCH index는 2이므로 그 위치에서의 stem 인덱스로 정의.
  const offsetFromIn = ((monthBranchIdx - 2) % 12 + 12) % 12;
  const startStem = (2 * yearStemIdx + 2) % 10;
  const stemIdx = (startStem + offsetFromIn) % 10;
  return { stemIdx, branchIdx: monthBranchIdx };
}

// 일주: 1900-01-01 = 갑술일 (cycle index 10)
function getDayPillar(year, month, day) {
  const ref = new Date(1900, 0, 1); // local
  const target = new Date(year, month - 1, day);
  const diff = daysBetween(ref, target);
  const cycleIdx = ((10 + diff) % 60 + 60) % 60;
  return { stemIdx: cycleIdx % 10, branchIdx: cycleIdx % 12, cycleIdx };
}

function getHourBranchIdx(hour /* 0-23 */) {
  // 23,0 → 자(0); 1,2 → 축(1); ...
  return Math.floor(((hour + 1) % 24) / 2) % 12;
}

function getHourPillar(dayStemIdx, hour) {
  const hb = getHourBranchIdx(hour);
  // 자시간 시작 = (2 * (dayStem % 5)) % 10
  const startStem = (2 * (dayStemIdx % 5)) % 10;
  const stemIdx = (startStem + hb) % 10;
  return { stemIdx, branchIdx: hb };
}

// 23시 이후는 다음 날의 일주를 사용 (야자시 보정)
function adjustForLateHour(year, month, day, hour) {
  if (hour >= 23) {
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  return { year, month, day };
}

// === 메인 함수 ===
function calcSaju({ year, month, day, hour, hasTime }) {
  // 사주연도, 월지
  const { sajuYear, monthBranchIdx } = getSajuYearAndMonthBranch(year, month, day);
  const yearP = getYearPillar(sajuYear);
  const monthP = getMonthPillar(yearP.stemIdx, monthBranchIdx);

  // 일주: 야자시 보정
  const dEff = (hasTime && hour >= 23)
    ? adjustForLateHour(year, month, day, hour)
    : { year, month, day };
  const dayP = getDayPillar(dEff.year, dEff.month, dEff.day);

  // 시주
  const hourP = hasTime
    ? getHourPillar(dayP.stemIdx, hour)
    : null;

  const pillars = {
    year:  { ...yearP,  label: "연주" },
    month: { ...monthP, label: "월주" },
    day:   { ...dayP,   label: "일주" },
    hour:  hourP ? { ...hourP, label: "시주" } : null,
  };

  // 음양·오행 집계
  const elements = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  const yinyang = { 양:0, 음:0 };
  function addStem(idx) {
    elements[STEM_ELEMENT[idx]]++;
    yinyang[STEM_YIN_YANG[idx]]++;
  }
  function addBranch(idx) {
    const b = BRANCHES[idx];
    elements[BRANCH_ELEMENT[b]]++;
    yinyang[BRANCH_YIN_YANG[b]]++;
  }
  addStem(yearP.stemIdx);   addBranch(yearP.branchIdx);
  addStem(monthP.stemIdx);  addBranch(monthP.branchIdx);
  addStem(dayP.stemIdx);    addBranch(dayP.branchIdx);
  if (hourP) { addStem(hourP.stemIdx); addBranch(hourP.branchIdx); }

  const total = hourP ? 8 : 6;

  // 부족/과다 오행
  const elementOrder = ["목","화","토","금","수"];
  const sorted = [...elementOrder].sort((a,b) => elements[a] - elements[b]);
  const lacking = elementOrder.filter(e => elements[e] === 0);
  const min = elements[sorted[0]];
  const weak = elementOrder.filter(e => elements[e] === min && elements[e] <= 1);
  const max = elements[[...elementOrder].sort((a,b) => elements[b] - elements[a])[0]];
  const strong = elementOrder.filter(e => elements[e] === max && elements[e] >= 3);

  // 일간(日干): 사주 분석의 중심
  const dayMaster = {
    stem: STEMS[dayP.stemIdx],
    han:  STEMS_HAN[dayP.stemIdx],
    element: STEM_ELEMENT[dayP.stemIdx],
    yinyang: STEM_YIN_YANG[dayP.stemIdx],
  };

  return {
    pillars,
    sajuYear,
    elements,
    yinyang,
    total,
    lacking,
    weak,
    strong,
    dayMaster,
    animal: ANIMALS[yearP.branchIdx],
  };
}

// 한자/한글 표기 헬퍼
function pillarText(p) {
  if (!p) return null;
  return {
    stem: STEMS[p.stemIdx],
    branch: BRANCHES[p.branchIdx],
    stemHan: STEMS_HAN[p.stemIdx],
    branchHan: BRANCHES_HAN[p.branchIdx],
    stemElement: STEM_ELEMENT[p.stemIdx],
    branchElement: BRANCH_ELEMENT[BRANCHES[p.branchIdx]],
    stemYY: STEM_YIN_YANG[p.stemIdx],
    branchYY: BRANCH_YIN_YANG[BRANCHES[p.branchIdx]],
  };
}

window.SAJU = {
  STEMS, STEMS_HAN, BRANCHES, BRANCHES_HAN, ANIMALS,
  STEM_ELEMENT, STEM_YIN_YANG, BRANCH_ELEMENT, BRANCH_YIN_YANG,
  ELEMENT_COLOR,
  calcSaju, pillarText,
};
