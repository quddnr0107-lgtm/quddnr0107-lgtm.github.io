# MBTI 처방전 시리즈 블로그

GitHub Pages + Jekyll로 운영하는 〈MBTI 16유형 처방전 시리즈〉 공식 블로그.

3권 × 16유형 = **48편의 SEO 최적화 글**이 자동 생성됩니다.

## 구조

```
mbti_blog/
├── _config.yml         # Jekyll 설정 (SEO 플러그인 포함)
├── Gemfile             # Ruby 의존성
├── _layouts/           # default.html, post.html
├── _includes/
├── _posts/             # 자동 생성된 48편
├── book/               # 3권 소개 페이지
├── category/           # 카테고리별 인덱스
├── about.md            # 저자 소개
├── index.html          # 홈
└── generate_posts.js   # 글 자동 생성 스크립트
```

## 1회 배포 절차 (GitHub Pages 무료)

### 1단계. GitHub 저장소 생성
1. github.com 가입 (사용자명을 `munhaksojeong` 같이 짧게)
2. 새 저장소 `<username>.github.io` 생성 (Public)
3. README 체크 해제 (덮어쓰기 회피)

### 2단계. 로컬에서 git 초기화·푸시
```bash
cd C:/Users/최병욱/Desktop/어플만들자/mbti_blog
git init
git branch -M main
git add .
git commit -m "MBTI 처방전 시리즈 블로그 초기 배포"
git remote add origin https://github.com/<username>/<username>.github.io.git
git push -u origin main
```

### 3단계. GitHub Pages 활성화
1. 저장소 Settings → Pages
2. Source: `main` 브랜치, `/` (root) 폴더 선택
3. Save → 1~3분 후 `https://<username>.github.io` 라이브

### 4단계. _config.yml의 url 수정
```yaml
url: "https://<username>.github.io"
```
다시 push하면 SEO 메타 태그가 정확한 도메인으로 갱신됨.

## 신규 글 추가 (자동)

책 내용이 업데이트되거나 새 권이 나오면:
```bash
cd mbti_blog
node generate_posts.js     # 48편 재생성
git add _posts
git commit -m "글 갱신"
git push
```
GitHub Pages가 자동 빌드·배포 (보통 1~2분).

## 로컬 미리보기 (선택)

Ruby 설치 후:
```bash
bundle install
bundle exec jekyll serve
```
브라우저에서 `http://localhost:4000` 확인.

## SEO 자동 적용 항목

- 모든 글에 `<meta description>`, `<meta keywords>`
- Open Graph (페이스북·카카오톡 미리보기)
- Twitter Card
- JSON-LD 구조화 데이터 (구글 책 검색 강화)
- sitemap.xml (구글 서치 콘솔 등록용)
- RSS feed (네이버 검색 등록용)

## 구글·네이버 검색 등록

배포 완료 후:

**구글 서치 콘솔**: search.google.com/search-console
1. 속성 추가 → URL prefix → `https://<username>.github.io`
2. 인증 (HTML 파일 또는 메타 태그)
3. Sitemap 제출 → `sitemap.xml`

**네이버 서치어드바이저**: searchadvisor.naver.com
1. 사이트 등록
2. 사이트 소유 확인 (HTML 파일 업로드)
3. Sitemap 제출 → `/sitemap.xml`
4. RSS 등록 → `/feed.xml`

검색 노출까지 보통 1~4주.

## 글 발행 스케줄

`generate_posts.js`는 글마다 12시간 간격으로 날짜를 분산시킵니다 (48편 × 12h = 24일).
이렇게 하면 검색 엔진이 "신선한 콘텐츠가 꾸준히 올라오는 블로그"로 인식해 색인 가중치가 올라갑니다.

스케줄을 다르게 두려면 `generate_posts.js`의 `BASE_DATE`와 `12 * 3600 * 1000` 부분 수정.

## 라이선스

본문 콘텐츠 © 2026 문학소정. 무단 전재·복제 금지.
블로그 글은 단행본의 일부 발췌이며, 전체 콘텐츠는 단행본에서만 만나볼 수 있습니다.
