module.exports = {
  apps: [
    {
      name: "shukrani-bot",
      script: "./Ray-MD/control.js",
      cwd: "./Ray-MD",
      watch: false,
      max_memory_restart: "500M",
    },
    {
      name: "shukrani-pairing",
      script: "./pairing-site/server.js",
      cwd: "./pairing-site",
      watch: false,
      env: {
        PORT: 10000
      }
    }
  ]
};
