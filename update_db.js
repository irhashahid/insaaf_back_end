const { initDB, getDB } = require("./config/db");

async function updateDB() {
  initDB();
  const db = getDB();

  try {
    console.log("Altering users table...");
    await db.query("ALTER TABLE users ADD COLUMN subscription_end_date DATE NULL");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("subscription_end_date already exists in users table.");
    } else {
      console.error(err);
    }
  }

  try {
    console.log("Creating settings table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        setting_key VARCHAR(255) UNIQUE, 
        setting_value VARCHAR(255)
      )
    `);
  } catch (err) {
    console.error(err);
  }

  try {
    console.log("Inserting default setting_fee...");
    await db.query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('subscription_fee', '2000')");
  } catch (err) {
    console.error(err);
  }

  console.log("DB Update complete.");
  process.exit();
}

updateDB();
