import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('holes'); // 'holes' | 'ranking' | 'calc'
  
  // 1. 심층 구멍 & 결계 상태
  const [holeData, setHoleData] = useState({ barrier: {}, holes: [], serverTime: '' });
  const [holeLoading, setHoleLoading] = useState(true);

  // 2. 랭킹 상태
  const [rankings, setRankings] = useState([]);
  const [rankType, setRankType] = useState('1'); // 1: 전투력, 2: 매력, 3: 생활력
  const [selectedServer, setSelectedServer] = useState('전체');
  const [rankSearch, setRankSearch] = useState('');
  const [rankLoading, setRankLoading] = useState(false);

  // 심층 구멍 데이터 로드
  const fetchHoles = async () => {
    setHoleLoading(true);
    try {
      const res = await fetch('/api/holes');
      const data = await res.json();
      setHoleData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setHoleLoading(false);
    }
  };

  // 랭킹 데이터 로드
  const fetchRankings = async (type) => {
    setRankLoading(true);
    try {
      const res = await fetch(`/api/ranking?type=${type}`);
      const data = await res.json();
      setRankings(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRankLoading(false);
    }
  };

  useEffect(() => {
    fetchHoles();
    const interval = setInterval(fetchHoles, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'ranking') {
      fetchRankings(rankType);
    }
  }, [activeTab, rankType]);

  // 필터링된 랭킹
  const filteredRankings = rankings.filter(item => {
    const matchServer = selectedServer === '전체' || item.server === selectedServer;
    const matchSearch = item.characterName.includes(rankSearch) || item.jobClass.includes(rankSearch);
    return matchServer && matchSearch;
  });

  return (
    <div className="portal-container">
      {/* 헤더 */}
      <header className="guild-header">
        <div className="header-badge">⚔️ MABINOGI MOBILE : GG GUILD</div>
        <h1 className="guild-title">
          <span className="gold-text">[GG]</span> 마비노기 모바일 정보소
        </h1>
        <p className="guild-motto">실시간 심층구멍 젠 현황 & 공식 랭킹 트래커</p>

        {/* 탭 네비게이션 */}
        <nav className="nav-tabs">
          <button className={activeTab === 'holes' ? 'tab active' : 'tab'} onClick={() => setActiveTab('holes')}>
            🕳️ 심층구멍 & 결계 타이머
          </button>
          <button className={activeTab === 'ranking' ? 'tab active' : 'tab'} onClick={() => setActiveTab('ranking')}>
            🏆 공식 랭킹 실시간 순위
          </button>
          <button className={activeTab === 'notice' ? 'tab active' : 'tab'} onClick={() => setActiveTab('notice')}>
            📜 길드 공지 & 파티
          </button>
        </nav>
      </header>

      <main className="main-content">
        {/* TAB 1: 심층구멍 & 결계 */}
        {activeTab === 'holes' && (
          <div className="tab-section">
            {/* 결계 상태 카드 */}
            <div className="barrier-banner">
              <div className="barrier-info">
                <span className="live-dot"></span>
                <div>
                  <h3>불길한 소환의 결계</h3>
                  <p>{holeData.barrier?.info}</p>
                </div>
              </div>
              <div className="barrier-status">
                {holeData.barrier?.isActive ? (
                  <span className="badge-active">🔥 결계 출현 중! (사냥터 진입)</span>
                ) : (
                  <div className="next-timer">
                    다음 출현: <strong>{holeData.barrier?.nextSchedule}</strong> (약 {Math.floor((holeData.barrier?.remainSeconds || 0) / 60)}분 남음)
                  </div>
                )}
              </div>
            </div>

            {/* 심층/어비스 구멍 실시간 목록 */}
            <div className="glass-card mt-4">
              <div className="card-header-flex">
                <div className="card-title">
                  <span>📍 사냥터 심층/어비스 구멍 실시간 제보</span>
                </div>
                <button className="btn-action" onClick={fetchHoles}>🔄 새로고침</button>
              </div>

              {holeLoading ? (
                <div className="loading-box">구멍 출현 정보를 불러오는 중...</div>
              ) : (
                <div className="hole-grid">
                  {holeData.holes.map(hole => (
                    <div key={hole.id} className={`hole-card ${hole.type.includes('심층') ? 'hole-deep' : 'hole-abyss'}`}>
                      <div className="hole-head">
                        <span className="hole-type">{hole.type}</span>
                        <span className="hole-remain">{hole.remainTime}</span>
                      </div>
                      <div className="hole-body">
                        <h4>{hole.zone}</h4>
                        <span className="channel-tag">{hole.channel}</span>
                      </div>
                      <div className="hole-footer">
                        제보자: {hole.reportedBy} {hole.verified && <span className="verified-check">✓ 인증됨</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 공식 랭킹 실시간 순위 */}
        {activeTab === 'ranking' && (
          <div className="tab-section">
            <div className="ranking-controls">
              <div className="rank-type-btns">
                <button className={rankType === '1' ? 'btn-sub active' : 'btn-sub'} onClick={() => setRankType('1')}>전투력</button>
                <button className={rankType === '2' ? 'btn-sub active' : 'btn-sub'} onClick={() => setRankType('2')}>매력</button>
                <button className={rankType === '3' ? 'btn-sub active' : 'btn-sub'} onClick={() => setRankType('3')}>생활력</button>
              </div>

              <div className="filter-group">
                <select value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)} className="select-dark">
                  <option value="전체">전체 서버</option>
                  <option value="데이안">데이안</option>
                  <option value="아이라">아이라</option>
                  <option value="던컨">던컨</option>
                  <option value="알리사">알리사</option>
                  <option value="메이븐">메이븐</option>
                  <option value="라사">라사</option>
                  <option value="칼릭스">칼릭스</option>
                  <option value="몰리">몰리</option>
                </select>

                <input 
                  type="text" 
                  placeholder="캐릭터명 / 클래스 검색" 
                  value={rankSearch} 
                  onChange={(e) => setRankSearch(e.target.value)} 
                  className="input-dark"
                />
              </div>
            </div>

            <div className="glass-card mt-3">
              {rankLoading ? (
                <div className="loading-box">공식 랭킹 데이터를 집계 중입니다...</div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>순위</th>
                      <th>서버</th>
                      <th>캐릭터명</th>
                      <th>클래스</th>
                      <th style={{ textAlign: 'right' }}>수치 ({rankType === '1' ? '전투력' : rankType === '2' ? '매력' : '생활력'})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRankings.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4">조회된 랭커가 없습니다.</td></tr>
                    ) : (
                      filteredRankings.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`rank-badge rank-${item.rank}`}>
                              {item.rank}
                            </span>
                          </td>
                          <td><span className="server-name">{item.server}</span></td>
                          <td><strong className="char-name">{item.characterName}</strong></td>
                          <td><span className="job-tag">{item.jobClass}</span></td>
                          <td style={{ textAlign: 'right' }} className="stat-num">{item.statValue}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 길드 공지 */}
        {activeTab === 'notice' && (
          <div className="tab-section">
            <div className="glass-card">
              <div className="card-title">📌 GG 길드 공지사항</div>
              <ul className="notice-ul">
                <li>매주 일요일 21:00 결사대 레이드 고정 공격대 운영 중</li>
                <li>심층 구멍 발견 시 상단 탭에서 채널 제보 부탁드립니다!</li>
                <li>일일 길드 기부 3회 및 출석체크는 필수입니다.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}