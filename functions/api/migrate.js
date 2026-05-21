export async function onRequestGet(context) {
  try {
    let logs = [];
    
    // 1. Create feedback table
    try {
      await context.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS feedback (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id)
        )
      `).run();
      logs.push("feedback table verified/created");
    } catch(e) { logs.push("feedback error: " + e.message); }

    // 2. Add sizes column
    try {
      await context.env.DB.prepare("ALTER TABLE products ADD COLUMN sizes TEXT").run();
      logs.push("sizes column added to products");
    } catch(e) { logs.push("sizes column exists or error: " + e.message); }

    // 3. Add colors column
    try {
      await context.env.DB.prepare("ALTER TABLE products ADD COLUMN colors TEXT").run();
      logs.push("colors column added to products");
    } catch(e) { logs.push("colors column exists or error: " + e.message); }

    return Response.json({ success: true, logs });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
