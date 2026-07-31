const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'db.json');

const DEFAULT_DATA = {
  quotations: { currentQuotation: null, history: [] },
  config: null,
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function readDb() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
      fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
      return { ...DEFAULT_DATA };
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
}

// 初始化資料檔
readDb();

// GET /api/data - 讀取所有資料
app.get('/api/data', (req, res) => {
  const data = readDb();
  res.json(data);
});

// PUT /api/data/quotations - 儲存報價單資料
app.put('/api/data/quotations', (req, res) => {
  const { currentQuotation, history } = req.body;
  if (currentQuotation === undefined || history === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const data = readDb();
  data.quotations = { currentQuotation, history };
  const ok = writeDb(data);
  res.json({ success: ok });
});

// PUT /api/data/config - 儲存設定檔
app.put('/api/data/config', (req, res) => {
  const config = req.body;
  const data = readDb();
  data.config = config;
  const ok = writeDb(data);
  res.json({ success: ok });
});

app.listen(PORT, () => {
  console.log(`Quote Generator API running on port ${PORT}`);
  console.log(`Data stored at: ${DATA_PATH}`);
});
