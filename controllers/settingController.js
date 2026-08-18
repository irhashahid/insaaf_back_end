const { getDB } = require("../config/db");

const getSettings = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM settings");
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get settings" });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    if (!setting_key || setting_value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }
    const db = getDB();
    await db.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [setting_key, setting_value, setting_value]
    );
    res.json({ message: "Setting updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update setting" });
  }
};

module.exports = { getSettings, updateSetting };
