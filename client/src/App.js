import React, { useState, useEffect, useRef } from 'react';
import { TeddyIllustration } from './components/BeanIllustrations';
import mrBeanImg from 'url:./mr-bean.png';
import themeSong from 'url:./mr-bean-theme.mp3';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

// Bean-o-Matic generator pools
const SUBJECTS = [
  "Mr. Bean's", "Teddy's", "The Reliant Robin's", "Mrs. Wicket's", "Scrapper the Cat's", 
  "Irma Gobb's", "The Royal Guard's", "The Tweed Suit's", "The Mini Cooper's"
];

const ADJECTIVES = [
  "Autonomous", "Explosive", "Automated", "Gyroscopic", "Self-Buttering", "Water-Spraying", 
  "Silent-Running", "Laser-Guided", "Tweed-Woven", "Pneumatic", "Elastic-Powered"
];

const OBJECTS = [
  "Alarm Clock Bucket", "Sandwich Sofa", "Tweed Bowtie", "Umbrella Launcher", "Stabilizer Rig", 
  "Teabag Dispenser", "Cat-Scaring Rig", "Turntable Armchair", "Turkey-Helmet Helper", "Key-Retrieval Hook"
];

const ACTIONS = [
  "keeps blue three-wheelers right-side up.",
  "guarantees 100% wake-up rate with ice water.",
  "makes fresh buttered toast in 3 seconds flat.",
  "retrieves lost keys from sewer grates with ease.",
  "shoots teabags directly into mugs from 10 feet.",
  "keeps Scrapper the cat from biting your ankles.",
  "allows you to cook a turkey on your head while driving.",
  "automatically nods in agreement during boring conversations.",
  "dispenses strawberry jam directly into your mouth.",
  "provides high-speed underglow for night missions."
];

