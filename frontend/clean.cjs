const fs = require('fs');
const path = require('path');

const adminDashboardPath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.tsx');
const adminManagementPath = path.join(__dirname, 'src', 'pages', 'AdminManagement.tsx');

let adminCode = fs.readFileSync(adminDashboardPath, 'utf8');

// For AdminDashboard, we want to remove 'users', 'topics', 'settings' tabs from the UI.
// And from the initial state: useState<'submissions' | 'users' | 'topics' | 'all_titles' | 'settings'>('submissions');
adminCode = adminCode.replace(
  "useState<'submissions' | 'users' | 'topics' | 'all_titles' | 'settings'>('submissions')",
  "useState<'submissions' | 'all_titles'>('submissions')"
);

// Remove the 3 tab buttons from UI
adminCode = adminCode.replace(/<button\s+onClick=\{\(\) => setActiveTab\('users'\)\}[\s\S]*?<\/button>/, '');
adminCode = adminCode.replace(/<button\s+onClick=\{\(\) => setActiveTab\('topics'\)\}[\s\S]*?<\/button>/, '');
adminCode = adminCode.replace(/<button\s+onClick=\{\(\) => setActiveTab\('settings'\)\}[\s\S]*?<\/button>/, '');

// Remove TAB 2, TAB 3, Settings
adminCode = adminCode.replace(/\{\/\* TAB 2: USER MANAGEMENT \*\/\}[\s\S]*?\{\/\* TAB 3: TOPICS MANAGEMENT \*\/\}/, '{/* TAB 3: TOPICS MANAGEMENT */}');
adminCode = adminCode.replace(/\{\/\* TAB 3: TOPICS MANAGEMENT \*\/\}[\s\S]*?\{\/\* TAB 4: ALL TITLES \*\/\}/, '{/* TAB 4: ALL TITLES */}');
adminCode = adminCode.replace(/\{activeTab === 'settings' && \([\s\S]*?\}\)[\s\r\n]*<\/div>[\s\r\n]*\{\/\* ASSIGN VALIDATOR MODAL \*\/\}/, '</div>\n\n      {/* ASSIGN VALIDATOR MODAL */}');

fs.writeFileSync(adminDashboardPath, adminCode);


let mgmtCode = fs.readFileSync(adminManagementPath, 'utf8');

mgmtCode = mgmtCode.replace(
  "useState<'submissions' | 'users' | 'topics' | 'all_titles' | 'settings'>('users')",
  "useState<'users' | 'topics' | 'settings'>('users')"
);

// Remove the submissions and all_titles buttons from UI
mgmtCode = mgmtCode.replace(/<button\s+onClick=\{\(\) => setActiveTab\('submissions'\)\}[\s\S]*?<\/button>/, '');
mgmtCode = mgmtCode.replace(/<button\s+onClick=\{\(\) => setActiveTab\('all_titles'\)\}[\s\S]*?<\/button>/, '');

// Remove stats block
mgmtCode = mgmtCode.replace(/\{\/\* Overview Stats \*\/\}[\s\S]*?\{\/\* TAB 1: SUBMISSIONS QUEUE \*\/\}/, '{/* TAB 1: SUBMISSIONS QUEUE */}');

// Remove TAB 1, TAB 4, ASSIGN VALIDATOR MODAL
mgmtCode = mgmtCode.replace(/\{\/\* TAB 1: SUBMISSIONS QUEUE \*\/\}[\s\S]*?\{\/\* TAB 2: USER MANAGEMENT \*\/\}/, '{/* TAB 2: USER MANAGEMENT */}');
mgmtCode = mgmtCode.replace(/\{\/\* TAB 4: ALL TITLES \*\/\}[\s\S]*?\{activeTab === 'settings' && \(/, '{activeTab === "settings" && (');
mgmtCode = mgmtCode.replace(/\{\/\* ASSIGN VALIDATOR MODAL \*\/\}[\s\S]*?\{\/\* ADD USER MODAL \*\/\}/, '{/* ADD USER MODAL */}');

fs.writeFileSync(adminManagementPath, mgmtCode);
console.log("Done");
