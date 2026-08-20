import { useState, useEffect, useMemo } from 'react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('holes'); // 'holes' | 'ranking' | 'todo'
  const [serverTime, setServerTime] = useState('');
  
  // 1. 심층 구멍 & 결계 데이터
  const [holeData, setHoleData] = useState({
    barrier: {
      isActive: false,
      remainMinutes: 38,
      nextSchedule: '21:00',
      info: '매시간 정각 출현 (결계 내 네임드 몬스터 등장)'
    },
    holes: [
      { id: 1, type: '심층 구멍', zone: '두갈드 아일', channel: 'Ch. 3', remainTime: '14분 남음', reporter: 'GG길마', verified: true },
      { id: 2, type: '어비스 구멍', zone: '티르 코네일', channel: 'Ch. 7', remainTime: '08분 남음', reporter: '칼릭스용병', verified: true },
      { id: 3, type: '심층 구멍', zone: '가이레흐 언덕', channel: 'Ch. 1', remainTime: '22분 남음', reporter: '음유시인', verified: false },
      { id: 4, type: '심층 구멍', zone: '센마이 평원', channel: 'Ch. 5', remainTime: '29분 남음', reporter: '나오의가호', verified: true },
    ]
  });

  // 2. 공식 랭킹 데이터
  const [rankings, setRankings] = useState([]);
  const [rankType, setRankType] = useState('1'); // 1: 전투력, 2: 매력, 3: 생활력
  const [selectedServer, setSelectedServer] = useState('전체');
  const [searchName, setSearchName] = useState('');
  const [rankLoading, setRankLoading] = useState(false);

  // 3. 일일 숙제 상태
  const [todos, setTodos] = useState([
    { id: 1, text: '길드 출석 체크 & 길드 코인 기부 (3회)', done: true },
    { id: 2, text: '심층 구멍 / 결계 네임드 몬스터 처치', done: true },
    { id: 3, text: '일일 던전 티켓 소진 (3/3)', done: false },
    { id: 4, text: '어비스 레이드 파티 참여', done: false },
    { id: 5, text: '생활력 채집 및 제작 피로도 소진', done: false },
  ]);

  // 실시간 시계 작동
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setServerTime(now.toLocaleTimeString('ko-KR', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 랭킹 API 로드
  const fetchRankings = async (type) => {
    setRankLoading(true);
    try {
      const res = await fetch(`/api/ranking?type=${type}`);
      const json = await res.json();
      setRankings(json.data || []);
    } catch {
      // 로컬 테스트용 Mock 데이터
      setRankings([
        { rank: 1, server: '데이안', characterName: '명종', jobClass: '힐러', statValue: '294,061' },
        { rank: 2, server: '데이안', characterName: '김코딱코', jobClass: '빙결술사', statValue: '249,708' },
        { rank: 3, server: '데이안', characterName: '체리이이이', jobClass: '빙결술사', statValue: '212,357' },
        { rank: 4, server: '데이안', characterName: '웰시P.', jobClass: '석궁사수', statValue: '208,741' },
        { rank: 5, server: '데이안', characterName: '파이어뚜지', jobClass: '화염술사', statValue: '201,941' },
        { rank: 6, server: '아이라', characterName: '윈드밀', jobClass: '전격술사', statValue: '198,200' },
        { rank: 7, server: '던컨', characterName: '칼날', jobClass: '검술사', statValue: '195,430' },
      ]);
    } finally {
      setRankLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(rankType);
  }, [rankType]);

  const filteredRankings = useMemo(() => {
    return rankings.filter(r => {
      const matchServer = selectedServer === '전체' || r.server === selectedServer;
      const matchSearch = r.characterName.toLowerCase().includes(searchName.toLowerCase()) || r.jobClass.includes(searchName);
      return matchServer && matchSearch;
    });
  }, [rankings, selectedServer, searchName]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const todoDoneCount = todos.filter(t => t.done).length;

  return (
    <div>
      {/* 1. 상단 글로벌 네비게이션 */}
      <nav className="global-nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="brand-badge">GG</span>
            <span className="brand-name">MabiMobi Archive</span>
          </div>
          <div className="server-clock">
            <span className="live-indicator"></span>
            <span>SERVER TIME : {serverTime || '00:00:00'}</span>
          </div>
        </div>
      </nav>

      <div className="app-container">
        {/* 2. 대시보드 요약 위젯 */}
        <section className="summary-grid">
          <div className="widget-card widget-glow-barrier">
            <div className="widget-header">
              <span className="widget-title">DIMENSIONAL BARRIER</span>
              <span className="widget-badge-red">NEXT EVENT</span>
            </div>
            <div className="widget-body">
              <h2>불길한 소환의 결계</h2>
              <p>{holeData.barrier.info}</p>
              <div className="timer-large">
                {holeData.barrier.nextSchedule} <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>({holeData.barrier.remainMinutes}분 후)</span>
              </div>
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title">DAILY QUESTS</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold-400)', fontWeight: 700 }}>
                {todoDoneCount} / {todos.length} COMPLETED
              </span>
            </div>
            <div className="widget-body">
              <h2>길드원 일일 숙제</h2>
              <div className="progress-container">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(todoDoneCount / todos.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 탭 바 */}
        <div className="tab-wrapper">
          <button 
            className={`tab-btn ${activeTab === 'holes' ? 'active' : ''}`}
            onClick={() => setActiveTab('holes')}
          >
            🌀 심층/어비스 구멍 제보
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            🏆 공식 실시간 랭킹
          </button>
          <button 
            className={`tab-btn ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            ✅ 일일 체크리스트
          </button>
        </div>

        {/* 4. 탭 콘텐츠 영역 */}
        {activeTab === 'holes' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">실시간 사냥터 구멍 현황</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                30초마다 자동 갱신됩니다
              </span>
            </div>

            <div className="holes-grid">
              {holeData.holes.map(hole => (
                <div key={hole.id} className={`hole-item-card ${hole.type === '심층 구멍' ? 'deep' : 'abyss'}`}>
                  <div className="hole-item-head">
                    <span className="hole-tag">{hole.type}</span>
                    <span className="hole-timer">⏳ {hole.remainTime}</span>
                  </div>
                  <div className="hole-item-body">
                    <span className="zone-title">{hole.zone}</span>
                    <span className="channel-pill">{hole.channel}</span>
                  </div>
                  <div className="hole-item-foot">
                    <span>제보: {hole.reporter}</span>
                    {hole.verified && <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ 확인완료</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="panel">
            <div className="panel-header">
              <div className="segmented-group">
                <button 
                  className={`seg-btn ${rankType === '1' ? 'active' : ''}`} 
                  onClick={() => setRankType('1')}
                >
                  전투력
                </button>
                <button 
                  className={`seg-btn ${rankType === '2' ? 'active' : ''}`} 
                  onClick={() => setRankType('2')}
                >
                  매력
                </button>
                <button 
                  className={`seg-btn ${rankType === '3' ? 'active' : ''}`} 
                  onClick={() => setRankType('3')}
                >
                  생활력
                </button>
              </div>

              <div className="filter-row">
                <select 
                  className="input-clean" 
                  value={selectedServer} 
                  onChange={(e) => setSelectedServer(e.target.value)}
                >
                  <option value="전체">전체 서버</option>
                  <option value="데이안">데이안</option>
                  <option value="아이라">아이라</option>
                  <option value="던컨">던컨</option>
                  <option value="알리사">알리사</option>
                  <option value="메이븐">메이븐</option>
                </select>

                <input 
                  type="text" 
                  className="input-clean" 
                  placeholder="캐릭터명 / 클래스 검색"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>

            <div className="mobi-table-wrapper">
              <table className="mobi-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>순위</th>
                    <th>서버</th>
                    <th>캐릭터명</th>
                    <th>클래스</th>
                    <th style={{ textAlign: 'right' }}>
                      {rankType === '1' ? '전투력' : rankType === '2' ? '매력 점수' : '생활 점수'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankLoading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        데이터를 집계하고 있습니다...
                      </td>
                    </tr>
                  ) : filteredRankings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        일치하는 랭커 정보가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredRankings.map((r) => (
                      <tr key={r.rank}>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`rank-num rank-${r.rank}`}>{r.rank}</span>
                        </td>
                        <td><span className="pill-server">{r.server}</span></td>
                        <td className="char-cell">{r.characterName}</td>
                        <td><span className="pill-job">{r.jobClass}</span></td>
                        <td style={{ textAlign: 'right' }} className="stat-cell">{r.statValue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">오늘의 에린 일일 숙제</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                매일 오전 06시 초기화
              </span>
            </div>

            <div className="checklist">
              {todos.map(todo => (
                <label key={todo.id} className={`check-item ${todo.done ? 'done' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={todo.done} 
                    onChange={() => toggleTodo(todo.id)} 
                  />
                  <span>{todo.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <footer className="global-footer">
          <p>© 2026 MabiMobi GG Guild Companion · Data synced with Official Nexon Services</p>
        </footer>
      </div>
    </div>
  );
}