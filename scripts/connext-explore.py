"""
Connext Portal Explorer
-----------------------
1. Opens a visible browser to the Connext login page
2. Waits for Jackson to log in manually (including 2FA)
3. Once logged in, takes screenshots of all major sections
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


def wait_for_login(page):
    """Wait until the URL changes away from the login page, indicating successful auth."""
    print("\n=== Waiting for Jackson to log in... ===")
    print("  1. Enter username and password")
    print("  2. Complete 2FA when prompted")
    print("  3. The script will continue automatically once you're logged in\n")

    while True:
        current_url = page.url.lower()
        # Check if we've left the login/security pages
        if "/public/login" not in current_url and "/public/validateuser" not in current_url:
            # Also check we're not on registration
            if "/public/register" not in current_url:
                print(f"  Login detected! Current URL: {page.url}")
                # Give the dashboard a moment to fully load
                time.sleep(5)
                return True
        time.sleep(2)


def explore_portal(page):
    """Navigate through the portal and screenshot everything."""
    print("\n=== Exploring the portal ===\n")

    # Screenshot the landing page / dashboard
    print("1. Dashboard / Home")
    take_screenshot(page, "01_dashboard")

    # Get the page content to understand navigation
    print("\n2. Analyzing navigation structure...")
    nav_info = page.evaluate("""() => {
        const links = [];
        // Get all links and navigation items
        document.querySelectorAll('a, [role="menuitem"], [role="tab"], .nav-link, .menu-item, button[routerlink]').forEach(el => {
            const text = el.textContent?.trim();
            const href = el.getAttribute('href') || el.getAttribute('routerlink') || '';
            const onclick = el.getAttribute('onclick') || '';
            if (text && text.length < 100) {
                links.push({ text, href, tag: el.tagName, classes: el.className });
            }
        });
        return links;
    }""")

    print(f"  Found {len(nav_info)} navigation elements:")
    for link in nav_info:
        print(f"    - {link['text'][:60]} | href={link.get('href','')} | tag={link['tag']}")

    # Save nav info to file
    nav_path = os.path.join(SCREENSHOTS_DIR, "navigation_elements.txt")
    with open(nav_path, "w") as f:
        for link in nav_info:
            f.write(f"{link['text'][:80]} | href={link.get('href','')} | tag={link['tag']} | classes={link.get('classes','')}\n")
    print(f"  Navigation saved to: {nav_path}")

    # Try to find and click common sections
    sections_to_try = [
        ("Commission", "03_commissions"),
        ("Book of Business", "04_book_of_business"),
        ("Policy", "05_policies"),
        ("Persistency", "06_persistency"),
        ("Report", "07_reports"),
        ("Chargeback", "08_chargebacks"),
        ("New Business", "09_new_business"),
        ("Download", "10_downloads"),
        ("Export", "11_export"),
        ("Account", "12_account"),
        ("Dashboard", "13_dashboard_nav"),
    ]

    for keyword, screenshot_name in sections_to_try:
        print(f"\n3. Looking for '{keyword}' section...")
        try:
            # Try to find a clickable element with this text
            elements = page.query_selector_all(f"text=/{keyword}/i")
            if elements:
                for i, el in enumerate(elements[:3]):  # Click up to 3 matches
                    text = el.text_content().strip()[:60]
                    print(f"  Found: '{text}' - clicking...")
                    try:
                        el.click()
                        time.sleep(3)
                        page.wait_for_load_state("networkidle", timeout=10000)
                    except Exception:
                        time.sleep(2)

                    take_screenshot(page, f"{screenshot_name}_{i}")
                    print(f"  URL after click: {page.url}")

                    # Look for any download/export buttons on this page
                    downloads = page.query_selector_all("text=/download|export|csv|excel|pdf/i")
                    if downloads:
                        print(f"  Found {len(downloads)} download/export elements:")
                        for d in downloads:
                            print(f"    - {d.text_content().strip()[:60]}")
            else:
                print(f"  No '{keyword}' element found")
        except Exception as e:
            print(f"  Error exploring '{keyword}': {e}")

    # Final: get full page HTML structure for analysis
    print("\n4. Saving page structure...")
    html_summary = page.evaluate("""() => {
        function getStructure(el, depth=0) {
            if (depth > 4) return '';
            let result = '';
            const indent = '  '.repeat(depth);
            const tag = el.tagName?.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const cls = el.className && typeof el.className === 'string' ? `.${el.className.split(' ').join('.')}` : '';
            const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
                ? ` "${el.textContent.trim().substring(0, 50)}"` : '';

            if (['script','style','svg','path'].includes(tag)) return '';

            result += `${indent}<${tag}${id}${cls}>${text}\\n`;
            for (const child of el.children) {
                result += getStructure(child, depth + 1);
            }
            return result;
        }
        return getStructure(document.body);
    }""")

    structure_path = os.path.join(SCREENSHOTS_DIR, "page_structure.txt")
    with open(structure_path, "w") as f:
        f.write(html_summary)
    print(f"  Page structure saved to: {structure_path}")

    print("\n=== Exploration complete! ===")
    print(f"All screenshots saved to: {SCREENSHOTS_DIR}")


def main():
    with sync_playwright() as p:
        # Launch visible browser so Jackson can interact
        browser = p.chromium.launch(
            headless=False,
            slow_mo=500,  # Slow down so we can see what's happening
        )

        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            # Save session for future use
            storage_state=None,
        )

        page = context.new_page()

        print(f"Opening Connext portal: {LOGIN_URL}")
        page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)

        take_screenshot(page, "00_login_page")

        # Wait for manual login
        wait_for_login(page)

        # Save the authenticated session for future use
        storage_path = os.path.join(SCREENSHOTS_DIR, "auth_state.json")
        context.storage_state(path=storage_path)
        print(f"  Session saved to: {storage_path}")

        # Now explore
        explore_portal(page)

        # Keep browser open for manual exploration
        print("\n Browser staying open for manual exploration.")
        print(" Press Ctrl+C in terminal when done.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nClosing browser...")

        browser.close()


if __name__ == "__main__":
    main()
