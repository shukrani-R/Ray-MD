// server.js
import express from 'express'
import { createServer } from 'http'
import { toBuffer } from 'qrcode'
import fetch from 'node-fetch'

let _qr = null
let _pairCode = null

function connect(conn, PORT = 3000) {
  const app = express()
  const server = createServer(app)

  // Baileys: sikiliza QR na Pairing Code
  conn.ev.on('connection.update', ({ qr, pairingCode }) => {
    if (qr) _qr = qr
    if (pairingCode) _pairCode = pairingCode
  })

  // Serve static HTML (index.html)
  app.use(express.static('views'))

  // QR code as PNG
  app.get('/qr', async (req, res) => {
    if (!_qr) return res.status(503).send('QR not available yet')
    res.setHeader('Content-Type', 'image/png')
    res.end(await toBuffer(_qr))
  })

  // Pairing code as JSON
  app.get('/paircode', (req, res) => {
    if (!_pairCode) return res.status(503).json({ pairCode: null })
    res.json({ pairCode: _pairCode })
  })

  // KeepAlive (optional for Render/Repl)
  setInterval(() => {
    fetch(`https://yourdomain.com/`).catch(() => {})
  }, 1000 * 60 * 5)

  server.listen(PORT, () => console.log('Server running on port', PORT))
}

export default connect
