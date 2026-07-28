import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: Could not find block in {filepath}:\n{old[:50]}...")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

manage_file = 'src/pages/AdminManagement.tsx'
manage_replacements = [
    (
        "import { Button } from '../components/ui/button';\nimport { api }",
        "import { Button } from '../components/ui/button';\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';\nimport { api }"
    ),
    (
        """  return (
    <>
      <div className="space-y-6">""",
        """  return (
    <>
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <div className="space-y-6">"""
    ),
    (
        """          <div className="flex items-center gap-2">
            
            <Button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              User Management
            </Button>
            <Button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'topics'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Topic Management
            </Button>
            
            <Button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Settings
            </Button>
          </div>""",
        """          <TabsList className="gap-2 border-none">
            <TabsTrigger value="users" className="px-4 py-2 text-xs">
              User Management
            </TabsTrigger>
            <TabsTrigger value="topics" className="px-4 py-2 text-xs">
              Topic Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="px-4 py-2 text-xs">
              Settings
            </TabsTrigger>
          </TabsList>"""
    ),
    (
        """        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">""",
        """        {/* TAB 2: USER MANAGEMENT */}
        <TabsContent value="users" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">"""
    ),
    (
        """            <div className="px-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter users by role">
                {[
                  { value: 'ALL', label: 'Semua' },
                  { value: 'STUDENT', label: 'Mahasiswa' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'VALIDATOR', label: 'Validator' },
                ].map((tab) => {
                  const usersInProdiAndStatus = users.filter(
                    (user) => (prodiFilter === 'ALL' || user.prodi === prodiFilter) &&
                              (userStatusFilter === 'ALL' || user.status === userStatusFilter)
                  );
                  const count = tab.value === 'ALL'
                    ? usersInProdiAndStatus.length
                    : usersInProdiAndStatus.filter(
                        (user) => user.role.toUpperCase() === tab.value,
                      ).length;

                  return (
                    <Button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={roleFilter === tab.value}
                      onClick={() => setRoleFilter(tab.value)}
                      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                        roleFilter === tab.value
                          ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                          : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                      }`}
                    >
                      {tab.label}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                        roleFilter === tab.value
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {count}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>""",
        """            <div className="px-5 border-b border-zinc-200 dark:border-zinc-800">
              <Tabs value={roleFilter} onValueChange={setRoleFilter}>
                <TabsList className="flex gap-1 overflow-x-auto border-none">
                  {[
                    { value: 'ALL', label: 'Semua' },
                    { value: 'STUDENT', label: 'Mahasiswa' },
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'VALIDATOR', label: 'Validator' },
                  ].map((tab) => {
                    const usersInProdiAndStatus = users.filter(
                      (user) => (prodiFilter === 'ALL' || user.prodi === prodiFilter) &&
                                (userStatusFilter === 'ALL' || user.status === userStatusFilter)
                    );
                    const count = tab.value === 'ALL'
                      ? usersInProdiAndStatus.length
                      : usersInProdiAndStatus.filter(
                          (user) => user.role.toUpperCase() === tab.value,
                        ).length;

                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex shrink-0 items-center gap-2 px-4 py-3 text-xs"
                      >
                        {tab.label}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                          roleFilter === tab.value
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>"""
    ),
    (
        """          </div>
        )}

        {/* TAB 3: TOPICS MANAGEMENT */}
        {activeTab === 'topics' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">""",
        """          </div>
        </TabsContent>

        {/* TAB 3: TOPICS MANAGEMENT */}
        <TabsContent value="topics" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4">"""
    ),
    (
        """          </div>
        )}
        {/* TAB 4: ALL TITLES */}
        {false && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">""",
        """          </div>
        </TabsContent>
        {/* TAB 4: ALL TITLES */}
        {false && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">"""
    ),
    (
        """          </div>
        )}
      </div>

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">""",
        """          </div>
        )}
      </div>

        <TabsContent value="settings" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">"""
    ),
    (
        """          </div>
        )}

      {/* ASSIGN VALIDATOR MODAL */}""",
        """          </div>
        </TabsContent>
        
        </div>
      </Tabs>

      {/* ASSIGN VALIDATOR MODAL */}"""
    )
]

replace_in_file(manage_file, manage_replacements)
print("Finished AdminManagement.tsx replacements")
