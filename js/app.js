/* 보바스기념병원 — 화면 동작
   1) 모바일 메뉴 열고 닫기
   2) 글자 크기 조절 (작게 / 보통 / 크게) — 선택은 브라우저에 저장
   3) 메뉴 링크를 누르면 모바일에서는 메뉴가 닫히도록 처리
   자바스크립트가 꺼져 있어도 모든 내용은 그대로 읽힙니다. */

(function () {
  "use strict";

  /* ---------- 1) 모바일 메뉴 ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- 2) 글자 크기 조절 ---------- */
  var STORAGE_KEY = "bobath-font-size";
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".fs-btn"));

  function applyFont(size) {
    document.documentElement.setAttribute("data-font", size);
    buttons.forEach(function (btn) {
      var on = btn.dataset.font === size;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch (err) {
      /* 시크릿 모드 등 저장이 막힌 경우에는 이번 방문에만 적용 */
    }
  }

  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    saved = null;
  }
  applyFont(saved === "small" || saved === "large" ? saved : "normal");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFont(btn.dataset.font);
    });
  });
})();
