import React, { useState, useEffect } from 'react';
import type { FarmProject, ProjectExpense, UserSettings } from './utils/helpers';
import {
  loadProjects,
  saveProjects,
  loadSettings,
  saveSettings,
  autoDetectLocation,
  loadProfile,
  saveProfile,
  type FarmerProfile,
  exportToCSV
} from './utils/helpers';
import { fetchWeather, cropBasePrices } from './data/mandiData';
import type { Language, TranslationSet } from './data/translations';
import { translations, languages } from './data/translations';
import { ProjectForm } from './components/ProjectForm';
import { ExpenseForm } from './components/ExpenseForm';
import { MandiWatchPanel } from './components/MandiWatchPanel';
import { AIAnalystPanel } from './components/AIAnalystPanel';
import {
  Sprout,
  Plus,
  Trash2,
  Edit,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  FileDown,
  Globe,
  PlusCircle,
  HelpCircle,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import './styles/App.css';

export default function App() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [onboardName, setOnboardName] = useState('');
  const [onboardLang, setOnboardLang] = useState<Language>('en');
  const [projects, setProjects] = useState<FarmProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Modals visibility
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingProject, setEditingProject] = useState<FarmProject | undefined>(undefined);

  // Load from Spring Boot API on mount (fallback to localStorage if server is offline)
  useEffect(() => {
    const initLoad = async () => {
      try {
        const [profileRes, projectsRes, settingsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/projects'),
          fetch('/api/settings')
        ]);
        
        // Safe helper to check if response is JSON (prevents SyntaxError on Vercel HTML redirects)
        const isJsonResponse = (res: Response) => 
          res.status === 200 && 
          (res.headers.get('content-type')?.includes('application/json') || false);
        
        const profileData = isJsonResponse(profileRes) ? await profileRes.json() : null;
        const projectsData = isJsonResponse(projectsRes) ? await projectsRes.json() : [];
        const settingsData = isJsonResponse(settingsRes) ? await settingsRes.json() : loadSettings();
        
        setProfile(profileData);
        setProjects(projectsData);
        setSettings(settingsData);
        
        if (projectsData.length > 0) {
          setActiveProjectId(projectsData[0].id);
        }
      } catch (error) {
        console.warn("Failed to load from Spring Boot API, falling back to localStorage", error);
        const localProfile = loadProfile();
        setProfile(localProfile);
        const localProjs = loadProjects();
        setProjects(localProjs);
        setSettings(loadSettings());
        if (localProjs.length > 0) {
          setActiveProjectId(localProjs[0].id);
        }
      } finally {
        setIsInitialLoading(false);
      }
    };
    initLoad();
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isInitialLoading) {
      saveProjects(projects);
    }
  }, [projects, isInitialLoading]);

  // Save settings whenever they change
  useEffect(() => {
    if (!isInitialLoading) {
      saveSettings(settings);
      // Sync settings to Spring Boot API in background
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(e => console.warn("Failed to sync settings to API", e));
    }
  }, [settings, isInitialLoading]);

  if (!profile) {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-card">
          <div style={{ textAlign: 'center' }}>
            <div className="onboard-logo">
              <Sprout size={36} color="white" />
            </div>
            <h2 className="onboard-title">किसान खाता</h2>
            <p className="onboard-subtitle">किसान का डिजिटल खाता बही — Your smart farm ledger. Set up your profile to get started.</p>
          </div>

          <div className="form-group">
            <label htmlFor="onboard-name">Your Name</label>
            <input
              id="onboard-name"
              type="text"
              className="form-control"
              value={onboardName}
              onChange={e => setOnboardName(e.target.value)}
              placeholder="Enter your name (e.g. Ramesh Kumar)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="onboard-lang">Preferred Language</label>
            <select
              id="onboard-lang"
              className="form-control"
              value={onboardLang}
              onChange={e => setOnboardLang(e.target.value as Language)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '16px' }}
            onClick={async () => {
              if (onboardName.trim()) {
                const newProfile = { name: onboardName, language: onboardLang, state: 'Maharashtra', district: 'Pune' };
                saveProfile(newProfile);
                setProfile(newProfile);
                const updatedSettings = { ...settings, language: onboardLang };
                setSettings(updatedSettings);
                
                // Sync profile and settings to API
                try {
                  await Promise.all([
                    fetch('/api/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newProfile)
                    }),
                    fetch('/api/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updatedSettings)
                    })
                  ]);
                } catch (e) {
                  console.warn("Failed to sync onboarding details to Spring Boot API", e);
                }
              }
            }}
          >
            <Sprout size={18} />
            Start Farming 🌱
          </button>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="panel-card" style={{ maxWidth: '320px', width: '100%', textAlign: 'center', padding: '30px' }}>
          <Sprout size={48} className="spin-anim" color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontWeight: 800 }}>Loading Kisan Khata...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>Connecting to secure farm ledger</p>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const t = translations[settings?.language] || translations['en'];

  // Weather simulation for the active location
  const activeState = activeProject ? activeProject.state : settings.state;
  const activeDistrict = activeProject ? activeProject.district : settings.district;
  const weather = fetchWeather(activeState, activeDistrict);

  // Financial aggregates across all projects
  const totalExpensesAll = projects.reduce((sum, p) => sum + p.expenses.reduce((s, e) => s + e.amount, 0), 0);
  const totalBudgetAll = projects.reduce((sum, p) => sum + p.budget, 0);

  // Active project expenses
  const activeExpenses = activeProject ? activeProject.expenses : [];
  const activeExpensesTotal = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Categories colors for graphs
  const categoryConfig: Record<ProjectExpense['category'], { color: string; labelKey: string }> = {
    seeds: { color: '#fb7185', labelKey: 'catSeeds' },
    fertilizers: { color: '#34d399', labelKey: 'catFertilizers' },
    tractor: { color: '#fb923c', labelKey: 'catTractor' },
    labor: { color: '#60a5fa', labelKey: 'catLabor' },
    irrigation: { color: '#a78bfa', labelKey: 'catIrrigation' },
    transport: { color: '#2dd4bf', labelKey: 'catTransport' },
    rent: { color: '#e879f9', labelKey: 'catRent' },
    misc: { color: '#9ca3af', labelKey: 'catMisc' }
  };

  // Group active project expenses by category for SVG graphing
  const categoryExpenses = activeExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<ProjectExpense['category'], number>);

  const hasExpenses = activeExpensesTotal > 0;

  // Add/Edit project handlers
  const handleSaveProject = async (projData: Omit<FarmProject, 'id' | 'expenses'>) => {
    let updatedProj: FarmProject;
    if (editingProject) {
      updatedProj = { ...editingProject, ...projData };
      setProjects(prev =>
        prev.map(p =>
          p.id === editingProject.id
            ? updatedProj
            : p
        )
      );
      setEditingProject(undefined);
    } else {
      updatedProj = {
        ...projData,
        id: Date.now().toString(),
        expenses: []
      };
      setProjects(prev => [updatedProj, ...prev]);
      setActiveProjectId(updatedProj.id);
    }
    setShowProjectModal(false);

    // Sync to API
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProj)
      });
    } catch (e) {
      console.warn("Failed to sync project to Spring Boot API", e);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t.deleteProject + '?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProjectId === id) {
        setActiveProjectId(updated.length > 0 ? updated[0].id : null);
      }

      // Sync delete to API
      try {
        await fetch(`/api/projects/${id}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.warn("Failed to delete project from Spring Boot API", e);
      }
    }
  };

  // Add/Delete expense handlers
  const handleSaveExpense = async (expData: Omit<ProjectExpense, 'id'>) => {
    if (!activeProjectId) return;
    const newExpense: ProjectExpense = {
      ...expData,
      id: Date.now().toString()
    };
    
    // Find active project
    const activeProj = projects.find(p => p.id === activeProjectId);
    if (!activeProj) return;

    const updatedProj = { ...activeProj, expenses: [newExpense, ...activeProj.expenses] };
    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId
          ? updatedProj
          : p
      )
    );
    setShowExpenseModal(false);

    // Sync expense to API
    try {
      await fetch(`/api/projects/${activeProjectId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
    } catch (e) {
      console.warn("Failed to add expense to Spring Boot API", e);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeProjectId) return;
    
    const activeProj = projects.find(p => p.id === activeProjectId);
    if (!activeProj) return;

    const updatedProj = { ...activeProj, expenses: activeProj.expenses.filter(e => e.id !== expenseId) };
    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId
          ? updatedProj
          : p
      )
    );

    // Sync delete to API
    try {
      await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("Failed to delete expense from Spring Boot API", e);
    }
  };

  // Geolocation trigger
  const handleGeoDetect = async () => {
    setIsLoadingLocation(true);
    const loc = await autoDetectLocation();
    
    if (activeProject) {
      const updatedProj = { ...activeProject, state: loc.state, district: loc.district };
      setProjects(prev =>
        prev.map(p =>
          p.id === activeProjectId
            ? updatedProj
            : p
        )
      );

      // Sync to API
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProj)
        });
      } catch (e) {
        console.warn("Failed to update project location to Spring Boot API", e);
      }
    } else {
      setSettings(prev => ({ ...prev, state: loc.state, district: loc.district }));
    }
    setIsLoadingLocation(false);
  };

  const handleUpdateProjectLocation = async (state: string, district: string) => {
    if (activeProject) {
      const updatedProj = { ...activeProject, state, district };
      setProjects(prev =>
        prev.map(p =>
          p.id === activeProjectId
            ? updatedProj
            : p
        )
      );

      // Sync to API
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProj)
        });
      } catch (e) {
        console.warn("Failed to update project location to Spring Boot API", e);
      }
    } else {
      setSettings(prev => ({ ...prev, state, district }));
    }
  };

  const handleExportCSV = () => {
    if (!activeProject) return;
    const csv = exportToCSV(activeProject);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KisanKhata_${activeProject.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearAll = () => {
    if (confirm(t.clearAll + '?')) {
      setProjects([]);
      setActiveProjectId(null);
      localStorage.clear();
    }
  };

  // Weather Icon Renderer
  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'rainy': return <CloudRain size={36} color="var(--primary)" />;
      case 'cloudy': return <Cloud size={36} color="#9ca3af" />;
      case 'windy': return <Wind size={36} color="#fb923c" />;
      default: return <Sun size={36} color="var(--accent-saffron)" />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Banner Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo-container">
            <Sprout size={28} />
          </div>
          <div className="app-title-group">
            <h1>{t.appTitle}</h1>
            <p>{t.appSubtitle}</p>
          </div>
        </div>

        <div className="header-controls">
          <div className="control-item">
            <Globe size={18} color="var(--primary)" />
            <select
              className="select-dropdown"
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as Language }))}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
          
          <button className="btn btn-secondary btn-danger" onClick={handleClearAll} style={{ padding: '8px 12px', fontSize: '12px' }}>
            {t.clearAll}
          </button>
        </div>
      </header>

      {/* Aggregate Overview Metrics */}
      <section className="metrics-row">
        <div className="metric-box">
          <span className="metric-label">{t.totalExpenses} (All)</span>
          <span className="metric-value">₹{totalExpensesAll.toLocaleString('en-IN')}</span>
          <span className="metric-sub">Sum of all farm projects</span>
        </div>
        <div className="metric-box saffron">
          <span className="metric-label">{t.totalBudget} (All)</span>
          <span className="metric-value">₹{totalBudgetAll.toLocaleString('en-IN')}</span>
          <span className="metric-sub">Total financial target</span>
        </div>
        <div className="metric-box blue">
          <span className="metric-label">{t.activeProjects}</span>
          <span className="metric-value">{projects.length}</span>
          <span className="metric-sub">Ongoing crops</span>
        </div>
        
        {/* Weather Watch Widget */}
        <div className="metric-box" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            <span className="metric-label">{t.weatherWatch}</span>
            <span className="metric-value" style={{ fontSize: '18px' }}>
              {weather.temp}°C, {weather.condition.toUpperCase()}
            </span>
            <span className="metric-sub">{activeDistrict}, {activeState}</span>
          </div>
          {getWeatherIcon(weather.condition)}
        </div>
      </section>

      {/* Weather tip banner */}
      <div className="weather-tip-banner">
        <AlertCircle size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--primary-hover)', marginRight: '6px' }}>{t.weatherWarning}:</strong>
          <span>{weather.farmingTipLang[settings.language] || weather.farmingTip}</span>
        </div>
      </div>

      {/* Dashboard Panels Layout */}
      <main className="dashboard-grid">
        {/* Left main column */}
        <div className="main-column">
          
          {/* Projects panel card */}
          <div className="panel-card">
            <div className="panel-title">
              <span>{t.activeProjects}</span>
              <div className="projects-header-actions">
                <button className="btn btn-primary" onClick={() => { setEditingProject(undefined); setShowProjectModal(true); }}>
                  <Plus size={16} />
                  {t.addProject}
                </button>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <Sprout size={52} className="empty-state-icon" />
                <p>{t.noProjects}</p>
                <button className="btn btn-primary" onClick={() => { setEditingProject(undefined); setShowProjectModal(true); }}>
                  <Plus size={15} />
                  {t.addProject}
                </button>
              </div>
            ) : (
              <div className="project-list">
                {projects.map((proj) => {
                  const projExpensesTotal = proj.expenses.reduce((s, e) => s + e.amount, 0);
                  const isSelected = proj.id === activeProjectId;
                  const ratio = Math.min(proj.budget > 0 ? (projExpensesTotal / proj.budget) * 100 : 0, 100);
                  const baseCrop = cropBasePrices[proj.cropId];

                  return (
                    <div
                      key={proj.id}
                      className={`project-card ${isSelected ? 'active-selected' : ''}`}
                      onClick={() => setActiveProjectId(proj.id)}
                    >
                      <div className="project-card-header">
                        <div>
                          <div className="project-title">{proj.name}</div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                            <span className="project-crop-badge">
                              <Sprout size={12} color="var(--primary)" />
                              {t[baseCrop?.nameKey || 'cropWheat']}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={10} />
                              {proj.district}, {proj.state}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`project-status-badge status-${proj.status}-bg`}>
                            {proj.status === 'ongoing' ? t.statusOngoing : proj.status === 'harvested' ? t.statusHarvested : t.statusSold}
                          </span>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px' }}
                            onClick={(e) => { e.stopPropagation(); setEditingProject(proj); setShowProjectModal(true); }}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            className="btn btn-secondary btn-danger"
                            style={{ padding: '6px' }}
                            onClick={(e) => handleDeleteProject(proj.id, e)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="project-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">{t.landArea}</span>
                          <span className="detail-val">{proj.landArea} Acres</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.totalExpenses}</span>
                          <span className="detail-val">₹{projExpensesTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.budget}</span>
                          <span className="detail-val">₹{proj.budget.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>Budget Spent: {ratio.toFixed(0)}%</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={10} />
                          {proj.sowingDate}
                        </span>
                      </div>
                      
                      <div className="project-progress-bar-container">
                        <div className="project-progress-bar-fill" style={{ width: `${ratio}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active project details & Expense log */}
          {activeProject && (
            <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="panel-title">
                <span>
                  Expenses Watch - {activeProject.name}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={handleExportCSV}>
                    <FileDown size={14} />
                    Export CSV
                  </button>
                  <button className="btn btn-secondary" onClick={handlePrint}>
                    Print Report
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
                    <PlusCircle size={14} />
                    {t.addExpense}
                  </button>
                </div>
              </div>

              {/* Expense category SVG graphs */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {t.expenseBreakdown}
                </h4>

                {!hasExpenses ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                    No expenses logged for this project yet. Click "Add Expense" to record fertilizer, labor, or seeds purchases.
                  </p>
                ) : (
                  <div className="chart-container">
                    {/* SVG Pie/Doughnut Chart */}
                    <svg className="chart-svg" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="25" />
                      {(() => {
                        let currentAngle = -90;
                        return Object.entries(categoryConfig).map(([cat, cfg]) => {
                          const amt = categoryExpenses[cat as ProjectExpense['category']] || 0;
                          if (amt === 0) return null;
                          const pct = amt / activeExpensesTotal;
                          const sweep = pct * 360;
                          
                          // Convert polar to cartesian
                          const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
                            const radians = (angle * Math.PI) / 180;
                            return {
                              x: cx + r * Math.cos(radians),
                              y: cy + r * Math.sin(radians)
                            };
                          };

                          const r = 85;
                          const start = polarToCartesian(100, 100, r, currentAngle);
                          const end = polarToCartesian(100, 100, r, currentAngle + sweep);
                          const largeArcFlag = sweep > 180 ? 1 : 0;
                          
                          const d = [
                            'M', start.x, start.y,
                            'A', r, r, 0, largeArcFlag, 1, end.x, end.y
                          ].join(' ');

                          currentAngle += sweep;

                          return (
                            <path
                              key={cat}
                              d={d}
                              fill="none"
                              stroke={cfg.color}
                              strokeWidth="25"
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dasharray 0.3s ease' }}
                            />
                          );
                        });
                      })()}
                      <circle cx="100" cy="100" r="55" fill="var(--bg-secondary)" />
                      <text x="100" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">TOTAL</text>
                      <text x="100" y="115" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="800">
                        ₹{activeExpensesTotal.toLocaleString('en-IN')}
                      </text>
                    </svg>

                    {/* Chart Legend */}
                    <div className="chart-legend">
                      {Object.entries(categoryConfig).map(([cat, cfg]) => {
                        const val = categoryExpenses[cat as ProjectExpense['category']] || 0;
                        if (val === 0) return null;
                        const pct = (val / activeExpensesTotal) * 100;
                        return (
                          <div key={cat} className="legend-item">
                            <div className="legend-label-group">
                              <span className="legend-color" style={{ backgroundColor: cfg.color }}></span>
                              <span>{t[cfg.labelKey as keyof TranslationSet] || cat}</span>
                            </div>
                            <span style={{ fontWeight: 'bold' }}>
                              ₹{val.toLocaleString('en-IN')} ({pct.toFixed(0)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Expense details list */}
              {activeExpenses.length > 0 && (
                <div className="expense-list-container">
                  <table className="expense-table">
                    <thead>
                      <tr>
                        <th>{t.expenseDate}</th>
                        <th>{t.expenseCategory}</th>
                        <th>{t.description}</th>
                        <th>{t.expenseAmount}</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeExpenses.map((exp) => {
                        const cfg = categoryConfig[exp.category];
                        return (
                          <tr key={exp.id}>
                            <td style={{ color: 'var(--text-secondary)' }}>{exp.date}</td>
                            <td>
                              <span
                                className="expense-cat-tag"
                                style={{ borderLeft: `3px solid ${cfg?.color || 'var(--border-glass)'}`, paddingLeft: '6px' }}
                              >
                                {t[cfg?.labelKey as keyof TranslationSet] || exp.category}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{exp.description}</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary-hover)' }}>
                              ₹{exp.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary btn-danger"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => handleDeleteExpense(exp.id)}
                              >
                                {t.deleteProject}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar column */}
        <div className="sidebar-column">
          {activeProject ? (
            <>
              {/* Optional APMC market checker (optional toggling supported by configuration) */}
              {activeProject.useMarketPricing ? (
                <MandiWatchPanel
                  project={activeProject}
                  t={t}
                  onLocationChange={handleUpdateProjectLocation}
                  onDetectLocation={handleGeoDetect}
                  isLoadingLocation={isLoadingLocation}
                />
              ) : (
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="panel-title">
                    <span>
                      <MapPin size={20} color="var(--text-muted)" />
                      {t.marketPriceEngine}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Market price integration is currently disabled for this crop. Enable it in project settings to forecast profits.
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setProjects(prev =>
                        prev.map(p =>
                          p.id === activeProjectId
                            ? { ...p, useMarketPricing: true }
                            : p
                        )
                      );
                    }}
                  >
                    Enable Mandi Ticker & ROI
                  </button>
                </div>
              )}

              {/* Local AI Advisor agronomist */}
              <AIAnalystPanel
                project={activeProject}
                t={t}
                language={settings.language}
              />
            </>
          ) : (
            <div className="panel-card empty-state">
              <HelpCircle size={44} className="empty-state-icon" />
              <p>Add a project or select one to unlock live mandi prices and the AI agronomist advisor.</p>
            </div>
          )}
        </div>
      </main>

      {/* Project Form Modal */}
      {showProjectModal && (
        <ProjectForm
          onClose={() => { setShowProjectModal(false); setEditingProject(undefined); }}
          onSave={handleSaveProject}
          project={editingProject}
          t={t}
          defaultState={settings.state}
          defaultDistrict={settings.district}
        />
      )}

      {/* Expense Form Modal */}
      {showExpenseModal && (
        <ExpenseForm
          onClose={() => setShowExpenseModal(false)}
          onSave={handleSaveExpense}
          t={t}
        />
      )}
    </div>
  );
}
