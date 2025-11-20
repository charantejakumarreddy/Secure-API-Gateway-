import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Dashboard() {
  const [token, setToken] = useState("");
  const [apiKeys, setApiKeys] = useState([]);
  const [logs, setLogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [health, setHealth] = useState(null);
  const [apiKeyName, setApiKeyName] = useState("");
  const [proxyResponse, setProxyResponse] = useState("");
  const [loading, setLoading] = useState({});
  const [showApiKey, setShowApiKey] = useState({});

  const log = (msg) => setLogs((prev) => [`${new Date().toLocaleTimeString()} › ${msg}`, ...prev]);

  // Clear form fields on logout
  const clearFormFields = () => {
    setUsername("");
    setPassword("");
    setApiKeyName("");
    setHealth(null);
    setProxyResponse("");
  };

  // login to get JWT
  async function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) {
      log("❌ Username and password are required");
      return;
    }

    setLoading(prev => ({...prev, login: true}));
    try {
      const res = await fetch(`${API_BASE}/admin/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: username,
          password: password
        })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.access_token);
        log("✅ Logged in successfully!");
      } else {
        log("❌ Login failed: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      log("⚠️ Network error: " + err.message);
    } finally {
      setLoading(prev => ({...prev, login: false}));
    }
  }

  // logout
  function handleLogout() {
    setToken("");
    clearFormFields();
    setApiKeys([]);
    log("✅ Logged out successfully");
  }

  // get system health (root)
  async function checkHealth() {
    setLoading(prev => ({...prev, health: true}));
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data.message);
        log("💡 Health check OK");
      } else {
        log("❌ Health check failed: " + res.status);
      }
    } catch (err) {
      log("⚠️ Network error: " + err.message);
    } finally {
      setLoading(prev => ({...prev, health: false}));
    }
  }

  // fetch existing API keys
  async function fetchKeys() {
    if (!token) return;
    
    setLoading(prev => ({...prev, fetchKeys: true}));
    try {
      const res = await fetch(`${API_BASE}/admin/apikeys`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setApiKeys(data);
          log("📜 Loaded API keys");
        } else {
          log("⚠️ Unexpected response format");
        }
      } else if (res.status === 401) {
        log("❌ Authentication failed. Please log in again.");
        handleLogout();
      } else {
        log("❌ Failed to fetch keys: " + res.status);
      }
    } catch (err) {
      log("⚠️ Network error: " + err.message);
    } finally {
      setLoading(prev => ({...prev, fetchKeys: false}));
    }
  }

  // create new key
  async function createKey(e) {
    e.preventDefault();
    if (!token) return;
    if (!apiKeyName.trim()) {
      log("❌ API key name is required");
      return;
    }

    setLoading(prev => ({...prev, createKey: true}));
    try {
      const res = await fetch(`${API_BASE}/admin/apikeys`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: apiKeyName.trim() }),
      });
      
      if (res.ok) {
        const data = await res.json();
        log("🔑 Created API key: " + (data.name || "Unnamed"));
        setApiKeyName(""); // Clear the input field
        fetchKeys(); // Refresh the list
      } else if (res.status === 401) {
        log("❌ Authentication failed. Please log in again.");
        handleLogout();
      } else {
        const data = await res.json();
        log("❌ Failed: " + (data.detail || res.status));
      }
    } catch (err) {
      log("⚠️ Network error: " + err.message);
    } finally {
      setLoading(prev => ({...prev, createKey: false}));
    }
  }

  // test proxy
  async function testProxy() {
    if (!token) return;
    
    setLoading(prev => ({...prev, proxy: true}));
    try {
      const res = await fetch(`${API_BASE}/nms/proxy`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProxyResponse(JSON.stringify(data, null, 2));
        log("📡 Proxy test success");
      } else if (res.status === 401) {
        log("❌ Authentication failed. Please log in again.");
        handleLogout();
      } else {
        log("❌ Proxy test failed: " + res.status);
      }
    } catch (err) {
      log("⚠️ Network error: " + err.message);
    } finally {
      setLoading(prev => ({...prev, proxy: false}));
    }
  }

  // Toggle API key visibility
  const toggleApiKeyVisibility = (id) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy API key to clipboard
  const copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    log(`📋 Copied API key for "${name}" to clipboard`);
  };

  // Load API keys when token is available
  useEffect(() => {
    if (token) {
      fetchKeys();
    }
  }, [token]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🔐 NMSSentinelPy Dashboard</h1>
        {token && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      <main className="dashboard-main">
        {!token ? (
          <div className="login-container">
            <div className="card">
              <h2>Login to NMSSentinelPy</h2>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading.login}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading.login}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading.login}
                >
                  {loading.login ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Health Section */}
            <section className="card">
              <h2>🏥 System Health</h2>
              <div className="health-content">
                <button 
                  onClick={checkHealth} 
                  disabled={loading.health}
                  className="btn-secondary"
                >
                  {loading.health ? "Checking..." : "Check Health"}
                </button>
                {health && (
                  <div className="health-message">
                    <p>{health}</p>
                  </div>
                )}
              </div>
            </section>

            {/* API Keys Section */}
            <section className="card">
              <h2>🔑 API Keys Management</h2>
              <div className="api-keys-content">
                <form onSubmit={createKey} className="api-key-form">
                  <div className="form-group">
                    <label htmlFor="apiKeyName">New API Key Name</label>
                    <input
                      id="apiKeyName"
                      type="text"
                      placeholder="Enter API key name"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      disabled={loading.createKey}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading.createKey}
                  >
                    {loading.createKey ? "Creating..." : "Create New Key"}
                  </button>
                  <button 
                    type="button" 
                    onClick={fetchKeys} 
                    disabled={loading.fetchKeys}
                    className="btn-secondary"
                  >
                    {loading.fetchKeys ? "Refreshing..." : "Refresh Keys"}
                  </button>
                </form>

                {apiKeys.length > 0 ? (
                  <div className="api-keys-list">
                    <h3>Existing API Keys ({apiKeys.length})</h3>
                    <div className="table-container">
                      <table className="api-keys-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiKeys.map((key) => (
                            <tr key={key.id}>
                              <td><strong>{key.name}</strong></td>
                              <td className="key-cell">
                                <span className="key-preview">
                                  {showApiKey[key.id] 
                                    ? key.key 
                                    : `${key.key.substring(0, 8)}...${key.key.slice(-4)}`
                                  }
                                </span>
                                <div className="key-actions">
                                  <button 
                                    onClick={() => toggleApiKeyVisibility(key.id)}
                                    className="btn-icon"
                                    title={showApiKey[key.id] ? "Hide key" : "Show key"}
                                  >
                                    {showApiKey[key.id] ? "🙈" : "👁️"}
                                  </button>
                                  <button 
                                    onClick={() => copyToClipboard(key.key, key.name)}
                                    className="btn-icon"
                                    title="Copy to clipboard"
                                  >
                                    📋
                                  </button>
                                </div>
                              </td>
                              <td>
                                {key.created_at 
                                  ? new Date(key.created_at).toLocaleString() 
                                  : 'N/A'
                                }
                              </td>
                              <td>
                                <button 
                                  className="btn-danger"
                                  onClick={() => {
                                    // In a real implementation, you would have a delete endpoint
                                    log(`⚠️ Delete functionality not implemented for key: ${key.name}`);
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="no-keys">
                    <p>No API keys found. Create your first key above.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Proxy Section */}
            <section className="card">
              <h2>📡 NMS Proxy Tester</h2>
              <div className="proxy-content">
                <button 
                  onClick={testProxy} 
                  disabled={loading.proxy}
                  className="btn-primary"
                >
                  {loading.proxy ? "Testing..." : "Run Proxy Test"}
                </button>
                
                {proxyResponse && (
                  <div className="proxy-response">
                    <h3>Response</h3>
                    <pre className="response-pre">
                      {proxyResponse}
                    </pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(proxyResponse);
                        log("📋 Copied proxy response to clipboard");
                      }}
                      className="btn-secondary"
                    >
                      Copy Response
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Logs Section */}
      <footer className="dashboard-footer">
        <div className="card logs-card">
          <h2>📝 Live Logs</h2>
          <div className="logs-container">
            {logs.length > 0 ? (
              <div className="logs-list">
                {logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-logs">No logs yet. Actions will appear here.</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}