function App() {
  // Navigation: 'landing' | 'explore' | 'auth' | 'creator' | 'profile'
  const [view, setView] = useState('landing');
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalRaised: 0, totalBackers: 0, totalCampaigns: 0, fundedCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('🧸');
  const [authError, setAuthError] = useState('');

  // Filters & State
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modals & Details
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // details, community, updates, polls
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Pledging
  const [pledgeAmount, setPledgeAmount] = useState('25');
  const [selectedReward, setSelectedReward] = useState(null);
  const [backerName, setBackerName] = useState('');
  const [backerMessage, setBackerMessage] = useState('');
  const [backerEmoji, setBackerEmoji] = useState('🧸');

  // Direct Guestbook Post in Modal
  const [guestName, setGuestName] = useState('');
  const [guestMsg, setGuestMsg] = useState('');
  const [guestEmoji, setGuestEmoji] = useState('💬');

  // Creator Dashboard Posting State
  const [selectedCampaignIdToUpdate, setSelectedCampaignIdToUpdate] = useState('');
  const [creatorUpdateTitle, setCreatorUpdateTitle] = useState('');
  const [creatorUpdateBody, setCreatorUpdateBody] = useState('');
  
  const [selectedCampaignIdToPoll, setSelectedCampaignIdToPoll] = useState('');
  const [creatorPollQuestion, setCreatorPollQuestion] = useState('');
  const [creatorPollOptionsRaw, setCreatorPollOptionsRaw] = useState('');

  // Bean-o-Matic State
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotResult, setSlotResult] = useState(null);
  const [slotTicker, setSlotTicker] = useState({ subject: 'Mr. Bean\'s', adjective: 'Autonomous', object: 'Tweed Bowtie' });

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Budget slider modifier
  const [simulatedPledge, setSimulatedPledge] = useState(100);

  // Form State for Launching Campaign
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Inventions',
    creator: '',
    targetAmount: '5000',
    daysLeft: '30'
  });

  const audioRef = useRef(null);

  // Initialize Auth on Mount
  useEffect(() => {
    const stored = localStorage.getItem('beanfund_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        // Prepopulate pledge name
        setBackerName(parsed.username);
      } catch (err) {
        localStorage.removeItem('beanfund_user');
      }
    }
  }, []);

  // Fetch data
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
        // Set default update target campaign selector in dashboard
        if (campaignData.data && campaignData.data.length > 0) {
          const userProjects = campaignData.data.filter(c => c.creator.toLowerCase() === currentUser?.username?.toLowerCase());
          if (userProjects.length > 0) {
            setSelectedCampaignIdToUpdate(userProjects[0].id);
            setSelectedCampaignIdToPoll(userProjects[0].id);
          } else {
            setSelectedCampaignIdToUpdate(campaignData.data[0].id);
            setSelectedCampaignIdToPoll(campaignData.data[0].id);
          }
        }
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || {});
      }
      setLoading(false);
    } catch (err) {
      console.warn('Backend API connection failed, local backup initialized:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Synchronize backing name when user logs in
  useEffect(() => {
    if (currentUser) {
      setBackerName(currentUser.username);
    } else {
      setBackerName('');
    }
  }, [currentUser]);

  // Local Web Audio synthesizer tones for retro game sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'coin') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 220);
      } else if (type === 'spin') {
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 150);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 450);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 50);
      }
    } catch (err) {
      console.warn('AudioContext failed:', err);
    }
  };

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

  // Handle Login & Sign Up
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!usernameInput || !passwordInput) {
      setAuthError('Please complete all credentials.');
      return;
    }

    const endpoint = authMode === 'login' ? 'login' : 'register';
    const payload = authMode === 'login' 
      ? { username: usernameInput, password: passwordInput }
      : { username: usernameInput, password: passwordInput, bio: bioInput, avatar: avatarInput };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('beanfund_user', JSON.stringify(data.user));
        playSound('success');
        
        // Reset forms
        setUsernameInput('');
        setPasswordInput('');
        setBioInput('');
        
        // Redirect to creator space or explore
        setView('explore');
      } else {
        setAuthError(data.message || 'Authentication failed. Please check inputs.');
      }
    } catch (err) {
      setAuthError('Unable to connect to API server.');
    }
  };

  // Logout
  const handleLogout = () => {
    playSound('click');
    setCurrentUser(null);
    localStorage.removeItem('beanfund_user');
    setView('landing');
  };

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
        const res = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaign.id}/pledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount, 
            backerName: backerName || 'Anonymous Patron',
            message: backerMessage || `Pledged $${amount} to fund this creation!`,
            emoji: backerEmoji,
            username: currentUser ? currentUser.username : undefined
          })
        });

        if (res.ok) {
          const result = await res.json();
          setSelectedCampaign(result.data);
          
          // Sync global campaigns list
          setCampaigns((prev) => prev.map((c) => (c.id === selectedCampaign.id ? result.data : c)));
          
          // Re-fetch global platform stats & user profile
          const statsRes = await fetch(`${API_BASE_URL}/stats`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData.data || {});
          }

          if (currentUser) {
            const profileRes = await fetch(`${API_BASE_URL}/users/${currentUser.username}`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setCurrentUser(profileData.user);
              localStorage.setItem('beanfund_user', JSON.stringify(profileData.user));
            }
          }
          
          playSound('success');
          alert(`🎉 SUCCESS! You pledged $${amount} to "${selectedCampaign.title}"! Your note is now pinned to the guestbook.`);
          
          setPledgeAmount('25');
          setSelectedReward(null);
          setBackerMessage('');
        }
      } catch (err) {
        console.error('Failed to pledge:', err);
      }
    }
  };

  // Handle direct message submission to guestbook
  const handleGuestbookSubmit = async (e) => {
    e.preventDefault();
    if (!guestMsg.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaign.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName || 'Anonymous Fan',
          message: guestMsg,
          emoji: guestEmoji
        })
      });

      if (res.ok) {
        const result = await res.json();
        const updatedCamp = {
          ...selectedCampaign,
          guestbook: [result.data, ...(selectedCampaign.guestbook || [])]
        };
        setSelectedCampaign(updatedCamp);
        setCampaigns((prev) => prev.map((c) => (c.id === selectedCampaign.id ? updatedCamp : c)));
        
        playSound('coin');
        setGuestMsg('');
        setGuestName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Vote in a Campaign Poll
  const handleVote = async (pollId, optionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaign.id}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });

      if (res.ok) {
        const result = await res.json();
        const updatedPolls = selectedCampaign.polls.map(p => p.id === pollId ? result.data : p);
        const updatedCamp = { ...selectedCampaign, polls: updatedPolls };
        
        setSelectedCampaign(updatedCamp);
        setCampaigns((prev) => prev.map((c) => (c.id === selectedCampaign.id ? updatedCamp : c)));
        playSound('coin');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // React to a Creator Update
  const handleReact = async (updateId, emoji) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaign.id}/updates/${updateId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        const result = await res.json();
        const updatedUpdates = selectedCampaign.updates.map(u => u.id === updateId ? result.data : u);
        const updatedCamp = { ...selectedCampaign, updates: updatedUpdates };
        
        setSelectedCampaign(updatedCamp);
        setCampaigns((prev) => prev.map((c) => (c.id === selectedCampaign.id ? updatedCamp : c)));
        playSound('click');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Creator Dashboard: Post Update Log
  const handleCreatorUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaignIdToUpdate || !creatorUpdateTitle.trim() || !creatorUpdateBody.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaignIdToUpdate}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: creatorUpdateTitle,
          body: creatorUpdateBody
        })
      });

      if (res.ok) {
        const result = await res.json();
        // Sync global campaigns list
        setCampaigns((prev) => prev.map((c) => (c.id === selectedCampaignIdToUpdate ? result.data : c)));
        
        playSound('success');
        setCreatorUpdateTitle('');
        setCreatorUpdateBody('');
        alert('📣 Update posted successfully to your project!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Creator Dashboard: Post Poll
  const handleCreatorPollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaignIdToPoll || !creatorPollQuestion.trim() || !creatorPollOptionsRaw.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const options = creatorPollOptionsRaw.split(',').map(o => o.trim()).filter(o => o.length > 0);
    if (options.length < 2) {
      alert('Please enter at least 2 comma-separated options.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaignIdToPoll}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: creatorPollQuestion,
          options
        })
      });

      if (res.ok) {
        const result = await res.json();
        setCampaigns((prev) => prev.map((c) => (c.id === selectedCampaignIdToPoll ? result.data : c)));
        
        playSound('success');
        setCreatorPollQuestion('');
        setCreatorPollOptionsRaw('');
        alert('🗳️ Backer decision poll added successfully to your project!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Launch Campaign
  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaignForm.title || !newCampaignForm.description || !newCampaignForm.targetAmount) {
      alert('Please complete the title, description, and funding goal.');
      return;
    }

    const payload = {
      ...newCampaignForm,
      creator: currentUser ? currentUser.username : 'bean',
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
        
        // Sync stats
        setStats((prev) => ({
          ...prev,
          totalCampaigns: prev.totalCampaigns + 1
        }));

        if (currentUser) {
          const profileRes = await fetch(`${API_BASE_URL}/users/${currentUser.username}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setCurrentUser(profileData.user);
            localStorage.setItem('beanfund_user', JSON.stringify(profileData.user));
          }
        }
        
        playSound('success');
        setShowLaunchModal(false);
        setNewCampaignForm({
          title: '',
          tagline: '',
          description: '',
          category: 'Inventions',
          creator: '',
          targetAmount: '5000',
          daysLeft: '30'
        });
        alert('🚀 Project Launched! Your campaign is now live on BEANFUND.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bean-o-Matic 3000 Pull Lever
  const pullSlotLever = () => {
    if (slotSpinning) return;
    setSlotSpinning(true);
    setSlotResult(null);
    
    let spins = 0;
    const interval = setInterval(() => {
      setSlotTicker({
        subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)],
        adjective: ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)],
        object: OBJECTS[Math.floor(Math.random() * OBJECTS.length)]
      });
      playSound('spin');
      spins++;
      
      if (spins > 10) {
        clearInterval(interval);
        
        const finalSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
        const finalAdjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const finalObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
        const finalAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

        const title = `${finalSubject} ${finalAdjective} ${finalObject}`;
        const tagline = `The ultimate gadget that ${finalAction}`;
        const description = `Directly from the secret archives of Bean Inventions. Presenting ${finalSubject.toLowerCase()} latest masterpiece: an automated, ${finalAdjective.toLowerCase()} ${finalObject.toLowerCase()} built specifically to ensure it ${finalAction.replace('.', '')}. Tested extensively with Teddy and guaranteed to cause minor community mischief.`;
        const category = ['Inventions', 'Home & Gadgets', 'Automotive', 'Mischief Tech'][Math.floor(Math.random() * 4)];
        const targetAmount = (Math.floor(Math.random() * 12) + 3) * 500; // $1,500 to $6,000

        setSlotResult({ title, tagline, description, category, targetAmount });
        setSlotSpinning(false);
        playSound('success');
      }
    }, 100);
  };

  // Populate Launch Form with Slot Result
  const useGeneratedIdea = () => {
    if (!slotResult) return;
    playSound('click');
    setNewCampaignForm({
      title: slotResult.title,
      tagline: slotResult.tagline,
      description: slotResult.description,
      category: slotResult.category,
      creator: currentUser ? currentUser.username : 'bean',
      targetAmount: slotResult.targetAmount.toString(),
      daysLeft: '30'
    });
    
    if (!currentUser) {
      alert('💡 Log in first to publish your generated project!');
      setAuthMode('login');
      setView('auth');
    } else {
      setShowLaunchModal(true);
    }
  };

  // Toggle Audio
  const toggleThemeAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  // Filter creator campaigns
  const creatorCampaigns = campaigns.filter(c => c.creator.toLowerCase() === currentUser?.username?.toLowerCase());

  return (
    <div className="container">
      <audio ref={audioRef} src={themeSong} loop preload="auto" />

      {/* TOP FLOATING TOGGLES */}
      <div className="top-toggles">
        <button 
          className={`sound-toggle-btn ${soundEnabled ? 'active' : ''}`}
          onClick={() => { setSoundEnabled(!soundEnabled); playSound('click'); }}
          title={soundEnabled ? "Disable SFX" : "Enable SFX"}
        >
          {soundEnabled ? '🔊 SFX ON' : '🔇 SFX OFF'}
        </button>
      </div>

      {/* Main Navigation Header */}
      <header className="header">
        <div className="brand" onClick={() => { playSound('click'); setView('landing'); }}>
          <TeddyIllustration className="teddy-icon" />
          <div>
            <h1 className="title">BEANFUND.</h1>
            <p className="subtitle font-mono">Mr. Bean's Crowdfunding Haven for Ridiculous Inventions</p>
          </div>
        </div>

        <nav className="header-nav">
          <button className={`nav-link-btn ${view === 'landing' ? 'active' : ''}`} onClick={() => { playSound('click'); setView('landing'); }}>
            🏠 Home
          </button>
          <button className={`nav-link-btn ${view === 'explore' ? 'active' : ''}`} onClick={() => { playSound('click'); setView('explore'); }}>
            🔥 Explore Projects
          </button>
          
          {currentUser ? (
            <>
              <button className={`nav-link-btn ${view === 'creator' ? 'active' : ''}`} onClick={() => { playSound('click'); setView('creator'); }}>
                🛠️ Creator Studio
              </button>
              <button className={`nav-link-btn ${view === 'profile' ? 'active' : ''}`} onClick={() => { playSound('click'); setView('profile'); }}>
                👤 {currentUser.avatar} {currentUser.username}
              </button>
              <button className="nav-link-btn logout-link" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <button className={`nav-link-btn auth-link ${view === 'auth' ? 'active' : ''}`} onClick={() => { playSound('click'); setView('auth'); }}>
              🔑 Login / Join
            </button>
          )}
        </nav>
      </header>

      {/* VIEW 1: LANDING PAGE */}
      {view === 'landing' && (
        <div className="landing-view">
          <section className="hero-section">
            <div className="hero-content">
              <span className="hero-badge">💡 THE WORLD'S ONLY RIDICULOUS CROWDFUNDING SITE</span>
              <h1 className="hero-title">Crowdfund your mischief. Fund silly creations.</h1>
              <p className="hero-desc">
                From self-buttering toast armchairs to stabilized three-wheeled vehicles, BEANFUND is the home for inventions that the mainstream crowdfunding companies are too afraid to list.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary hero-btn-large" onClick={() => { playSound('click'); setView('explore'); }}>
                  🔥 Explore Wild Inventions
                </button>
                <button className="btn hero-btn-large bg-yellow" onClick={() => { 
                  playSound('click'); 
                  if (!currentUser) { setAuthMode('login'); setView('auth'); } else { setView('creator'); }
                }}>
                  🚀 Start a Campaign
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="large-teddy-frame">
                <TeddyIllustration className="giant-teddy" />
                <span className="visual-caption font-mono">Hover to squeeze Teddy 🧸</span>
              </div>
            </div>
          </section>

          {/* Quick Platform Stats */}
          <div className="stats-dashboard text-center">
            <div className="stat-card">
              <span className="stat-value">${stats.totalRaised ? stats.totalRaised.toLocaleString() : '16,270'}</span>
              <span className="stat-label">Raised For Mischief</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalBackers || 304}</span>
              <span className="stat-label">Crazy Backers</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.fundedCampaigns || 1} / {stats.totalCampaigns || campaigns.length}</span>
              <span className="stat-label">Delivered Prototypes</span>
            </div>
          </div>

          {/* Premium Showcase Features */}
          <section className="features-showcase">
            <h2 className="section-title text-center">What makes us totally different?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feat-emoji">🎰</span>
                <h3>The Bean-o-Matic 3000</h3>
                <p>Have writer's block? Use our randomized client-side generator to roll Mr. Bean action, adjective, and object combinations to formulate your campaign draft instantly!</p>
              </div>
              <div className="feature-card">
                <span className="feat-emoji">🗳️</span>
                <h3>Interactive Decision Polls</h3>
                <p>Creators don't just take your money and disappear. Backers get a democratic vote on key design phases like prototype colors, accessory options, and wool types!</p>
              </div>
              <div className="feature-card">
                <span className="feat-emoji">📊</span>
                <h3>Live Budget Calculator</h3>
                <p>Simulate your pledge amount! Drag the slider to see dynamically down to the penny where your dollar goes across materials, insurance, and emergency tea rations.</p>
              </div>
              <div className="feature-card">
                <span className="feat-emoji">📌</span>
                <h3>Backer Wall Bulletin Board</h3>
                <p>Leave your mark! All backing actions are accompanied by custom-colored Neubrutalist sticky notes pinned directly to the campaign community corkboard.</p>
              </div>
            </div>
          </section>

          {/* Characters Testimonials */}
          <section className="testimonials-section">
            <h2 className="section-title text-center">What our neighborhood says</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card rotate-left">
                <p className="quote">"I backed the sandwich sofa. I still think Bean is a menace to the building, but the teabag dispenser has a 90% accuracy rate."</p>
                <div className="quote-author">- Mrs. Wicket (Landlady)</div>
              </div>
              <div className="testimonial-card rotate-right">
                <p className="quote">"Teddy looks so beautiful in his new Royal Guard uniform! The backer polls picked the best color outfit. Best $200 I ever spent!"</p>
                <div className="quote-author">- Irma Gobb (Admirer)</div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: EXPLORE / CAMPAIGNS */}
      {view === 'explore' && (
        <div className="app-grid">
          
          {/* Main listing & search */}
          <main className="main-content-area">
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
                        onClick={() => { playSound('click'); setCategory(cat); }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="status-toggle">
                  <button
                    className={`status-btn ${statusFilter === 'All' ? 'active' : ''}`}
                    onClick={() => { playSound('click'); setStatusFilter('All'); }}
                  >
                    All
                  </button>
                  <button
                    className={`status-btn ${statusFilter === 'Active' ? 'active' : ''}`}
                    onClick={() => { playSound('click'); setStatusFilter('Active'); }}
                  >
                    Active 🔥
                  </button>
                  <button
                    className={`status-btn ${statusFilter === 'Funded' ? 'active' : ''}`}
                    onClick={() => { playSound('click'); setStatusFilter('Funded'); }}
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
                  <button className="clear-btn" onClick={() => { playSound('click'); setSearch(''); }}>
                    ✖
                  </button>
                )}
              </div>
            </div>

            {/* Campaign Grid */}
            {loading ? (
              <div className="loading-card">
                <div className="spinner"></div>
                <p>Loading Live Crowdfunding Campaigns from Server...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="empty-card">
                <p>No projects match your filter criteria.</p>
                <button className="btn" onClick={() => { playSound('click'); setCategory('All'); setStatusFilter('All'); setSearch(''); }}>
                  Reset Filters
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
                          {isFunded ? '🎉 FUNDED' : `⏳ ${c.daysLeft} Days Left`}
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
                            playSound('click');
                            setSelectedCampaign(c);
                            setActiveTab('details');
                            setSimulatedPledge(100);
                            setSelectedReward(c.rewards && c.rewards.length > 0 ? c.rewards[0] : null);
                          }}
                        >
                          ⚡ View Details & Back
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* RIGHT COLUMN: The Bean-o-Matic 3000 Widget */}
          <aside className="aside-panel">
            <div className="beanomatic-widget">
              <div className="widget-header">
                <span className="widget-badge">🤖 IDEA LAB</span>
                <h3 className="widget-title">The Bean-o-Matic 3000</h3>
                <p className="widget-desc">Generate a hilarious, Mr. Bean-approved crowdfunding idea instantly!</p>
              </div>

              <div className="slot-machine">
                <div className="slot-screen">
                  {slotSpinning ? (
                    <div className="slot-spin-content">
                      <span className="slot-spin-word">{slotTicker.subject}</span>
                      <span className="slot-spin-word">{slotTicker.adjective}</span>
                      <span className="slot-spin-word">{slotTicker.object}</span>
                    </div>
                  ) : slotResult ? (
                    <div className="slot-result-content">
                      <div className="result-title">{slotResult.title}</div>
                      <div className="result-tagline">"{slotResult.tagline}"</div>
                      <div className="result-meta">
                        <span>Goal: ${slotResult.targetAmount}</span> | <span>{slotResult.category}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="slot-placeholder">
                      <span>🎰 Lever Ready! Pull to Spin.</span>
                    </div>
                  )}
                </div>

                <div className="slot-controls">
                  <button 
                    className={`btn slot-lever-btn ${slotSpinning ? 'disabled' : ''}`}
                    onClick={pullSlotLever}
                    disabled={slotSpinning}
                  >
                    {slotSpinning ? '⚙️ SPINNING...' : '🎰 PULL LEVER'}
                  </button>

                  {slotResult && !slotSpinning && (
                    <button className="btn btn-primary slot-launch-btn" onClick={useGeneratedIdea}>
                      🚀 LAUNCH THIS IDEA
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* VIEW 3: AUTHENTICATION (LOGIN & SIGN UP) */}
      {view === 'auth' && (
        <div className="auth-view-container">
          <div className="auth-card">
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { playSound('click'); setAuthMode('login'); setAuthError(''); }}
              >
                🔐 Account Login
              </button>
              <button 
                className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { playSound('click'); setAuthMode('register'); setAuthError(''); }}
              >
                📝 Join BEANFUND
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form form-body">
              {authError && <div className="error-alert">{authError}</div>}
              
              <div className="demo-tip font-mono">
                💡 <strong>Seed Accounts Available:</strong><br />
                Usernames: <strong>bean</strong>, <strong>irma</strong>, or <strong>wicket</strong><br />
                Passwords: <strong>123</strong> (for all demo users)
              </div>

              <label className="form-label">Username:</label>
              <input 
                type="text" 
                placeholder="e.g. bean" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />

              <label className="form-label">Password:</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />

              {authMode === 'register' && (
                <>
                  <label className="form-label">Choose Avatar Emoji:</label>
                  <div className="emoji-select-row">
                    {['🧸', '❤️', '😾', '🚗', '🥪', '⚙️', '🎩', '💡'].map((em) => (
                      <button
                        type="button"
                        key={em}
                        className={`emoji-btn ${avatarInput === em ? 'active' : ''}`}
                        onClick={() => { playSound('click'); setAvatarInput(em); }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  <label className="form-label">Inventor Bio / Tagline:</label>
                  <textarea 
                    placeholder="Tell the community about your engineering dreams..." 
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows="3"
                  />
                </>
              )}

              <button type="submit" className="btn btn-primary auth-submit-btn">
                {authMode === 'login' ? '🔑 Enter Studio' : '✨ Register Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 4: CREATOR STUDIO (CREATOR DASHBOARD) */}
      {view === 'creator' && currentUser && (
        <div className="creator-view">
          <div className="creator-dashboard-header">
            <span className="creator-badge">🛠️ CREATOR STUDIO</span>
            <h2>Welcome back, {currentUser.username}!</h2>
            <p className="sub-text">Manage your launched projects, post campaign logs, and construct decision polls for your backers.</p>
          </div>

          <div className="creator-grid">
            {/* Left pane: Project listing and updates creator */}
            <div className="creator-left">
              <div className="studio-card">
                <div className="studio-card-header">
                  <h3>My Active Projects</h3>
                  <button className="btn btn-primary" onClick={() => { playSound('click'); setShowLaunchModal(true); }}>
                    🚀 Launch A New Project
                  </button>
                </div>

                {creatorCampaigns.length === 0 ? (
                  <div className="empty-creator-state font-mono">
                    <p>You haven't launched any campaigns yet under this account.</p>
                    <p>💡 Tip: Use the <strong>Bean-o-Matic 3000</strong> generator on the Explore page to roll a hilarious campaign instantly, or click Launch A New Project above!</p>
                  </div>
                ) : (
                  <div className="creator-campaigns-list">
                    {creatorCampaigns.map((c) => {
                      const pct = Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100));
                      return (
                        <div key={c.id} className="creator-camp-item">
                          <div className="camp-item-details">
                            <span className="badge">{c.category}</span>
                            <h4>{c.title}</h4>
                            <p className="font-mono">Raised: <strong>${c.raisedAmount.toLocaleString()}</strong> of ${c.targetAmount.toLocaleString()} ({pct}% funded)</p>
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              playSound('click');
                              setSelectedCampaign(c);
                              setActiveTab('details');
                            }}
                          >
                            👁️ View Details
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Creator Updates Poster */}
              <div className="studio-card">
                <h3>📣 Publish a Project Update Log</h3>
                <p className="section-desc">Keep your backers engaged with recent development milestones and photos (doodles).</p>
                <form onSubmit={handleCreatorUpdateSubmit} className="creator-dashboard-form">
                  <label className="form-label">Select Campaign to Update:</label>
                  <select 
                    value={selectedCampaignIdToUpdate}
                    onChange={(e) => setSelectedCampaignIdToUpdate(e.target.value)}
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <label className="form-label">Update Title / Milestone:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Prototype sewing complete!" 
                    value={creatorUpdateTitle}
                    onChange={(e) => setCreatorUpdateTitle(e.target.value)}
                    required
                  />

                  <label className="form-label">Log Details:</label>
                  <textarea 
                    placeholder="Detail the progress, challenges, and next milestones..." 
                    rows="4" 
                    value={creatorUpdateBody}
                    onChange={(e) => setCreatorUpdateBody(e.target.value)}
                    required
                  />

                  <button type="submit" className="btn btn-primary">📣 Post Update to Backers</button>
                </form>
              </div>
            </div>

            {/* Right pane: Poll creator */}
            <div className="creator-right">
              <div className="studio-card">
                <h3>🗳️ Create a Backer Decision Poll</h3>
                <p className="section-desc">Build interactive choices for your backers to steer the prototype direction.</p>
                
                <form onSubmit={handleCreatorPollSubmit} className="creator-dashboard-form">
                  <label className="form-label">Select Campaign:</label>
                  <select 
                    value={selectedCampaignIdToPoll}
                    onChange={(e) => setSelectedCampaignIdToPoll(e.target.value)}
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <label className="form-label">Poll Question:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Which bowtie fabric should we choose?" 
                    value={creatorPollQuestion}
                    onChange={(e) => setCreatorPollQuestion(e.target.value)}
                    required
                  />

                  <label className="form-label">Options (Comma-Separated):</label>
                  <input 
                    type="text" 
                    placeholder="Red Silk, Blue Tweed, Green Velvet" 
                    value={creatorPollOptionsRaw}
                    onChange={(e) => setCreatorPollOptionsRaw(e.target.value)}
                    required
                  />
                  <span className="input-hint font-mono">Separate options with commas. At least two options required.</span>

                  <button type="submit" className="btn btn-primary">🗳️ Publish Poll</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: USER PROFILE */}
      {view === 'profile' && currentUser && (
        <div className="profile-view">
          <div className="profile-card">
            <div className="profile-header-split">
              <div className="profile-avatar-giant">{currentUser.avatar || '🧸'}</div>
              <div className="profile-meta-info">
                <h2>{currentUser.username}</h2>
                <p className="bio-quote">"{currentUser.bio || 'A mysterious backer of silly inventions.'}"</p>
                <div className="profile-badges-row">
                  <span className="profile-stat-badge">Backed: <strong>{currentUser.backedPledges?.length || 0}</strong> projects</span>
                  <span className="profile-stat-badge">Created: <strong>{currentUser.createdCampaigns?.length || 0}</strong> projects</span>
                </div>
              </div>
            </div>

            <div className="profile-history-section">
              <h3>💸 Pledge Backing History</h3>
              {(!currentUser.backedPledges || currentUser.backedPledges.length === 0) ? (
                <div className="empty-history font-mono">
                  <p>You haven't backed any campaigns yet.</p>
                  <p>Browse our Explore Projects tab and fund the future of ridiculous tech! ⚡</p>
                </div>
              ) : (
                <div className="history-pledges-list">
                  {currentUser.backedPledges.map((p, idx) => (
                    <div key={idx} className="history-pledge-item">
                      <div className="pledge-item-left">
                        <h4>{p.title}</h4>
                        <span className="pledge-date font-mono">{new Date(p.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="pledge-item-right font-mono">
                        Pledged <strong>${p.amount}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED CAMPAIGN MODAL (THE PRODUCT-LEVEL CORE) */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => { playSound('click'); setSelectedCampaign(null); }}>
          <div className="modal-card detailed-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="modal-head detailed-head">
              <div className="head-left">
                <span className="badge">{selectedCampaign.category}</span>
                <h2 className="modal-campaign-title">{selectedCampaign.title}</h2>
                <p className="creator-byline">By <strong>{selectedCampaign.creator}</strong> &bull; {selectedCampaign.daysLeft > 0 ? `⏳ ${selectedCampaign.daysLeft} Days Left` : '🎉 Funded'}</p>
              </div>
              <button className="close-btn" onClick={() => { playSound('click'); setSelectedCampaign(null); }}>✖</button>
            </div>

            {/* Navigation Tabs */}
            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => { playSound('click'); setActiveTab('details'); }}
              >
                📋 Campaign Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
                onClick={() => { playSound('click'); setActiveTab('community'); }}
              >
                💬 Backer Wall ({selectedCampaign.guestbook?.length || 0})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'updates' ? 'active' : ''}`}
                onClick={() => { playSound('click'); setActiveTab('updates'); }}
              >
                📣 Creator Updates ({selectedCampaign.updates?.length || 0})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
                onClick={() => { playSound('click'); setActiveTab('polls'); }}
              >
                🗳️ Decision Polls ({selectedCampaign.polls?.length || 0})
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="modal-body detailed-body">
              
              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="tab-pane-details">
                  <div className="detail-split-layout">
                    {/* Left: Info, budget, stretch goals */}
                    <div className="split-left">
                      <h4 className="section-subtitle">Project Story</h4>
                      <p className="description-text">{selectedCampaign.description}</p>
                      
                      {/* Interactive Stretch Goals */}
                      <div className="stretch-goals-box">
                        <h4 className="section-subtitle">🚧 Stretch Goals Roadmap</h4>
                        <p className="section-desc">Unlock extra features as we raise more funds!</p>
                        <div className="stretch-timeline">
                          {selectedCampaign.stretchGoals && selectedCampaign.stretchGoals.map((goal, idx) => {
                            const isGoalUnlocked = selectedCampaign.raisedAmount >= goal.value;
                            return (
                              <div key={idx} className={`stretch-node ${isGoalUnlocked ? 'unlocked' : 'locked'}`}>
                                <div className="stretch-status-icon">
                                  {isGoalUnlocked ? '✅' : '🔒'}
                                </div>
                                <div className="stretch-info">
                                  <div className="stretch-value">${goal.value.toLocaleString()} Goal</div>
                                  <div className="stretch-label">{goal.label}</div>
                                </div>
                                {isGoalUnlocked && <span className="unlocked-badge">UNLOCKED 🎉</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Budget Simulator */}
                      <div className="budget-simulator-box">
                        <h4 className="section-subtitle">📊 Interactive Budget Allocation</h4>
                        <p className="section-desc">Drag the slider to see how your simulated pledge splits across the project budget!</p>
                        <div className="slider-wrapper">
                          <label className="form-label">Simulated Pledge: <strong>${simulatedPledge}</strong></label>
                          <input 
                            type="range" 
                            min="10" 
                            max="2000" 
                            step="10" 
                            value={simulatedPledge} 
                            onChange={(e) => { playSound('click'); setSimulatedPledge(Number(e.target.value)); }}
                            className="neubrutal-slider"
                          />
                        </div>

                        <div className="budget-breakdown-bars">
                          {selectedCampaign.budgetBreakdown && selectedCampaign.budgetBreakdown.map((item, idx) => {
                            const allocatedDollars = Math.round((simulatedPledge * item.percentage) / 100);
                            return (
                              <div key={idx} className="budget-bar-item">
                                <div className="budget-bar-labels">
                                  <span className="budget-label-name">{item.label} ({item.percentage}%)</span>
                                  <span className="budget-label-amount"><strong>${allocatedDollars}</strong> of your pledge</span>
                                </div>
                                <div className="budget-bar-bg">
                                  <div 
                                    className="budget-bar-fill" 
                                    style={{ width: `${item.percentage}%`, backgroundColor: ['#FFC700', '#00E0FF', '#FF007A', '#00FF66'][idx % 4] }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Pledge Form & Rewards */}
                    <div className="split-right">
                      <div className="pledge-sticky-card">
                        <h4 className="section-subtitle text-center">💸 Pledge Support</h4>
                        
                        <div className="goal-meter-summary">
                          <div className="stat-chunk">
                            <span className="chunk-val">${selectedCampaign.raisedAmount.toLocaleString()}</span>
                            <span className="chunk-lbl">Pledged</span>
                          </div>
                          <div className="stat-chunk">
                            <span className="chunk-val">${selectedCampaign.targetAmount.toLocaleString()}</span>
                            <span className="chunk-lbl">Goal</span>
                          </div>
                        </div>

                        <form onSubmit={handlePledgeSubmit} className="pledge-form">
                          <label className="form-label">Backer Name:</label>
                          <input 
                            type="text" 
                            placeholder="Mrs. Wicket, Irma, Teddy..." 
                            value={backerName} 
                            onChange={(e) => setBackerName(e.target.value)}
                            required
                          />

                          <label className="form-label">Backer Message (Sticky Wall Note):</label>
                          <input 
                            type="text" 
                            placeholder="Add a message to the wall..." 
                            value={backerMessage} 
                            onChange={(e) => setBackerMessage(e.target.value)}
                          />

                          <label className="form-label">Mood Emoji:</label>
                          <div className="emoji-select-row">
                            {['🧸', '❤️', '😂', '😾', '🥪', '🚗'].map((em) => (
                              <button
                                type="button"
                                key={em}
                                className={`emoji-btn ${backerEmoji === em ? 'active' : ''}`}
                                onClick={() => { playSound('click'); setBackerEmoji(em); }}
                              >
                                {em}
                              </button>
                            ))}
                          </div>

                          <label className="form-label">Pledge Amount ($ USD):</label>
                          <div className="preset-pledges">
                            {['10', '25', '50', '150', '500'].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                className={`preset-btn ${pledgeAmount === amt ? 'active' : ''}`}
                                onClick={() => { playSound('click'); setPledgeAmount(amt); }}
                              >
                                ${amt}
                              </button>
                            ))}
                          </div>

                          <input 
                            type="number" 
                            min="1" 
                            value={pledgeAmount}
                            onChange={(e) => setPledgeAmount(e.target.value)}
                            required
                            className="custom-amount-input"
                          />

                          <button type="submit" className="btn btn-primary pledge-submit-btn">
                            💳 CONFIRM PLEDGE
                          </button>
                        </form>

                        {/* Tiered Rewards list */}
                        {selectedCampaign.rewards && (
                          <div className="modal-rewards-list">
                            <span className="reward-section-title">🎁 Tier Rewards Included:</span>
                            {selectedCampaign.rewards.map((rew) => (
                              <div 
                                key={rew.id} 
                                className={`reward-tier-pill ${Number(pledgeAmount) >= rew.minPledge ? 'unlocked' : 'locked'}`}
                                onClick={() => { playSound('click'); setPledgeAmount(rew.minPledge.toString()); }}
                              >
                                <span className="tier-min-pledge">${rew.minPledge}+</span>
                                <div className="tier-details">
                                  <div className="tier-title">{rew.title}</div>
                                  <div className="tier-perk">{rew.perk}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BACKER WALL (GUESTBOOK STICKY NOTES) */}
              {activeTab === 'community' && (
                <div className="tab-pane-community">
                  <div className="community-layout">
                    {/* Add Message Form */}
                    <div className="comment-post-box">
                      <h4 className="section-subtitle">Post a Guestbook Note</h4>
                      <form onSubmit={handleGuestbookSubmit} className="guestbook-inline-form">
                        <div className="inline-row">
                          <input 
                            type="text" 
                            placeholder="Your Name..." 
                            value={guestName} 
                            onChange={(e) => setGuestName(e.target.value)}
                          />
                          <select 
                            value={guestEmoji} 
                            onChange={(e) => setGuestEmoji(e.target.value)}
                          >
                            <option value="💬">💬 Chat</option>
                            <option value="🧸">🧸 Teddy</option>
                            <option value="❤️">❤️ Love</option>
                            <option value="😂">😂 Funny</option>
                            <option value="😾">😾 Scram!</option>
                            <option value="🥪">🥪 Butter</option>
                            <option value="🚗">🚗 Robin</option>
                          </select>
                        </div>
                        <textarea 
                          placeholder="Write something silly or supportive for Mr. Bean's invention..." 
                          value={guestMsg} 
                          onChange={(e) => setGuestMsg(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-primary">📌 Pin Note to Wall</button>
                      </form>
                    </div>

                    {/* Guestbook Sticky Notes Grid */}
                    <div className="sticky-notes-board">
                      {selectedCampaign.guestbook && selectedCampaign.guestbook.length > 0 ? (
                        <div className="sticky-grid">
                          {selectedCampaign.guestbook.map((note) => (
                            <div 
                              key={note.id} 
                              className="sticky-note-card"
                              style={{ transform: `rotate(${(Math.sin(note.id.charCodeAt(5) || 0) * 4).toFixed(1)}deg)` }}
                            >
                              <div className="note-pin">📌</div>
                              <div className="note-header">
                                <span className="note-emoji">{note.emoji || '💬'}</span>
                                <span className="note-author">{note.backerName}</span>
                              </div>
                              <p className="note-text">"{note.message}"</p>
                              <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-guestbook">
                          <p>The wall is empty! Pledgers can write notes, or you can write a note above to be the first! 📌</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CREATOR UPDATES */}
              {activeTab === 'updates' && (
                <div className="tab-pane-updates">
                  <h4 className="section-subtitle">📣 Project Update Logs</h4>
                  {selectedCampaign.updates && selectedCampaign.updates.length > 0 ? (
                    <div className="updates-timeline">
                      {selectedCampaign.updates.map((upd) => (
                        <div key={upd.id} className="timeline-item">
                          <div className="timeline-node"></div>
                          <div className="timeline-card">
                            <div className="timeline-card-header">
                              <h3 className="update-title">{upd.title}</h3>
                              <span className="update-date">{new Date(upd.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="update-body">{upd.body}</p>

                            <div className="update-reactions-row">
                              <span className="reactions-label">Reactions:</span>
                              {['🧸', '❤️', '😂', '🔥', '👍'].map((emoji) => {
                                const count = (upd.reactions && upd.reactions[emoji]) || 0;
                                return (
                                  <button
                                    key={emoji}
                                    className="react-btn"
                                    onClick={() => handleReact(upd.id, emoji)}
                                  >
                                    <span className="react-emoji">{emoji}</span>
                                    <span className="react-count">{count}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-text">No updates posted by the creator yet.</p>
                  )}
                </div>
              )}

              {/* TAB 4: DECISION POLLS */}
              {activeTab === 'polls' && (
                <div className="tab-pane-polls">
                  <h4 className="section-subtitle">🗳️ Creator Backer Polls</h4>
                  <p className="section-desc">Vote on active project development decisions. Everyone can vote!</p>
                  
                  {selectedCampaign.polls && selectedCampaign.polls.length > 0 ? (
                    <div className="polls-list">
                      {selectedCampaign.polls.map((poll) => {
                        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0) || 1;
                        return (
                          <div key={poll.id} className="poll-item-card">
                            <h3 className="poll-question">❓ {poll.question}</h3>
                            <div className="poll-options-list">
                              {poll.options.map((opt) => {
                                const percent = Math.round((opt.votes / totalVotes) * 100);
                                return (
                                  <button
                                    key={opt.id}
                                    className="poll-option-row-btn"
                                    onClick={() => handleVote(poll.id, opt.id)}
                                  >
                                    <div className="option-percentage-bar" style={{ width: `${percent}%` }}></div>
                                    <div className="option-content-flex">
                                      <span className="option-label-text">{opt.label}</span>
                                      <span className="option-votes-stat"><strong>{percent}%</strong> ({opt.votes} votes)</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            <span className="poll-total-votes">Total Votes Cast: {totalVotes}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="empty-text">No active decision polls on this project.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* LAUNCH CAMPAIGN MODAL */}
      {showLaunchModal && (
        <div className="modal-overlay" onClick={() => { playSound('click'); setShowLaunchModal(false); }}>
          <div className="modal-card launch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>🚀 Launch Your Crowdfunding Campaign</h3>
              <button className="close-btn" onClick={() => { playSound('click'); setShowLaunchModal(false); }}>✖</button>
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
                    value={currentUser ? currentUser.username : 'bean'}
                    disabled
                    className="disabled-input"
                  />
                  <span className="input-hint font-mono">Locked to your logged-in username.</span>
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
                <button type="button" className="btn" onClick={() => { playSound('click'); setShowLaunchModal(false); }}>
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
