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

# 1. SubmissionListPage.tsx
sub_file = 'src/pages/SubmissionListPage.tsx'
sub_replacements = [
    (
        "import { Button } from '../components/ui/button';\nimport { api }",
        "import { Button } from '../components/ui/button';\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';\nimport { api }"
    ),
    (
        """        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <Button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <ListIcon size={16} /> Daftar Judul
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <PieChart size={16} /> Analitik
          </Button>
        </div>""",
        """        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="gap-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListIcon size={16} /> Daftar Judul
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart size={16} /> Analitik
            </TabsTrigger>
          </TabsList>"""
    ),
    (
        """        ) : (
          <>
            {activeTab === 'list' ? (
              <>""",
        """        ) : (
          <div className="relative">
            <TabsContent value="list">
              <>"""
    ),
    (
        """            </div>
            </>
            ) : (
              <div className="space-y-6">""",
        """            </div>
            </>
            </TabsContent>
            <TabsContent value="analytics">
              <div className="space-y-6">"""
    ),
    (
        """                </div>
              </div>
            )}
          </>
        )}
      </div>""",
        """                </div>
              </div>
            </TabsContent>
          </div>
        )}
        </Tabs>
      </div>"""
    )
]

replace_in_file(sub_file, sub_replacements)
print("Finished SubmissionListPage.tsx replacements")
