# ⚾ MLB 순위 (앱인토스 미니앱)

메이저리그 30개 팀 순위 + 한국 선수 시즌 성적을 한눈에 볼 수 있는 앱인토스 미니앱입니다.

> **스포츠 랭킹 시리즈** 4번째 앱 (KBO → K리그 → MLS → MLB)

## 🌟 차별화 포인트

- 🇰🇷 **한국 선수 전용 탭** — 이정후, 김혜성 + 한국계 빅리거 4명의 시즌 성적 한 화면에
- 🔴 **한국 선수 출전 경기 강조** — 오늘/어제 경기에서 한국 선수 출전 경기는 빨간 테두리 + 상단 정렬
- 📊 **응원팀 상세 리포트** — 리워드 광고 시청 후 잠금 해제

## 📂 구조

```
mlb-app/
├── scraper/                 # MLB Stats API 스크래퍼 (Node.js)
│   ├── scrape.js
│   └── package.json
├── data/                    # 시드 + GitHub Actions 자동 갱신 데이터
│   ├── standings.json       # 30팀 순위
│   ├── wildcard.json        # 와일드카드
│   ├── batters.json         # 타자 Top 30
│   ├── korean_players.json  # 한국 선수 (치트키!)
│   ├── games.json           # 오늘/어제 경기
│   └── meta.json            # 메타데이터
├── docs/                    # GitHub Pages (약관)
├── app/                     # 앱인토스 미니앱 (React + Vite)
└── .github/workflows/       # GitHub Actions (매시간 갱신)
```

## 🚀 배포 가이드

### 1. 로컬 환경 셋업

```cmd
cd C:\Users\Lee\mlb-app\app
npm install
```

### 2. 개발 서버

```cmd
npx ait dev
```

### 3. 광고 ID 적용 (출시 전)

3개 컴포넌트 파일 수정:
- `app/src/components/BannerAd.tsx`
- `app/src/components/InterstitialAd.tsx`
- `app/src/components/RewardedAd.tsx`

각 파일에서:
```ts
const IS_AD_PRODUCTION = true;  // false → true
const PROD_*_ID = "ait.v2.live.실제광고ID";  // 콘솔에서 발급받은 ID
```

### 4. 빌드

```cmd
cd C:\Users\Lee\mlb-app\app
npx ait build
```

### 5. 앱인토스 콘솔에서 deploymentId 등록

빌드 결과(`*.ait` 파일)를 콘솔에 업로드하고, 출력되는 deploymentId를 등록.

### 6. 검수 제출

체크리스트:
- [x] `webViewProps.navigationBar.withBackButton: false` (granite.config.ts)
- [x] BottomNav는 Pill 스타일 (rounded-full, 중앙 정렬)
- [x] window.alert/confirm 사용 안 함 (sonner toast 사용)
- [x] API 재시도 + 폴백 + 에러 UI
- [x] 시드 JSON 번들 포함
- [ ] 실제 광고 ID 3개 적용 + IS_AD_PRODUCTION=true
- [ ] 약관/개인정보 URL을 GitHub Pages에 공개

## 📡 데이터 소스

**MLB Stats API** (https://statsapi.mlb.com/api/v1/)
- 공식 API, 인증 불필요
- JSON 응답
- 매시간 GitHub Actions으로 갱신

## 🇰🇷 등재 한국 선수 (2026 시즌)

**현역 메이저리거**
- ⚾ 이정후 (샌프란시스코 자이언츠)
- ⚾ 김혜성 (LA 다저스)

**한국계 빅리거 (WBC 대표팀)**
- 🇰🇷 데인 더닝 (시애틀)
- 🇰🇷 라일리 오브라이언 (세인트루이스)
- 🇰🇷 저마이 존스 (디트로이트)
- 🇰🇷 셰이 위트컴 (휴스턴)

> 선수 명단은 시즌 변경 시 `scraper/scrape.js`의 `KOREAN_PLAYERS_QUERY` 배열에서 업데이트하세요.

## 📝 시리즈

- ✅ KBO 순위 (검수 완료)
- ✅ K리그 순위 (검수 중)
- ✅ MLS 순위 (검수 중)
- ⚾ **MLB 순위 (이 repo)**
- 🔜 EPL 순위 (다음)

## 📄 라이선스

MIT
