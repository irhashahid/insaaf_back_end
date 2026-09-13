const bcrypt = require("bcrypt");
const { getDB } = require("../config/db");

async function getAllLawyers() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT 
      u.id, u.name, u.email, u.phone, u.specialization, u.category, u.location, 
      u.experience, u.cases, u.license, u.status, u.role, u.subscription_expiry,
      COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS rating,
      COUNT(r.id) AS total_reviews
     FROM users u
     LEFT JOIN ratings r ON u.id = r.lawyer_id
     WHERE u.role = 'lawyer'
     GROUP BY u.id`
  );
  return rows;
}

async function getLawyerById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT 
      u.id, u.name, u.email, u.phone, u.specialization, u.category, u.location, 
      u.experience, u.cases, u.license, u.status, u.role, u.subscription_expiry,
      COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS rating,
      COUNT(r.id) AS total_reviews
     FROM users u
     LEFT JOIN ratings r ON u.id = r.lawyer_id
     WHERE u.id = ? AND u.role = 'lawyer'
     GROUP BY u.id`,
    [id]
  );
  return rows;
}

async function createLawyer({ name, email, password, specialization, location, experience, cases }) {
  const db = getDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, specialization, location, experience, cases, status, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, specialization, location, experience, cases, 1, 'lawyer']
  );
  return result;
}

async function updateLawyer({ name, email, password, specialization, location, experience, cases }, id) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE users 
     SET name=?, email=?, password=?, specialization=?, location=?, experience=?, cases=?, status=?, role=?
     WHERE id=? `,
    [name, email, password, specialization, location, experience, cases, 1, 'lawyer', id]
  );
  return result;
}

async function deleteLawyer(id) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM users WHERE id=? AND role='lawyer'",
    [id]
  );
  return result;
}

async function setLawyerStatus(id, status) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET status = ? WHERE id = ? AND role = 'lawyer'",
    [status, id]
  );
  return result;
}

async function getApprovedLawyers() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT 
      u.id, u.name, u.email, u.phone, u.specialization, u.category, u.location, 
      u.experience, u.cases, u.license, u.status, u.role, u.subscription_expiry,
      COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS rating,
      COUNT(r.id) AS total_reviews
     FROM users u
     LEFT JOIN ratings r ON u.id = r.lawyer_id
     WHERE u.status = 1 
       AND u.role = 'lawyer'
       AND (u.subscription_expiry IS NOT NULL AND u.subscription_expiry > NOW())
     GROUP BY u.id`
  );
  return rows;
}

// Renew lwyer sbscrption by 30 days nd recrd in subscription_records
async function renewLawyerSubscription(id) {
  const db = getDB();

  // 1. Fetch crunt sbscrption fee frm setngs
  let fee = 2000;
  try {
    const [settings] = await db.execute(
      "SELECT setting_value FROM settings WHERE setting_key = 'subscription_fee'"
    );
    if (settings.length > 0) {
      fee = parseFloat(settings[0].setting_value) || 2000;
    }
  } catch (e) {
    // fallback if settings table not queried
  }

  // 2. Extnd sbscrption expiry by 30 days
  const [result] = await db.execute(
    `UPDATE users 
     SET subscription_expiry = DATE_ADD(IFNULL(subscription_expiry, NOW()), INTERVAL 30 DAY)
     WHERE id = ? AND role = 'lawyer'`,
    [id]
  );

  if (result.affectedRows > 0) {
    // Fetch updtd expiry date
    const [userRows] = await db.execute(
      "SELECT subscription_expiry FROM users WHERE id = ?",
      [id]
    );
    const newExpiry = userRows[0]?.subscription_expiry || null;

    // 4. Updte pnding recrd or insrt active record in subscription_records
    try {
      const [pendingRows] = await db.execute(
        "SELECT id FROM subscription_records WHERE lawyer_id = ? AND status = 'pending' ORDER BY paid_date DESC LIMIT 1",
        [id]
      );
      if (pendingRows.length > 0) {
        await db.execute(
          "UPDATE subscription_records SET status = 'active', expiry_date = ? WHERE id = ?",
          [newExpiry, pendingRows[0].id]
        );
      } else {
        await db.execute(
          `INSERT INTO subscription_records 
           (lawyer_id, amount, paid_date, expiry_date, payment_method, status)
           VALUES (?, ?, NOW(), ?, 'JazzCash/Cash', 'active')`,
          [id, fee, newExpiry]
        );
      }
    } catch (err) {
      console.warn("Could not record in subscription_records:", err.message);
    }
  }

  return result;
}

// Lawyer submits JazzCash payment proof for subscription renewal
async function submitSubscriptionPayment(lawyerId, { amount, payment_method, transaction_id, payment_receipt }) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO subscription_records 
     (lawyer_id, amount, paid_date, expiry_date, payment_method, transaction_id, payment_receipt, status)
     VALUES (?, ?, NOW(), NULL, ?, ?, ?, 'pending')`,
    [
      lawyerId,
      amount || 2000,
      payment_method || 'JazzCash',
      transaction_id || null,
      payment_receipt || null,
    ]
  );
  return result;
}

// Revoke lawyer subscription
async function revokeLawyerSubscription(id) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET subscription_expiry = NOW() WHERE id = ? AND role = 'lawyer'",
    [id]
  );
  return result;
}

// Get subscription stats for admin
async function getSubscriptionStats() {
  const db = getDB();

  const [lawyers] = await db.execute(
    "SELECT id, name, email, subscription_expiry FROM users WHERE role = 'lawyer'"
  );

  let subscriptionFee = 2000;
  try {
    const [settings] = await db.execute(
      "SELECT setting_value FROM settings WHERE setting_key = 'subscription_fee'"
    );
    if (settings.length > 0) subscriptionFee = settings[0].setting_value;
  } catch (e) {}

  const now = new Date();
  const activeCount = lawyers.filter(l => l.subscription_expiry && new Date(l.subscription_expiry) > now).length;
  const expiredCount = lawyers.length - activeCount;

  return { 
    activeCount,
    expiredCount,
    subscriptionFee,
    lawyers 
  };
}

// Get all subscription records for admin
async function getSubscriptionRecords() {
  const db = getDB();
  try {
    const [rows] = await db.execute(
      `SELECT 
        sr.id,
        sr.lawyer_id,
        sr.amount,
        sr.paid_date,
        sr.expiry_date,
        sr.payment_method,
        sr.transaction_id,
        sr.payment_receipt,
        sr.status,
        u.name AS lawyer_name,
        u.email AS lawyer_email,
        u.phone AS lawyer_phone
       FROM subscription_records sr
       JOIN users u ON sr.lawyer_id = u.id
       ORDER BY sr.paid_date DESC`
    );
    return rows;
  } catch (err) {
    console.warn("Error fetching subscription_records:", err.message);
    return [];
  }
}

module.exports = {
  getAllLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  setLawyerStatus,
  getApprovedLawyers,
  renewLawyerSubscription,
  submitSubscriptionPayment,
  revokeLawyerSubscription,
  getSubscriptionStats,
  getSubscriptionRecords
};