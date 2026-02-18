const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = "stephaded2022";
const REPO = "napps-ogun-state-website";

const DATABASE = {
  schools: "data/schools.json",
  teachers: "data/teachers.json",
  executives: "data/executives.json",
  logs: "data/logs.json",
  notifications: "data/notification.json",
};

async function getDatabase(type) {
  const path = DATABASE[type] || `data/${type}.json`;
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path
    });
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { sha: data.sha, path, json: JSON.parse(content) };
  } catch (err) {
    console.warn(`Database ${path} not found, starting fresh.`);
    return { sha: null, path, json: [] };
  }
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const type = event.queryStringParameters?.type || "schools";

    // --- GET DATA ---
    if (event.httpMethod === "GET") {
      const db = await getDatabase(type);
      return { statusCode: 200, headers, body: JSON.stringify(db.json) };
    }

    // --- UPDATE DATA ---
    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body);
      const { action, id, actorRole, data: submissionData } = payload;
      const db = await getDatabase(type);
      let newData = [...db.json];

      if (action === "register") {
        newData.push({
          id: Date.now().toString(),
          ...submissionData,
          status: "pending",
          date: new Date().toISOString()
        });
      } else if (action === "verify") {
        newData = newData.map(item => item.id === id ? { ...item, status: "verified" } : item);
      } else if (action === "delete") {
        newData = newData.filter(item => item.id !== id);
      }

      await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: db.path,
        message: `Portal Update: ${action} on ${type}`,
        content: Buffer.from(JSON.stringify(newData, null, 2)).toString("base64"),
        sha: db.sha
      });

      return { statusCode: 200, headers, body: JSON.stringify({ message: "Sync Success" }) };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};