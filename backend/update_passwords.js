const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kantinku.sqlite');
const db = new sqlite3.Database(dbPath);

async function updatePasswords() {
  try {
    const defaultPassword = 'PASSWORD';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    db.run('UPDATE users SET password = ?', [hashedPassword], function(err) {
      if (err) {
        console.error('Error updating passwords:', err);
      } else {
        console.log(`Updated ${this.changes} users with the new password hash.`);
        console.log(`New hash value: ${hashedPassword}`);
      }
    });

  } catch (err) {
    console.error('Error hashing password:', err);
  }
}

updatePasswords();
