import subprocess

git_show = subprocess.run(['git', 'show', 'HEAD:frontend/src/pages/AdminDashboard.tsx'], capture_output=True, text=True, encoding='utf-8')
text = git_show.stdout

start_idx = text.find("{activeTab === 'settings' && (")
if start_idx != -1:
    end_idx = text.find("      </div>\n\n      {/* ASSIGN VALIDATOR MODAL */}", start_idx)
    if end_idx != -1:
        settings_block = text[start_idx:end_idx]
        
        with open('frontend/src/pages/AdminManagement.tsx', 'r', encoding='utf-8') as f2:
            mgmt = f2.read()
        
        mgmt = mgmt.replace("      </div>\n\n      {/* ADD USER MODAL */}", f"      {settings_block}\n      </div>\n\n      {{/* ADD USER MODAL */}}")
        
        with open('frontend/src/pages/AdminManagement.tsx', 'w', encoding='utf-8') as f3:
            f3.write(mgmt)
        print("Settings block restored")
    else:
        print("End index not found")
else:
    print("Start index not found")
