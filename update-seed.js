const fs = require('fs');

let content = fs.readFileSync('src/lib/seed.ts.bak', 'utf8');

content = content.replace(/totalStages: 1/g, 'totalStages: 2');

const taskFieldsMap = {
  "development": ["projectPdf", "taskGithubUrl", "taskDeployedUrl"],
  "competitive-coding": [],
  "ui-ux": ["projectPdf", "taskFigmaUrl", "taskDeployedUrl"],
  "ai-ml": ["projectPdf", "taskGithubUrl"],
  "cyber-security": [],
  "design": [],
  "management": [],
  "entrepreneurship": [],
  "content-media": ["githubUrl", "demoUrl", "comments"]
};

const genericTaskFieldsStr = `            {
              id: "projectPdf",
              label: "Upload your Task Project PDF",
              type: "file" as const,
              required: true,
            },
            {
              id: "taskLink",
              label: "Task Link (Drive / GitHub / Figma etc.)",
              type: "url" as const,
              required: false,
            }`;

let deps = content.split('slug: "');
for (let i = 1; i < deps.length; i++) {
  const slug = deps[i].split('"', 1)[0];
  const fieldsToMove = taskFieldsMap[slug] || [];
  
  let match = deps[i].match(/stages: \[\s*\{\s*stage: 1,[\s\S]*?formFields: \[\s*([\s\S]*?)\s*\]\s*\}\s*,?\s*\]/);
  if (!match) continue;

  let formFieldsStr = match[1];
  
  // A better way to split fields: find `{` and `}` blocks.
  let fieldsArr = [];
  let depth = 0;
  let currentField = "";
  for(let char of formFieldsStr) {
    if(char === "{") depth++;
    if(depth > 0) currentField += char;
    if(char === "}") {
      depth--;
      if(depth === 0) {
        fieldsArr.push(currentField);
        currentField = "";
      }
    }
  }

  let stage1Fields = [];
  let stage2Fields = [];
  
  fieldsArr.forEach(fieldBlock => {
    let idMatch = fieldBlock.match(/id:\s*"([^"]+)"/);
    if (idMatch && fieldsToMove.includes(idMatch[1])) {
      stage2Fields.push(fieldBlock.trim());
    } else {
      stage1Fields.push(fieldBlock.trim());
    }
  });

  let stage2Inner = stage2Fields.length > 0 ? stage2Fields.join(',\n            ') : genericTaskFieldsStr;

  let newStagesBlock = `stages: [
        {
          stage: 1,
          title: "Domain Questions",
          description: "Please answer these domain-specific questions to help us understand your experience.",
          formFields: [
            ${stage1Fields.join(',\n            ')}
          ],
        },
        {
          stage: 2,
          title: "Task Submission",
          description: "Upload your completed tasks here. Please ensure all links are public.",
          formFields: [
            ${stage2Inner}
          ],
        }
      ]`;

  deps[i] = deps[i].replace(/stages: \[\s*\{\s*stage: 1,[\s\S]*?formFields: \[\s*([\s\S]*?)\s*\]\s*\}\s*,?\s*\]/, newStagesBlock);
}

fs.writeFileSync('src/lib/seed.ts', deps.join('slug: "'));
console.log("Updated seed.ts");
