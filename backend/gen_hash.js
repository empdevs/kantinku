const bcrypt = require('bcryptjs');
const fs = require('fs');

async function genHash() {
  const defaultPassword = 'PASSWORD';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  fs.writeFileSync('new_hash.txt', hashedPassword);
}

genHash();
