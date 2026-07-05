const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Step 1: Remove the misplaced hooks after the early return (the ones starting at "// Modals visibility")
const badBlock = `\n\n  // Modals visibility
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingProject, setEditingProject] = useState<FarmProject | undefined>(undefined);`;

code = code.replace(badBlock, '');

// Step 2: Add those hooks at the top, right after the other state declarations
const insertAfter = `  const [isLoadingLocation, setIsLoadingLocation] = useState(false);`;
const insertWith = `  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Modals visibility
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingProject, setEditingProject] = useState<FarmProject | undefined>(undefined);`;

code = code.replace(insertAfter, insertWith);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed: moved hooks above the early return statement.');
