from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
import json


def fetch_release_notes():
    with sync_playwright() as p:
        # Launch browser with stealth mode
        browser = p.chromium.launch(
            headless=True,  # Switch to False for debugging
            args=["--disable-web-security", "--disable-features=IsolateOrigins,site-per-process"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Apply stealth
        stealth_sync(page)

        # Visit the release notes section
        print("Visiting Aircall Release Notes page...")
        page.goto("https://support.aircall.io/hc/en-gb/sections/16408014759069-Release-Notes-2024", wait_until="networkidle")

        # Handle cookie banner
        try:
            page.locator('#onetrust-accept-btn-handler').click(timeout=5000)
            print('Accepted cookies.')
        except:
            print('No cookie banner found.')

        # Simulate scrolling for lazy-loaded content
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(3000)

        # Scrape links to monthly releases
        articles = []
        links = page.locator("a:has-text('Release Notes')")
        for i in range(links.count()):
            title = links.nth(i).inner_text().strip()
            url = links.nth(i).get_attribute("href")
            if url.startswith("/"):
                url = f"https://support.aircall.io{url}"
            articles.append({"title": title, "url": url})

        # Fetch details from each release page
        for article in articles:
            print(f"Visiting: {article['title']} - {article['url']}")
            page.goto(article['url'], wait_until="networkidle")
            page.wait_for_timeout(2000)

            # Extract dates
            dates = page.locator("h2")  # Adjust selector if needed
            updates = []

            for i in range(dates.count()):
                date = dates.nth(i).inner_text().strip()

                # Find the table of updates below each date
                table = page.locator(f"xpath=(//h2[text()='{date}']/following-sibling::table[1])")  # Locate table under the date
                rows = table.locator("tr")

                for j in range(rows.count()):
                    columns = rows.nth(j).locator("td")
                    # Skip header row if it contains 'Feature Area' and 'Description'
                    if j == 0 and columns.count() >= 2 and 'Feature Area' in columns.nth(0).inner_text() and 'Description' in columns.nth(1).inner_text():
                        continue

                    if columns.count() >= 2:  # Ensure table has at least two columns
                        update_title = columns.nth(0).inner_text().strip()
                        update_details = columns.nth(1).inner_text().strip()
                        updates.append({
                            "date": date,
                            "update_title": update_title,
                            "update_details": update_details
                        })

            # Add updates to the article
            article["updates"] = updates

        # Save results
        with open("/Users/mariannakovaleva/Documents/Projects/competitor-tracker/src/server/scraper/aircall/aircall_release_notes.json", "w") as f:
            json.dump(articles, f, indent=2)


        print("Scraping completed. Results saved to aircall_release_notes.json")

        # Close the browser
        browser.close()


fetch_release_notes()