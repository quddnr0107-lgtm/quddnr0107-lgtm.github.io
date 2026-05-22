// 48편 자동 글 생성: 3권 × 16유형
// 각 글은 원문 발췌 + 본문 일부 + 책 구매 유도 CTA
// 사용법: node generate_posts.js

const fs = require('fs');
const path = require('path');
const COUPANG = require('./coupang_config.js');

const POSTS_DIR = path.join(__dirname, '_posts');
const BASE_DATE = new Date('2026-05-22');

// ── 쿠팡 파트너스 affiliate 블록 빌드 ─────────────
function buildAffiliateBlock(type, book) {
  if (!COUPANG.enabled) return '';

  // recommended 책/방식 이름 추출
  const items = type.recommended.slice(0, COUPANG.maxBooks).map(r => {
    const heading = r.method || r.book || r.name || r.title || '';
    // 책 제목만 추출 (괄호 안 저자·출판사 제거: "에센셜리즘 (그렉 맥커운, 알에이치코리아)" → "에센셜리즘")
    const cleanTitle = heading.split('(')[0].trim();
    return cleanTitle;
  }).filter(Boolean);

  if (items.length === 0) return '';

  // 쿠팡 검색 URL 생성
  // 형식: https://www.coupang.com/np/search?q=<인코딩된 키워드>&channel=user
  // affiliate ID는 URL 끝에 ?lptag= 또는 subId= 형태로 붙음 (쿠팡 파트너스 가이드)
  function affiliateLink(keyword) {
    const q = encodeURIComponent(keyword);
    let url = `https://www.coupang.com/np/search?q=${q}&channel=user`;
    if (COUPANG.affiliateId) {
      url += `&lptag=${encodeURIComponent(COUPANG.affiliateId)}&subId=${encodeURIComponent(COUPANG.channelName || '')}`;
    }
    return url;
  }

  const isBookDomain = book.domain === '자기계발서';
  const blockTitle = isBookDomain ? '📚 이 책 쿠팡에서 보기' : `🛒 ${book.domain} 도구 쿠팡에서 보기`;
  // 시각적으로 쿠팡 링크임을 강조하는 HTML 블록 생성
  const linksHtml = items.map(t => {
    const url = affiliateLink(t);
    return `<a href="${url}" target="_blank" rel="nofollow sponsored noopener" class="coupang-btn">
  <span class="coupang-tag">쿠팡</span>
  <span class="coupang-title">${t}</span>
  <span class="coupang-arrow">최저가 보기 →</span>
</a>`;
  }).join('\n');

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

// 영문 타입 슬러그 매핑 (URL 안전)
const SLUG_BASE = {
  INTJ: 'intj', INTP: 'intp', ENTJ: 'entj', ENTP: 'entp',
  INFJ: 'infj', INFP: 'infp', ENFJ: 'enfj', ENFP: 'enfp',
  ISTJ: 'istj', ISFJ: 'isfj', ESTJ: 'estj', ESFJ: 'esfj',
  ISTP: 'istp', ISFP: 'isfp', ESTP: 'estp', ESFP: 'esfp',
};

// 3권 메타 정의
const BOOKS = [
  {
    id: 'self-help',
    title: 'ENFP에게 아주 작은 습관의 힘을 권하지 마라',
    sub: 'MBTI 16유형 자기계발서 처방전',
    category: '자기계발',
    bookPath: '../mbti_book',
    domain: '자기계발서',
    duration: 90,
    bookUrl: '/book/self-help/',
    buyUrl: 'https://bookk.co.kr/bookStore/6a0d32a8a55d20e8b2669245',
    seoKeywords: ['MBTI 자기계발', '성격별 자기계발서', '16유형 책 추천'],
  },
  {
    id: 'diet',
    title: 'INFP에게 헬스장 PT를 권하지 마라',
    sub: 'MBTI 16유형 다이어트 처방전',
    category: '다이어트',
    bookPath: '../mbti_diet_book',
    domain: '다이어트',
    duration: 90,
    bookUrl: '/book/diet/',
    buyUrl: 'https://bookk.co.kr/bookStore/6a0d3290b5f25301484081dd',
    seoKeywords: ['MBTI 다이어트', '성격별 다이어트', '16유형 다이어트'],
  },
  {
    id: 'study',
    title: 'ESTJ에게 자기주도학습을 권하지 마라',
    sub: 'MBTI 16유형 공부법 처방전',
    category: '공부법',
    bookPath: '../mbti_study_book',
    domain: '공부법',
    duration: 100,
    bookUrl: '/book/study/',
    buyUrl: 'https://bookk.co.kr/bookStore/6a0d36a85a907e440c66ae05',
    seoKeywords: ['MBTI 공부법', '성격별 공부법', '16유형 공부법'],
  },
];

// 모든 책 데이터 로드
function loadBook(bookPath) {
  // mbti_book uses NT_DATA/..., mbti_diet_book/mbti_study_book use MBTI_NT/...
  const nt = require(path.join(bookPath, 'content_mbti_nt.js'));
  const nf = require(path.join(bookPath, 'content_mbti_nf.js'));
  const sj = require(path.join(bookPath, 'content_mbti_sj.js'));
  const sp = require(path.join(bookPath, 'content_mbti_sp.js'));
  const get = (m) => m.MBTI_NT || m.MBTI_NF || m.MBTI_SJ || m.MBTI_SP || m.NT_DATA || m.NF_DATA || m.SJ_DATA || m.SP_DATA;
  return [...get(nt), ...get(nf), ...get(sj), ...get(sp)];
}

// 글 본문 마크다운 생성 (책 본문 발췌 + 미공개 부분 차단)
function buildPostMarkdown(type, book, postIndex) {
  const dateStr = new Date(BASE_DATE.getTime() + postIndex * 12 * 3600 * 1000)
    .toISOString().split('T')[0];

  // intro 첫 2문단만 발췌 (전문 노출 방지)
  const introExcerpt = type.intro.slice(0, 2).join('\n\n');

  // avoid 5개 중 첫 3개만 노출 (티저)
  const avoidTeaser = type.avoid.slice(0, 3).map(a => `- ${a}`).join('\n');

  // recommended 5개 중 첫 2개의 method/book/name·why만 노출
  // mbti_book uses r.book, mbti_diet_book/mbti_study_book use r.method
  const recTeaser = type.recommended.slice(0, 2).map(r => {
    const heading = r.method || r.book || r.name || r.title || '';
    return `### ${heading}\n\n${r.why}`;
  }).join('\n\n');

  const unitWord = book.domain === '자기계발서' ? '책 5권' : '방식 5가지';
  const seoTitle = `${type.type} ${type.nickname}에게 추천하는 ${book.domain} ${unitWord} - MBTI ${book.domain} 처방`;
  const description = (introExcerpt.substring(0, 150) + '...').replace(/\n/g, ' ');

  const tags = [
    'MBTI', book.domain, type.type, type.nickname,
    `${type.type} ${book.domain}`, `MBTI ${book.domain}`,
    '16유형', '성격별',
  ];

  // YAML front matter
  const frontMatter = `---
layout: post
title: "${seoTitle}"
date: ${dateStr} 10:00:00 +0900
categories: [${book.category}]
tags: [${tags.map(t => `"${t}"`).join(', ')}]
description: "${description.replace(/"/g, "'")}"
keywords: "${book.seoKeywords.concat([`${type.type} ${book.domain}`, `${type.nickname} ${book.domain}`]).join(', ')}"
book_title: "${book.title}"
book_url: "${book.bookUrl}"
buy_url: "${book.buyUrl}"
type_code: "${type.type}"
type_nickname: "${type.nickname}"
---`;

  const body = `
## ${type.type} ${type.nickname}의 ${book.domain} 성향

${introExcerpt}

## 이 유형이 거부감을 느끼는 ${book.domain} 방식 (일부)

${avoidTeaser}

> 위 3가지는 ${type.type}이 가장 자주 무너지는 방식의 일부입니다. 전체 5가지는 단행본에서 확인할 수 있습니다.

## 이 유형에게 약이 되는 ${book.domain} 방식 (티저)

${recTeaser}

> 나머지 3가지 방식과 각 방식의 활용법, 그리고 ${book.duration}일 지속 플랜은 단행본에서 만나보세요.

## 흔한 실수

${type.commonMistake.split('\n\n')[0]}

## 기억할 한 줄

> ${type.keyTakeaway}

## 시리즈 다른 권에서 ${type.type} 처방 보기

- [ENFP에게 아주 작은 습관의 힘을 권하지 마라 (자기계발서)](/book/self-help/)
- [INFP에게 헬스장 PT를 권하지 마라 (다이어트)](/book/diet/)
- [ESTJ에게 자기주도학습을 권하지 마라 (공부법)](/book/study/)
${buildAffiliateBlock(type, book)}`;

  return frontMatter + body;
}

// 메인 실행
function main() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  let postIndex = 0;
  const order = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

  for (const book of BOOKS) {
    const bookData = loadBook(book.bookPath);
    const byType = {};
    for (const t of bookData) byType[t.type] = t;

    for (const code of order) {
      const type = byType[code];
      if (!type) { console.warn(`MISSING: ${book.id}/${code}`); continue; }

      const slug = `${SLUG_BASE[code]}-${book.id}`;
      const dateStr = new Date(BASE_DATE.getTime() + postIndex * 12 * 3600 * 1000)
        .toISOString().split('T')[0];
      const filename = `${dateStr}-${slug}.md`;
      const filepath = path.join(POSTS_DIR, filename);

      const md = buildPostMarkdown(type, book, postIndex);
      fs.writeFileSync(filepath, md);
      console.log(`✓ ${filename}`);
      postIndex++;
    }
  }

  console.log(`\n총 ${postIndex}편 생성 완료`);
}

main();
