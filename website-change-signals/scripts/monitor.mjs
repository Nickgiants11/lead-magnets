#!/usr/bin/env node

/**
 * Website Change Monitor
 * Detects rebrands, overhauls, and significant changes on target sites.
 * 
 * Usage:
 *   node monitor.mjs                    # Check all sites
 *   node monitor.mjs --add https://...  # Add a site to monitor
 *   node monitor.mjs --list             # List monitored sites
 * 
 * Setup:
 *   npm install puppeteer
 *   Edit SITES array below or use --add
 */

import puppeteer from 'puppeteer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '../data/site-hashes.json');
const SITES_FILE = path.join(__dirname, '../data/monitored-sites.json');

// Default sites to monitor (edit this or use --add)
const DEFAULT_SITES = [
  // { name: 'Competitor A', url: 'https://competitor-a.com', type: 'competitor' },
  // { name: 'Target Company', url: 'https://target.com', type: 'target' },
];

function ensureDataDir() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadSites() {
  if (fs.existsSync(SITES_FILE)) {
    return JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
  }
  return DEFAULT_SITES;
}

function saveSites(sites) {
  ensureDataDir();
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2));
}

async function getPageHash(url) {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract visible text content (ignores dynamic/random elements)
    const content = await page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      // Remove dynamic elements that change frequently
      clone.querySelectorAll('script, style, noscript, iframe, [data-timestamp], .timestamp, time').forEach(el => el.remove());
      return clone.innerText.replace(/\\s+/g, ' ').trim();
    });
    
    // Also get key structural elements
    const structure = await page.evaluate(() => {
      const title = document.title || '';
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText).join('|');
      const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
      return `${title}::${h1s}::${metaDesc}`;
    });
    
    await browser.close();
    
    // Combine content + structure for hash
    const combined = content.slice(0, 10000) + '::STRUCTURE::' + structure;
    return crypto.createHash('md5').update(combined).digest('hex');
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function checkSites() {
  ensureDataDir();
  const sites = loadSites();
  
  if (sites.length === 0) {
    console.log('No sites configured. Add sites with: node monitor.mjs --add <url> --name "Company Name"');
    return [];
  }
  
  const state = fs.existsSync(STATE_FILE) 
    ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) 
    : {};
  
  const changes = [];
  const now = new Date().toISOString();
  
  console.log(`\\n🔍 Checking ${sites.length} sites...\\n`);
  
  for (const site of sites) {
    process.stdout.write(`  ${site.name}: `);
    
    try {
      const currentHash = await getPageHash(site.url);
      const previous = state[site.url];
      
      if (previous && previous.hash !== currentHash) {
        console.log('🔔 CHANGED');
        changes.push({
          name: site.name,
          url: site.url,
          type: site.type || 'unknown',
          detected: now,
          previousCheck: previous.checked
        });
      } else if (!previous) {
        console.log('✓ (first check)');
      } else {
        console.log('✓ no change');
      }
      
      state[site.url] = { hash: currentHash, checked: now };
      
    } catch (error) {
      console.log(`⚠️ Error: ${error.message}`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
  
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  if (changes.length > 0) {
    console.log(`\\n🚨 ${changes.length} site(s) changed:\\n`);
    changes.forEach(c => {
      console.log(`  • ${c.name} (${c.type})`);
      console.log(`    ${c.url}`);
      console.log(`    Last checked: ${c.previousCheck}\\n`);
    });
  } else {
    console.log('\\n✅ No changes detected.');
  }
  
  return changes;
}

function addSite(url, name, type = 'target') {
  const sites = loadSites();
  
  if (sites.find(s => s.url === url)) {
    console.log('Site already being monitored.');
    return;
  }
  
  sites.push({ name, url, type });
  saveSites(sites);
  console.log(`✓ Added: ${name} (${url})`);
}

function listSites() {
  const sites = loadSites();
  
  if (sites.length === 0) {
    console.log('No sites configured.');
    return;
  }
  
  console.log('\\nMonitored sites:\\n');
  sites.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name} [${s.type}]`);
    console.log(`     ${s.url}\\n`);
  });
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--list')) {
  listSites();
} else if (args.includes('--add')) {
  const urlIndex = args.indexOf('--add') + 1;
  const nameIndex = args.indexOf('--name') + 1;
  const typeIndex = args.indexOf('--type') + 1;
  
  const url = args[urlIndex];
  const name = nameIndex > 0 ? args[nameIndex] : new URL(url).hostname;
  const type = typeIndex > 0 ? args[typeIndex] : 'target';
  
  if (!url) {
    console.log('Usage: node monitor.mjs --add <url> --name "Company Name" --type competitor|target');
    process.exit(1);
  }
  
  addSite(url, name, type);
} else {
  checkSites().then(changes => {
    if (changes.length > 0) {
      // TODO: Send to webhook, Slack, or email
      // Example: fetch('https://hooks.slack.com/...', { method: 'POST', body: JSON.stringify({ text: '...' }) })
    }
  });
}
