// functions/api/ranking.js
export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const type = searchParams.get('type') || '1'; // 1: 전투력, 2: 매력, 3: 생활력
  const server = searchParams.get('server') || '데이안';

  try {
    const targetUrl = `https://mabinogimobile.nexon.com/Ranking/List?t=${type}`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9'
      }
    });

    if (!res.ok) {
      throw new Error(`Nexon Response Status: ${res.status}`);
    }

    const html = await res.text();
    const rankings = [];

    // 정규식 기반 HTML 랭킹 파싱
    const rowRegex = /(\d+)위\s*서버명\s*([^\s]+)\s*캐릭터명\s*([^\s]+)\s*클래스\s*([^\s]+)\s*(전투력|종합 점수|매력|생활력)\s*([\d,]+)/g;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      rankings.push({
        rank: parseInt(match[1], 10),
        server: match[2],
        characterName: match[3],
        jobClass: match[4],
        statType: match[5],
        statValue: match[6]
      });
    }

    return new Response(JSON.stringify({
      success: true,
      updatedAt: new Date().toISOString(),
      type,
      data: rankings.length > 0 ? rankings : getFallbackRanking(type)
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // 5분 CDN 캐싱
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: true,
      updatedAt: new Date().toISOString(),
      isFallback: true,
      data: getFallbackRanking(type)
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

// 예비용 Mock 데이터
function getFallbackRanking(type) {
  const statName = type === '1' ? '전투력' : type === '2' ? '매력' : '생활력';
  return [
    { rank: 1, server: '던컨', characterName: '기역기역', jobClass: '대검전사', statType: statName, statValue: '999,999' },
    { rank: 2, server: '데이안', characterName: '김코딱코', jobClass: '빙결술사', statType: statName, statValue: '249,708' },
    { rank: 3, server: '데이안', characterName: '체리이이이', jobClass: '빙결술사', statType: statName, statValue: '212,357' },
    { rank: 4, server: '데이안', characterName: '웰시P.', jobClass: '석궁사수', statType: statName, statValue: '208,741' },
    { rank: 5, server: '데이안', characterName: '파이어뚜지', jobClass: '화염술사', statType: statName, statValue: '201,941' },
    { rank: 6, server: '아이라', characterName: '윈드밀', jobClass: '전격술사', statType: statName, statValue: '198,200' },
    { rank: 7, server: '던컨', characterName: '칼날', jobClass: '검술사', statType: statName, statValue: '195,430' },
  ];
}