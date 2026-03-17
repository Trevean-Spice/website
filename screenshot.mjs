import puppeteer from 'puppeteer';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'temporary screenshots');

if (!existsSync(SCREENSHOT_DIR)) mkdirSync(SCREENSHOT_DIR, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment screenshot number
const existing = readdirSync(SCREENSHOT_DIR).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll through the entire page to trigger IntersectionObserver reveals
await page.evaluate(async () => {
  const distance = 400;
  const delay = 100;
  const scrollHeight = document.body.scrollHeight;
  let currentPosition = 0;
  while (currentPosition < scrollHeight) {
    window.scrollBy(0, distance);
    currentPosition += distance;
    await new Promise(r => setTimeout(r, delay));
  }
  // Scroll back to top
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 500));
});

// Wait for fonts and images to settle
await new Promise(r => setTimeout(r, 2000));

await page.screenshot({
  path: join(SCREENSHOT_DIR, filename),
  fullPage: true,
});

console.log(`Screenshot saved: temporary screenshots/${filename}`);
await browser.close();
