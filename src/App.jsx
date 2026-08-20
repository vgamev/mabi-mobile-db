import { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- 기본 시드 데이터 ---
const INITIAL_POSTS = [
  {
    id: 1,
    category: 'notice',
    title: '📢 [필독] GG 길드 주간 정기 레이드(결사대) 운영 방침',
    author: '길드마스터',
    date: '2026-08-20',
    views: 142,
    likes: 28,
    isPinned: true,
    content: `안녕하세요, GG 길드원 여러분.\n\n매주 일요일 21:00에 진행되는 결사대 정기 공격대 관련 안내드립니다.\n\n1. 최소 전투력 24,000 이상 세팅 필수\n2. 디스코드 음성 채널 입장(듣기만 해도 무방)\n3. 성수 및 최고급 생명력 포션 30개 이상 지참\n\n불참 시 토요일 자정까지 미리 댓글이나 귓속말 남겨주시기 바랍니다.`
  },
  {
    id: 2,
    category: 'notice',
    title: '📢 길드 영지 기부 3회 및 일일 출석 체크 독려 안내',
    author: '부길마',
    date: '2026-08-19',
    views: 89,
    likes: 15,
    isPinned: false,
    content: '길드 레벨 확장을 위해 매일 영지 기부 3회(골드/루비) 및 출석체크는 꼭 부탁드립니다! 길드 버프 레벨업에 큰 도움이 됩니다.'
  },
  {
    id: 3,
    category: 'free',
    title: '오늘 심구에서 드디어 전설 룬 먹었습니다 ㅠㅠ',
    author: '에린의검귀',
    date: '2026-08-20',
    views: 65,
    likes: 12,
    isPinned: false,
    content: '두갈드 아일 3채널 심층 구멍 제보 보고 달려갔는데 보스 상자에서 [분노의 낙인] 4티어 떴네요... 다들 심구 제보 자주 확인하세요!'
  },
  {
    id: 4,
    category: 'free',
    title: '빙결술사 스킬 트리 및 룬 세팅 질문드립니다',
    author: '뉴비얼음법사',
    date: '2026-08-18',
    views: 47,
    likes: 4,
    isPinned: false,
    content: '헤일스톰 위주로 세팅 중인데 캐스팅 속도랑 치명타율 중에 어떤 걸 우선순위로 두는 게 좋을까요? 고수님들 조언 부탁드립니다.'
  }
];

const INITIAL_NOTES = [
  {
    id: 1,
    title: '⚔️ 레이드 준비물 체크',
    content: '- 성수 40개\n- 특선 스테이크 요리 (치명 피해 +15%)\n- 파티 부활 깃털 2개',
    color: 'amber',
    date: '08-20 18:30',
    isPinned: true
  },
  {
    id: 2,
    title: '🎯 이번 주 목표 파밍',
    content: '1. 심구 돌아서 룬 정수 500개 모으기\n2. 제작 대장기술 5레벨 달성\n3. 장비 12강 트라이',
    color: 'blue',
    date: '08-19 21:10',
    isPinned: false
  },
  {
    id: 3,
    title: '💡 길드 파티 약속',
    content: '금요일 22:00 길드전 예선 Ch.2 집결\n토요일 심연 3층 고정팟',
    color: 'emerald',
    date: '08-18 14:05',
    isPinned: false
  }
];

const NOTE_COLORS = [
  { id: 'amber', label: '골드/앰버' },
  { id: 'blue', label: '사파이어 블루' },
  { id: 'emerald', label: '에메랄드 그린' },
  { id: 'purple', label: '아메시스트 퍼플' },
  { id: 'rose', label: '로즈 레드' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('holes'); // 'holes' | 'ranking' | 'board' | 'notes' | 'todo'
  const [serverTime, setServerTime] = useState('');

  // 1. 심층 구멍 & 결계 상태
  const [holeData] = useState({
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

  // 2. 랭킹 상태
  const [rankings, setRankings] = useState([]);
  const [rankType, setRankType] = useState('1');
  const [selectedServer, setSelectedServer] = useState('전체');
  const [searchName, setSearchName] = useState('');

  // 3. 게시판 상태 (localStorage 연동)
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('gg_guild_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [boardCategory, setBoardCategory] = useState('all'); // 'all' | 'notice' | 'free'
  const [boardSearch, setBoardSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null); // 글 상세 보기 모달
  const [isWriting, setIsWriting] = useState(false); // 글쓰기 모달
  const [newPost, setNewPost] = useState({ category: 'free', title: '', author: '', content: '' });

  // 4. 스티키 노트 상태 (localStorage 연동)
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('gg_guild_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'amber' });

  // 5. 일일 숙제 상태
  const [todos, setTodos] = useState([
    { id: 1, text: '길드 출석 체크 & 길드 코인 기부 (3회)', done: true },
    { id: 2, text: '심층 구멍 / 결계 네임드 몬스터 처치', done: true },
    { id: 3, text: '일일 던전 티켓 소진 (3/3)', done: false },
    { id: 4, text: '어비스 레이드 파티 참여', done: false },
    { id: 5, text: '생활력 채집 및 제작 피로도 소진', done: false },
  ]);

  // 실시간 시계
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setServerTime(now.toLocaleTimeString('ko-KR', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // localStorage 저장
  useEffect(() => {
    localStorage.setItem('gg_guild_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('gg_guild_notes', JSON.stringify(notes));
  }, [notes]);

  // 랭킹 목업/로드
  useEffect(() => {
    setRankings([
      { rank: 1, server: '데이안', characterName: '명종', jobClass: '힐러', statValue: '294,061' },
      { rank: 2, server: '데이안', characterName: '김코딱코', jobClass: '빙결술사', statValue: '249,708' },
      { rank: 3, server: '데이안', characterName: '체리이이이', jobClass: '빙결술사', statValue: '212,357' },
      { rank: 4, server: '데이안', characterName: '웰시P.', jobClass: '석궁사수', statValue: '208,741' },
      { rank: 5, server: '데이안', characterName: '파이어뚜지', jobClass: '화염술사', statValue: '201,941' },
      { rank: 6, server: '아이라', characterName: '윈드밀', jobClass: '전격술사', statValue: '198,200' },
      { rank: 7, server: '던컨', characterName: '칼날', jobClass: '검술사', statValue: '195,430' },
    ]);
  }, [rankType]);

  // 필터링된 게시글 목록
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchCat = boardCategory === 'all' || p.category === boardCategory;
      const matchQuery = p.title.toLowerCase().includes(boardSearch.toLowerCase()) || 
                         p.author.toLowerCase().includes(boardSearch.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [posts, boardCategory, boardSearch]);

  // 게시글 등록
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const postObj = {
      id: Date.now(),
      category: newPost.category,
      title: newPost.title,
      author: newPost.author.trim() || '익명 길드원',
      date: new Date().toISOString().split('T')[0],
      views: 1,
      likes: 0,
      isPinned: false,
      content: newPost.content
    };

    setPosts([postObj, ...posts]);
    setNewPost({ category: 'free', title: '', author: '', content: '' });
    setIsWriting(false);
  };

  // 게시글 삭제
  const handleDeletePost = (id) => {
    if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      setPosts(posts.filter(p => p.id !== id));
      setSelectedPost(null);
    }
  };

  // 스티키 노트 등록
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    const now = new Date();
    const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const noteObj = {
      id: Date.now(),
      title: newNote.title.trim() || '제목 없는 메모',
      content: newNote.content,
      color: newNote.color,
      date: dateStr,
      isPinned: false
    };

    setNotes([noteObj, ...notes]);
    setNewNote({ title: '', content: '', color: 'amber' });
    setIsAddingNote(false);
  };

  // 스티키 노트 수정 (인라인)
  const handleUpdateNoteContent = (id, newContent) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content: newContent } : n));
  };

  // 스티키 노트 색상 변경
  const handleChangeNoteColor = (id, color) => {
    setNotes(notes.map(n => n.id === id ? { ...n, color } : n));
  };

  // 스티키 노트 핀 고정
  const handleTogglePinNote = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  // 스티키 노트 삭제
  const handleDeleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const todoDoneCount = todos.filter(t => t.done).length;

  return (
    <div>
      {/* 1. 상단 글로벌 내비게이션 바 */}
      <nav className="global-nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="brand-badge">GG</span>
            <span className="brand-name">MabiMobi Companion</span>
          </div>
          <div className="server-clock">
            <span className="live-indicator"></span>
            <span>SERVER TIME : {serverTime || '00:00:00'}</span>
          </div>
        </div>
      </nav>

      <div className="app-container">
        {/* 2. 대시보드 위젯 */}
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
              <span className="widget-title">COMMUNITY & LOGS</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold-400)', fontWeight: 700 }}>
                {notes.length} NOTES ACTIVE
              </span>
            </div>
            <div className="widget-body">
              <h2>GG 길드 정보 아카이브</h2>
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${(todoDoneCount / todos.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 탭 바 */}
        <div className="tab-wrapper">
          <button className={`tab-btn ${activeTab === 'holes' ? 'active' : ''}`} onClick={() => setActiveTab('holes')}>
            🌀 심층/어비스 구멍
          </button>
          <button className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>
            🏆 공식 랭킹
          </button>
          <button className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
            💬 길드 게시판
          </button>
          <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            📝 스티키 노트
          </button>
          <button className={`tab-btn ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>
            ✅ 일일 숙제
          </button>
        </div>

        {/* --- 탭 1: 심층/어비스 구멍 --- */}
        {activeTab === 'holes' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">실시간 사냥터 구멍 현황</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>30초마다 자동 갱신됩니다</span>
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

        {/* --- 탭 2: 공식 랭킹 --- */}
        {activeTab === 'ranking' && (
          <div className="panel">
            <div className="panel-header">
              <div className="segmented-group">
                <button className={`seg-btn ${rankType === '1' ? 'active' : ''}`} onClick={() => setRankType('1')}>전투력</button>
                <button className={`seg-btn ${rankType === '2' ? 'active' : ''}`} onClick={() => setRankType('2')}>매력</button>
                <button className={`seg-btn ${rankType === '3' ? 'active' : ''}`} onClick={() => setRankType('3')}>생활력</button>
              </div>
              <div className="filter-row">
                <select className="input-clean" value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)}>
                  <option value="전체">전체 서버</option>
                  <option value="데이안">데이안</option>
                  <option value="아이라">아이라</option>
                  <option value="던컨">던컨</option>
                </select>
                <input type="text" className="input-clean" placeholder="캐릭터명 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
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
                    <th style={{ textAlign: 'right' }}>수치</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map(r => (
                    <tr key={r.rank}>
                      <td style={{ textAlign: 'center' }}><span className={`rank-num rank-${r.rank}`}>{r.rank}</span></td>
                      <td><span className="pill-server">{r.server}</span></td>
                      <td className="char-cell">{r.characterName}</td>
                      <td><span className="pill-job">{r.jobClass}</span></td>
                      <td style={{ textAlign: 'right' }} className="stat-cell">{r.statValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 탭 3: 길드 게시판 (공지사항 + 자유게시판) --- */}
        {activeTab === 'board' && (
          <div className="panel">
            <div className="panel-header">
              <div className="segmented-group">
                <button className={`seg-btn ${boardCategory === 'all' ? 'active' : ''}`} onClick={() => setBoardCategory('all')}>전체글</button>
                <button className={`seg-btn ${boardCategory === 'notice' ? 'active' : ''}`} onClick={() => setBoardCategory('notice')}>📌 공지사항</button>
                <button className={`seg-btn ${boardCategory === 'free' ? 'active' : ''}`} onClick={() => setBoardCategory('free')}>💬 자유게시판</button>
              </div>

              <div className="filter-row">
                <input 
                  type="text" 
                  className="input-clean" 
                  placeholder="제목 / 작성자 검색" 
                  value={boardSearch} 
                  onChange={(e) => setBoardSearch(e.target.value)} 
                />
                <button className="btn-primary" onClick={() => setIsWriting(true)}>
                  ✍️ 새 글 작성
                </button>
              </div>
            </div>

            <div className="mobi-table-wrapper">
              <table className="mobi-table board-table">
                <thead>
                  <tr>
                    <th style={{ width: '85px', textAlign: 'center' }}>구분</th>
                    <th>제목</th>
                    <th style={{ width: '120px' }}>작성자</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>작성일</th>
                    <th style={{ width: '65px', textAlign: 'center' }}>조회</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem' }}>게시글이 없습니다.</td>
                    </tr>
                  ) : (
                    filteredPosts.map(post => (
                      <tr key={post.id} className="board-row" onClick={() => setSelectedPost(post)}>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge-cat ${post.category === 'notice' ? 'cat-notice' : 'cat-free'}`}>
                            {post.category === 'notice' ? '공지' : '자유'}
                          </span>
                        </td>
                        <td className="board-title-cell">
                          {post.isPinned && <span className="pin-icon">📌 </span>}
                          <span className="post-title-text">{post.title}</span>
                        </td>
                        <td><span className="post-author">{post.author}</span></td>
                        <td style={{ textAlign: 'center' }} className="post-date">{post.date}</td>
                        <td style={{ textAlign: 'center' }} className="post-views">{post.views}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 글 작성 모달 */}
            {isWriting && (
              <div className="modal-backdrop" onClick={() => setIsWriting(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>✍️ 새 게시글 작성</h3>
                    <button className="btn-close" onClick={() => setIsWriting(false)}>✕</button>
                  </div>
                  <form onSubmit={handleCreatePost}>
                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label>분류</label>
                        <select 
                          className="input-clean w-full"
                          value={newPost.category} 
                          onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                        >
                          <option value="free">자유게시판</option>
                          <option value="notice">공지사항 (운영진)</option>
                        </select>
                      </div>
                      <div className="form-group flex-1">
                        <label>작성자 닉네임</label>
                        <input 
                          type="text" 
                          className="input-clean w-full" 
                          placeholder="캐릭터 닉네임"
                          value={newPost.author} 
                          onChange={e => setNewPost({ ...newPost, author: e.target.value })} 
                        />
                      </div>
                    </div>
                    <div className="form-group mt-3">
                      <label>제목</label>
                      <input 
                        type="text" 
                        className="input-clean w-full" 
                        placeholder="글 제목을 입력하세요"
                        required
                        value={newPost.title} 
                        onChange={e => setNewPost({ ...newPost, title: e.target.value })} 
                      />
                    </div>
                    <div className="form-group mt-3">
                      <label>내용</label>
                      <textarea 
                        className="input-clean w-full textarea-field" 
                        rows="6" 
                        placeholder="내용을 작성하세요..."
                        required
                        value={newPost.content} 
                        onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="modal-actions mt-4">
                      <button type="button" className="btn-ghost" onClick={() => setIsWriting(false)}>취소</button>
                      <button type="submit" className="btn-primary">등록하기</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 글 상세 조회 모달 */}
            {selectedPost && (
              <div className="modal-backdrop" onClick={() => setSelectedPost(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div>
                      <span className={`badge-cat ${selectedPost.category === 'notice' ? 'cat-notice' : 'cat-free'}`}>
                        {selectedPost.category === 'notice' ? '공지사항' : '자유게시판'}
                      </span>
                      <h3 style={{ marginTop: '0.5rem', color: '#FFF' }}>{selectedPost.title}</h3>
                    </div>
                    <button className="btn-close" onClick={() => setSelectedPost(null)}>✕</button>
                  </div>
                  <div className="post-meta-bar">
                    <span>작성자: <strong>{selectedPost.author}</strong></span>
                    <span>작성일: {selectedPost.date}</span>
                    <span>조회수: {selectedPost.views}</span>
                  </div>
                  <div className="post-detail-body">
                    {selectedPost.content.split('\n').map((line, idx) => (
                      <p key={idx}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                  <div className="modal-actions">
                    <button className="btn-danger-ghost" onClick={() => handleDeletePost(selectedPost.id)}>🗑️ 글 삭제</button>
                    <button className="btn-primary" onClick={() => setSelectedPost(null)}>닫기</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 탭 4: 스티키 노트 (Sticky Notes) --- */}
        {activeTab === 'notes' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">📝 나만의 길드 스티키 노트</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  파밍 목표, 레이드 준비물, 개인 메모를 자유롭게 적어두세요. (브라우저에 자동 보관됩니다)
                </p>
              </div>
              <button className="btn-primary" onClick={() => setIsAddingNote(true)}>
                ➕ 새 메모 추가
              </button>
            </div>

            {/* 새 노트 추가 모달 */}
            {isAddingNote && (
              <div className="modal-backdrop" onClick={() => setIsAddingNote(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>📝 새 스티키 노트 작성</h3>
                    <button className="btn-close" onClick={() => setIsAddingNote(false)}>✕</button>
                  </div>
                  <form onSubmit={handleAddNote}>
                    <div className="form-group">
                      <label>메모 제목</label>
                      <input 
                        type="text" 
                        className="input-clean w-full" 
                        placeholder="예: 이번 주 파밍 루틴"
                        value={newNote.title} 
                        onChange={e => setNewNote({ ...newNote, title: e.target.value })} 
                      />
                    </div>
                    <div className="form-group mt-3">
                      <label>메모 색상 테마</label>
                      <div className="color-picker-row">
                        {NOTE_COLORS.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            className={`color-chip chip-${c.id} ${newNote.color === c.id ? 'active' : ''}`}
                            onClick={() => setNewNote({ ...newNote, color: c.id })}
                            title={c.label}
                          ></button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group mt-3">
                      <label>메모 내용</label>
                      <textarea 
                        className="input-clean w-full textarea-field" 
                        rows="5" 
                        placeholder="기억해야 할 내용이나 체크리스트를 작성하세요..."
                        required
                        value={newNote.content} 
                        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="modal-actions mt-4">
                      <button type="button" className="btn-ghost" onClick={() => setIsAddingNote(false)}>취소</button>
                      <button type="submit" className="btn-primary">노트 저장</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 노트 그리드 */}
            <div className="sticky-notes-grid">
              {sortedNotes.map(note => (
                <div key={note.id} className={`sticky-card note-theme-${note.color} ${note.isPinned ? 'is-pinned' : ''}`}>
                  <div className="sticky-head">
                    <div className="sticky-title-wrap">
                      {note.isPinned && <span className="pin-badge">📌</span>}
                      <span className="sticky-title">{note.title}</span>
                    </div>
                    <div className="sticky-actions">
                      <button 
                        className={`icon-btn ${note.isPinned ? 'active-pin' : ''}`} 
                        onClick={() => handleTogglePinNote(note.id)} 
                        title={note.isPinned ? '상단 고정 해제' : '상단 고정'}
                      >
                        📌
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteNote(note.id)} title="삭제">
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* 인라인 직접 편집 가능한 본문 */}
                  <textarea
                    className="sticky-body-input"
                    value={note.content}
                    onChange={(e) => handleUpdateNoteContent(note.id, e.target.value)}
                    placeholder="메모를 입력하세요..."
                  ></textarea>

                  <div className="sticky-foot">
                    <span className="sticky-date">{note.date}</span>
                    <div className="sticky-color-swatches">
                      {NOTE_COLORS.map(c => (
                        <button
                          key={c.id}
                          className={`mini-color-dot dot-${c.id} ${note.color === c.id ? 'active' : ''}`}
                          onClick={() => handleChangeNoteColor(note.id, c.id)}
                          title={c.label}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 탭 5: 일일 숙제 --- */}
        {activeTab === 'todo' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">오늘의 에린 일일 숙제</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>매일 오전 06시 초기화</span>
            </div>
            <div className="checklist">
              {todos.map(todo => (
                <label key={todo.id} className={`check-item ${todo.done ? 'done' : ''}`}>
                  <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
                  <span>{todo.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <footer className="global-footer">
          <p>© 2026 MabiMobi GG Guild Companion · Powered by Cloudflare Serverless</p>
        </footer>
      </div>
    </div>
  );
}