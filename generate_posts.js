// 1년치 (336편) 변형 글 자동 생성
// 7가지 각도 × 16유형 × 3권 = 336편, 24시간 간격
// 사용법: node generate_posts.js

const fs = require('fs');
const path = require('path');
const COUPANG = require('./coupang_config.js');

const POSTS_DIR = path.join(__dirname, '_posts');
const BASE_DATE = new Date('2026-05-22');

// ── 영문 슬러그 ────────────────────────
const SLUG_BASE = {
  INTJ:'intj',INTP:'intp',ENTJ:'entj',ENTP:'entp',
  INFJ:'infj',INFP:'infp',ENFJ:'enfj',ENFP:'enfp',
  ISTJ:'istj',ISFJ:'isfj',ESTJ:'estj',ESFJ:'esfj',
  ISTP:'istp',ISFP:'isfp',ESTP:'estp',ESFP:'esfp',
};

// ── 한국어 조사 (받침 판정) ──────────────────
function hasJong(s) {
  if (!s) return false;
  const c = s[s.length-1].charCodeAt(0);
  if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28 !== 0;
  return /[LMNRSX]/i.test(s[s.length-1]);
}
const eulReul = s => hasJong(s) ? '을' : '를';
const iGa = s => hasJong(s) ? '이' : '가';
const eunNeun = s => hasJong(s) ? '은' : '는';

// ── 책 메타 ────────────────────────────
const BOOKS = [
  {
    id: 'self-help',
    title: '아주 작은 습관의 힘을 권하지 마라',
    hero: 'ENFP',
    sub: 'MBTI 16유형 자기계발서 처방전',
    category: '자기계발',
    bookPath: '../mbti_book',
    domain: '자기계발서',
    unit: '책 5권',
    duration: 90,
    bookUrl: '/book/self-help/',
    buyUrl: 'https://bookk.co.kr/bookStore/6a0d32a8a55d20e8b2669245',
    seoKeywords: ['MBTI 자기계발', '성격별 자기계발서', '16유형 책 추천'],
  },
  {
    id: 'diet',
    title: '헬스장 PT를 권하지 마라',
    hero: 'INFP',
    sub: 'MBTI 16유형 다이어트 처방전',
    category: '다이어트',
    bookPath: '../mbti_diet_book',
    domain: '다이어트',
    unit: '방식 5가지',
    duration: 90,
    bookUrl: '/book/diet/',
    buyUrl: 'https://bookk.co.kr/bookStore/6a0d3290b5f25301484081dd',
    seoKeywords: ['MBTI 다이어트', '성격별 다이어트', '16유형 다이어트'],
  },
  {
    id: 'study',
    title: '자기주도학습을 권하지 마라',
    hero: 'ESTJ',
    sub: 'MBTI 16유형 공부법 처방전',
    category: '공부법',
    bookPath: '../mbti_study_book',
    domain: '공부법',
    unit: '방식 5가지',
    duration: 100,
    bookUrl: '/book/study/',
    buyUrl: 'https://bookk.co.kr/bookStore/6a0d36a85a907e440c66ae05',
    seoKeywords: ['MBTI 공부법', '성격별 공부법', '16유형 공부법'],
  },
  {
    id: 'love',
    title: '소개팅을 권하지 마라',
    hero: 'INFJ',
    sub: 'MBTI 16유형 연애 처방전',
    category: '연애',
    bookPath: '../mbti_love_book',
    domain: '연애',
    unit: '방식 5가지',
    duration: 90,
    bookUrl: '/book/love/',
    buyUrl: '',
    seoKeywords: ['MBTI 연애', '성격별 연애', '16유형 연애', 'MBTI 소개팅', 'MBTI 궁합'],
  },
];

function loadBook(bookPath) {
  const nt = require(path.join(bookPath, 'content_mbti_nt.js'));
  const nf = require(path.join(bookPath, 'content_mbti_nf.js'));
  const sj = require(path.join(bookPath, 'content_mbti_sj.js'));
  const sp = require(path.join(bookPath, 'content_mbti_sp.js'));
  const get = m => m.MBTI_NT || m.MBTI_NF || m.MBTI_SJ || m.MBTI_SP || m.NT_DATA || m.NF_DATA || m.SJ_DATA || m.SP_DATA;
  return [...get(nt), ...get(nf), ...get(sj), ...get(sp)];
}

