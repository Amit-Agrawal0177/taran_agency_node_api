import time
from datetime import datetime
import schedule
import random
from playwright.sync_api import sync_playwright
import mysql.connector
import logging
import os

# === Setup daily log file ===
def setup_logger():
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)  # ensure folder exists
    log_filename = os.path.join(
        log_dir, f"tusharLogs_{datetime.now().strftime('%Y-%m-%d')}.txt"
    )

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_filename, mode="a", encoding="utf-8")
        ]
    )

setup_logger()
logging.info("Tushar Attendance Script Started")

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
    retries = 0

    while retries < MAX_RETRIES:
        browser = None
        try:
            if is_restricted_day():
                logging.info("Restricted day — skipping attendance.")
                return

            if checkForAttndance():
                logging.info("Attendance already marked — skipping login.")
                return
            
            number = random.randint(300, 1800)
            time.sleep(number)

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                page.goto("https://flovation.greythr.com/v3/portal/ess/home")

                page.fill("#username", "FT005")
                page.fill("#password", "9930@OEPP")
                page.press("#password", "Enter")

                try:
                    page.wait_for_url("**/portal/ess/home", timeout=60000)
                except:
                    page.wait_for_selector("text=Sign In", timeout=60000)

                logging.info("Login successful, dashboard loaded.")

                try:
                    page.wait_for_selector("text=Sign In", timeout=30000)
                    page.click("text=Sign In")
                    logging.info("Attendance 'Sign In' clicked successfully.")
                except Exception as e:
                    logging.error(f"Could not click attendance Sign In: {e}")

                page.wait_for_timeout(5000)
                browser.close()

            logging.info("Login successful.")
            return

        except Exception as e:
            logging.error(f"Attempt {retries+1} failed: {e}")
            retries += 1
            time.sleep(5)

    logging.error("All retries exhausted. Login failed.")


def login_api_for_end_attndance():
    logging.info("Starting attendance logout check...")
    retries = 0

    while retries < MAX_RETRIES:
        browser = None
        try:
            if is_restricted_day():
                logging.info("Restricted day — skipping logout.")
                return

            number = random.randint(300, 1800)
            time.sleep(number)

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                page.goto("https://flovation.greythr.com/v3/portal/ess/home")

                page.fill("#username", "FT005")
                page.fill("#password", "9930@OEPP")
                page.press("#password", "Enter")

                try:
                    page.wait_for_url("**/portal/ess/home", timeout=60000)
                except:
                    page.wait_for_selector("text=Sign Out", timeout=60000)

                logging.info("Login successful, dashboard loaded.")

                try:
                    page.wait_for_selector("text=Sign Out", timeout=30000)
                    page.click("text=Sign Out")
                    logging.info("Attendance 'Sign Out' clicked successfully.")
                except Exception as e:
                    logging.error(f"Could not click attendance Sign Out: {e}")

                page.wait_for_timeout(5000)
                browser.close()

            logging.info("Logout successful.")
            return

        except Exception as e:
            logging.error(f"Attempt {retries+1} failed: {e}")
            retries += 1
            time.sleep(5)

    logging.error("All retries exhausted. Sign Out failed.")


# === Schedule tasks ===
schedule.every().day.at("10:00").do(login_api_for_start_attndance)
schedule.every().day.at("19:30").do(login_api_for_end_attndance)

logging.info("Scheduling started. Waiting for next trigger...")

while True:
    schedule.run_pending()
    time.sleep(1)