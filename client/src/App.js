import React, { useState, useEffect, useRef } from 'react';
import { TeddyIllustration } from './components/BeanIllustrations';
import mrBeanImg from 'url:./mr-bean.png';
import themeSong from 'url:./mr-bean-theme.mp3';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalRaised: 0, totalBackers: 0, totalCampaigns: 0, fundedCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState('25');
  const [selectedReward, setSelectedReward] = useState(null);
  const [backerName, setBackerName] = useState('Anonymous Patron');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Form State for Launching Campaign
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Inventions',
    creator: 'Bean Inventions Co.',
    targetAmount: '5000',
    daysLeft: '30'
  });

  const audioRef = useRef(null);

  // Fetch campaigns and platform stats from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/campaigns`),
        fetch(`${API_BASE_URL}/stats`)
      ]);

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaigns(campaignData.data || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || {});
      }
      setLoading(false);
    } catch (err) {
      console.warn('Backend API connection failed, using local seed fallback:', err);
      const fallbackList = [
        {
          id: '1',
          title: 'Teddy 2.0: AI-Powered Autonomous Companion',
          tagline: 'The classic knitted teddy bear upgraded with voice recognition and zero attitude.',
          description: 'We are retrofitting the iconic 1990 knitted Teddy with micro-controllers and soft velvet sensors to recreate Mr. Bean\'s loyal sidekick.',
          category: 'Inventions',
          creator: 'Bean Robotics Lab',
          targetAmount: 10000,
          raisedAmount: 8750,
          backersCount: 142,
          daysLeft: 12,
          status: 'Active',
          rewards: [
            { id: 'r1', title: 'Teddy\'s Nod', minPledge: 10, perk: 'Digital certificate signed by Teddy' },
            { id: 'r2', title: 'Stitched Edition', minPledge: 50, perk: 'Custom woven Teddy badge + Early Backer credit' },
            { id: 'r3', title: 'The Tweed Patron', minPledge: 200, perk: 'Physical Teddy 2.0 Prototype + Executive Producer credit' }
          ]
        },
        {
          id: '2',
          title: 'The Automatic Sandwich-Making Sofa',
          tagline: 'Make fresh buttered toast and tea without leaving your armchair during TV time.',
          description: 'Built into a high-density memory foam sofa with built-in toaster slots, jam dispensers, and automated teabag arm.',
          category: 'Home & Gadgets',
          creator: 'Living Room Engineers',
          targetAmount: 5000,
          raisedAmount: 5120,
          backersCount: 98,
          daysLeft: 0,
          status: 'Funded',
          rewards: [
            { id: 'r4', title: 'Toast Lover', minPledge: 15, perk: 'Branded sofa mug + Butter knife' }
          ]
        },
        {
          id: '3',
          title: 'Reliant Robin 3-Wheel Stabilizer Rig',
          tagline: 'Prevent the iconic blue 3-wheeler from flipping over at every single intersection.',
          description: 'A gyroscopic bumper extension engineered specifically to keep 3-wheeled vehicles right-side up.',
          category: 'Automotive',
          creator: 'Blue Car Defense Squad',
          targetAmount: 3500,
          raisedAmount: 2400,
          backersCount: 64,
          daysLeft: 18,
          status: 'Active',
          rewards: [
            { id: 'r6', title: 'Support Sticker', minPledge: 5, perk: 'Anti-Flipper bumper sticker' }
          ]
        }
      ];
      setCampaigns(fallbackList);
      setStats({
        totalRaised: 16270,
        totalBackers: 304,
        totalCampaigns: 3,
        fundedCampaigns: 1
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle auto-playing theme audio on first click
  useEffect(() => {
    const startAudioOnFirstClick = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsPlayingAudio(true))
          .catch(() => setIsPlayingAudio(false));
      }
      window.removeEventListener('click', startAudioOnFirstClick);
    };

    window.addEventListener('click', startAudioOnFirstClick);
    return () => {
      window.removeEventListener('click', startAudioOnFirstClick);
    };
  }, []);

  // Categories
  const categories = ['All', 'Inventions', 'Home & Gadgets', 'Automotive', 'Mischief Tech'];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchCat = category === 'All' || c.category === category;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && c.status === 'Active') ||
      (statusFilter === 'Funded' && (c.status === 'Funded' || c.raisedAmount >= c.targetAmount));
    const matchSearch =
      search.trim() === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.creator.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  // Handle Pledge Submit
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(pledgeAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid pledge amount.');
      return;
    }

    if (selectedCampaign) {
      try {
        await fetch(`${API_BASE_URL}/campaigns/${selectedCampaign.id}/pledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, backerName })
        });
      } catch (err) {}

      // Update local state in real-time
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === selectedCampaign.id) {
            const newRaised = c.raisedAmount + amount;
            const newCount = c.backersCount + 1;
            const isNowFunded = newRaised >= c.targetAmount;
            return {
              ...c,
              raisedAmount: newRaised,
              backersCount: newCount,
              status: isNowFunded ? 'Funded' : c.status
            };
          }
          return c;
        })
      );

      setStats((prev) => ({
        ...prev,
        totalRaised: prev.totalRaised + amount,
        totalBackers: prev.totalBackers + 1
      }));

      alert(`🎉 SUCCESS! You pledged $${amount} to "${selectedCampaign.title}"! Thank you for being a patron!`);
      setSelectedCampaign(null);
      setPledgeAmount('25');
      setSelectedReward(null);
    }
  };

  // Handle Launch Campaign Submit
  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaignForm.title || !newCampaignForm.description || !newCampaignForm.targetAmount) {
      alert('Please complete the title, description, and funding goal.');
      return;
    }

    const payload = {
      ...newCampaignForm,
      targetAmount: Number(newCampaignForm.targetAmount),
      daysLeft: Number(newCampaignForm.daysLeft) || 30
    };

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        setCampaigns((prev) => [result.data, ...prev]);
      } else {
        throw new Error('Failed to create campaign via API');
      }
    } catch (err) {
      // Local fallback launch
      const newC = {
        id: Date.now().toString(),
        ...payload,
        raisedAmount: 0,
        backersCount: 0,
        status: 'Active',
        rewards: [
          { id: 'r_new', title: 'Early Backer Special', minPledge: 15, perk: 'Digital Producer Badge + Name on Credit Wall' }
        ]
      };
      setCampaigns((prev) => [newC, ...prev]);
    }

    setShowLaunchModal(false);
    setNewCampaignForm({
      title: '',
      tagline: '',
      description: '',
      category: 'Inventions',
      creator: 'Bean Inventions Co.',
      targetAmount: '5000',
      daysLeft: '30'
    });
    alert('🚀 Project Launched! Your crowdfunding campaign is now LIVE on BEANFUND!');
  };

  // Toggle Theme Audio
  const toggleThemeAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          console.warn('Audio play blocked:', err);
          setIsPlayingAudio(false);
        });
    }
  };

  return (
    <div className="container">
      {/* Background Theme Audio */}
      <audio ref={audioRef} src={themeSong} loop preload="auto" />

      {/* Header */}
      <header className="header">
        <div className="brand">
          <TeddyIllustration className="teddy-icon" />
          <div>
            <h1 className="title">BEANFUND.</h1>
            <p className="subtitle">Crowdfunding Ridiculous Inventions &amp; Passion Projects</p>
          </div>
        </div>

        <button className="btn btn-primary btn-launch" onClick={() => setShowLaunchModal(true)}>
          🚀 Launch Project
        </button>
      </header>

      {/* Real-time Platform Statistics Bar */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <span className="stat-value">${stats.totalRaised ? stats.totalRaised.toLocaleString() : '18,120'}</span>
          <span className="stat-label">Total Pledged</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalBackers || 304}</span>
          <span className="stat-label">Global Backers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.fundedCampaigns || 2} / {stats.totalCampaigns || campaigns.length}</span>
          <span className="stat-label">Projects Funded</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="main">
        {/* Category & Status Filter Toolbar */}
        <div className="toolbar">
          <div className="filter-row">
            <div className="categories-wrapper">
              <span className="cat-label">Category:</span>
              <div className="categories-list">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="status-toggle">
              <button
                className={`status-btn ${statusFilter === 'All' ? 'active' : ''}`}
                onClick={() => setStatusFilter('All')}
              >
                All Projects
              </button>
              <button
                className={`status-btn ${statusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Active')}
              >
                Active 🔥
              </button>
              <button
                className={`status-btn ${statusFilter === 'Funded' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Funded')}
              >
                Funded 🎉
              </button>
            </div>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search campaigns by title, idea, or inventor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch('')}>
                ✖
              </button>
            )}
          </div>
        </div>

        {/* Campaign List / Cards */}
        {loading ? (
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Loading Live Crowdfunding Campaigns from Server...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="empty-card">
            <p>No campaigns found matching your filter!</p>
            <button className="btn" onClick={() => { setCategory('All'); setStatusFilter('All'); setSearch(''); }}>
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="campaign-grid">
            {filteredCampaigns.map((c) => {
              const percent = Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100));
              const isFunded = c.raisedAmount >= c.targetAmount || c.status === 'Funded';

              return (
                <div key={c.id} className={`campaign-card ${isFunded ? 'funded-card' : ''}`}>
                  <div className="card-top">
                    <span className="badge">{c.category}</span>
                    <span className={`status-badge ${isFunded ? 'funded-badge' : ''}`}>
                      {isFunded ? '🎉 FULLY FUNDED' : `⏳ ${c.daysLeft} Days Left`}
                    </span>
                  </div>

                  <h2 className="campaign-title">{c.title}</h2>
                  <p className="campaign-tagline">{c.tagline || c.description}</p>

                  {/* Funding Progress Bar */}
                  <div className="progress-container">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="progress-stats">
                      <span className="percent-text"><strong>{percent}%</strong> Funded</span>
                      <span className="amount-text">${c.raisedAmount.toLocaleString()} of ${c.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <div className="creator-info">
                      <span className="creator-name">👤 {c.creator}</span>
                      <span className="backer-count">🤝 {c.backersCount} Backers</span>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedCampaign(c);
                        setSelectedReward(c.rewards && c.rewards.length > 0 ? c.rewards[0] : null);
                      }}
                    >
                      {isFunded ? '💚 Back Extra' : '⚡ Back This Project'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>BEANFUND &bull; Full-Stack Crowdfunding Platform &bull; Built with React &amp; Express</p>
      </footer>

      {/* Floating Round Mr. Bean Audio Control Button */}
      <button
        className={`floating-audio-btn ${isPlayingAudio ? 'playing' : ''}`}
        onClick={toggleThemeAudio}
        title={isPlayingAudio ? 'Pause Theme Song' : 'Play Theme Song'}
      >
        <div className="audio-avatar">
          <img src={mrBeanImg} alt="Mr. Bean" className="bean-real-img" />
        </div>
        <span className="audio-badge">{isPlayingAudio ? '🔊' : '🎵'}</span>
      </button>

      {/* Pledge / Back Project Modal */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="badge">{selectedCampaign.category}</span>
                <h3>Back "{selectedCampaign.title}"</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedCampaign(null)}>✖</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">{selectedCampaign.description}</p>
              
              <div className="modal-goal-summary">
                <span>Raised: <strong>${selectedCampaign.raisedAmount.toLocaleString()}</strong></span>
                <span>Goal: <strong>${selectedCampaign.targetAmount.toLocaleString()}</strong></span>
              </div>

              {/* Tiered Backer Rewards */}
              {selectedCampaign.rewards && selectedCampaign.rewards.length > 0 && (
                <div className="rewards-section">
                  <label className="form-label">Select Reward Tier:</label>
                  <div className="rewards-list">
                    {selectedCampaign.rewards.map((r) => (
                      <div
                        key={r.id}
                        className={`reward-item ${selectedReward?.id === r.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedReward(r);
                          setPledgeAmount(r.minPledge.toString());
                        }}
                      >
                        <div className="reward-head">
                          <strong className="reward-title">{r.title}</strong>
                          <span className="reward-pledge">${r.minPledge}+ Pledge</span>
                        </div>
                        <p className="reward-perk">{r.perk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pledge Form */}
              <form onSubmit={handlePledgeSubmit} className="pledge-form">
                <label className="form-label">Your Patron / Backer Name:</label>
                <input
                  type="text"
                  placeholder="Enter your name or keep anonymous..."
                  value={backerName}
                  onChange={(e) => setBackerName(e.target.value)}
                />

                <label className="form-label">Pledge Amount ($ USD):</label>
                <div className="preset-pledges">
                  {['10', '25', '50', '100', '250'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`preset-btn ${pledgeAmount === amt ? 'active' : ''}`}
                      onClick={() => setPledgeAmount(amt)}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder="Custom Pledge Amount ($)"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  min="1"
                  required
                />

                <div className="modal-actions">
                  <button type="button" className="btn" onClick={() => setSelectedCampaign(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    💳 Confirm Pledge of ${pledgeAmount || '0'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Launch New Campaign Modal */}
      {showLaunchModal && (
        <div className="modal-overlay" onClick={() => setShowLaunchModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>🚀 Launch Your Crowdfunding Campaign</h3>
              <button className="close-btn" onClick={() => setShowLaunchModal(false)}>✖</button>
            </div>

            <form onSubmit={handleLaunchCampaign} className="modal-body form-body">
              <label className="form-label">Project / Invention Title:</label>
              <input
                type="text"
                placeholder="e.g. The Automatic Alarm Clock Water Bucket"
                value={newCampaignForm.title}
                onChange={(e) => setNewCampaignForm({ ...newCampaignForm, title: e.target.value })}
                required
              />

              <label className="form-label">Catchy One-Line Tagline:</label>
              <input
                type="text"
                placeholder="e.g. 100% wake-up rate for heavy sleepers"
                value={newCampaignForm.tagline}
                onChange={(e) => setNewCampaignForm({ ...newCampaignForm, tagline: e.target.value })}
              />

              <div className="form-row">
                <div>
                  <label className="form-label">Category:</label>
                  <select
                    value={newCampaignForm.category}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, category: e.target.value })}
                  >
                    <option value="Inventions">Inventions</option>
                    <option value="Home & Gadgets">Home &amp; Gadgets</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Mischief Tech">Mischief Tech</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Funding Goal ($ USD):</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newCampaignForm.targetAmount}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, targetAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Campaign Duration (Days):</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newCampaignForm.daysLeft}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, daysLeft: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Creator / Inventor Name:</label>
                  <input
                    type="text"
                    placeholder="Your Name or Studio"
                    value={newCampaignForm.creator}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, creator: e.target.value })}
                  />
                </div>
              </div>

              <label className="form-label">Detailed Campaign Description:</label>
              <textarea
                rows="4"
                placeholder="Describe your invention, how it works, and why backers should support you..."
                value={newCampaignForm.description}
                onChange={(e) => setNewCampaignForm({ ...newCampaignForm, description: e.target.value })}
                required
              />

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowLaunchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  ✨ Publish Campaign to Crowd
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
