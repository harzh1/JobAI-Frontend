const fs = require('fs');
const path = 'c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/Campaigns.jsx';
let content = fs.readFileSync(path, 'utf8');

// Normalize line endings to \n for easier regex
content = content.replace(/\r\n/g, '\n');

// 1. Add imports
if (!content.includes('import { getCampaigns')) {
  content = content.replace(
    'import { resumeService } from "../services/database";',
    'import { resumeService } from "../services/database";\nimport { getCampaigns, createCampaign, updateCampaignStatus, deleteCampaign, getTemplates, createTemplate, updateTemplate, deleteTemplate, getAccounts, connectAccount, deleteAccount } from "../utils/firebaseServices";'
  );
}

// 2. Remove Dummy Data
content = content.replace(/const INITIAL_TEMPLATES = \[\s*\{.*?\}\s*\];/s, '');
content = content.replace(/const INITIAL_ACCOUNTS = \[\s*\{.*?\}\s*\];/s, '');

content = content.replace(
  'const [templates, setTemplates] = useState(INITIAL_TEMPLATES);',
  'const [templates, setTemplates] = useState([]);'
);
content = content.replace(
  'const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);',
  'const [accounts, setAccounts] = useState([]);\n  const [isLoadingCampaignData, setIsLoadingCampaignData] = useState(false);'
);

// 3. Add useEffect to load data
const useEffectTarget = `    };
    loadResumes();
  }, [user]);`;

const useEffectReplacement = `    };
    loadResumes();

    const loadCampaignData = async () => {
      setIsLoadingCampaignData(true);
      try {
        const [campsData, templatesData, accountsData] = await Promise.all([
          getCampaigns(),
          getTemplates(),
          getAccounts()
        ]);
        setCampaigns(campsData);
        setTemplates(templatesData);
        setAccounts(accountsData);
      } catch (error) {
        console.error("Error loading campaign data:", error);
      } finally {
        setIsLoadingCampaignData(false);
      }
    };
    loadCampaignData();
  }, [user]);`;
content = content.replace(useEffectTarget, useEffectReplacement);

// 4. Update toggleCampaignStatus
const toggleTarget = /const toggleCampaignStatus = \(id\) => \{[\s\S]*?return c;\n    \}\)\);\n  \};/m;
const toggleReplacement = `const toggleCampaignStatus = async (id) => {
    try {
      const c = campaigns.find(camp => camp.id === id);
      if (c && c.status !== 'Completed') {
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        await updateCampaignStatus(id, newStatus);
        
        setCampaigns(prev => prev.map(camp => {
          if (camp.id === id) {
            if (selectedCampaign && selectedCampaign.id === id) {
               setSelectedCampaign({ ...camp, status: newStatus });
            }
            return { ...camp, status: newStatus };
          }
          return camp;
        }));
      }
    } catch (error) {
      console.error("Failed to toggle campaign status", error);
    }
  };`;
content = content.replace(toggleTarget, toggleReplacement);

// 5. Update onSave in EmailTemplateBuilder
const onSaveTarget = /onSave=\{\(data\) => \{[\s\S]*?setViewState\("templates"\);\n        \}\}/m;
const onSaveReplacement = `onSave={async (data) => {
          try {
            if (data.id) {
              const res = await updateTemplate(data.id, data);
              setTemplates(templates.map(t => t.id === data.id ? res : t));
            } else {
              const res = await createTemplate(data);
              setTemplates([res, ...templates]);
            }
            setViewState("templates");
          } catch (e) { console.error(e); }
        }}`;
content = content.replace(onSaveTarget, onSaveReplacement);

// 6. Update onSend in NewCampaignBuilder
const onSendTarget = /onSend=\{\(data\) => \{[\s\S]*?if\(setView\) setView\("campaigns"\);\n        \}\}/m;
const onSendReplacement = `onSend={async (data) => {
          try {
            const res = await createCampaign(data);
            setCampaigns([res, ...campaigns]);
            setViewState("campaigns");
            if(setView) setView("campaigns");
          } catch (e) { console.error(e); }
        }}`;
content = content.replace(onSendTarget, onSendReplacement);

// 7. Update connect account
const onConnectTarget = /onConnect=\{\(newAcc\) => \{[\s\S]*?setIsConnectModalOpen\(false\);\n            \}\}/m;
const onConnectReplacement = `onConnect={async (newAcc) => {
              try {
                const res = await connectAccount(newAcc);
                setAccounts([...accounts, res]);
                setIsConnectModalOpen(false);
              } catch (e) { console.error(e); }
            }}`;
content = content.replace(onConnectTarget, onConnectReplacement);

// 8. Update delete template
const deleteTemplateTarget = /onClick=\{\(e\) => \{ e\.stopPropagation\(\); setTemplates\(templates\.filter\(t => t\.id !== template\.id\)\); \}\}/g;
const deleteTemplateReplacement = `onClick={async (e) => { e.stopPropagation(); await deleteTemplate(template.id); setTemplates(templates.filter(t => t.id !== template.id)); }}`;
content = content.replace(deleteTemplateTarget, deleteTemplateReplacement);

// 9. Update disconnect account
const deleteAccountTarget = /onClick=\{\(\) => setAccounts\(accounts\.filter\(a => a\.id !== acc\.id\)\)\}/g;
const deleteAccountReplacement = `onClick={async () => { await deleteAccount(acc.id); setAccounts(accounts.filter(a => a.id !== acc.id)); }}`;
content = content.replace(deleteAccountTarget, deleteAccountReplacement);

// Write back to file with \r\n
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('Update completed');