// 연애책 전용 추가 데이터 (호감신호·연락·다가가기·데이트·궁합)
let LOVE_EXTRA_BY_TYPE = {};
try {
  LOVE_EXTRA_BY_TYPE = require('../mbti_love_book/content_love_extra.js').LOVE_EXTRA_BY_TYPE;
} catch (e) { /* 연애책 없으면 무시 */ }

function getRec(r) {
  return r.method || r.book || r.name || r.title || '';
}

function getWhy(r) {
  return (r.why || '').toString();
}

function getHow(r) {
  return (r.howUse || r.howRead || r.howApply || '').toString();
}

// ── 쿠팡 affiliate 블록 ───────────────
function buildAffiliateBlock(type, book) {
  if (!COUPANG.enabled) return '';
  // 연애책은 추천이 추상적 만남 방식이라 쿠팡 상품 링크 부적합 → 제외
  if (book.id === 'love' || book.domain === '연애') return '';
  const items = type.recommended.slice(0, COUPANG.maxBooks).map(r => getRec(r).split('(')[0].trim()).filter(Boolean);
  if (items.length === 0) return '';
  const aff = (kw) => {
    const q = encodeURIComponent(kw);
    let url = `https://www.coupang.com/np/search?q=${q}&channel=user`;
    if (COUPANG.affiliateId) url += `&lptag=${encodeURIComponent(COUPANG.affiliateId)}&subId=${encodeURIComponent(COUPANG.channelName||'')}`;
    return url;
  };
  const isBook = book.domain === '자기계발서';
  const blockTitle = isBook ? '📚 이 책 쿠팡에서 보기' : `🛒 ${book.domain} 도구 쿠팡에서 보기`;
  const linksHtml = items.map(t => `<a href="${aff(t)}" target="_blank" rel="nofollow sponsored noopener" class="coupang-btn">
  <span class="coupang-tag">쿠팡</span>
  <span class="coupang-title">${t}</span>
  <span class="coupang-arrow">최저가 보기 →</span>
</a>`).join('\n');
  return `
## ${blockTitle}

<style>
.coupang-btn { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin: 8px 0; background: #fff; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #1a1a1a; transition: all 0.15s; }
.coupang-btn:hover { border-color: #E63946; transform: translateX(3px); }
.coupang-tag { background: #f04757; color: #fff; font-weight: bold; font-size: 0.78em; padding: 3px 8px; border-radius: 4px; flex-shrink: 0; }
.coupang-title { font-weight: 600; flex-grow: 1; }
.coupang-arrow { color: #888; font-size: 0.85em; flex-shrink: 0; }
@media (max-width: 480px) { .coupang-arrow { display: none; } }
</style>

<div class="coupang-list">
${linksHtml}
</div>

> ${COUPANG.disclosure}
`;
}

// ── 시리즈 크로스링크 ────────────────
function seriesLinks() {
  return `
## 시리즈 다른 권

- [ENFP에게 아주 작은 습관의 힘을 권하지 마라 (자기계발서)](/book/self-help/)
- [INFP에게 헬스장 PT를 권하지 마라 (다이어트)](/book/diet/)
- [ESTJ에게 자기주도학습을 권하지 마라 (공부법)](/book/study/)
- [INFJ에게 소개팅을 권하지 마라 (연애)](/book/love/)
`;
}

