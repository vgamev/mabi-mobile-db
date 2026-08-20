// functions/api/holes.js
export async function onRequest(context) {
  const now = new Date();
  
  // 한국 시간(KST) 기준 시간 계산
  const kstOffset = 9 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (kstOffset * 60000));
  
  // 결계: 매시간 정각 출현 (00분~07분 지속)
  const currentMinutes = kst.getMinutes();
  const currentSeconds = kst.getSeconds();
  
  const isBarrierActive = currentMinutes < 7;
  const minutesUntilNextBarrier = isBarrierActive ? 0 : 60 - currentMinutes;
  const secondsUntilNext = (minutesUntilNextBarrier * 60) - currentSeconds;

  // 현재 제보된 심층/어비스 구멍 목록
  const activeHoles = [
    { id: 1, type: '심층 구멍 (심구)', zone: '두갈드 아일', channel: 'Ch. 3', remainTime: '18분 남음', reportedBy: 'GG길마', verified: true },
    { id: 2, type: '어비스 구멍 (어구)', zone: '티르 코네일', channel: 'Ch. 7', remainTime: '9분 남음', reportedBy: '검술사A', verified: true },
    { id: 3, type: '심층 구멍 (심구)', zone: '가이레흐 언덕', channel: 'Ch. 1', remainTime: '24분 남음', reportedBy: '에린모험가', verified: false },
  ];

  return new Response(JSON.stringify({
    barrier: {
      isActive: isBarrierActive,
      remainSeconds: secondsUntilNext,
      nextSchedule: `${(kst.getHours() + (isBarrierActive ? 0 : 1)) % 24}:00`,
      info: '매시간 정각 출현 (3분 후 보스 젠, 총 7분간 유지)'
    },
    holes: activeHoles,
    serverTime: kst.toLocaleTimeString('ko-KR')
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}