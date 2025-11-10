import time
from datetime import datetime
import random
import logging
import os
import subprocess
import sys

# Install required packages
try:
    import schedule
except ImportError:
    print("⚠️ 'schedule' module missing. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "schedule"])
    import schedule
    print("✅ Installed 'schedule'")

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("⚠️ 'playwright' module missing. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
    from playwright.sync_api import sync_playwright
    print("✅ Installed 'playwright'")

try:
    import mysql.connector
except ImportError:
    print("⚠️ 'mysql' module missing. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "mysql-connector-python"])
    import mysql.connector
    print("✅ Installed 'mysql'")

# Install Playwright browsers if needed
def ensure_playwright_browsers():
    """Check and install Playwright browsers if not present"""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            browser.close()
        print("✅ Playwright browsers already installed")
    except Exception as e:
        if "Executable doesn't exist" in str(e):
            print("⚠️ Playwright browsers not installed. Installing Chromium...")
            try:
                result = subprocess.run(
                    [sys.executable, "-m", "playwright", "install", "chromium"],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    print("✅ Installed Playwright Chromium browser")
                else:
                    print(f"❌ Installation failed: {result.stderr}")
                    print("Please run manually: playwright install chromium")
                    sys.exit(1)
            except Exception as install_error:
                print(f"❌ Failed to install browsers: {install_error}")
                print("Please run manually: playwright install chromium")
                sys.exit(1)
        else:
            print(f"❌ Unexpected error: {e}")
            raise

# Run browser check at startup
ensure_playwright_browsers()

# Setup daily log file
def setup_logger():
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    log_filename = os.path.join(
        log_dir, f"meghaLogs_{datetime.now().strftime('%Y-%m-%d')}.txt"
    )

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_filename, mode="a", encoding="utf-8")
        ]
    )

setup_logger()
logging.info("megha Attendance Script Started")
print("megha Attendance Script Started")

MAX_RETRIES = 3


def checkForAttndance():
    try:
        conn = mysql.connector.connect(
            host="oswalcorns.com",
            user="oswalcorns",
            password="getitd0ne@C",
            database="taran_agency_db"
        )

        cursor = conn.cursor()
        cursor.execute("SELECT a FROM att WHERE id = 2;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return rows[0][0] == 2
    except Exception as e:
        logging.error(f"MySQL Error: {e}")
        return False


def is_restricted_day():
    return False
    today = datetime.now()
    weekday = today.weekday()

    # Sunday off
    if weekday == 6:
        return True

    # 2nd Saturday off
    if weekday == 5:
        day_of_month = today.day
        count = len([
            d for d in range(1, day_of_month + 1)
            if datetime(today.year, today.month, d).weekday() == 5
        ])
        if count == 2:
            return True

    return False


def login_api_for_start_attndance():
    logging.info("Starting attendance login check...")
    print("Starting attendance login check...")
    retries = 0

    while retries < MAX_RETRIES:
        browser = None
        try:
            if is_restricted_day():
                logging.info("Restricted day — skipping attendance.")
                print("Restricted day — skipping attendance.")
                return

            if checkForAttndance():
                logging.info("Attendance already marked — skipping login.")
                print("Attendance already marked — skipping login.")
                return
            
            number = random.randint(0, 300)
            time.sleep(number)

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)  # Set False for debugging
                page = browser.new_page()

                print("Navigating to login page...")
                page.goto("https://flovation.greythr.com/v3/portal/ess/home")

                print("Filling login credentials...")
                page.fill("#username", "FT002")
                page.fill("#password", "Megha123@")
                page.press("#password", "Enter")

                try:
                    page.wait_for_url("**/portal/ess/home", timeout=60000)
                    logging.info("Redirected to home page")
                    print("Redirected to home page")
                except:
                    logging.warning("URL redirect timeout, waiting for page load...")
                    print("URL redirect timeout, waiting for page load...")

                # Wait for page to fully load
                page.wait_for_load_state("networkidle")
                logging.info("Login successful, dashboard loaded.")
                print("Login successful, dashboard loaded.")

                # Try multiple strategies to find and click the button
                clicked = False
                
                # Strategy 1: Find button with "Sign In" text
                try:
                    print("\n--- Strategy 1: Searching for buttons with 'Sign In' text ---")
                    buttons = page.query_selector_all('button')
                    print(f"Found {len(buttons)} buttons on page")
                    
                    for i, btn in enumerate(buttons):
                        try:
                            text = btn.inner_text().strip()
                            if text:
                                print(f"Button {i}: '{text}'")
                            if "Sign In" in text or "sign in" in text.lower():
                                print(f"✓ Found Sign In button at index {i}")
                                btn.click()
                                clicked = True
                                logging.info("Attendance 'Sign In' clicked successfully (Strategy 1).")
                                print("✓ Attendance 'Sign In' clicked successfully (Strategy 1).")
                                break
                        except:
                            continue
                except Exception as e:
                    print(f"✗ Strategy 1 failed: {e}")
                    logging.warning(f"Strategy 1 failed: {e}")

                # Strategy 2: Use name attribute
                if not clicked:
                    try:
                        print("\n--- Strategy 2: Looking for button[name='primary'] ---")
                        page.wait_for_selector('button[name="primary"]', timeout=10000)
                        page.click('button[name="primary"]')
                        clicked = True
                        logging.info("Attendance 'Sign In' clicked successfully (Strategy 2).")
                        print("✓ Attendance 'Sign In' clicked successfully (Strategy 2).")
                    except Exception as e:
                        print(f"✗ Strategy 2 failed: {e}")
                        logging.warning(f"Strategy 2 failed: {e}")

                # Strategy 3: Use CSS class selector
                if not clicked:
                    try:
                        print("\n--- Strategy 3: Looking for .btn.btn-primary ---")
                        page.wait_for_selector('button.btn.btn-primary', timeout=10000)
                        page.click('button.btn.btn-primary')
                        clicked = True
                        logging.info("Attendance 'Sign In' clicked successfully (Strategy 3).")
                        print("✓ Attendance 'Sign In' clicked successfully (Strategy 3).")
                    except Exception as e:
                        print(f"✗ Strategy 3 failed: {e}")
                        logging.warning(f"Strategy 3 failed: {e}")

                # Strategy 4: JavaScript click
                if not clicked:
                    try:
                        print("\n--- Strategy 4: Using JavaScript to find and click ---")
                        result = page.evaluate('''
                            const buttons = Array.from(document.querySelectorAll('button'));
                            const signInBtn = buttons.find(btn => 
                                btn.textContent.includes('Sign In') || 
                                btn.getAttribute('name') === 'primary'
                            );
                            if (signInBtn) {
                                signInBtn.click();
                                return true;
                            }
                            return false;
                        ''')
                        if result:
                            clicked = True
                            logging.info("Attendance 'Sign In' clicked successfully (Strategy 4).")
                            print("✓ Attendance 'Sign In' clicked successfully (Strategy 4).")
                        else:
                            print("✗ JavaScript didn't find matching button")
                    except Exception as e:
                        print(f"✗ Strategy 4 failed: {e}")
                        logging.error(f"All click strategies failed: {e}")

                if not clicked:
                    logging.error("Could not click attendance Sign In button with any strategy")
                    print("❌ Could not click attendance Sign In button with any strategy")

                print("\nWaiting 5 seconds...")
                page.wait_for_timeout(5000)
                browser.close()

            logging.info("Login process completed.")
            print("Login process completed.")
            return

        except Exception as e:
            logging.error(f"Attempt {retries+1} failed: {e}")
            print(f"❌ Attempt {retries+1} failed: {e}")
            if browser:
                try:
                    browser.close()
                except:
                    pass
            retries += 1
            time.sleep(5)

    logging.error("All retries exhausted. Login failed.")
    print("❌ All retries exhausted. Login failed.")


def login_api_for_end_attndance():
    logging.info("Starting attendance logout check...")
    print("Starting attendance logout check...")
    retries = 0

    while retries < MAX_RETRIES:
        browser = None
        try:
            if is_restricted_day():
                logging.info("Restricted day — skipping logout.")
                print("Restricted day — skipping logout.")
                return

            number = random.randint(0, 300)
            time.sleep(number)

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)  # Set False for debugging
                page = browser.new_page()

                print("Navigating to login page...")
                page.goto("https://flovation.greythr.com/v3/portal/ess/home")

                print("Filling login credentials...")
                page.fill("#username", "FT002")
                page.fill("#password", "Megha123@")
                page.press("#password", "Enter")

                try:
                    page.wait_for_url("**/portal/ess/home", timeout=60000)
                    logging.info("Redirected to home page")
                    print("Redirected to home page")
                except:
                    logging.warning("URL redirect timeout, waiting for page load...")
                    print("URL redirect timeout, waiting for page load...")

                # Wait for page to fully load
                page.wait_for_load_state("networkidle")
                logging.info("Login successful, dashboard loaded.")
                print("Login successful, dashboard loaded.")

                # Try multiple strategies to find and click the Sign Out button
                clicked = False
                
                # Strategy 1: Find button with "Sign Out" text
                try:
                    print("\n--- Strategy 1: Searching for buttons with 'Sign Out' text ---")
                    buttons = page.query_selector_all('button')
                    print(f"Found {len(buttons)} buttons on page")
                    
                    for i, btn in enumerate(buttons):
                        try:
                            text = btn.inner_text().strip()
                            if text:
                                print(f"Button {i}: '{text}'")
                            if "Sign Out" in text or "sign out" in text.lower():
                                print(f"✓ Found Sign Out button at index {i}")
                                btn.click()
                                clicked = True
                                logging.info("Attendance 'Sign Out' clicked successfully (Strategy 1).")
                                print("✓ Attendance 'Sign Out' clicked successfully (Strategy 1).")
                                break
                        except:
                            continue
                except Exception as e:
                    print(f"✗ Strategy 1 failed: {e}")
                    logging.warning(f"Strategy 1 failed: {e}")

                # Strategy 2: Use name attribute (if Sign Out button has it)
                if not clicked:
                    try:
                        print("\n--- Strategy 2: Looking for button[name='primary'] with Sign Out ---")
                        page.wait_for_selector('button[name="primary"]', timeout=10000)
                        page.click('button[name="primary"]')
                        clicked = True
                        logging.info("Attendance 'Sign Out' clicked successfully (Strategy 2).")
                        print("✓ Attendance 'Sign Out' clicked successfully (Strategy 2).")
                    except Exception as e:
                        print(f"✗ Strategy 2 failed: {e}")
                        logging.warning(f"Strategy 2 failed: {e}")

                # Strategy 3: Use CSS class selector
                if not clicked:
                    try:
                        print("\n--- Strategy 3: Looking for .btn.btn-primary ---")
                        page.wait_for_selector('button.btn.btn-primary', timeout=10000)
                        page.click('button.btn.btn-primary')
                        clicked = True
                        logging.info("Attendance 'Sign Out' clicked successfully (Strategy 3).")
                        print("✓ Attendance 'Sign Out' clicked successfully (Strategy 3).")
                    except Exception as e:
                        print(f"✗ Strategy 3 failed: {e}")
                        logging.warning(f"Strategy 3 failed: {e}")

                # Strategy 4: JavaScript click
                if not clicked:
                    try:
                        print("\n--- Strategy 4: Using JavaScript to find and click ---")
                        result = page.evaluate('''
                            const buttons = Array.from(document.querySelectorAll('button'));
                            const signOutBtn = buttons.find(btn => 
                                btn.textContent.includes('Sign Out') || 
                                btn.getAttribute('name') === 'primary'
                            );
                            if (signOutBtn) {
                                signOutBtn.click();
                                return true;
                            }
                            return false;
                        ''')
                        if result:
                            clicked = True
                            logging.info("Attendance 'Sign Out' clicked successfully (Strategy 4).")
                            print("✓ Attendance 'Sign Out' clicked successfully (Strategy 4).")
                        else:
                            print("✗ JavaScript didn't find matching button")
                    except Exception as e:
                        print(f"✗ Strategy 4 failed: {e}")
                        logging.error(f"All click strategies failed: {e}")

                if not clicked:
                    logging.error("Could not click attendance Sign Out button with any strategy")
                    print("❌ Could not click attendance Sign Out button with any strategy")

                print("\nWaiting 5 seconds...")
                page.wait_for_timeout(5000)
                browser.close()

            logging.info("Logout process completed.")
            print("Logout process completed.")
            return

        except Exception as e:
            logging.error(f"Attempt {retries+1} failed: {e}")
            print(f"❌ Attempt {retries+1} failed: {e}")
            if browser:
                try:
                    browser.close()
                except:
                    pass
            retries += 1
            time.sleep(5)

    logging.error("All retries exhausted. Sign Out failed.")
    print("❌ All retries exhausted. Sign Out failed.")

# Schedule tasks
schedule.every().day.at("10:00").do(login_api_for_start_attndance)
schedule.every().day.at("19:30").do(login_api_for_end_attndance)

logging.info("Scheduling started. Waiting for next trigger...")
print("\nScheduling started. Waiting for next trigger...")
print(f"Next Sign In: 10:00 daily")
print(f"Next Sign Out: 19:30 daily")

while True:
    schedule.run_pending()
    time.sleep(1)