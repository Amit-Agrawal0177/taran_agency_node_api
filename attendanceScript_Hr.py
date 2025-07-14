import time
from datetime import datetime
import schedule
import random
from playwright.sync_api import sync_playwright

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
    if is_restricted_day() == True:
        return

    number = random.randint(300, 1800)
    time.sleep(number)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://flovation.greythr.com/v3/portal/ess/home")
        
        # Fill login form
        page.fill("#username", "FT002")
        page.fill("#password", "Megha123@")
        page.press("#password", "Enter")

        # Click the button using class selector
        page.wait_for_timeout(5000)
        # page.wait_for_load_state("networkidle")
        page.click("text=Sign In")

        page.wait_for_timeout(5000)
        browser.close()
    
    

def login_api_for_end_attndance():
    if is_restricted_day() == True:
        return

    number = random.randint(300, 1800)
    time.sleep(number)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://flovation.greythr.com/v3/portal/ess/home")
        
        # Fill login form
        page.fill("#username", "FT002")
        page.fill("#password", "Megha123@")
        page.press("#password", "Enter")

        # Click the button using class selector
        page.wait_for_timeout(5000)
        # page.wait_for_load_state("networkidle")
        page.click("text=Sign Out")

        page.wait_for_timeout(5000)
        browser.close()



schedule.every().day.at("10:00").do(login_api_for_start_attndance)
schedule.every().day.at("18:00").do(login_api_for_end_attndance)

while True:
    schedule.run_pending()
    time.sleep(1)