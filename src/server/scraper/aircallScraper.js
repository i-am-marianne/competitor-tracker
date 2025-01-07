const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use stealth plugin to bypass detection
puppeteer.use(StealthPlugin());

async function fetchAircallUpdates() {
  const url = 'https://support.aircall.io/hc/en-gb/p/ai-support/categories/10249503285533';

  try {
    const browser = await puppeteer.launch({ headless: false }); // Use headless: false for debugging
    const page = await browser.newPage();

    // Mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
    });

    // Step 1: Go to the initial page and accept cookies
    await page.goto(url, { waitUntil: 'networkidle2' });

    const cookieButtonSelector = '#onetrust-accept-btn-handler'; // Accept cookies button
    const button = await page.$(cookieButtonSelector);
    if (button) {
      await button.click(); // Accept cookies
      await new Promise(resolve => setTimeout(resolve, 2000)); // Fixed timeout
    }

    // Step 2: Force reload to the updates page (in case of redirects)
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Debugging screenshot
    await page.screenshot({ path: 'aircall-page-debug-after-reload.png' });

    // Step 3: Extract updates
    const updates = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.article-list-item').forEach(el => {
        const title = el.querySelector('.article-list-item-title')?.innerText || '';
        const link = 'https://support.aircall.io' + el.querySelector('a')?.getAttribute('href');
        const date = el.querySelector('.article-list-item-date')?.innerText || '';
        items.push({ title, link, date });
      });
      return items;
    });

    await browser.close();
    return updates;

  } catch (error) {
    console.error('Error fetching Aircall updates:', error);
    return [];
  }
}

module.exports = fetchAircallUpdates;
