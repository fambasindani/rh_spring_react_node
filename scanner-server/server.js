const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ À ADAPTER : chemin vers NAPS2.Console.exe sur la machine du scanner.
const NAPS2_PATH = process.env.NAPS2_PATH || 'C:\\Program Files\\NAPS2\\NAPS2.Console.exe';
// Pilote : wia (Windows, recommandé) ou twain.
const NAPS2_DRIVER = (process.env.NAPS2_DRIVER || 'wia').toLowerCase();
// Nom exact du scanner. Si vide, le premier scanner détecté est utilisé automatiquement.
const NAPS2_DEVICE = process.env.NAPS2_DEVICE || '';

// ⚠️ À ADAPTER : dossier où NAPS2 dépose les fichiers scannés.
const SCAN_OUTPUT_DIR = process.env.SCAN_OUTPUT_DIR || path.join(__dirname, 'scans');

if (!fs.existsSync(SCAN_OUTPUT_DIR)) {
  fs.mkdirSync(SCAN_OUTPUT_DIR, { recursive: true });
}

// Sert les fichiers scannés pour que le backend puisse les récupérer.
app.use('/files', express.static(SCAN_OUTPUT_DIR));

const exePath = () => NAPS2_PATH.replace(/^"|"$/g, '');

function otherDriver(driver) {
  return driver === 'wia' ? 'twain' : 'wia';
}

// Liste les scanners pour un pilote donné.
function listDevices(driver) {
  return new Promise((resolve) => {
    exec(
      `"${exePath()}" --driver ${driver} --listdevices`,
      { windowsHide: true, timeout: 30000 },
      (error, stdout, stderr) => {
        if (error) return resolve({ devices: [], error: (stderr || error.message || '').trim() });
        const devices = (stdout || '')
          .split(/\r?\n/)
          .map((ligne) => ligne.trim())
          .filter(Boolean);
        resolve({ devices, error: null });
      },
    );
  });
}

// Détecte le premier scanner disponible (ou utilise NAPS2_DEVICE).
async function detectDevice(driver = NAPS2_DRIVER) {
  if (NAPS2_DEVICE && NAPS2_DEVICE.trim()) return NAPS2_DEVICE.trim();
  const { devices } = await listDevices(driver);
  return devices[0] || '';
}

// Exécute NAPS2 en capturant stdout/stderr et le code de sortie.
function runNaps2(args, { timeout = 120000 } = {}) {
  const command = `"${exePath()}" ${args}`;
  console.log('Exécution de :', command);
  return new Promise((resolve) => {
    exec(
      command,
      { windowsHide: true, timeout, maxBuffer: 20 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          command,
          error,
          code: error && typeof error.code === 'number' ? error.code : error ? 1 : 0,
          timedOut: Boolean(error && error.killed),
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim(),
        });
      },
    );
  });
}

// Endpoint de santé — le frontend/backend vérifie que le pont est lancé.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Liste les scanners disponibles (debug). ?driver=wia|twain
app.get('/devices', async (req, res) => {
  const driver = (req.query.driver || NAPS2_DRIVER).toString().toLowerCase();
  const { devices, error } = await listDevices(driver);
  if (error) return res.status(500).json({ success: false, driver, error });
  res.json({ success: true, driver, devices });
});

// Lance un scan via NAPS2 et renvoie le PDF généré.
app.post('/scan', async (req, res) => {
  const scanId = Date.now();
  const outputFile = path.join(SCAN_OUTPUT_DIR, `scan_${scanId}.pdf`);
  const filename = path.basename(outputFile);
  const body = req.body || {};
  const driver = (body.driver || NAPS2_DRIVER).toString().toLowerCase();
  const requestedDevice = (body.device || '').toString().trim();

  try {
    // Construit la liste des stratégies à essayer (n'échoue que si TOUTES échouent).
    // IMPORTANT : NAPS2.Console exige un appareil (--device) ou un --profile.
    const attempts = [];
    let primaryDevice = '';

    if (requestedDevice) {
      primaryDevice = requestedDevice;
    } else if (NAPS2_DEVICE && NAPS2_DEVICE.trim()) {
      primaryDevice = NAPS2_DEVICE.trim();
    } else {
      primaryDevice = await detectDevice(driver);
    }

    if (!primaryDevice) {
      return res.status(500).json({
        success: false,
        error: `Aucun scanner détecté (pilote ${driver}). Vérifiez que le scanner est allumé et connecté.`,
        hint: 'Consultez GET /devices?driver=wia et GET /devices?driver=twain.',
      });
    }

    attempts.push({ driver, device: primaryDevice, label: `${driver} + ${primaryDevice}` });

    // Repli sur l'autre pilote (avec son propre premier appareil détecté).
    const fallbackDriver = otherDriver(driver);
    const fallbackDevice = await detectDevice(fallbackDriver);
    if (fallbackDevice) {
      attempts.push({
        driver: fallbackDriver,
        device: fallbackDevice,
        label: `${fallbackDriver} + ${fallbackDevice}`,
      });
    }

    const diagnostics = [];
    let last = null;

    for (const attempt of attempts) {
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

      let args = `--output "${outputFile}" --driver ${attempt.driver}`;
      if (attempt.device) args += ` --device "${attempt.device}"`;
      args += ' --noprofile --verbose';

      const result = await runNaps2(args);
      last = result;

      const ok = !result.error && fs.existsSync(outputFile);
      diagnostics.push({
        label: attempt.label,
        command: result.command,
        code: result.code,
        timedOut: result.timedOut,
        ok,
        stdout: result.stdout ? result.stdout.slice(0, 2000) : '',
        stderr: result.stderr ? result.stderr.slice(0, 2000) : '',
      });

      if (ok) {
        console.log(`Scan réussi (${attempt.label}) -> ${outputFile}`);
        return res.json({
          success: true,
          file: outputFile,
          filename,
          url: `/files/${encodeURIComponent(filename)}`,
          strategy: attempt.label,
        });
      }

      console.warn(`Échec (${attempt.label}):`, result.stderr || result.stdout || result.error?.message);
    }

    // Toutes les stratégies ont échoué.
    const informative = [...diagnostics].reverse().find((d) => d.stderr || d.stdout);
    const rawDetail =
      (informative && (informative.stderr || informative.stdout)) ||
      (last && last.error && last.error.message) ||
      'Échec du scan (NAPS2).';

    const hardwareIssue = /teint|occup|offline|off\b|busy|not available|indisponible/i.test(rawDetail);
    const friendly = hardwareIssue
      ? 'Le scanner semble éteint ou occupé. Allumez-le, vérifiez sa connexion (réseau/USB) puis réessayez.'
      : rawDetail;

    return res.status(500).json({
      success: false,
      error: friendly || 'Échec du scan (NAPS2).',
      details: rawDetail,
      hint: hardwareIssue
        ? 'Testez l\'imprimante/scanner directement (impression ou scan Windows), puis relancez. ' +
          'Vous pouvez aussi forcer le pilote/appareil via le corps de la requête : { "driver": "twain", "device": "..." }.'
        : 'Vérifiez NAPS2_PATH, que NAPS2.Console.exe est bien celui du dossier NAPS2, ' +
          'que le scanner est allumé et que le pilote (WIA/TWAIN) est installé. ' +
          'Consultez GET /devices?driver=wia et ?driver=twain.',
      diagnostics,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Pont NAPS2 en écoute sur http://127.0.0.1:${PORT}`);
});
