import socket


def check_reachability(host: str, port: int, timeout: float = 3.0):
    """
    Resolve the target and test whether the requested TCP service
    can be reached.

    This does NOT authenticate to the target.
    """

    try:
        # Resolve hostname/FQDN or validate IP
        resolved_ip = socket.gethostbyname(host)

    except socket.gaierror:
        return {
            "reachable": False,
            "stage": "dns_resolution",
            "host": host,
            "resolved_ip": None,
            "port": port,
            "error": "Unable to resolve target"
        }

    try:
        # Attempt TCP connection
        with socket.create_connection(
            (resolved_ip, port),
            timeout=timeout
        ):
            return {
                "reachable": True,
                "stage": "tcp_reachability",
                "host": host,
                "resolved_ip": resolved_ip,
                "port": port,
                "service_available": True
            }

    except socket.timeout:
        return {
            "reachable": False,
            "stage": "tcp_reachability",
            "host": host,
            "resolved_ip": resolved_ip,
            "port": port,
            "error": "Connection timed out"
        }

    except ConnectionRefusedError:
        return {
            "reachable": False,
            "stage": "tcp_reachability",
            "host": host,
            "resolved_ip": resolved_ip,
            "port": port,
            "error": "Connection refused"
        }

    except OSError as error:
        return {
            "reachable": False,
            "stage": "tcp_reachability",
            "host": host,
            "resolved_ip": resolved_ip,
            "port": port,
            "error": str(error)
        }