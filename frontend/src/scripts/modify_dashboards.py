import re
import os

# 1. Update AdminManagement.tsx
management_path = r"C:\Users\iyede\code\__lab__\skripsihub\frontend\src\pages\AdminManagement.tsx"
with open(management_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change component name
content = content.replace("export const AdminDashboard: React.FC = () => {", "export const AdminManagement: React.FC = () => {")

# Remove unused states and functions
content = re.sub(r"const \[submissions.*?\] = useState<Submission\[\]>\(\[\]\);\n", "", content)
content = re.sub(r"const \[validators.*?\] = useState<ValidatorInfo\[\]>\(\[\]\);\n", "", content)
content = re.sub(r"const \[allTitles.*?\] = useState<any\[\]>\(\[\]\);\n", "", content)
content = re.sub(r"const \[stats.*?\] = useState<AdminStats \| null>\(null\);\n", "", content)

# Remove Filters & Pagination related to submissions
content = re.sub(r"// Filters & Pagination\n[\s\S]*?const \[totalSubmissions.*?\] = useState\(0\);\n", "", content)

# Remove Assignment Modal
content = re.sub(r"// Assignment Modal\n[\s\S]*?const \[assignError.*?\] = useState<string \| null>\(null\);\n", "", content)

# Fix fetchInitialData
content = re.sub(r"api\.getValidators\(\),\n\s*api\.getUsers\(\),\n\s*api\.getAdminStats\(\),\n\s*api\.getTopics\(\),\n\s*api\.getAllTitles\(\),", "api.getUsers(),\n        api.getTopics(),", content)
content = re.sub(r"if \(valRes\.success\) setValidators\(valRes\.data \|\| \[\]\);\n", "", content)
content = re.sub(r"if \(usrRes\.success\) setUsers\(usrRes\.data \|\| \[\]\);\n\s*if \(statsRes\.success\) setStats\(statsRes\.data\);\n\s*if \(topRes\.success\) setTopics\(topRes\.data \|\| \[\]\);\n\s*if \(allTitlesRes\.success\) setAllTitles\(allTitlesRes\.data \|\| \[\]\);", "if (usrRes.success) setUsers(usrRes.data || []);\n      if (topRes.success) setTopics(topRes.data || []);", content)

# Replace fetchPromise array destructuring
content = re.sub(r"const \[valRes, usrRes, statsRes, topRes, allTitlesRes\] = await Promise\.all\(\[", "const [usrRes, topRes] = await Promise.all([", content)

# Remove fetchSubmissions
content = re.sub(r"const fetchSubmissions = async \(\) => {[\s\S]*?};\n\n", "", content)

# Remove handleAssignValidator
content = re.sub(r"const handleAssignValidator = async \(e: React\.FormEvent\) => {[\s\S]*?};\n\n", "", content)

# Change activeTab initial state
content = content.replace("const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'topics' | 'all_titles' | 'settings'>('submissions');", "const [activeTab, setActiveTab] = useState<'users' | 'topics' | 'settings'>('users');")

# Remove useEffect for submissions
content = re.sub(r"useEffect\(\(\) => {\n\s*if \(activeTab === 'submissions'\) fetchSubmissions\(\);\n\s*}\[\s\S\]*?\);\n\n", "", content)

# Remove getStatusBadge
content = re.sub(r"const getStatusBadge = \(status: SubmissionStatus\) => {[\s\S]*?};\n\n", "", content)

# Update Title
content = content.replace("Admin Management Portal", "Management Portal")
content = content.replace("Review thesis proposals, assign validators, and manage user accounts.", "Manage user accounts, topics, and system settings.")

# Keep only relevant tabs buttons
tabs_to_remove = r"""<button\s*onClick=\{\(\) => setActiveTab\('submissions'\)\}[\s\S]*?</button>|""" \
                 r"""<button\s*onClick=\{\(\) => setActiveTab\('all_titles'\)\}[\s\S]*?</button>"""
content = re.sub(tabs_to_remove, "", content)

# Remove Overview Stats
content = re.sub(r"\{\/\* Overview Stats \*\/\}\n\s*<div className=\"grid grid-cols-2 sm:grid-cols-4 gap-4\">[\s\S]*?</div>\n\s*</div>", "", content)

# Remove TAB 1
content = re.sub(r"\{\/\* TAB 1: SUBMISSIONS QUEUE \*\/\}\n\s*\{activeTab === 'submissions' && \([\s\S]*?\}\)\}\n\s*</div>\n\s*\)\}", "", content)

# Remove TAB 4
content = re.sub(r"\{\/\* TAB 4: ALL TITLES \*\/\}\n\s*\{activeTab === 'all_titles' && \([\s\S]*?</div>\n\s*\)\}", "", content)

# Remove ASSIGN VALIDATOR MODAL
content = re.sub(r"\{\/\* ASSIGN VALIDATOR MODAL \*\/\}\n\s*\{assigningSubmission && \([\s\S]*?</div>\n\s*\)\}", "", content)

with open(management_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update AdminDashboard.tsx
dashboard_path = r"C:\Users\iyede\code\__lab__\skripsihub\frontend\src\pages\AdminDashboard.tsx"
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Change activeTab initial state
content2 = content2.replace("const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'topics' | 'all_titles' | 'settings'>('submissions');", "const [activeTab, setActiveTab] = useState<'submissions' | 'all_titles'>('submissions');")

# Remove unused states and functions
content2 = re.sub(r"const \[users.*?\] = useState<User\[\]>\(\[\]\);\n", "", content2)
content2 = re.sub(r"const \[topics.*?\] = useState<Topic\[\]>\(\[\]\);\n", "", content2)

# Remove Add User Modal, Edit User Modal, Delete User Dialog, Add Topic Modal, Settings state
content2 = re.sub(r"// Add User Modal\n[\s\S]*?const \[savingDepartment.*?\] = useState\(false\);\n", "", content2)
content2 = re.sub(r"const \[roleFilter, setRoleFilter\] = useState<string>\('ALL'\);\n", "", content2)

# Fix fetchInitialData
content2 = re.sub(r"const \[valRes, usrRes, statsRes, topRes, allTitlesRes\] = await Promise\.all\(\[[\s\S]*?\]\);", "const [valRes, statsRes, allTitlesRes] = await Promise.all([\n        api.getValidators(),\n        api.getAdminStats(),\n        api.getAllTitles(),\n      ]);", content2)
content2 = re.sub(r"if \(valRes\.success\) setValidators\(valRes\.data \|\| \[\]\);\n\s*if \(usrRes\.success\) setUsers\(usrRes\.data \|\| \[\]\);\n\s*if \(statsRes\.success\) setStats\(statsRes\.data\);\n\s*if \(topRes\.success\) setTopics\(topRes\.data \|\| \[\]\);\n\s*if \(allTitlesRes\.success\) setAllTitles\(allTitlesRes\.data \|\| \[\]\);\n", "if (valRes.success) setValidators(valRes.data || []);\n      if (statsRes.success) setStats(statsRes.data);\n      if (allTitlesRes.success) setAllTitles(allTitlesRes.data || []);\n", content2)
content2 = re.sub(r"// Fetch default department\n\s*try \{[\s\S]*?\} catch \{ /\* ignore \*/ \}\n", "", content2)

# Remove handleCreateUser, handleUpdateUser, confirmDeleteUser, handleCreateTopic, handleToggleTopic, handleSaveDefaultDepartment
content2 = re.sub(r"const handleCreateUser = async \(e: React\.FormEvent\) => {[\s\S]*?};\n\n", "", content2)
content2 = re.sub(r"const handleUpdateUser = async \(e: React\.FormEvent\) => {[\s\S]*?};\n\n", "", content2)
content2 = re.sub(r"const confirmDeleteUser = async \(\) => {[\s\S]*?};\n\n", "", content2)
content2 = re.sub(r"const handleCreateTopic = async \(e: React\.FormEvent\) => {[\s\S]*?};\n\n", "", content2)
content2 = re.sub(r"const handleToggleTopic = async \(topicId: string\) => {[\s\S]*?};\n\n", "", content2)
content2 = re.sub(r"const handleSaveDefaultDepartment = async \(\) => {[\s\S]*?};\n\n", "", content2)

content2 = re.sub(r"const filteredUsers = users\.filter\(\(u\) => \{[\s\S]*?\}\);\n\n", "", content2)

# Remove users, topics, settings tabs buttons
tabs_to_remove2 = r"""<button\s*onClick=\{\(\) => setActiveTab\('users'\)\}[\s\S]*?</button>|""" \
                  r"""<button\s*onClick=\{\(\) => setActiveTab\('topics'\)\}[\s\S]*?</button>|""" \
                  r"""<button\s*onClick=\{\(\) => setActiveTab\('settings'\)\}[\s\S]*?</button>"""
content2 = re.sub(tabs_to_remove2, "", content2)

# Remove TAB 2, TAB 3
content2 = re.sub(r"\{\/\* TAB 2: USER MANAGEMENT \*\/\}\n\s*\{activeTab === 'users' && \([\s\S]*?</div>\n\s*\)\}", "", content2)
content2 = re.sub(r"\{\/\* TAB 3: TOPICS MANAGEMENT \*\/\}\n\s*\{activeTab === 'topics' && \([\s\S]*?</div>\n\s*\)\}", "", content2)
content2 = re.sub(r"\{activeTab === 'settings' && \([\s\S]*?</div>\n\s*\)\}", "", content2)

# Remove ADD USER MODAL, EDIT USER MODAL, ADD TOPIC MODAL, ConfirmationModal for delete user
content2 = re.sub(r"\{\/\* ADD USER MODAL \*\/\}\n\s*\{showAddUserModal && \([\s\S]*?</div>\n\s*\)\}", "", content2)
content2 = re.sub(r"\{\/\* EDIT USER MODAL \*\/\}\n\s*\{showEditUserModal && editingUser && \([\s\S]*?</div>\n\s*\)\}", "", content2)
content2 = re.sub(r"\{\/\* ADD TOPIC MODAL \*\/\}\n\s*\{showAddTopicModal && \([\s\S]*?</div>\n\s*\)\}", "", content2)
content2 = re.sub(r"<ConfirmationModal\s*isOpen=\{!!userToDelete\}[\s\S]*?/>\n", "", content2)

# In all_titles, topics map might fail because topics is removed. Let's fix that.
# Find: ...topics.map(t => ({ value: t.name, label: t.name }))
# Replace with just generic or fetch topics. We can keep topics state just for filter if needed.
# Let's restore topics state for all_titles filter.
content2 = content2.replace("const [allTitles, setAllTitles] = useState<any[]>([]);", "const [allTitles, setAllTitles] = useState<any[]>([]);\n  const [topics, setTopics] = useState<Topic[]>([]);")
content2 = content2.replace("const [valRes, statsRes, allTitlesRes] = await Promise.all([", "const [valRes, statsRes, allTitlesRes, topRes] = await Promise.all([")
content2 = content2.replace("api.getAllTitles(),\n      ]);", "api.getAllTitles(),\n        api.getTopics(),\n      ]);")
content2 = content2.replace("if (allTitlesRes.success) setAllTitles(allTitlesRes.data || []);", "if (allTitlesRes.success) setAllTitles(allTitlesRes.data || []);\n      if (topRes.success) setTopics(topRes.data || []);")

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content2)

print("Done")
