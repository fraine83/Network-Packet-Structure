const connectButton = document.getElementById("connect-button");
const connectionStatus = document.getElementById("connection-status");
const authenticationStage = document.getElementById("authentication-stage");
const authenticateButton = document.getElementById("authenticate-button");


// ============================================================
// TARGET REACHABILITY
// ============================================================
connectButton.addEventListener("click", async () => {

    const connectionData = {
        environmentType: document.getElementById("environment-type").value,
        host: document.getElementById("host").value.trim(),
        port: Number(document.getElementById("port").value)
    };

    if (!connectionData.environmentType || !connectionData.host) {
        console.error("Environment type and host are required.");
        return;
    }

    console.log("Reachability request:", connectionData);

    setConnectionState("checking");

    try {
        const result = await checkReachability(connectionData);

        console.log("Reachability result:", result);

        if (!result.reachable) {
            throw new Error(
                result.error || "Target is not reachable"
            );
        }

        setConnectionState("reachable");
        authenticationStage.hidden = false;

    } catch (error) {
        console.error("Reachability check failed:", error);

        authenticationStage.hidden = true;
        setConnectionState("failed");
    }
});

// ============================================================
// AUTHENTICATION
// ============================================================

authenticateButton.addEventListener("click", async () => {

    const authenticationData = {
        environmentType: document.getElementById("environment-type").value,
        host: document.getElementById("host").value.trim(),
        port: Number(document.getElementById("port").value),
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    };

    if (!authenticationData.username || !authenticationData.password) {
        console.error("Username and password are required.");
        return;
    }

    console.log("Authentication request:", {
        environmentType: authenticationData.environmentType,
        host: authenticationData.host,
        port: authenticationData.port,
        username: authenticationData.username,
        password: "[REDACTED]"
    });

    authenticateButton.disabled = true;
    authenticateButton.textContent = "Authenticating...";

    try {
        const result = await authenticateTarget(authenticationData);

        console.log("Authentication result:", result);

        if (!result.authenticated) {
            throw new Error(
                result.error || "Authentication failed"
            );
        }

        authenticateButton.textContent = "Authenticated";

    } catch (error) {
        console.error("Authentication failed:", error);

        authenticateButton.disabled = false;
        authenticateButton.textContent = "Retry Authentication";
    }
});

// ============================================================
// UI STATE
// ============================================================

function setConnectionState(state) {

    connectionStatus.classList.remove(
        "status--disconnected",
        "status--connecting",
        "status--connected",
        "status--failed"
    );

    switch (state) {

        case "checking":
            connectionStatus.textContent = "Checking...";
            connectionStatus.classList.add("status--connecting");

            connectButton.disabled = true;
            connectButton.textContent = "Checking...";
            break;

        case "reachable":
            connectionStatus.textContent = "Target Reachable";
            connectionStatus.classList.add("status--connected");

            connectButton.disabled = false;
            connectButton.textContent = "Check Again";
            break;

        case "failed":
            connectionStatus.textContent = "Target Unreachable";
            connectionStatus.classList.add("status--failed");

            connectButton.disabled = false;
            connectButton.textContent = "Retry";
            break;

        default:
            connectionStatus.textContent = "Disconnected";
            connectionStatus.classList.add("status--disconnected");

            connectButton.disabled = false;
            connectButton.textContent = "Check Target";
    }
}


// ============================================================
// BACKEND API
// ============================================================

async function checkReachability(connectionData) {

    const response = await fetch(
        "http://127.0.0.1:8000/api/reachability",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                environmentType: connectionData.environmentType,
                host: connectionData.host,
                port: connectionData.port
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `Backend API returned HTTP ${response.status}`
        );
    }

    return await response.json();
}


async function authenticateTarget(authenticationData) {

    const response = await fetch(
        "http://127.0.0.1:8000/api/authenticate",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(authenticationData)
        }
    );

    if (!response.ok) {
        throw new Error(
            `Backend API returned HTTP ${response.status}`
        );
    }

    return await response.json();
}