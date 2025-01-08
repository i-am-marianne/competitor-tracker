from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
import json

def fetch_release_notes():
    with sync_playwright() as p:
        # Launch browser with stealth mode and necessary options
        browser = p.chromium.launch(
            headless=False,
            args=["--disable-web-security", "--disable-features=IsolateOrigins,site-per-process"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            java_script_enabled=True
        )
        page = context.new_page()

        # Apply stealth to evade detection
        stealth_sync(page)

        # Monitor network responses for debugging
        page.on("response", lambda response: print(f"URL: {response.url}, Status: {response.status}"))

        # Visit the page
        print("Visiting Aircall page...")
        page.goto("https://support.aircall.io/hc/en-gb/sections/16408014759069-Release-Notes-2024", wait_until="networkidle")

        # Handle cookie banner if present
        try:
            page.locator('#onetrust-accept-btn-handler').click(timeout=5000)
            print('Accepted cookies.')
        except:
            print('No cookie banner found.')

        # Simulate scrolling for lazy-loaded content
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(3000)

        # DEBUG: Save HTML and screenshot
        with open("debug-page.html", "w") as f:
            f.write(page.content())
        page.screenshot(path="debug-playwright.png", full_page=True)

        # Scrape release notes
        articles = []
        links = page.locator("a:has-text('Release Notes')")
        for i in range(links.count()):
            title = links.nth(i).inner_text().strip()
            url = links.nth(i).get_attribute("href")
            articles.append({"title": title, "url": f"https://support.aircall.io{url}"})

        # Output results
        print(json.dumps(articles, indent=2))

        # Save results to a file
        with open("release_notes.json", "w") as f:
            json.dump(articles, f, indent=2)

        # Close the browser
        browser.close()

fetch_release_notes()
