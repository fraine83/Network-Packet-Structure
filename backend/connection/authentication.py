import paramiko


def authenticate_ssh(
    host: str,
    port: int,
    username: str,
    password: str,
    timeout: float = 5.0
):
    client = paramiko.SSHClient()

    # Development/lab behavior for now.
    client.set_missing_host_key_policy(
        paramiko.AutoAddPolicy()
    )

    try:
        client.connect(
            hostname=host,
            port=port,
            username=username,
            password=password,
            timeout=timeout,
            auth_timeout=timeout,
            banner_timeout=timeout,
            look_for_keys=False,
            allow_agent=False
        )

        return {
            "authenticated": True,
            "host": host,
            "port": port,
            "username": username
        }

    except paramiko.AuthenticationException:
        return {
            "authenticated": False,
            "host": host,
            "port": port,
            "error": "Authentication failed"
        }

    except paramiko.SSHException:
        return {
            "authenticated": False,
            "host": host,
            "port": port,
            "error": "SSH connection failed"
        }

    except OSError:
        return {
            "authenticated": False,
            "host": host,
            "port": port,
            "error": "Unable to connect to SSH service"
        }

    finally:
        client.close()