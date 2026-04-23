"""
Connext Portal Explorer v3
---------------------------
Uses Chrome with remote debugging so Jackson logs in with
his real Chrome browser. We connect to it after login.

USAGE:
1. Run this script - it launches Chrome with a debug port
2. Jackson logs in normally in that Chrome window
3. When logged in, run: touch connext-screenshots/GO
4. Script explores and screenshots everything
"""

import time
import os
import subprocess
import sys
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "connext-screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

LOGIN_URL = "https://www.connext.corebridgefinancial.com/life/connext-portal/public/login"
DEBUG_PORT = 9222
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
USER_DATA_DIR = os.path.join(SCREENSHOTS_DIR, "chrome-profile")


def take_screenshot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    try:
        page.screenshot(path=path, full_page=True)
        print(f"  Screenshot saved: {path}")
    except Exception as e:
        # Try non-full-page screenshot as fallback
        try:
            page.screenshot(path=path, full_page=False)
            print(f"  Screenshot saved (viewport only): {path}")
        except Exception as e2:
            print(f"  Screenshot failed: {e2}")
    return path


def explore_portal(page):
    """Navigate through the portal and screenshot everything."""
    print("\n=== Exploring the portal ===\n")

    print(f"Current URL: {page.url}")
    print(f"Title: {page.title()}")

    # Wait for content to fully render
    time.sleep(3)

    # Screenshot dashboard
    print("\n1. Dashboard")
    take_screenshot(page, "01_dashboard")

    # Get page content info
    print("\n2. Page analysis...")
    page_info = page.evaluate("""() => {
        const info = {
            url: window.location.href,
            title: document.title,
            bodyText: document.body?.innerText?.substring(0, 3000) || 'empty',
            allLinks: [],
            allButtons: [],
            iframes: []
        };

        // Get all links
        document.querySelectorAll('a').forEach(a => {
            const text = a.textContent?.trim().replace(/\\s+/g, ' ');
            const href = a.href || a.getAttribute('href') || '';
            const rect = a.getBoundingClientRect();
            if (text && text.length > 0 && text.length < 80 && rect.width > 0) {
                info.allLinks.push({ text, href, x: Math.round(rect.x), y: Math.round(rect.y) });
            }
        });

        // Get all buttons
        document.querySelectorAll('button, [role="button"], input[type="submit"]').forEach(b => {
            const text = b.textContent?.trim().replace(/\\s+/g, ' ');
            const rect = b.getBoundingClientRect();
            if (text && text.length > 0 && text.length < 80 && rect.width > 0) {
                info.allButtons.push({ text, x: Math.round(rect.x), y: Math.round(rect.y) });
            }
        });

        // Check for iframes
        document.querySelectorAll('iframe').forEach(f => {
            info.iframes.push({ src: f.src, id: f.id, name: f.name });
        });

        return info;
    }""")

    print(f"\n  Body text preview:")
    for line in page_info['bodyText'].split('\n')[:30]:
        line = line.strip()
        if line:
            print(f"    {line[:100]}")

    print(f"\n  Links ({len(page_info['allLinks'])}):")
    for link in page_info['allLinks']:
        print(f"    - {link['text'][:60]} -> {link['href'][:80]}")

    print(f"\n  Buttons ({len(page_info['allButtons'])}):")
    for btn in page_info['allButtons']:
        print(f"    - {btn['text'][:60]}")

    if page_info['iframes']:
        print(f"\n  Iframes ({len(page_info['iframes'])}):")
        for iframe in page_info['iframes']:
            print(f"    - src={iframe['src'][:80]} id={iframe['id']}")

    # Save all info
    info_path = os.path.join(SCREENSHOTS_DIR, "page_analysis.txt")
    with open(info_path, "w") as f:
        f.write(f"URL: {page_info['url']}\n")
        f.write(f"Title: {page_info['title']}\n\n")
        f.write("=== BODY TEXT ===\n")
        f.write(page_info['bodyText'])
        f.write("\n\n=== LINKS ===\n")
        for link in page_info['allLinks']:
            f.write(f"{link['text']} -> {link['href']}\n")
        f.write("\n=== BUTTONS ===\n")
        for btn in page_info['allButtons']:
            f.write(f"{btn['text']}\n")
    print(f"\n  Full analysis saved to: {info_path}")

    # Now click through each link and screenshot
    print("\n3. Exploring each navigation link...")
    seen_urls = set()
    for i, link in enumerate(page_info['allLinks']):
        href = link['href']
        if not href or href == '#' or href.startswith('javascript:') or href in seen_urls:
            continue
        if 'logout' in href.lower() or 'signout' in href.lower():
            print(f"  Skipping logout link: {link['text']}")
            continue

        seen_urls.add(href)
        print(f"\n  [{i}] Navigating to: {link['text']} ({href[:60]})")
        try:
            page.goto(href, wait_until="networkidle", timeout=15000)
            time.sleep(3)

            safe_name = link['text'][:25].replace(' ', '_').replace('/', '_').replace('\\', '_')
            take_screenshot(page, f"02_nav_{i:02d}_{safe_name}")

            # Check this page for download/export options
            downloads = page.evaluate("""() => {
                const items = [];
                document.querySelectorAll('a, button, [role="button"]').forEach(el => {
                    const text = el.textContent?.trim().toLowerCase() || '';
                    if (text.includes('download') || text.includes('export') ||
                        text.includes('csv') || text.includes('excel') ||
                        text.includes('pdf') || text.includes('print') ||
                        text.includes('report')) {
                        items.push(el.textContent.trim());
                    }
                });
                return [...new Set(items)];
            }""")
            if downloads:
                print(f"  ** DOWNLOAD/EXPORT OPTIONS: {downloads}")

            # Get visible text summary
            text_summary = page.evaluate("""() => {
                return document.body?.innerText?.substring(0, 1000) || '';
            }""")
            summary_lines = [l.strip() for l in text_summary.split('\n') if l.strip()][:10]
            if summary_lines:
                print(f"  Page content: {' | '.join(summary_lines)}")

        except Exception as e:
            print(f"  Error: {e}")

    # Save HTML
    print("\n4. Saving final page HTML...")
    html = page.content()
    html_path = os.path.join(SCREENSHOTS_DIR, "page_source.html")
    with open(html_path, "w") as f:
        f.write(html)
    print(f"  Saved to: {html_path}")

    print("\n=== EXPLORATION COMPLETE ===")