// ── 7가지 변형 콘텐츠 빌더 ──────────────
const VARIANTS = [
  // 1. 추천 (기본형)
  {
    id: 'recommend',
    title: (t, b) => `${t.type} ${t.nickname}에게 추천하는 ${b.domain} ${b.unit} - MBTI ${b.domain} 처방`,
    body: (t, b) => `## ${t.type} ${t.nickname}의 ${b.domain} 성향

${t.intro.slice(0, 2).join('\n\n')}

## ${t.type}에게 약이 되는 ${b.domain} ${b.unit}

${t.recommended.slice(0, 2).map(r => `### ${getRec(r)}\n\n${getWhy(r)}`).join('\n\n')}

> 나머지 3가지 방식과 각 활용법, ${b.duration}일 적용 플랜은 단행본에서 만나보세요.

## 기억할 한 줄

> ${t.keyTakeaway}
`,
  },
  // 2. 거부 (피해야 할)
  {
    id: 'avoid',
    title: (t, b) => `${t.type}${iGa(t.type)} 피해야 할 ${b.domain} ${b.unit} - 매번 실패하는 진짜 이유`,
    body: (t, b) => `## ${t.type}${iGa(t.type)} ${b.domain}에서 실패하는 이유

${t.intro.slice(0, 1).join('\n\n')}

당신의 의지가 약해서가 아닙니다. ${t.type}의 성향과 ${b.domain} 방식이 충돌하기 때문입니다.

## ${t.type}이 피해야 할 ${b.domain} ${b.unit}

${t.avoid.slice(0, 3).map((a, i) => `**${i+1}. ${a.split('—')[0].trim()}**\n\n${a.split('—').slice(1).join('—').trim()}`).join('\n\n')}

> 위 3가지가 가장 자주 무너지는 패턴입니다. 나머지 2가지와 각 방식이 ${t.type}과 어떻게 충돌하는지 분석은 단행본에서 다룹니다.

## 다음 ${b.domain}는 어디서 시작할까

${t.type}에게는 위 방식을 피하고, 본성과 일치하는 ${b.domain}로 가야 합니다. 첫걸음 추천: **${getRec(t.recommended[0])}** — ${getWhy(t.recommended[0]).substring(0, 150)}...

전체 5가지 추천 방식은 단행본에서 만나보세요.
`,
  },
  // 3. 실수 (흔한 실수)
  {
    id: 'mistake',
    title: (t, b) => `${t.type}${iGa(t.type)} ${b.domain}에서 흔히 하는 실수 - 자책을 멈추는 법`,
    body: (t, b) => `## ${t.type} ${t.nickname}${iGa(t.type)} ${b.domain}에서 가장 자주 빠지는 함정

${t.commonMistake.split('\n\n').slice(0, 2).join('\n\n')}

## 어떻게 벗어날까

이 패턴은 ${t.type}의 단점이 아니라 강점의 그림자입니다. 강점을 살리면서 패턴만 끊는 방법이 단행본에 정리되어 있습니다.

핵심 한 줄: **${t.keyTakeaway}**

## 다음 시도

${t.type}에게는 ${getRec(t.recommended[0])}이 약이 될 가능성이 큽니다. ${getWhy(t.recommended[0]).substring(0, 180)}...
`,
  },
  // 4. 플랜 (90/100일 적용)
  {
    id: 'plan',
    title: (t, b) => `${t.type} 위한 ${b.duration}일 ${b.domain} 적용 플랜`,
    body: (t, b) => `## ${t.type} ${t.nickname}을 위한 ${b.duration}일 ${b.domain} 운영체계

${t.intro.slice(0, 1).join('\n\n')}

## ${b.duration}일 단계별 플랜 (요약)

**1단계 (1~30일)**: 본성과 가장 맞는 방식 1가지부터 — ${getRec(t.recommended[0])}

${getHow(t.recommended[0]).substring(0, 200)}...

**2단계 (31~60일)**: 한 가지가 일상이 되면 두 번째 추가 — ${getRec(t.recommended[1])}

**3단계 (61~${b.duration}일)**: 자기 패턴 분석 + 조정

각 단계별 구체적 워크시트와 측정 도구는 단행본 4부에서 다룹니다.

## 핵심 원칙

> ${t.keyTakeaway}
`,
  },
  // 5. 한 줄 처방
  {
    id: 'oneline',
    title: (t, b) => `${t.type} ${b.domain} 한 줄 처방 - 평생 가는 ${b.domain}의 시작`,
    body: (t, b) => `## ${t.type}에게 ${b.domain}${eunNeun(b.domain)}

${t.intro.slice(0, 1).join('\n\n')}

## 한 줄 처방

> ${t.keyTakeaway}

## 이 한 줄이 의미하는 것

${t.howToRead ? t.howToRead.slice(0, 2).join('\n\n') : t.intro.slice(1, 3).join('\n\n')}

## 다음 단계

${t.type}에게 ${b.domain} 운영체계의 출발점은 **${getRec(t.recommended[0])}** 입니다. ${getWhy(t.recommended[0]).substring(0, 150)}...
`,
  },
  // 6. 페르소나 (사례)
  {
    id: 'persona',
    title: (t, b) => `30대 ${t.type}이 본 ${b.domain} - 사례로 배우는 성향별 처방`,
    body: (t, b) => `## ${t.type} ${t.nickname}의 사례

${t.intro.slice(0, 1).join('\n\n')}

${t.intro.length >= 3 ? t.intro[2] : t.intro.slice(1).join('\n\n')}

## 무엇이 달랐는가

이 사례에서 가장 중요한 지점은 ${t.type}이 다른 유형과 다른 도파민·동기 메커니즘을 가졌다는 사실입니다. 같은 ${b.domain} 방식이 다른 유형에 효과적이어도 ${t.type}에는 안 통할 수 있습니다.

## ${t.type}이 시도해야 할 방향

${getRec(t.recommended[0])} — ${getWhy(t.recommended[0]).substring(0, 180)}...

전체 5가지 추천과 ${b.duration}일 적용 플랜은 단행본 3부에서 다룹니다.

## 기억할 한 줄

> ${t.keyTakeaway}
`,
  },
  // 7. 비교 (다른 유형 vs)
  {
    id: 'compare',
    title: (t, b) => {
      const pair = pairOf(t.type);
      return `${t.type} vs ${pair} ${b.domain} 차이 - 같은 ${b.domain} 다른 결과`;
    },
    body: (t, b) => {
      const pairCode = pairOf(t.type);
      return `## ${t.type}와 ${pairCode}는 ${b.domain}에서 정반대

같은 ${b.domain} 방식이 ${t.type}에게는 약이 되고 ${pairCode}에게는 독이 됩니다. 또는 그 반대입니다.

## ${t.type} ${t.nickname}의 성향

${t.intro.slice(0, 2).join('\n\n')}

## ${t.type}에게 약이 되는 ${b.domain}

**${getRec(t.recommended[0])}**

${getWhy(t.recommended[0]).substring(0, 200)}...

## ${pairCode}와 어떻게 다른가

${pairCode}는 ${t.type}과 정보 처리·결정 방식이 다른 유형입니다. ${b.domain}에서도 흥미·동기·실패 패턴이 완전히 다릅니다. 자세한 비교 표는 단행본 2부 5장 "같은 ${b.domain === '자기계발서' ? '책' : (b.domain === '다이어트' ? '식단' : (b.domain === '공부법' ? '강의' : '소개팅'))}, 네 가지 다른 반응"에서 다룹니다.

## 핵심

> ${t.keyTakeaway}
`;
    },
  },

  // ───── 연애책 전용 변형 (loveOnly) — 검색량 큰 주제 ─────
  // 8. 호감 신호 (좋아할 때 행동)
  {
    id: 'crush', loveOnly: true,
    title: (t) => `${t.type} 호감 신호 - ${t.type}${iGa(t.type)} 좋아할 때 보이는 행동`,
    summary: (t, x) => `${t.type}(${t.nickname})은 좋아하는 사람에게 ${(x.crushSignals[0]||'').replace(/[#>*]/g,'').substring(0, 80)}... 단, 호감 신호는 확대해석하지 말고 정중히 직접 확인하는 것이 가장 정확합니다.`,
    body: (t, b, x) => `## ${t.type} ${t.nickname}${eunNeun(t.type)} 좋아할 때 어떤 행동을 할까?

${x.crushSignals.join('\n\n')}

## ${t.type}에게 다가가는 법

${x.attract.slice(0, 2).join('\n\n')}
`,
    faq: (t, x) => [
      { q: `${t.type}가 나를 좋아하는지 어떻게 알 수 있나요?`, a: (x.crushSignals[0]||'').replace(/\n/g,' ').substring(0, 220) },
      { q: `${t.type}에게 어떻게 다가가야 하나요?`, a: (x.attract[0]||'').replace(/\n/g,' ').substring(0, 220) },
      { q: `호감 신호가 확실하지 않을 때는요?`, a: '호감 신호는 사람마다 다르게 나타나므로 확대해석은 금물입니다. 마음이 궁금하면 정중하게 직접 물어보는 것이 가장 정확하고 건강합니다. 상대가 거리를 원하면 존중하세요.' },
    ],
  },
  // 9. 연락 스타일
  {
    id: 'contact', loveOnly: true,
    title: (t) => `${t.type} 연락 스타일 - 읽씹·잠수·연락 빈도의 진짜 이유`,
    summary: (t, x) => `${t.type}(${t.nickname})의 연락 패턴: ${(x.contactStyle[0]||'').replace(/[#>*]/g,'').substring(0, 90)}...`,
    body: (t, b, x) => `## ${t.type} ${t.nickname}의 연락 스타일

${x.contactStyle.join('\n\n')}

## 오해하지 말아야 할 것

${t.type}의 연락 방식은 애정의 크기와 다를 수 있습니다. 연락 빈도만으로 마음을 판단하기보다, ${t.type}의 성향을 이해하고 서로 편한 연락 리듬을 대화로 맞추는 것이 좋습니다.
`,
    faq: (t, x) => [
      { q: `${t.type}가 연락이 뜸한데 관심이 없는 건가요?`, a: (x.contactStyle[0]||'').replace(/\n/g,' ').substring(0, 220) },
      { q: `${t.type}와 연락 빈도를 맞추려면?`, a: `${t.type}의 연락 성향을 이해하고, 서로 편안한 리듬을 솔직하게 대화로 정하는 것이 가장 좋습니다.` },
    ],
  },
  // 10. 꼬시는 법 (호감 주는 법)
  {
    id: 'attract', loveOnly: true,
    title: (t) => `${t.type} 꼬시는 법? ${t.type} 마음 여는 진짜 방법 - MBTI 연애`,
    summary: (t, x) => `${t.type}(${t.nickname})에게 진정성 있게 다가가는 법. 조작이 아니라 ${t.type}이 편안함을 느끼는 방식으로 호감을 표현하는 것이 핵심입니다.`,
    body: (t, b, x) => `## ${t.type} ${t.nickname}에게 다가가는 진짜 방법

이 글은 "기술로 사람을 꼬시는 법"이 아닙니다. ${t.type}이 편안함과 호감을 느끼는 방식, 그리고 피해야 할 접근을 정리한 것입니다. 모든 관계의 전제는 상대의 동의와 존중입니다.

${x.attract.join('\n\n')}

## ${t.type}이 부담을 느끼는 접근

${t.avoid.slice(0, 2).map(a => `- ${a.split('—')[0].trim()}`).join('\n')}
`,
    faq: (t, x) => [
      { q: `${t.type}에게 호감을 주려면 어떻게 해야 하나요?`, a: (x.attract[0]||'').replace(/\n/g,' ').substring(0, 220) },
      { q: `${t.type}가 부담스러워하는 행동은?`, a: `${t.type}은 ${(t.avoid[0]||'').split('—')[0].trim()} 같은 방식에 부담을 느낄 수 있습니다. 진정성 있고 상대의 속도를 존중하는 접근이 좋습니다.` },
      { q: `상대 마음을 확실히 알려면?`, a: '어떤 기술보다 정중하게 직접 마음을 표현하고 묻는 것이 가장 정확합니다. 상대가 원치 않으면 존중하는 것이 건강한 관계의 시작입니다.' },
    ],
  },
  // 11. 데이트 스타일
  {
    id: 'datestyle', loveOnly: true,
    title: (t) => `${t.type} 데이트 스타일 - ${t.type}${iGa(t.type)} 좋아하는 데이트`,
    summary: (t, x) => `${t.type}(${t.nickname})이 좋아하는 데이트: ${(x.dateStyle[0]||'').replace(/[#>*]/g,'').substring(0, 90)}...`,
    body: (t, b, x) => `## ${t.type} ${t.nickname}이 좋아하는 데이트

${x.dateStyle.join('\n\n')}

## ${t.type}과 데이트할 때 기억할 것

${t.type}의 성향을 존중하는 데이트가 관계를 깊게 만듭니다. 다만 데이트 취향도 사람마다 다르니, 상대에게 직접 무엇을 좋아하는지 물어보는 것이 가장 확실합니다.
`,
    faq: (t, x) => [
      { q: `${t.type}와 첫 데이트는 어디가 좋나요?`, a: (x.dateStyle[0]||'').replace(/\n/g,' ').substring(0, 220) },
    ],
  },
  // 12. 궁합
  {
    id: 'compat', loveOnly: true,
    title: (t) => `${t.type} 궁합 - ${t.type}와 잘 맞는 유형과 노력이 필요한 유형`,
    summary: (t, x) => `${t.type}(${t.nickname})과 잘 통하는 경향: ${x.compatibility.best.join('·')} / 노력이 필요한 경향: ${x.compatibility.growth.join('·')}. 단 궁합은 절대적 기준이 아닙니다.`,
    body: (t, b, x) => `## ${t.type} ${t.nickname}의 연애 궁합

${x.compatibility.note}

## ${t.type}과 잘 통하는 경향의 유형

**${x.compatibility.best.join(', ')}**

${x.compatibility.bestReason}

## ${t.type}과 노력이 필요한 경향의 유형

**${x.compatibility.growth.join(', ')}**

${x.compatibility.growthReason}

## 궁합보다 중요한 것

MBTI 궁합표는 재미와 이해의 출발점입니다. 궁합이 좋아도 노력 없이 좋은 관계가 되지 않고, 궁합이 나빠도 서로를 존중하면 행복한 커플이 됩니다. 사람을 유형으로 거르지 마세요.
`,
    faq: (t, x) => [
      { q: `${t.type}와 가장 잘 맞는 MBTI는?`, a: `${t.type}은 ${x.compatibility.best.join(', ')} 유형과 잘 통하는 경향이 있습니다. ${x.compatibility.bestReason}` },
      { q: `${t.type}와 안 맞는 MBTI도 사귈 수 있나요?`, a: `네. ${x.compatibility.growth.join(', ')} 등과는 차이가 있을 수 있지만, 서로의 다름을 존중하고 대화하면 충분히 좋은 관계가 됩니다. 궁합은 절대적이지 않습니다.` },
    ],
  },
];

// 비교용 페어 (반대 유형)
function pairOf(code) {
  const flip = {I:'E',E:'I',N:'S',S:'N',F:'T',T:'F',J:'P',P:'J'};
  return code.split('').map(c => flip[c] || c).join('');
}

// YAML 안전 이스케이프
function yamlStr(s) {
  return '"' + String(s).replace(/\\/g,'').replace(/"/g, "'").replace(/\n/g,' ').trim() + '"';
}

// ── 글 생성 ──────────────────────
function buildPost(type, book, variant, postIndex) {
  const dateStr = new Date(BASE_DATE.getTime() + postIndex * 24 * 3600 * 1000).toISOString().split('T')[0];
  const extra = LOVE_EXTRA_BY_TYPE[type.type] || null;
  const title = variant.title(type, book, extra);
  const body = variant.body(type, book, extra);
  const description = body.replace(/[#>*`\[\]\n]/g, ' ').substring(0, 150).trim() + '...';
  const summary = variant.summary ? variant.summary(type, extra) : '';
  const faqItems = (variant.faq && extra) ? variant.faq(type, extra) : [];

  const tags = [
    'MBTI', book.domain, type.type, type.nickname,
    `${type.type} ${book.domain}`, `MBTI ${book.domain}`,
    '16유형', '성격별', variant.id,
  ];
  // 연애 변형은 검색 키워드 태그 보강
  if (variant.loveOnly) {
    const kwMap = { crush: '호감 신호', contact: '연락 스타일', attract: '꼬시는 법', datestyle: '데이트', compat: '궁합' };
    tags.push(`${type.type} ${kwMap[variant.id]}`, `${type.type} 연애`);
  }

  // FAQ front matter (post.html에서 JSON-LD FAQPage 생성용)
  let faqYaml = '';
  if (faqItems.length > 0) {
    faqYaml = '\nfaq:\n' + faqItems.map(qa => `  - q: ${yamlStr(qa.q)}\n    a: ${yamlStr(qa.a)}`).join('\n');
  }

  const frontMatter = `---
layout: post
title: ${yamlStr(title)}
date: ${dateStr} 10:00:00 +0900
categories: [${book.category}]
tags: [${tags.map(t => `"${t.replace(/"/g,"'")}"`).join(', ')}]
description: ${yamlStr(description)}
keywords: "${book.seoKeywords.concat([`${type.type} ${book.domain}`, `${type.nickname} ${book.domain}`]).join(', ')}"
book_title: "${book.title}"
book_url: "${book.bookUrl}"
buy_url: "${book.buyUrl}"
type_code: "${type.type}"
type_nickname: "${type.nickname}"
variant: "${variant.id}"${summary ? `\nsummary: ${yamlStr(summary)}` : ''}${faqYaml}
---`;

  // FAQ 본문 렌더링 (사람이 읽는 섹션 — JSON-LD와 별개)
  let faqSection = '';
  if (faqItems.length > 0) {
    faqSection = '\n\n<div class="faq">\n<h2>자주 묻는 질문 (FAQ)</h2>\n' +
      faqItems.map(qa => `<div class="faq-item"><div class="faq-q">${qa.q}</div><div class="faq-a">${qa.a}</div></div>`).join('\n') +
      '\n</div>\n';
  }

  return frontMatter + '\n' + body + faqSection + seriesLinks() + buildAffiliateBlock(type, book);
}

// ── 메인 ──────────────────────────
function main() {
  // 기존 포스트 삭제 (재생성)
  if (fs.existsSync(POSTS_DIR)) {
    for (const f of fs.readdirSync(POSTS_DIR)) {
      if (f.endsWith('.md')) fs.unlinkSync(path.join(POSTS_DIR, f));
    }
  } else {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const order = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
  let postIndex = 0;
  let count = 0;

  // 책 데이터 미리 로드
  const bookTypes = {};
  for (const book of BOOKS) {
    const data = loadBook(book.bookPath);
    const map = {};
    for (const t of data) map[t.type] = t;
    bookTypes[book.id] = map;
  }

  // 책별 발행 큐 생성 (변형-메이저: recommend 먼저, 유형 순서)
  const queues = {};
  for (const book of BOOKS) {
    const q = [];
    for (let v = 0; v < VARIANTS.length; v++) {
      const variant = VARIANTS[v];
      if (variant.loveOnly && book.id !== 'love') continue;
      for (const code of order) {
        const type = bookTypes[book.id][code];
        if (!type) continue;
        if (variant.loveOnly && !LOVE_EXTRA_BY_TYPE[code]) continue;
        q.push({ book, type, variant, code });
      }
    }
    queues[book.id] = q;
  }

  // 라운드로빈: 자기계발→다이어트→공부법→연애→자기계발... 순으로 하루 1편씩
  // (첫 4일 안에 4개 카테고리 모두 노출, 책 소진 시 스킵)
  const bookIds = BOOKS.map(b => b.id);
  const cursor = {};
  for (const id of bookIds) cursor[id] = 0;
  let remaining = Object.values(queues).reduce((s, q) => s + q.length, 0);

  while (remaining > 0) {
    for (const id of bookIds) {
      const q = queues[id];
      if (cursor[id] >= q.length) continue; // 이 책 소진
      const item = q[cursor[id]++];
      remaining--;

      const md = buildPost(item.type, item.book, item.variant, postIndex);
      const dateStr = new Date(BASE_DATE.getTime() + postIndex * 24 * 3600 * 1000).toISOString().split('T')[0];
      const slug = `${SLUG_BASE[item.code]}-${item.book.id}-${item.variant.id}`;
      fs.writeFileSync(path.join(POSTS_DIR, `${dateStr}-${slug}.md`), md);
      postIndex++;
      count++;
    }
  }

  const endDate = new Date(BASE_DATE.getTime() + (postIndex - 1) * 24 * 3600 * 1000);
  console.log(`✓ ${count}편 생성 완료`);
  console.log(`기간: ${BASE_DATE.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`);
  const generic = VARIANTS.filter(v => !v.loveOnly).length;
  const loveOnly = VARIANTS.filter(v => v.loveOnly).length;
  console.log(`(일반 ${generic}변형×${BOOKS.length}권 + 연애전용 ${loveOnly}변형×1권) × ${order.length}유형`);
}

main();
