import time
import requests
from datetime import datetime
import schedule
print("hell0")
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
    
    url = "https://api.hr.9930i.com/login/email_login"
    payload = {"email": "meghams147@gmail.com", "password": "12345678"}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            response_data = response.json()
            data = {
                "token": response_data.get("data", {}).get("token"),
                "personId": response_data.get("data", {}).get("personId"),
                "compId": response_data.get("data", {}).get("compId"),
                "entry_geocord": [
                    22.689155,
                    75.8657297
                ]
            }
            jwt_token = response_data.get("jwt_token")
            print(f"Data {data} {jwt_token}")

            attendance_start(data, jwt_token)
    except Exception as e:
        print(f"Error triggering API: {e}")

def attendance_start(data, jwt_token):
    url = "https://api.hr.9930i.com/android_attendance/entry_attendance"
    payload = data
    headers = {"Content-Type": "application/json", "authorization" : jwt_token}

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Triggered API - Status Code: {response.status_code}, Response: {response.text}")
        
        if response.status_code == 200:
            print(f"Success")
    except Exception as e:
        print(f"Error triggering API: {e}")

def login_api_for_end_attndance():
    if is_restricted_day() == True:
        return
    
    url = "https://api.hr.9930i.com/login/email_login"
    payload = {"email": "meghams147@gmail.com", "password": "12345678"}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            response_data = response.json()
            data = {
                "token": response_data.get("data", {}).get("token"),
                "personId": response_data.get("data", {}).get("personId"),
                "compId": response_data.get("data", {}).get("compId"),
                "entry_geocord": [
                    22.689155,
                    75.8657297
                ]
            }
            jwt_token = response_data.get("jwt_token")
            print(f"Data {data} {jwt_token}")

            api_to_get_attendance_data(data, jwt_token)
    except Exception as e:
        print(f"Error triggering API: {e}")

def api_to_get_attendance_data(data, jwt_token):
    url = "https://api.hr.9930i.com/android_attendance/get_attendance_by_date"
    payload = data
    headers = {"Content-Type": "application/json", "authorization" : jwt_token}

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Triggered API - Status Code: {response.status_code}, Response: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            result_list = response_data.get("result", [])
            latest_attendance = result_list[-1]
            attendance_id = latest_attendance.get("attendanceId")
            payload = {
                "compId": data["compId"],
                "personId": data["personId"],
                "token": data["token"],
                "content": "{\"Name Of The Project 01\\t\":\"--\",\"Total No. Of Hours Worked On Project 01\\t\":\"-\",\"Task Done In Project 01\\t\":\"--\",\"Name Of The Project 02\\t\":\"\",\"Total No. Of Hours Worked On Project 02\\t\":\"\",\"Task Done In Project 02\\t\":\"\",\"Name Of The Project 03\\t\":\"\",\"Total No. Of Hours Worked On Project 03\\t\":\"\",\"Task Done In Project 03\\t\":\"\",\"Date\":\"\"}",
                "attendanceId": attendance_id
            }
            save_dpr_api(payload, jwt_token)
            print(f"Success")
    except Exception as e:
        print(f"Error triggering API: {e}")

def save_dpr_api(data, jwt_token):
    url = "https://api.hr.9930i.com/user/save_dpr"
    payload = data
    headers = {"Content-Type": "application/json", "authorization" : jwt_token}

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Triggered API - Status Code: {response.status_code}, Response: {response.text}")
        
        if response.status_code == 200:
            print(f"Success")
            exit_attendance(data, jwt_token)
    except Exception as e:
        print(f"Error triggering API: {e}")

def exit_attendance(data, jwt_token):
    url = "https://api.hr.9930i.com/android_attendance/exit_attendance"
    today = datetime.now().strftime("%Y-%m-%d")
    payload = {
        "token": data["token"],
        "personId": data["personId"],
        "compId": data["compId"],
        "exit_geocord": [
            22.689155,
            75.8657297
        ],
        "exitDate": today,
        "entryDate": today
    }
    headers = {"Content-Type": "application/json", "authorization" : jwt_token}

    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Triggered API - Status Code: {response.status_code}, Response: {response.text}")
        
        if response.status_code == 200:
            print(f"Success")
    except Exception as e:
        print(f"Error triggering API: {e}")

