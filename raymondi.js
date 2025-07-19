import chalk from 'chalk'
import { spawn } from 'child_process'
import express from 'express'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { EventEmitter } from 'events'

// 🔧 Ondoa onyo la MaxListenersExceededWarning
EventEmitter.defaultMaxListeners = Infinity

// 📍 Tambua directory na file path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🎨 Figlet Banner
figlet('RAY-MD', { font: 'Ghost' }, (err, data) => {
  if (err) return console.error(chalk.red('Figlet error:'), err)
  console.log(chalk.yellow(data))
})

figlet('Ray Bot', (err, data) => {
  if (err) return console.error(chalk.red('Figlet error:'), err)
  console.log(chalk.magenta(data))
})

// 🌐 Start Express server
const app = express()
const port = process.env.PORT || 5000

// Serve static files from jusorts/
app.use(express.static(path.join(__dirname, 'jusorts')))

// Redirect homepage to ray.html
app.get('/', (req, res) => res.redirect('/ray.html'))

// Start the server
app.listen(port, () => {
  console.log(chalk.green(`✅ Port ${port} is open: http://localhost:${port}`))
})

// 🚀 Bot launcher
let isRunning = false
async function start(file) {
  if (isRunning) return
  isRunning = true

  const args = [path.join(__dirname, file), ...process.argv.slice(2)]
  const child = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })

  child.on('message', data => {
    console.log(chalk.cyan(`📩 RECEIVED: ${data}`))
    if (data === 'reset') {
      child.kill()
      isRunning = false
      start(file)
    } else if (data === 'uptime') {
      child.send(process.uptime())
    }
  })

  child.on('exit', code => {
    isRunning = false
    console.error(chalk.red(`❌ Bot exited with code: ${code}`))
    if (code !== 0) {
      fs.watchFile(args[0], () => {
        fs.unwatchFile(args[0])
        start(file)
      })
    }
  })

  child.on('error', err => {
    console.error(chalk.red(`❌ Bot process error: ${err}`))
    child.kill()
    isRunning = false
    start(file)
  })

  // 🔌 Load plugins (optional folder)
  const pluginsFolder = path.join(__dirname, 'plugins')
  fs.readdir(pluginsFolder, async (err, files) => {
    if (err) {
      console.error(chalk.red(`Error loading plugins: ${err.message}`))
      return
    }
    console.log(chalk.yellow(`🔌 Installed ${files.length} plugins`))

    // Baileys version info
    try {
      const { fetchLatestBaileysVersion } = await import('@whiskeysockets/baileys')
      const { version } = await fetchLatestBaileysVersion()
      console.log(chalk.blue(`💬 Using Baileys version ${version}`))
    } catch {
      console.error(chalk.red('Baileys library not found or failed to load'))
    }
  })
}

// ⚙️ Start main bot file (default: sylivanus.js)
start('sylivanus.js')

// 📛 Catch unhandled errors
process.on('unhandledRejection', err => {
  console.error(chalk.red('Unhandled rejection:'), err)
  start('sylivanus.js')
})

process.on('exit', code => {
  console.error(chalk.red(`Exited with code ${code}`))
  start('sylivanus.js')
})
