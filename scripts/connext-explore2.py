"""
Connext Portal Explorer v2
---------------------------
Launches browser, waits for user to say they're logged in,
then explores and screenshots everything.
"""

import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "connext-screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

LOGIN_URL = "https://www.connext.corebridgefinancial.com/life/connext-portal/public/login"


def take_screenshot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  Screenshot saved: {path}")
    return path


def explore_portal(page):
    """Navigate through the portal and screenshot everything."""
    print("\n=== Exploring the portal ===\n")

    # Screenshot the current page (should be dashboard)
    print("1. Current page (post-login)")
    print(f"   URL: {page.url}")
    take_screenshot(page, "01_dashboard")

    # Get the page title
    print(f"   Title: {page.title()}")

    # Get ALL navigation elements
    print("\n2. Analyzing navigation structure...")
    nav_info = page.evaluate("""() => {
        const links = [];
        document.querySelectorAll('a, [role="menuitem"], [role="tab"], .nav-link, .menu-item, button, [routerlink], li[class*="nav"], div[class*="menu"], span[class*="menu"]').forEach(el => {
            const text = el.textContent?.trim().replace(/\\s+/g, ' ');
            const href = el.getAttribute('href') || el.getAttribute('routerlink') || el.getAttribute('ng-reflect-router-link') || '';
            if (text && text.length > 0 && text.length < 100) {
                const rect = el.getBoundingClientRect();
                links.push({
                    text: text,
                    href: href,
                    tag: el.tagName,
                    classes: el.className && typeof el.className === 'string' ? el.className : '',
                    visible: rect.width > 0 && rect.height > 0,
                    x: Math.round(rect.x),
                    y: Math.round(rect.y)
                });
            }
        });
        // Deduplicate by text
        const seen = new Set();
        return links.filter(l => {
            const key = l.text + l.href;
            if (seen.has(key)) return false;
            seen.add(key);
            return l.visible;
        });
    }""")

    print(f"  Found {len(nav_info)} visible interactive elements:")
    for link in nav_info:
        print(f"    [{link['tag']}] {link['text'][:60]} | href={link.get('href','')} | pos=({link['x']},{link['y']})")

    # Save nav info
    nav_path = os.path.join(SCREENSHOTS_DIR, "navigation_elements.txt")
    with open(nav_path, "w") as f:
        for link in nav_info:
            f.write(f"[{link['tag']}] {link['text'][:80]} | href={link.get('href','')} | classes={link.get('classes','')[:60]} | pos=({link['x']},{link['y']})\n")
    print(f"  Navigation saved to: {nav_path}")

    # Now try clicking through main nav items
    # First, look for top-level menu/nav items
    print("\n3. Looking for main menu items...")
    menu_items = page.evaluate("""() => {
        const items = [];
        // Look for top-level nav links, menu items, tabs
        const selectors = [
            'nav a', 'nav button',
            '.navbar a', '.navbar button',
            '[role="navigation"] a',
            '.nav-item a', '.nav-link',
            '.menu-item', '.sidebar a',
            'header a', 'header button',
            '.top-menu a', '.main-menu a',
            'mat-tab-link', '[mat-tab-link]',
            '.mat-tab-link', '.mat-tab-label',
            '[role="tab"]'
        ];
        for (const sel of selectors) {
            document.querySelectorAll(sel).forEach(el => {
                const text = el.textContent?.trim().replace(/\\s+/g, ' ');
                const rect = el.getBoundingClientRect();
                if (text && text.length > 0 && text.length < 60 && rect.width > 0 && rect.height > 0) {
                    items.push({
                        text: text,
                        selector: sel,
                        tag: el.tagName,
                        x: Math.round(rect.x),
                        y: Math.round(rect.y)
                    });
                }
            });
        }
        const seen = new Set();
        return items.filter(i => {
            if (seen.has(i.text)) return false;
            seen.add(i.text);
            return true;
        });
    }""")

    print(f"  Found {len(menu_items)} menu items:")
    for item in menu_items:
        print(f"    - {item['text']} (via {item['selector']})")

    # Click each menu item and screenshot
    for i, item in enumerate(menu_items):
        print(f"\n4.{i}. Clicking: '{item['text']}'")
        try:
            # Find the element by its text content
            el = page.get_by_text(item['text'], exact=True).first
            if el:
                el.click()
                time.sleep(3)
                try:
                    page.wait_for_load_state("networkidle", timeout=10000)
                except:
                    pass

                print(f"  URL: {page.url}")
                take_screenshot(page, f"02_menu_{i:02d}_{item['text'][:20].replace(' ','_').replace('/','_')}")

                # Check for sub-navigation or tabs on this page
                sub_items = page.evaluate("""() => {
                    const items = [];
                    document.querySelectorAll('[role="tab"], .sub-nav a, .tab-link, .mat-tab-label, [mat-tab-link]').forEach(el => {
                        const text = el.textContent?.trim().replace(/\\s+/g, ' ');
                        const rect = el.getBoundingClientRect();
                        if (text && text.length < 60 && rect.width > 0) {
                            items.push(text);
                        }
                    });
                    return [...new Set(items)];
                }""")
                if sub_items:
                    print(f"  Sub-tabs found: {sub_items}")

                # Look for download/export buttons
                downloads = page.evaluate("""() => {
                    const items = [];
                    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
                        const text = el.textContent?.trim().toLowerCase();
                        if (text && (text.includes('download') || text.includes('export') || text.includes('csv') || text.includes('excel') || text.includes('pdf') || text.includes('print'))) {
                            items.push(el.textContent.trim());
                        }
                    });
                    return [...new Set(items)];
                }""")
                if downloads:
                    print(f"  ** DOWNLOAD/EXPORT OPTIONS FOUND: {downloads}")
        except Exception as e:
            print(f"  Error: {e}")

    # Also try looking for dropdowns / hamburger menus
    print("\n5. Looking for dropdown/hamburger menus...")
    try:
        hamburgers = page.query_selector_all('[class*="hamburger"], [class*="toggle"], [class*="dropdown-toggle"], .fa-bars, .menu-toggle, [aria-label="menu"]')
        for h in hamburgers:
            text = h.text_content().strip()[:30] if h.text_content() else "menu icon"
            print(f"  Found menu toggle: {text}")
            h.click()
            time.sleep(2)
            take_screenshot(page, "05_dropdown_menu")
    except Exception as e:
        print(f"  Error with dropdowns: {e}")

    # Save the full HTML for offline analysis
    print("\n6. Saving page HTML...")
    html = page.content()
    html_path = os.path.join(SCREENSHOTS_DIR, "page_source.html")
    with open(html_path, "w") as f:
        f.write(html)
    print(f"  HTML saved to: {html_path}")

    print("\n=== Exploration complete! ===")
    print(f"All files saved to: {SCREENSHOTS_DIR}")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            slow_mo=300,
        )

        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
        )

        page = context.new_page()

        print(f"Opening Connext portal: {LOGIN_URL}")
        page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)

        # Wait for signal file to be created (triggered externally)
        signal_file = os.path.join(SCREENSHOTS_DIR, "GO")
        print(f"\n  Waiting for login... (create {signal_file} to continue)")
        while not os.path.exists(signal_file):
            time.sleep(1)
        os.remove(signal_file)
        print("  Signal received! Continuing...")

        # Save the authenticated session
        storage_path = os.path.join(SCREENSHOTS_DIR, "auth_state.json")
        context.storage_state(path=storage_path)
        print(f"  Session saved to: {storage_path}")

        # Explore
        explore_portal(page)

        # Keep browser open
        print("\n Browser staying open for manual exploration.")
        print(" Create STOP file to close: " + os.path.join(SCREENSHOTS_DIR, "STOP"))
        stop_file = os.path.join(SCREENSHOTS_DIR, "STOP")
        while not os.path.exists(stop_file):
            time.sleep(2)
        os.remove(stop_file)

        browser.close()


if __name__ == "__main__":
    main()