def main():
    print("Launching Chrome with remote debugging...")
    print(f"  Debug port: {DEBUG_PORT}")
    print(f"  Profile dir: {USER_DATA_DIR}")

    # Launch Chrome with remote debugging
    chrome_proc = subprocess.Popen([
        CHROME_PATH,
        f"--remote-debugging-port={DEBUG_PORT}",
        f"--user-data-dir={USER_DATA_DIR}",
        "--no-first-run",
        "--no-default-browser-check",
        LOGIN_URL
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print(f"\nChrome launched (PID: {chrome_proc.pid})")
    print("Jackson: please log in in the Chrome window that just opened.")

    # Wait for signal file
    signal_file = os.path.join(SCREENSHOTS_DIR, "GO")
    print(f"\nWaiting for signal... (will look for: {signal_file})")

    while not os.path.exists(signal_file):
        time.sleep(1)
    os.remove(signal_file)
    print("Signal received!")

    # Connect to the running Chrome via CDP
    with sync_playwright() as p:
        print(f"Connecting to Chrome on port {DEBUG_PORT}...")
        browser = p.chromium.connect_over_cdp(f"http://localhost:{DEBUG_PORT}")

        # Get the existing page
        contexts = browser.contexts
        print(f"Found {len(contexts)} browser contexts")

        if not contexts:
            print("ERROR: No browser contexts found!")
            chrome_proc.terminate()
            return

        pages = contexts[0].pages
        print(f"Found {len(pages)} pages")

        if not pages:
            print("ERROR: No pages found!")
            chrome_proc.terminate()
            return

        page = pages[0]
        print(f"Connected to page: {page.url}")

        # Explore
        explore_portal(page)

        # Keep alive
        print("\nDone! Create STOP file to close:")
        stop_file = os.path.join(SCREENSHOTS_DIR, "STOP")
        print(f"  touch {stop_file}")
        while not os.path.exists(stop_file):
            time.sleep(2)
        os.remove(stop_file)

        browser.close()
        chrome_proc.terminate()


if __name__ == "__main__":
    main()
