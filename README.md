# 보바스기념병원 웹사이트 (리뉴얼)

bobath.co.kr 리뉴얼용 정적 웹사이트입니다. 빌드 도구·프레임워크 없이 HTML/CSS/JS만으로 동작합니다.

## 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` | 전체 페이지 (병원 소개 · 진료과 · 전문 센터 · 재활 클리닉 · 이용 안내 · FAQ · 오시는 길) |
| `css/styles.css` | 스타일. 모바일 우선, 50대 이상 가독성 기준 |
| `js/app.js` | 모바일 메뉴, 글자 크기 조절 |
| `llms.txt` | AI 어시스턴트가 병원 정보를 정확히 읽도록 정리한 요약 문서 |
| `robots.txt` / `sitemap.xml` | 검색엔진 · AI 크롤러 안내 |

## 설계 기준

**AI가 잘 인식하도록**
- `schema.org` 구조화 데이터(JSON-LD): `Hospital`, `MedicalClinic`, `FAQPage`, `WebSite` — 진료과, 진료시간, 전화번호, 주소, 제공 치료를 기계가 읽는 형태로 명시
- 시맨틱 HTML(`header`/`nav`/`main`/`section`/`footer`)과 `h1 → h2 → h3` 단일 계층
- 메타 설명 · Open Graph · canonical
- `llms.txt`로 핵심 사실을 평문 요약, `robots.txt`에서 GPTBot·ClaudeBot·PerplexityBot 등 명시적 허용

**50대 이상이 보기 편하도록**
- 본문 기본 19px, 줄간격 1.8, 한글 단어가 끊기지 않는 `word-break: keep-all`
- 헤더의 글자 크기 조절 버튼(작게 / 보통 / 크게), 선택값은 브라우저에 저장
- 본문 대비 WCAG AA 이상, 버튼 최소 높이 60px
- 외부 폰트 없이 Pretendard → Apple SD Gothic Neo → 맑은 고딕 순서의 시스템 한글 폰트

**모바일에서 잘 되도록**
- 모바일 우선 CSS, 700px / 1000px 두 개의 분기점
- 하단 고정 바(전화 상담 · 예약 안내 · 오시는 길)와 `tel:` 링크로 한 번에 전화 연결
- 터치 영역 최소 56px, `env(safe-area-inset-bottom)` 대응
- 자바스크립트 없이도 전체 내용 열람 가능

## 로컬에서 보기

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 반영 전 확인이 필요한 항목

원본 사이트를 직접 크롤링할 수 없는 환경에서 작성해, 아래 항목은 병원 담당자 확인이 필요합니다.

- 의료진 소개, 병원 연혁, 층별 안내, 주차 · 면회 세부 규정
- 비급여 수가, 증명서 발급, 진료협력센터 등 실제 업무 페이지 링크
- 대표 이미지 · 로고 등 브랜드 자산 (현재 이미지 없이 타이포그래피만 사용)
