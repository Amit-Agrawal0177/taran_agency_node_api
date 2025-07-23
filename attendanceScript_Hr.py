import time
from datetime import datetime
import schedule
import random
from playwright.sync_api import sync_playwright

MAX_RETRIES = 3

def is_restricted_day():
    today = datetime.now()
    weekday = today.weekday()

    if weekday == 6:
        return True

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
    retries = 0

    while retries < MAX_RETRIES:
        browser = None
        try:
            if is_restricted_day():
                return

            number = random.randint(0, 300)
            time.sleep(number)

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://flovation.greythr.com/v3/portal/ess/home")

                page.fill("#username", "FT002")
                page.fill("#password", "Megha123@")
                page.press("#password", "Enter")

                page.wait_for_timeout(10000)
                page.click("text=Sign In")

                page.wait_for_timeout(5000)
            return

        except Exception as e:
            print(f"[ERROR] Attempt {retries+1}: {e}")
            retries += 1
            time.sleep(5)
        finally:
            if browser:
                browser.close()

    print("[FAILURE] All retries exhausted. Login failed.")


def login_api_for_end_attndance():
    retries = 0

    while retries < MAX_RETRIES:
        browser = None
        try:
            if is_restricted_day():
                return

            number = random.randint(0, 300)
            time.sleep(number)

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://flovation.greythr.com/v3/portal/ess/home")

                page.fill("#username", "FT002")
                page.fill("#password", "Megha123@")
                page.press("#password", "Enter")

                page.wait_for_timeout(10000)
                page.click("text=Sign Out")

                page.wait_for_timeout(5000)
            return

        except Exception as e:
            print(f"[ERROR] Attempt {retries+1}: {e}")
            retries += 1
            time.sleep(5)
        finally:
            if browser:
                browser.close()

    print("[FAILURE] All retries exhausted. sign Out failed.")


schedule.every().day.at("10:00").do(login_api_for_start_attndance)
schedule.every().day.at("19:30").do(login_api_for_end_attndance)

while True:
    schedule.run_pending()
    time.sleep(1)