schedule.every().day.at("10:00").do(login_api_for_start_attndance)
schedule.every().day.at("18:00").do(login_api_for_end_attndance)

while True:
    schedule.run_pending()
    print(datetime.now())
    time.sleep(1)



# https://api.hr.9930i.com/login/email_login
# {
#     "email": "meghams147@gmail.com",
#     "password": "12345678"
# }
# {
#     "data": {
#         "userId": 650,
#         "personId": 412,
#         "empl_id": "FT002",
#         "role_id": 2,
#         "compId": 85,
#         "reg_num": null,
#         "username": "Megha Sahu",
#         "email": "meghams147@gmail.com",
#         "mobile": "8770555604",
#         "password": "7c222fb2927d828af22f592134e8932480637c0d",
#         "doa": "2023-03-04 22:46:49",
#         "is_active": "Y",
#         "token": "ea9188fb34d1936e44efb4b97a99e18671ec1dd4",
#         "app_token": null,
#         "ip_address": null,
#         "login_device": "W",
#         "lastLoginTimeStamp": "2025-04-10 15:19:14",
#         "verificationCode": "KFtY1a",
#         "is_verified": "Y",
#         "is_admin": "N",
#         "is_employed": "Y",
#         "macId": null,
#         "user_rights": 100,
#         "doj": "2020-07-03",
#         "dol": null,
#         "resign_date": null,
#         "leave_balance": null,
#         "bulk_id": 20,
#         "agree_policy": "Y",
#         "agree_policy_date": "2023-04-27 20:34:39",
#         "role": "Employee"
#     },
#     "data1": [
#         {
#             "personId": 528,
#             "personNum": 412,
#             "name": "Megha Sahu",
#             "is_active": "N",
#             "userId": 650,
#             "role_id": 2,
#             "compId": 85,
#             "reg_num": null,
#             "association_id": 403,
#             "department_id": 300,
#             "designation_id": 333,
#             "gender": "F",
#             "dob": "1998-07-19",
#             "email": "meghams147@gmail.com",
#             "mob": "8770555604",
#             "mob2": null,
#             "pan": "PSQPS5927D",
#             "aadhaar": "320155396289",
#             "profileImage": null,
#             "fatherName": "Mr. Sunil kumar Sahu ",
#             "motherName": "Mrs. Madhu sahu",
#             "fatherOccup": "Businessman",
#             "motherOccup": "Housewife",
#             "fatherMobile": "9424305069",
#             "motherMobile": "0",
#             "guardianName": null,
#             "guardianContact": "0",
#             "guardian_relation": null,
#             "referredBy": "None",
#             "doa": "2023-03-04 17:16:49",
#             "permAddressId": "1342",
#             "tempAddressId": "1341",
#             "blood_group": null,
#             "pf_no": null,
#             "esi_no": null,
#             "eps_no": null,
#             "bulk_id": 20
#         },
#         {
#             "personId": 570,
#             "personNum": 412,
#             "name": "Megha Sahu",
#             "is_active": "Y",
#             "userId": 650,
#             "role_id": 2,
#             "compId": 85,
#             "reg_num": null,
#             "association_id": 403,
#             "department_id": 300,
#             "designation_id": 338,
#             "gender": "F",
#             "dob": "1998-07-19",
#             "email": "meghams147@gmail.com",
#             "mob": "8770555604",
#             "mob2": null,
#             "pan": "PSQPS5927D",
#             "aadhaar": "320155396289",
#             "profileImage": null,
#             "fatherName": "Mr. Sunil kumar Sahu ",
#             "motherName": "Mrs. Madhu sahu",
#             "fatherOccup": "Businessman",
#             "motherOccup": "Housewife",
#             "fatherMobile": "9424305069",
#             "motherMobile": "0",
#             "guardianName": null,
#             "guardianContact": "0",
#             "guardian_relation": null,
#             "referredBy": "None",
#             "doa": "2023-03-24 14:30:43",
#             "permAddressId": "1480",
#             "tempAddressId": "1341",
#             "blood_group": null,
#             "pf_no": null,
#             "esi_no": null,
#             "eps_no": null,
#             "bulk_id": 0
#         }
#     ],
#     "status": 1,
#     "attId": 1,
#     "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImVhOTE4OGZiMzRkMTkzNmU0NGVmYjRiOTdhOTllMTg2NzFlYzFkZDQiLCJzdWIiOjQxMiwiaWF0IjoxNzQ0Mjc4NTU0MDc0LCJleHAiOjE3NDQyNzg1NTc2NzR9.P4pql1_JkLY90MfL9l95wSIllxpYjt0-iyNCFG7kEww",
#     "msg": "Login Successful by Email"
# }



