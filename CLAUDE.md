# szsh-front (Next.js App Router)

프론트엔드. 백엔드(`../back`, FastAPI)와 **BFF 프록시**로 통신. 독립 git repo(jakebox1966/szsh-front).
배포·데이터 상세는 루트 `../CLAUDE.md` 및 `../docs/` 참고.

## ⭐ 코드 변경 시 (사이드 이펙트·무오류)
**"됐다" 전에 반드시:**
- `node_modules/.bin/tsc --noEmit` + `node_modules/.bin/eslint <파일>`
  - 기존 경고(`react-hooks/refs` in HeroSection, `activeTag`)는 내 변경과 무관 — **새로 생긴 것만** 본다.
- **시그니처/타입 바꾸면 `grep`으로 모든 호출처** 찾아 같이 수정.
  - 예: `AuthUser.id` 제거 → 댓글 소유권(`CompanyDetailContainer`·`CompanySaySection`)까지 깨졌음.
- **공유 컴포넌트 = 파급 큼**: `features/calculators/ui/shared.tsx` 수정 = 계산기 4종 전부 영향.
- **API 응답 형태 바뀌면** `lib/api-types.ts` + `lib/api-mappers.ts` + 소비처 한 세트로.
- **auth 의존 로직은 로그인/로그아웃 둘 다** 확인 (예: 홈 댓글/digest는 status 변경 시 재요청).

## 데이터 통신
- 모든 데이터 호출은 `lib/api.ts`의 `apiFetch` 사용 → BFF(`/api/*`, `/auth/*`)가 백엔드로 forward. **상대 경로**로 호출.
- `apiFetch`는 `credentials: include` + **204/빈 응답 처리**(DELETE 등). `res.json()` 직접 호출 금지.
- 응답 필드는 백엔드가 camelCase 직렬화(예: `userPublicId`, `companyName`). 타입은 `lib/api-types.ts`, 매핑은 `lib/api-mappers.ts`.

## 자주 터졌던 함정
- **타임존**: 백엔드 시간은 naive UTC. `formatTimeAgo`(`lib/api-mappers.ts`)가 타임존 없으면 `Z` 붙여 UTC 해석. 새 시간 표시 시 +9h 어긋남 주의.
- **nullable**: `companyData.finance`는 null 가능(재무는 상장사만) → 옵셔널 체이닝.
- **비로그인 게이트**: 가려질 콘텐츠는 **서버가 비로그인엔 안 보냄**. 블러 자리는 더미(`HomeBoards`의 `BLUR_ROWS`). CSS 블러만으론 게이트 안 됨.

## 인증 (요약)
- OAuth(google/kakao) → `buildLoginUrl`로 시작 → httpOnly 쿠키. `/login?callbackUrl=/path`로 복귀.
- `useAuth()` → `{ user, status }`. `user`는 `AuthUser`(`public_id`, nickname, email, profile_image, tier) — **내부 정수 id는 노출 안 함**.
- 로그인 시 `setUserId(public_id)`로 GA4 `user_id` 전역 세팅 → 이후 모든 이벤트에 부착.

## 디자인 톤
- 강조색 **indigo**(`indigo-600/500`). 금액 `formatKRW`(원→한글). 카드 `bg-white rounded-2xl border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`.

## GA4 이벤트 (`lib/analytics.ts` EventMap)
- `sign_up_start / sign_up / login`, `search_enter / search_results`, `company_detail`,
  `comment_submit / comment_edit / comment_delete`,
  `salary/jeonse/mortgage/dsr_calculate`(계산기 **진입+계산** 둘 다 발사).
- 새 이벤트는 EventMap에 타입 추가 후 `trackEvent`. user_id는 로그인 시 자동.

## 배포
- `git push origin main` → Vercel 자동. (push는 gh 활성계정 `jakebox1966` 필요)
