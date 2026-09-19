import requests


def authenticate_eve_ng(
    host: str,
    port: int,
    username: str,
    password: str,
    timeout: float = 5.0
):
    url = f"http://{host}:{port}/api/auth/login"

    session = requests.Session()

    try:
        response = session.post(
            url,
            json={
                "username": username,
                "password": password
            },
            timeout=timeout
        )

        data = response.json()

        if response.ok and data.get("status") == "success":
            return {
                "authenticated": True,
                "host": host,
                "port": port,
                "username": username,
                "api_status": data.get("status"),
                "message": data.get("message")
            }

        return {
            "authenticated": False,
            "host": host,
            "port": port,
            "error": data.get(
                "message",
                "EVE-NG authentication failed"
            )
        }

    except requests.RequestException as error:
        return {
            "authenticated": False,
            "host": host,
            "port": port,
            "error": str(error)
        }

    except ValueError:
        return {
            "authenticated": False,
            "host": host,
            "port": port,
            "error": "EVE-NG returned an invalid JSON response"
        }