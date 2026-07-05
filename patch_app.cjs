const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Inject imports
if (!code.includes('loadProfile')) {
  code = code.replace(
    'autoDetectLocation,',
    'autoDetectLocation,\n  loadProfile,\n  saveProfile,\n  type FarmerProfile,'
  );
}

// Inject state
if (!code.includes('const [profile')) {
  code = code.replace(
    'export default function App() {',
    `export default function App() {\n  const [profile, setProfile] = useState<FarmerProfile | null>(loadProfile());\n  const [onboardName, setOnboardName] = useState('');\n  const [onboardLang, setOnboardLang] = useState<Language>('en');`
  );
}

// Inject Onboarding View
const onboardView = `
  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-default)', padding: '20px' }}>
        <div className="panel-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', background: '#ffffff' }}>
          <Sprout size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Welcome to Farmoholic</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please set up your farmer profile.</p>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Your Name</label>
            <input type="text" className="form-input" value={onboardName} onChange={e => setOnboardName(e.target.value)} placeholder="Enter your name" />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Preferred Language</label>
            <select className="form-input" value={onboardLang} onChange={e => setOnboardLang(e.target.value as Language)}>
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            onClick={() => {
              if (onboardName.trim()) {
                const newProfile = { name: onboardName, language: onboardLang, state: 'Maharashtra', district: 'Pune' };
                saveProfile(newProfile);
                setProfile(newProfile);
                setSettings({ ...settings, language: onboardLang });
              }
            }}
          >
            Start Farming
          </button>
        </div>
      </div>
    );
  }
`;

if (!code.includes('if (!profile) {')) {
  code = code.replace(
    '  // Modals visibility',
    onboardView + '\n\n  // Modals visibility'
  );
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx onboarding patch applied!');
