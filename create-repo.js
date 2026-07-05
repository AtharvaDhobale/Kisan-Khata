const https = require('https');

// This script creates a GitHub repo via the API
// It requires a Personal Access Token (PAT) passed as argument
const token = process.argv[2];
if (!token) {
  console.error('Usage: node create-repo.js <GITHUB_PAT>');
  process.exit(1);
}

const data = JSON.stringify({
  name: 'farmoholic',
  description: 'Smart farm management app for Indian farmers — track crop expenses, monitor live APMC mandi prices, and get AI agronomist advice in 9 Indian languages',
  private: false,
  auto_init: false,
  has_issues: true,
  has_projects: true,
  has_wiki: false
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/user/repos',
  method: 'POST',
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Farmoholic-Setup',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    const result = JSON.parse(body);
    if (res.statusCode === 201) {
      console.log('SUCCESS: Repository created!');
      console.log('URL:', result.html_url);
      console.log('Clone URL:', result.clone_url);
    } else if (res.statusCode === 422) {
      console.log('ALREADY_EXISTS: Repository already exists, that is fine!');
    } else {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
