import { useState } from 'react';
import './App.css';

// 기초 목업 데이터
const JOBS_DATA = [
  { id: 1, name: '전사 (Warrior)', role: '근접 딜러 / 탱커', weapon: '양손검, 검/방패', desc: '높은 생명력과 방어력을 기반으로 전방에서 전투를 지휘하는 클래스.' },
  { id: 2, name: '궁수 (Archer)', role: '원거리 딜러', weapon: '활, 석궁', desc: '원거리에서 치명타 중심의 지속적인 단일 및 광역 피해를 주는 클래스.' },
  { id: 3, name: '마법사 (Mage)', role: '광역 마법 딜러', weapon: '스태프, 원드', desc: '속성 마법을 활용하여 넓은 범위의 적을 무력화하고 폭발적인 대미지를 입히는 클래스.' },
  { id: 4, name: '힐러 (Healer)', role: '서포터 / 치유', weapon: '원드, 성서', desc: '파티원의 체력 회복과 버프/디버프 해제를 담당하는 필수 서포터.' },
];

const ITEMS_DATA = [
  { id: 101, name: '글로리 소드', type: '무기', grade: '전설', stat: '물리 공격력 +450, 치명타율 +5%', desc: '찬란한 빛을 내뿜는 에린의 고대 검.' },
  { id: 102, name: '엘븐 보우', type: '무기', grade: '영웅', stat: '물리 공격력 +380, 사거리 +2m', desc: '요정의 가호가 깃든 유연한 활.' },
  { id: 103, name: '대마법사의 로브', type: '방어구', grade: '전설', stat: '마법 방어력 +320, MP 회복 +15', desc: '마력 순환을 돕는 최고급 양모 로브.' },
  { id: 104, name: '생명력의 목걸이', type: '장신구', grade: '희귀', stat: '최대 HP +1,200', desc: '착용자의 생명력을 보존해 주는 목걸이.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = JOBS_DATA.filter((job) =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) || job.role.includes(searchTerm)
  );

  const filteredItems = ITEMS_DATA.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.type.includes(searchTerm) || item.grade.includes(searchTerm)
  );

  return (
    <div className="container">
      <header className="header">
        <h1>🗡️ 마비노기 모바일 정보소</h1>
        <p className="subtitle">클래스 가이드, 아이템 DB 및 시뮬레이터</p>
        
        <nav className="tab-nav">
          <button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>
            직업/클래스
          </button>
          <button className={activeTab === 'items' ? 'active' : ''} onClick={() => setActiveTab('items')}>
            아이템 DB
          </button>
          <button className={activeTab === 'calc' ? 'active' : ''} onClick={() => setActiveTab('calc')}>
            스탯 계산기
          </button>
        </nav>
      </header>

      <main className="content">
        {activeTab !== 'calc' && (
          <div className="search-bar">
            <input
              type="text"
              placeholder={activeTab === 'jobs' ? "클래스명, 역할 검색..." : "아이템명, 등급, 부위 검색..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* 직업 탭 */}
        {activeTab === 'jobs' && (
          <div className="grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="card">
                <div className="card-header">
                  <h3>{job.name}</h3>
                  <span className="badge role">{job.role}</span>
                </div>
                <p className="weapon"><strong>주요 무기:</strong> {job.weapon}</p>
                <p className="desc">{job.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* 아이템 탭 */}
        {activeTab === 'items' && (
          <div className="grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="card">
                <div className="card-header">
                  <h3>{item.name}</h3>
                  <span className={`badge grade-${item.grade}`}>{item.grade}</span>
                </div>
                <p className="type"><strong>분류:</strong> {item.type}</p>
                <p className="stat"><strong>옵션:</strong> {item.stat}</p>
                <p className="desc">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* 간이 스탯 계산기 탭 */}
        {activeTab === 'calc' && (
          <div className="card calc-box">
            <h3>간이 대미지 계산기 (Alpha)</h3>
            <p className="desc">캐릭터 기본 스탯을 입력하여 기대 피해량을 산출합니다.</p>
            <div className="calc-inputs">
              <label>공격력: <input type="number" defaultValue={500} id="atk" /></label>
              <label>치명타율 (%): <input type="number" defaultValue={25} id="crit" /></label>
              <label>치명타 피해 (%): <input type="number" defaultValue={150} id="critDmg" /></label>
            </div>
            <p className="calc-info">※ 공식 런칭 후 세부 공식이 업데이트될 예정입니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}