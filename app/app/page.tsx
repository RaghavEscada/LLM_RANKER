import fs from 'fs';
import path from 'path';
import Dashboard from './Dashboard';

// Types for our data (kept here for the server-side pass)
interface CompanyRank {
  company_name: string;
  LLM_score: number;
  rank: number;
  tier: string;
}

interface Stats {
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  r_squared: number;
  tier_high: number;
  tier_medium: number;
  tier_low: number;
}

function parseCSV(csvText: string): CompanyRank[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const dataLines = lines.slice(1);
  return dataLines.map((line) => {
    const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
    return {
      company_name: values[0],
      LLM_score: parseFloat(values[9]),
      rank: parseInt(values[10], 10),
      tier: values[11]
    };
  });
}

export default function Home() {
  let companies: CompanyRank[] = [];
  let stats: Stats | null = null;
  
  try {
    const csvPath = path.join(process.cwd(), 'public', 'ranked_companies.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    companies = parseCSV(fileContent);

    const statsPath = path.join(process.cwd(), 'public', 'stats.json');
    const statsContent = fs.readFileSync(statsPath, 'utf8');
    stats = JSON.parse(statsContent);
  } catch (error) {
    console.error("Failed to read analytic outputs:", error);
  }

  return <Dashboard companies={companies} stats={stats} />;
}
