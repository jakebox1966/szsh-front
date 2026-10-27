# 세전세후 (SZSH)

**취업과 이직을 위한 기업 분석 플랫폼**

세전세후는 취업 및 이직을 준비하는 사용자가 기업의 연봉, 재무 정보, 인사 지표 등을 확인하고, 기업에 대한 다양한 의견을 참고할 수 있도록 돕는 서비스입니다.

기업의 주요 데이터를 시각화하여 제공하고, 연봉 및 대출 관련 계산기를 통해 직장 생활과 주거에 필요한 의사결정을 지원합니다.

## 주요 기능

### 🏢 기업 정보 및 분석
- 기업 검색 및 기업별 상세 정보 조회
- 기업의 연봉 정보 및 세후 실수령액 관련 정보 제공
- 매출, 영업이익 등 주요 재무 지표 시각화
- 인사 지표 및 기업 성장성 관련 정보 제공
- 기업의 주요 지표를 종합한 분석 정보 제공

### 💬 기업 의견 공유
- 기업별 사용자 의견 조회
- 기업에 대한 다양한 의견과 경험 공유
- 여러 기업의 의견을 모아볼 수 있는 페이지 제공

### 🧮 생활 금융 계산기

직장 생활과 주거 계획에 필요한 주요 금융 계산 기능을 제공합니다.

| 계산기 | 설명 |
|---|---|
| 실수령액 계산기 | 세전 연봉을 기준으로 예상 실수령액 계산 |
| 전세대출 계산기 | 전세보증금 및 대출 조건에 따른 계산 |
| 주택담보대출 계산기 | 주택담보대출 관련 금액 계산 |
| DSR 계산기 | 소득 및 대출 조건을 바탕으로 DSR 계산 |

※ 계산 결과는 입력 조건과 적용 기준에 따라 달라질 수 있으며, 실제 금융기관의 심사 결과와 차이가 있을 수 있습니다.

## 기술 스택

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI:** Radix UI
- **Chart:** Recharts
- **Icons:** Lucide React

### Architecture
- Next.js App Router 기반 페이지 구성
- Next.js API Route를 활용한 백엔드 API 프록시
- 별도 백엔드 서버와 연동하는 프론트엔드 구조

### Backend
- FastAPI 기반 백엔드 서버와 연동

## 프로젝트 구조

```text
szsh-front/
├── app/
│   ├── (site)/
│   │   ├── comments/       # 기업 의견 모아보기
│   │   ├── company/        # 기업 상세 페이지
│   │   ├── search/         # 기업 검색 페이지
│   │   └── page.tsx        # 메인 페이지
│   ├── api/
│   │   └── [...path]/      # 백엔드 API 프록시
│   ├── auth/               # 인증 관련 API
│   ├── login/              # 로그인 페이지
│   ├── globals.css         # 전역 스타일
│   └── layout.tsx          # 루트 레이아웃
├── components/
│   ├── layout/             # 헤더, 푸터 등 공통 레이아웃
│   └── ui/                 # 공통 UI 컴포넌트
├── features/
│   ├── calculators/        # 금융 계산기
│   ├── comments/           # 기업 의견 관련 기능
│   ├── company/            # 기업 상세 및 분석 기능
│   ├── home/               # 메인 페이지 기능
│   └── search/             # 검색 기능
├── lib/                    # 공통 유틸리티 및 API 관련 코드
├── public/                 # 정적 리소스
├── package.json
└── README.md

<img width="648" height="1404" alt="szsh1" src="https://github.com/user-attachments/assets/d468724c-d7dd-47c2-b74f-1e6e999af5ba" />
