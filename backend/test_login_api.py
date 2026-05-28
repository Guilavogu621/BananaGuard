import requests

def test_login():
    url_login = "http://127.0.0.1:8000/api/auth/login"
    payload = {
        "username": "test@bananaguard.com",
        "password": "BananaGuard2025"
    }
    
    # 1. Login
    print("Attempting login...")
    try:
        response = requests.post(url_login, data=payload)
        print(f"Login Response Status: {response.status_code}")
        print(f"Login Response Data: {response.json()}")
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # 2. Get Me
            print("\nAttempting to fetch user info...")
            url_me = "http://127.0.0.1:8000/api/auth/me"
            response_me = requests.get(url_me, headers=headers)
            print(f"Me Response Status: {response_me.status_code}")
            print(f"Me Response Data: {response_me.json()}")
        else:
            print("Login failed, cannot test /me.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_login()
