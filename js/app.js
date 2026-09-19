// =============================================
// DOM REFERENCES
// =============================================

const connectionForm = document.getElementById("connection-form");
const connectButton = document.getElementById("connect-button");
const connectionStatus = document.getElementById("connection-status");

const environmentType = document.getElementById("environment-type");
const hostLabel = document.getElementById("host-label");
const hostInput = document.getElementById("host");


// =============================================
// ENVIRONMENT FORM
// =============================================

environmentType.addEventListener("change", updateEnvironmentForm);

function updateEnvironmentForm() {

    switch (environmentType.value) {

        case "eve_ng":
            hostLabel.textContent = "EVE-NG Host / IP Address";
            hostInput.placeholder = "192.168.20.13";
            break;

        case "linux":
            hostLabel.textContent = "Linux Host / FQDN";
            hostInput.placeholder = "server.example.com";
            break;

        case "network_device":
            hostLabel.textContent = "Device IP / FQDN";
            hostInput.placeholder = "192.168.20.1";
            break;

        case "remote_environment":
            hostLabel.textContent = "Domain / Access FQDN";
            hostInput.placeholder = "access.example.net";
            break;

        default:
            hostLabel.textContent = "Host / IP Address";
            hostInput.placeholder = "192.168.1.100";
    }

    hostInput.value = "";
}


// =============================================
// CONNECTION FORM
// =============================================

connectionForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const connectionData = {
        environmentType: environmentType.value,
        host: hostInput.value.trim(),
        port: Number(document.getElementById("port").value),
        username: document.getElementById("username").value.trim(),
        authType: document.getElementById("auth-type").value,
        password: document.getElementById("password").value
    };

    console.log("Connection request:", {
        ...connectionData,
        password: connectionData.password ? "[REDACTED]" : ""
    });

    setConnectionState("connecting");

    try {

        const result = await mockConnect(connectionData);

        if (!result.connected) {
            throw new Error(result.error || "Connection failed");
        }

        setConnectionState("connected");

        console.log(
            "Environment detected:",
            result.environment
        );

    } catch (error) {

        console.error(error);

        setConnectionState("failed");
    }
});


// =============================================
// CONNECTION STATE
// =============================================

function setConnectionState(state) {

    connectionStatus.classList.remove(
        "status--disconnected",
        "status--connecting",
        "status--connected",
        "status--failed"
    );

    switch (state) {

        case "connecting":

            connectionStatus.textContent = "Connecting...";
            connectionStatus.classList.add("status--connecting");

            connectButton.disabled = true;
            connectButton.textContent = "Connecting...";

            break;

        case "connected":

            connectionStatus.textContent = "Connected";
            connectionStatus.classList.add("status--connected");

            connectButton.disabled = false;
            connectButton.textContent = "Connected";

            break;

        case "failed":

            connectionStatus.textContent = "Connection Failed";
            connectionStatus.classList.add("status--failed");

            connectButton.disabled = false;
            connectButton.textContent = "Retry";

            break;

        default:

            connectionStatus.textContent = "Disconnected";
            connectionStatus.classList.add("status--disconnected");

            connectButton.disabled = false;
            connectButton.textContent = "Connect";
    }
}


// =============================================
// MOCK CONNECTION
// Temporary — replaced by Python API later
// =============================================

async function mockConnect(connectionData) {

    // Simulate network/API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Temporary failure test
    if (connectionData.host === "192.168.20.99") {

        return {
            connected: false,
            error: "Unable to reach target environment"
        };
    }

    return {
        connected: true,

        environment: {
            type: connectionData.environmentType,
            hostname: "eve-ng",
            captureSupported: true
        }
    };
}