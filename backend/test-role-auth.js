/**
 * Role Verification Test (no emoji - Windows compatible)
 * Run: node test-role-auth.js
 */

const BASE = "http://localhost:5000";
const TEST_EMAIL = `testuser_${Date.now()}@gmail.com`;
const TEST_PASS = "Test@1234";

async function req(method, path, body, token) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(`${BASE}${path}`, opts);
  return res.json();
}

function log(label, ok, detail = "") {
  const icon = ok ? "[PASS]" : "[FAIL]";
  console.log(`  ${icon} ${label}${detail ? ": " + detail : ""}`);
}

async function run() {
  console.log("");
  console.log("===== Role Verification Test Suite =====");
  console.log(`  User: ${TEST_EMAIL}`);
  console.log("");

  // 1. Register
  console.log("[1] Register new user");
  const reg = await req("POST", "/api/user/register", { name: "Test User", email: TEST_EMAIL, password: TEST_PASS });
  log("Registration", reg.success, reg.message);
  if (!reg.success) { console.log("ABORT: Registration failed"); return process.exit(1); }

  // 2. Login
  console.log("");
  console.log("[2] Login");
  const login = await req("POST", "/api/user/login", { email: TEST_EMAIL, password: TEST_PASS });
  log("Login response", login.success, login.message || "ok");
  if (!login.success) { console.log("ABORT: Login failed"); return process.exit(1); }

  const { token, user } = login;
  log("Token received", !!token, token ? token.substring(0, 20) + "..." : "none");
  log("Role in login response", !!user.role, `role = "${user.role}"`);

  // 3. Decode JWT
  console.log("");
  console.log("[3] Decode JWT payload");
  let payload;
  try {
    payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    log("JWT id field", !!payload.id, payload.id);
    log("JWT role field", !!payload.role, `"${payload.role}"`);
    log("Role is 'user'", payload.role === "user", payload.role === "user" ? "correct" : `got "${payload.role}"`);
    log("Role is NOT admin", payload.role !== "admin", payload.role !== "admin" ? "correct" : "WARNING: user has admin role!");
  } catch (e) {
    log("JWT decode", false, e.message);
  }

  // 4. Protected route /api/user/me
  console.log("");
  console.log("[4] Access protected route /api/user/me");
  const me = await req("GET", "/api/user/me", null, token);
  log("Auth middleware passes", me.success, me.data?.email || me.message);
  if (me.success) {
    log("DB user role", !!me.data.role, `"${me.data.role}"`);
    log("Roles match", me.data.role === payload?.role,
      me.data.role === payload?.role ? "JWT role == DB role" : `JWT="${payload?.role}" vs DB="${me.data.role}"`);
  }

  // 5. Admin route with user token (must be BLOCKED)
  console.log("");
  console.log("[5] Admin-only /api/admin/analytics with USER token (expect: BLOCKED)");
  const adminBlocked = await req("GET", "/api/admin/analytics", null, token);
  const wasBlocked = !adminBlocked.success;
  log("Route correctly BLOCKED for 'user' role", wasBlocked, adminBlocked.message);

  // 6. Admin route with no token (must be BLOCKED)
  console.log("");
  console.log("[6] Admin-only /api/admin/analytics with NO token (expect: BLOCKED)");
  const noToken = await req("GET", "/api/admin/analytics");
  log("Route correctly BLOCKED with no token", !noToken.success, noToken.message);

  console.log("");
  console.log("========================================");
  const allPass = reg.success && login.success && me.success && wasBlocked && !noToken.success;
  console.log(allPass ? "RESULT: ALL TESTS PASSED" : "RESULT: SOME TESTS FAILED - see above");
  console.log("");
}

run().catch(err => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
