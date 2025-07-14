const fs = require('fs');
const path = require('path');

function loadCommands(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      require(path.join(process.cwd(), dir, file));
      console.log(`✅ Loaded command: ${file}`);
    } catch (err) {
      console.error(`❌ Error in ${file}: ${err.message}`);
    }
  }
}

module.exports = { loadCommands };
