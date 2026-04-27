/* 메인 컨트롤러: 폼 입력 → 사주 계산 → 화면 렌더링 */

(function () {
  const $ = (id) => document.getElementById(id);

  const form = $("naming-form");
  const noTimeBox = $("no-time");
  const birthtime = $("birthtime");

  noTimeBox.addEventListener("change", () => {
    birthtime.disabled = noTimeBox.checked;
    if (noTimeBox.checked) birthtime.value = "12:00";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runRecommendation();
  });

  function runRecommendation() {
    const surname = $("surname").value.trim();
    const gender  = $("gender").value;
    const dateStr = $("birthdate").value;
    const timeStr = $("birthtime").value || "12:00";
    const hasTime = !noTimeBox.checked;
    const nameLen = parseInt($("name-len").value, 10);
    const count   = parseInt($("count").value, 10);

    if (!surname) { alert("성씨를 입력해 주세요."); return; }
    if (!dateStr) { alert("생년월일을 선택해 주세요."); return; }

    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);

    const saju = SAJU.calcSaju({
      year: y, month: m, day: d, hour: hh, hasTime,
    });

    renderResults({ surname, gender, nameLen, count, saju, hh, mm, hasTime });

    $("results").hidden = false;
    if (typeof $("results").scrollIntoView === "function") {
      $("results").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ===== 렌더링 =====

  function renderResults(ctx) {
    renderPillars(ctx);
    renderYinYang(ctx.saju);
    renderElements(ctx.saju);
    renderRecommendations(ctx);
    renderLucky(ctx);
  }

  function renderPillars({ saju, hh, mm, hasTime }) {
    const ps = saju.pillars;
    const order = [
      ["연주", ps.year],
      ["월주", ps.month],
      ["일주", ps.day],
      ["시주", ps.hour],
    ];

    const wrap = $("pillars");
    wrap.innerHTML = "";
    for (const [label, p] of order) {
      const div = document.createElement("div");
      div.className = "pillar";
      if (!p) {
        div.innerHTML = `
          <h4>${label}</h4>
          <div class="gz" style="opacity:.35">
            <span class="stem">—</span>
            <span class="branch">—</span>
          </div>
          <div class="ko">시각 미입력</div>`;
      } else {
        const t = SAJU.pillarText(p);
        div.classList.add("bg-" + t.stemElement);
        div.innerHTML = `
          <h4>${label}</h4>
          <div class="gz">
            <span class="stem el-${t.stemElement}">${t.stemHan}</span>
            <span class="branch el-${t.branchElement}">${t.branchHan}</span>
          </div>
          <div class="ko">${t.stem}${t.branch} · ${t.stemElement}${t.branchElement}</div>`;
      }
      wrap.appendChild(div);
    }

    const dm = saju.dayMaster;
    $("saju-summary").innerHTML =
      `사주연도 <b>${saju.sajuYear}</b>년(${saju.animal}띠) · ` +
      `일간 <b class="el-${dm.element}">${dm.han}(${dm.stem})</b> ` +
      `— ${dm.yinyang} ${dm.element}.`;

    const eb = $("pillars-explain");
    eb.innerHTML = `
      <p><b>연주(年柱)</b> — 양력 생일이 입춘(2/4 무렵) 이전이면 전년도를 사주연도로 잡습니다.
        ${saju.sajuYear}년의 60갑자에서 천간/지지를 가져옵니다.</p>
      <p><b>월주(月柱)</b> — 월의 지(枝)는 절기를 따릅니다(소한·입춘·경칩…).
        월의 간(干)은 연간을 기준으로 “갑·기→丙寅, 을·경→戊寅 …” 규칙으로 정해집니다.</p>
      <p><b>일주(日柱)</b> — <code>1900-01-01 = 갑술일</code>을 기준으로 일수 차이로 60갑자를 돌려 산출합니다.</p>
      <p><b>시주(時柱)</b> — 2시간 단위로 12지에 매핑(23~01시=자, 01~03=축…)하고,
        “일간이 갑·기면 자시간=甲, 을·경이면 丙 …” 규칙으로 시간을 정합니다.
        ${hasTime ? `입력하신 ${pad2(hh)}:${pad2(mm)}로 계산했습니다.` : "시각 미입력이라 시주는 비워두었습니다."}</p>
    `;
  }

  function pad2(n){ return n < 10 ? "0"+n : ""+n; }

  function renderYinYang(saju) {
    const yang = saju.yinyang.양;
    const yin  = saju.yinyang.음;
    const total = yang + yin;
    const yangPct = total ? (yang/total*100).toFixed(0) : 0;
    const yinPct  = total ? (yin/total*100).toFixed(0) : 0;

    $("yinyang").innerHTML = `
      <div class="yy-row"><b>양 (陽)</b>
        <div class="yy-bar"><div class="yy-fill yy-yang" style="width:${yangPct}%"></div></div>
        <span>${yang}/${total} (${yangPct}%)</span>
      </div>
      <div class="yy-row"><b>음 (陰)</b>
        <div class="yy-bar"><div class="yy-fill yy-yin" style="width:${yinPct}%"></div></div>
        <span>${yin}/${total} (${yinPct}%)</span>
      </div>`;

    let comment;
    const diff = Math.abs(yang - yin);
    if (diff <= 1) {
      comment = "음양이 매우 균형 잡혀 있습니다. 성품이 안정되고 어디서나 어울리기 좋은 사주입니다.";
    } else if (yang > yin) {
      comment = "양 기운이 우세해 활동적이고 추진력이 강합니다. 이름에는 부드러운 음의 글자(예: 윤·연·아·서)를 더해 균형을 잡으면 좋습니다.";
    } else {
      comment = "음 기운이 우세해 차분하고 사려 깊습니다. 이름에는 밝고 따뜻한 양의 글자(예: 태·진·휘·하)를 더해 활기를 북돋우면 좋습니다.";
    }
    $("yinyang-comment").textContent = comment;
  }

  function renderElements(saju) {
    const order = ["목","화","토","금","수"];
    const meta = {
      "목": "성장·인자(仁)·창의",
      "화": "예의·열정·표현",
      "토": "신의·중심·안정",
      "금": "의리·결단·결실",
      "수": "지혜·유연·총명",
    };
    const max = Math.max(...order.map(e => saju.elements[e]), 1);
    const wrap = $("elements");
    wrap.innerHTML = "";
    for (const e of order) {
      const v = saju.elements[e];
      const pct = (v / max * 100).toFixed(0);
      wrap.innerHTML += `
        <div class="el-label el-${e}">${e} (${meta[e].split("·")[0]})</div>
        <div class="el-bar"><div class="el-fill bg-${e}" style="width:${pct}%"></div></div>
        <div class="el-count">${v}</div>`;
    }

    // 코멘트
    let parts = [];
    parts.push(`총 ${saju.total}자 중 ` + order.map(e => `${e} ${saju.elements[e]}`).join(" · ") + ".");
    if (saju.lacking.length) parts.push(`<b>없는 오행</b>: ${saju.lacking.join("·")}.`);
    if (saju.weak.length && !saju.weak.every(e => saju.lacking.includes(e))) {
      const onlyWeak = saju.weak.filter(e => !saju.lacking.includes(e));
      if (onlyWeak.length) parts.push(`<b>부족한 오행</b>: ${onlyWeak.join("·")}.`);
    }
    if (saju.strong.length) parts.push(`<b>강한 오행</b>: ${saju.strong.join("·")}.`);
    parts.push(`이름에는 <b>없거나 부족한 오행</b>의 한자를 골라 보완해 주는 것이 좋습니다.`);
    $("elements-comment").innerHTML = parts.join(" ");

    // 칩
    const need = needFulfillElements(saju);
    const chipWrap = $("needed");
    chipWrap.innerHTML = "";
    if (!need.length) {
      chipWrap.innerHTML = `<span class="chip">오행이 매우 균형 잡혀 별도 보완이 필요 없습니다.</span>`;
    } else {
      need.forEach(e => {
        const reason = saju.lacking.includes(e) ? "없음" : "부족";
        chipWrap.innerHTML += `<span class="chip chip-strong">보완 추천: <b class="el-${e}">${e}</b> (${reason})</span>`;
      });
    }
  }

  function needFulfillElements(saju) {
    // 우선순위: 없는 오행 > 1개만 있는 약한 오행
    const need = [...saju.lacking];
    saju.weak.forEach(e => { if (!need.includes(e) && saju.elements[e] <= 1) need.push(e); });
    // 너무 많으면 상위 2개만
    return need.slice(0, 2);
  }

  // ===== 추천 이름 생성 =====
  function renderRecommendations(ctx) {
    const { saju, surname, gender, nameLen, count } = ctx;
    const wrap = $("recommendations");
    wrap.innerHTML = "";

    const need = needFulfillElements(saju);
    // 보완 오행이 없으면, 일간(日干) 오행을 돕는 오행으로 추천 (생기 보충)
    let targets = need.length ? need : [getHelperElement(saju.dayMaster.element)];

    const candidates = generateNameCandidates({ targets, gender, nameLen, count });

    if (!candidates.length) {
      wrap.innerHTML = `<p class="muted">추천 결과가 충분하지 않습니다. 다른 조건으로 시도해 보세요.</p>`;
      return;
    }

    candidates.forEach((c, idx) => {
      const card = document.createElement("div");
      card.className = "name-card";
      const fullKo  = surname + c.ko;
      const fullHan = c.han;
      card.innerHTML = `
        <div class="han">${fullHan}</div>
        <div class="ko">${fullKo}</div>
        <div class="meta">
          <b>오행 보완</b> ${c.elements.map(e => `<span class="el-${e}">${e}</span>`).join("·")}
          · <b>음양</b> ${c.yinyang}
        </div>
        <details>
          <summary>왜 이 이름이 좋을까요?</summary>
          <div class="why">${buildWhy(c, saju, surname)}</div>
        </details>`;
      wrap.appendChild(card);
    });
  }

  // 일간을 돕는 오행 (상생 관계: 생해주는 오행)
  // 목→수가 생함, 화→목, 토→화, 금→토, 수→금
  function getHelperElement(el) {
    return ({ "목":"수", "화":"목", "토":"화", "금":"토", "수":"금" })[el] || "토";
  }

  function generateNameCandidates({ targets, gender, nameLen, count }) {
    // 1자 이름인 경우: 첫째 글자만 사용
    const firstPool = poolFor(targets[0], gender);
    const secondTarget = targets[1] || targets[0];
    const secondPool = poolFor(secondTarget, gender);

    const out = [];
    const seen = new Set();

    // 균형: 음/양 섞기
    const tries = Math.min(count * 6, 200);
    for (let i = 0; i < tries && out.length < count; i++) {
      const a = pickRandom(firstPool);
      if (!a) continue;
      if (nameLen === 1) {
        const key = a.han;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          ko: a.ko,
          han: a.han,
          parts: [a],
          elements: [a.el],
          yinyang: a.yy,
        });
      } else {
        const b = pickRandom(secondPool);
        if (!b) continue;
        if (a.han === b.han) continue; // 같은 한자 중복 회피
        const key = a.han + b.han;
        if (seen.has(key)) continue;
        seen.add(key);
        // 음양 균형 우대 (둘이 다르면 우선 채택, 같으면 절반만 통과)
        const balanced = a.yy !== b.yy;
        if (!balanced && Math.random() > 0.45) continue;
        out.push({
          ko: a.ko + b.ko,
          han: a.han + b.han,
          parts: [a, b],
          elements: dedupe([a.el, b.el]),
          yinyang: balanced ? "양·음 조화" : a.yy + " 강조",
        });
      }
    }
    return out;
  }

  function poolFor(el, gender) {
    let pool = HANJA.byElement(el, gender);
    if (pool.length < 4) {
      // 너무 좁으면 공통 풀로 확장
      pool = HANJA.list.filter(h => h.el === el);
    }
    return pool;
  }

  function dedupe(arr) { return [...new Set(arr)]; }

  function pickRandom(arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function buildWhy(c, saju, surname) {
    const lines = [];
    lines.push(`<b>${surname}${c.ko}</b> (${c.han}) — 한자 풀이`);
    const ul = c.parts.map(p =>
      `<li><b>${p.han}(${p.ko})</b> · ${p.meaning} · 오행 <span class="el-${p.el}">${p.el}</span> · 음양 ${p.yy}</li>`
    ).join("");
    lines.push(`<ul style="margin:6px 0 8px 18px;padding:0;">${ul}</ul>`);

    // 보완 효과 설명
    const targetSet = new Set(c.elements);
    const helps = [...targetSet].filter(e => saju.lacking.includes(e) || saju.elements[e] <= 1);
    if (helps.length) {
      lines.push(`이 이름의 <b>${helps.join("·")}</b> 기운이 ` +
        `${saju.lacking.length ? "사주에 없거나 약한 " : "부족한 "}` +
        `<b>${helps.join("·")}</b> 오행을 보충해 줍니다.`);
    } else {
      lines.push(`일간 <b>${saju.dayMaster.element}</b>을(를) 돕는 <b>${[...targetSet].join("·")}</b> 기운으로, ` +
        `타고난 본성을 부드럽게 길러 줍니다.`);
    }

    // 음양
    if (c.parts.length === 2 && c.parts[0].yy !== c.parts[1].yy) {
      lines.push(`두 글자의 <b>음양이 조화</b>를 이루어, 성격과 인간관계가 두루 원만하게 발전할 수 있습니다.`);
    }
    return lines.join(" ");
  }

  // ===== 길한 일·생활 추천 =====
  function renderLucky(ctx) {
    const { saju, gender } = ctx;
    const need = needFulfillElements(saju);
    const dm = saju.dayMaster;

    // 일간 기준 자원 오행별 권장
    const advice = adviceByElement(dm.element);

    const lucky = [];

    lucky.push({
      tag: "성품 코칭",
      title: `일간 ${dm.han}(${dm.stem}) — ${dm.element}의 사람`,
      body: advice.character,
    });

    lucky.push({
      tag: "공부·진로",
      title: "어울리는 분야",
      body: advice.career,
    });

    lucky.push({
      tag: "건강",
      title: "주의할 부위 · 권장 활동",
      body: advice.health,
    });

    lucky.push({
      tag: "행운 색",
      title: `${need.length ? need.map(e => COLOR_BY_EL[e].name).join(" · ") : COLOR_BY_EL[dm.element].name}`,
      body: `${need.length
        ? `보완할 오행 색을 옷·소품·아기방 포인트에 활용해 보세요. (${need.map(e => `${e}=${COLOR_BY_EL[e].name}`).join(", ")})`
        : `일간을 빛나게 하는 색입니다. (${dm.element}=${COLOR_BY_EL[dm.element].name})`}`,
    });

    lucky.push({
      tag: "행운 방위",
      title: `${need.length ? need.map(e => DIRECTION_BY_EL[e]).join(" · ") : DIRECTION_BY_EL[dm.element]}`,
      body: "아기방 침대 머리 방향이나 공부방 책상 방향에 참고하면 좋습니다.",
    });

    lucky.push({
      tag: "행운 숫자",
      title: numbersByElement(need.length ? need : [dm.element]),
      body: "기념일·차량 번호·계좌 번호 등 작은 선택에서 활용해 보세요.",
    });

    lucky.push({
      tag: "음식",
      title: foodByElement(need.length ? need : [dm.element]),
      body: "이유식과 어린 시절 식단에 균형 있게 활용하세요.",
    });

    lucky.push({
      tag: "학습 활동",
      title: "권장 학습·놀이",
      body: hobbyByElement(need.length ? need : [dm.element], gender),
    });

    lucky.push({
      tag: "관계",
      title: "잘 맞는 띠",
      body: matchAnimal(saju.animal),
    });

    lucky.push({
      tag: "성장 키워드",
      title: "삶의 좋은 일 3가지",
      body: positiveKeywords(saju),
    });

    const wrap = $("lucky");
    wrap.innerHTML = "";
    lucky.forEach(item => {
      const div = document.createElement("div");
      div.className = "lucky-item";
      div.innerHTML = `<span class="tag">${item.tag}</span>
        <h4>${item.title}</h4>
        <p>${item.body}</p>`;
      wrap.appendChild(div);
    });
  }

  const COLOR_BY_EL = {
    "목": { name: "초록·연두" },
    "화": { name: "붉은색·산호" },
    "토": { name: "황토·아이보리" },
    "금": { name: "흰색·은빛" },
    "수": { name: "남색·검정" },
  };
  const DIRECTION_BY_EL = {
    "목":"동쪽", "화":"남쪽", "토":"중앙", "금":"서쪽", "수":"북쪽"
  };

  function numbersByElement(els) {
    const map = { "목":[3,8], "화":[2,7], "토":[5,10], "금":[4,9], "수":[1,6] };
    const nums = new Set();
    els.forEach(e => map[e].forEach(n => nums.add(n)));
    return "행운 숫자 " + [...nums].sort((a,b)=>a-b).join(", ");
  }

  function foodByElement(els) {
    const map = {
      "목":"신맛·푸른 채소(시금치·브로콜리·키위)",
      "화":"쓴맛·붉은 채소(토마토·당근·수박)",
      "토":"단맛·곡물(고구마·단호박·찹쌀)",
      "금":"매운맛·흰 식재료(무·배·양파)",
      "수":"짠맛·검은 식재료(검은콩·미역·현미)",
    };
    return els.map(e => map[e]).join(" / ");
  }

  function hobbyByElement(els, gender) {
    const map = {
      "목":"식물 가꾸기·종이접기·도서관 나들이",
      "화":"노래·미술·발표 놀이로 표현력 키우기",
      "토":"흙놀이·요리 보조·블록 쌓기",
      "금":"악기·바둑/체스·정리정돈 습관",
      "수":"수영·물놀이·과학 실험·독서",
    };
    return els.map(e => map[e]).join(" · ");
  }

  function adviceByElement(el) {
    return ({
      "목": {
        character: "곧고 인자한 기질입니다. 호기심이 많고 새로운 것을 배우길 즐깁니다. 부모는 ‘새 시도’를 응원해 주세요.",
        career: "교육·인문·환경·디자인·바이오 분야에 친화적입니다.",
        health: "간·근육 계열을 살펴 주세요. 산책·자전거 같은 가벼운 유산소가 좋습니다.",
      },
      "화": {
        character: "밝고 표현력이 풍부합니다. 칭찬과 무대를 만들어 주면 빠르게 성장합니다.",
        career: "예술·방송·홍보·교육·마케팅에 잘 맞습니다.",
        health: "심장·시력에 무리 가지 않게 화면 시간 관리를 해 주세요.",
      },
      "토": {
        character: "신의가 있고 든든합니다. 친구를 잘 챙기는 ‘반장형’ 성품으로 자랍니다.",
        career: "행정·부동산·요식·상담·교육 분야와 어울립니다.",
        health: "위장과 비장을 살펴 주세요. 규칙적인 식사가 핵심입니다.",
      },
      "금": {
        character: "의롭고 야무진 기질입니다. 정의감과 결단력이 자라납니다.",
        career: "법·재무·공학·의료·스포츠에서 두각을 보입니다.",
        health: "폐·기관지 관리에 신경 쓰고, 호흡을 가다듬는 운동(수영·요가)을 추천합니다.",
      },
      "수": {
        character: "지혜롭고 사려 깊습니다. 깊이 생각하고 융통성 있게 판단합니다.",
        career: "연구·IT·금융·문학·외교에 강점이 있습니다.",
        health: "신장·방광 균형을 살피고 따뜻한 물을 자주 마시게 해 주세요.",
      },
    })[el];
  }

  // 띠 궁합 (간단 삼합/육합 기반)
  function matchAnimal(myAnimal) {
    const sanhab = {
      "쥐":["용","원숭이"], "용":["쥐","원숭이"], "원숭이":["쥐","용"],
      "소":["뱀","닭"], "뱀":["소","닭"], "닭":["소","뱀"],
      "호랑이":["말","개"], "말":["호랑이","개"], "개":["호랑이","말"],
      "토끼":["양","돼지"], "양":["토끼","돼지"], "돼지":["토끼","양"],
    };
    const buddies = sanhab[myAnimal] || [];
    if (!buddies.length) return "두루 원만하게 어울리는 사주입니다.";
    return `${myAnimal}띠와 삼합을 이루는 ${buddies.join(" · ")}띠 친구·가족과 특히 잘 맞습니다.`;
  }

  function positiveKeywords(saju) {
    const need = needFulfillElements(saju);
    const dm = saju.dayMaster;
    const k = [];

    if (saju.elements.목 >= 2) k.push("성장하는 일에 운이 따릅니다 — 학습·새 도전");
    if (saju.elements.화 >= 2) k.push("표현하는 일에 운이 따릅니다 — 무대·창작·인정");
    if (saju.elements.토 >= 2) k.push("사람을 모으는 일에 운이 따릅니다 — 우정·중재");
    if (saju.elements.금 >= 2) k.push("결실 맺는 일에 운이 따릅니다 — 시험·완성·재산");
    if (saju.elements.수 >= 2) k.push("궁리하는 일에 운이 따릅니다 — 연구·여행·지혜");

    if (k.length < 3) {
      const more = {
        "목":"새 친구·새 환경에서 운이 열립니다",
        "화":"무대 위에서 사랑받는 운이 있습니다",
        "토":"꾸준함이 큰 복으로 돌아옵니다",
        "금":"맑은 마음과 정직함이 재능을 빛나게 합니다",
        "수":"깊이 있는 사색이 인생의 길잡이가 됩니다",
      };
      (need.length ? need : [dm.element]).forEach(e => {
        if (k.length < 3) k.push(more[e]);
      });
    }
    while (k.length < 3) k.push("부모의 따뜻한 말 한마디가 가장 큰 복이 됩니다");
    return k.slice(0, 3).map(s => "· " + s).join("<br/>");
  }
})();
