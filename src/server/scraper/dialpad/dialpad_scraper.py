from playwright.async_api import async_playwright
import asyncio
import json
from datetime import datetime

async def extract_release_content(page, url):
    try:
        print(f"Navigating to {url}")
        await page.goto(url, wait_until="networkidle", timeout=120000)
        
        content = await page.evaluate('''
            () => {
                const sections = [];
                
                const getTextContent = (element) => {
                    const clone = element.cloneNode(true);
                    clone.querySelectorAll('a').forEach(link => {
                        link.textContent = `${link.textContent} (${link.href})`;
                    });
                    return clone.textContent.trim();
                };
                
                const extractSection = (sectionId) => {
                    const section = document.querySelector(`h2#${sectionId}`);
                    if (!section) return null;
                    
                    const items = [];
                    let element = section.nextElementSibling;
                    let currentItem = null;
                    
                    while (element && element.tagName !== 'H2') {
                        if (element.tagName === 'H3') {
                            if (currentItem) items.push(currentItem);
                            currentItem = {
                                title: element.textContent.trim(),
                                details: ''
                            };
                        } else if (element.tagName === 'P' && currentItem) {
                            const text = getTextContent(element);
                            if (text) {
                                currentItem.details += (currentItem.details ? '\\n' : '') + text;
                            }
                        }
                        element = element.nextElementSibling;
                    }
                    
                    if (currentItem && currentItem.title) items.push(currentItem);
                    
                    return {
                        type: sectionId,
                        title: section.textContent.trim(),
                        items: items
                    };
                };
                
                ['improvements', 'new'].forEach(sectionId => {
                    const section = extractSection(sectionId);
                    if (section && section.items.length > 0) {
                        sections.push(section);
                    }
                });
                
                return sections;
            }
        ''')
        return content
    except Exception as e:
        print(f"Error processing {url}: {str(e)}")
        return []

async def run():
    async with async_playwright() as p:
        print("Connecting to Chrome...")
        browser = await p.chromium.connect_over_cdp("http://localhost:9222")
        
        context = browser.contexts[0]
        pages = context.pages
        page = pages[0] if pages else await context.new_page()

        try:
            print("Getting release notes list...")
            await page.goto(
                "https://help.dialpad.com/docs/dialpad-release-notes",
                wait_until="networkidle",
                timeout=120000
            )
            
            await page.wait_for_selector('.category-index-item', timeout=30000)
            
            release_notes = await page.evaluate('''
                () => {
                    const items = document.querySelectorAll('.category-index-item');
                    return Array.from(items).map(item => {
                        const titleEl = item.querySelector('.category-index-title h2');
                        if (!titleEl) return null;
                        
                        const title = titleEl.textContent.trim();
                        const match = title.match(/\\d{2}\\.\\d{2}\\.\\d{2}/);
                        if (!match) return null;
                        
                        const [year, month, day] = match[0].split('.');
                        const date = `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month)-1]} 20${year}`;
                        const link = item.querySelector('a').href;
                        
                        return { title, date, link };
                    }).filter(item => item !== null);
                }
            ''')
            
            print(f"\nFound {len(release_notes)} release notes to process")
            
            full_release_notes = []
            for i, note in enumerate(release_notes, 1):
                print(f"\nProcessing {i}/{len(release_notes)}: {note['title']}")
                try:
                    content = await extract_release_content(page, note['link'])
                    full_note = {
                        **note,
                        'sections': content
                    }
                    full_release_notes.append(full_note)
                    
                    # Save progress after each successful scrape
                    with open("dialpad_release_notes.json", "w", encoding="utf-8") as f:
                        json.dump(full_release_notes, f, indent=2, ensure_ascii=False)
                    print(f"Progress saved ({i}/{len(release_notes)})")
                    
                    # Small delay between requests
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    print(f"Error processing note {note['title']}: {str(e)}")
                    continue
            
            print(f"\nCompleted! Processed {len(full_release_notes)} release notes")
            print("Final data saved to dialpad_release_notes.json")
            
            print("\nPress Enter to close browser...")
            await asyncio.get_event_loop().run_in_executor(None, input)
            
        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="error_state.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())