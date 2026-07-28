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

admin_file = 'src/pages/AdminDashboard.tsx'
admin_replacements = [
    (
        "import { Button } from '../components/ui/button';\nimport { api }",
        "import { Button } from '../components/ui/button';\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';\nimport { api }"
    ),
    (
        """  return (
    <>
      <div className="space-y-4">""",
        """  return (
    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
      <div className="space-y-4">"""
    ),
    (
        """          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              Submissions Queue
            </Button>


            <Button
              onClick={() => setActiveTab('all_titles')}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                activeTab === 'all_titles'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              All Titles
            </Button>
          </div>""",
        """          <TabsList className="gap-2 border-none">
            <TabsTrigger value="submissions" className="px-4 py-2 text-xs">
              Submissions Queue
            </TabsTrigger>
            <TabsTrigger value="all_titles" className="px-4 py-2 text-xs">
              All Titles
            </TabsTrigger>
          </TabsList>"""
    ),
    (
        """        {/* TAB 1: SUBMISSIONS QUEUE */}
        {activeTab === 'submissions' && (
          <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">""",
        """        {/* TAB 1: SUBMISSIONS QUEUE */}
        <TabsContent value="submissions" className="mt-0">
          <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">"""
    ),
    (
        """            <div className="border-b border-zinc-200 px-4 dark:border-zinc-800">
              <div
                className="flex gap-1 overflow-x-auto"
                role="tablist"
                aria-label="Filter proposal berdasarkan status"
              >
                {[
                  { value: 'ALL', label: 'Semua' },
                  { value: 'PENDING_ADMIN_REVIEW', label: 'Menunggu Admin' },
                  { value: 'PENDING_VALIDATOR_REVIEW', label: 'Dalam Validasi' },
                  { value: 'APPROVED', label: 'Disetujui' },
                  { value: 'REJECTED_BY_ADMIN', label: 'Ditolak Admin' },
                  { value: 'REJECTED_BY_VALIDATOR', label: 'Ditolak Validator' },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === tab.value}
                    onClick={() => handleFilterChange(setStatusFilter, tab.value)}
                    className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      statusFilter === tab.value
                        ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:text-zinc-100'
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>""",
        """            <div className="border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Tabs value={statusFilter} onValueChange={(val) => handleFilterChange(setStatusFilter, val)}>
                <TabsList className="flex gap-1 overflow-x-auto border-none">
                  {[
                    { value: 'ALL', label: 'Semua' },
                    { value: 'PENDING_ADMIN_REVIEW', label: 'Menunggu Admin' },
                    { value: 'PENDING_VALIDATOR_REVIEW', label: 'Dalam Validasi' },
                    { value: 'APPROVED', label: 'Disetujui' },
                    { value: 'REJECTED_BY_ADMIN', label: 'Ditolak Admin' },
                    { value: 'REJECTED_BY_VALIDATOR', label: 'Ditolak Validator' },
                  ].map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-2.5 text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>"""
    ),
    (
        """              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALL TITLES */}
        {activeTab === 'all_titles' && (
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">""",
        """              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: ALL TITLES */}
        <TabsContent value="all_titles" className="mt-0">
          <div className="bg-white dark:bg-zinc-950 rounded shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">"""
    ),
    (
        """          </div>
        )}
      </div>

      {/* ADMIN BATCH REVIEW MODAL */}""",
        """          </div>
        </TabsContent>
      </div>
    </Tabs>

      {/* ADMIN BATCH REVIEW MODAL */}"""
    )
]

replace_in_file(admin_file, admin_replacements)
print("Finished AdminDashboard.tsx replacements")