# https://api.hr.9930i.com/android_attendance/entry_attendance
# {
#     "token": "9ae472877bbf3e5a5791941f59f59611e0f94bc6",
#     "personId": "412",
#     "compId": "85",
#     "entry_geocord": [
#         22.689155,
#         75.8657297
#     ]
# }
# {
#     "status": 1,
#     "msg": "Successfully inserted ",
#     "result": "2025-04-10 15:22:13",
#     "entry_date": "2025-04-10",
#     "ip": "116.75.242.211"
# }







# https://api.hr.9930i.com/android_attendance/get_attendance_by_date
# {
#     "token": "d5e4de546a4694b88e9e0b91e86c0c385db6b2bd",
#     "personId": "412",
#     "compId": "85",
#     "entry_geocord": []
# }
# {
#     "status": 1,
#     "attBeganFlag": false,
#     "msg": "Fetch all the details",
#     "attId": 0,
#     "result": [
#         {
#             "entry_date": "2025-04-10",
#             "entry_time": "2025-04-10 15:22:13",
#             "exit_time": "2025-04-10 15:52:09",
#             "hours": "00:29:56",
#             "attendanceId": 33808,
#             "dprSaveFlag": true
#         }
#     ]
# }

# https://api.hr.9930i.com/user/save_dpr
# {
#     "compId": "85",
#     "personId": "412",
#     "token": "d5e4de546a4694b88e9e0b91e86c0c385db6b2bd",
#     "content": "{\"Name Of The Project 01\\t\":\"--\",\"Total No. Of Hours Worked On Project 01\\t\":\"-\",\"Task Done In Project 01\\t\":\"--\",\"Name Of The Project 02\\t\":\"\",\"Total No. Of Hours Worked On Project 02\\t\":\"\",\"Task Done In Project 02\\t\":\"\",\"Name Of The Project 03\\t\":\"\",\"Total No. Of Hours Worked On Project 03\\t\":\"\",\"Task Done In Project 03\\t\":\"\",\"Date\":\"\"}",
#     "attendanceId": 33808
# }
# {
#     "compId": "85",
#     "personId": "412",
#     "token": "d5e4de546a4694b88e9e0b91e86c0c385db6b2bd",
#     "content": "{\"Name Of The Project 01\\t\":\"--\",\"Total No. Of Hours Worked On Project 01\\t\":\"-\",\"Task Done In Project 01\\t\":\"--\",\"Name Of The Project 02\\t\":\"\",\"Total No. Of Hours Worked On Project 02\\t\":\"\",\"Task Done In Project 02\\t\":\"\",\"Name Of The Project 03\\t\":\"\",\"Total No. Of Hours Worked On Project 03\\t\":\"\",\"Task Done In Project 03\\t\":\"\",\"Date\":\"\"}",
#     "attendanceId": 33808
# }

# https://api.hr.9930i.com/android_attendance/exit_attendance
# {
#     "token": "d5e4de546a4694b88e9e0b91e86c0c385db6b2bd",
#     "personId": "412",
#     "compId": "85",
#     "exit_geocord": [
#         22.689155,
#         75.8657297
#     ],
#     "exitDate": "2025-04-10",
#     "entryDate": "2025-04-10"
# }
# {
#     "status": 1,
#     "msg": "Successfully inserted ",
#     "result": "2025-04-10 15:52:09",
#     "ip": "116.75.242.211",
#     "hours": "0:29:56"
# }
