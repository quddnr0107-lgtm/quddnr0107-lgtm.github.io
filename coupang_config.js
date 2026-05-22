// 쿠팡 파트너스 설정
// partners.coupang.com 가입 후 본인 추천인 코드 입력

module.exports = {
  // 쿠팡 파트너스 가입 후 발급되는 추천인 ID (예: "AF1234567")
  // 아직 미가입 상태면 비워두기. 그러면 일반 쿠팡 검색 링크만 들어감 (수수료 없음)
  affiliateId: 'AF2582293',

  // 도서 링크에 사용할 트래킹 채널 이름 (자유)
  channelName: 'mbti_book',

  // 의무 고지문 (쿠팡 파트너스 약관 필수)
  disclosure: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',

  // 표시할 책 최대 개수
  maxBooks: 5,

  // 활성화 여부 (false면 affiliate 블록 안 만듦)
  enabled: true,
};
