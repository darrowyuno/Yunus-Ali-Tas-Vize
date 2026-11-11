require('dotenv').config();
const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'fikir_bahcesi';
const MAX_WATER = 6;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let ideas; // MongoDB koleksiyonu

// Sulama sayısına göre büyüme aşaması
const stageOf = (water) => (water >= MAX_WATER ? 'cicek' : water >= 3 ? 'filiz' : 'tohum');
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Geçersiz id'leri en baştan ele
app.param('id', (req, res, next, id) =>
  ObjectId.isValid(id) ? next() : res.status(400).json({ error: 'Geçersiz id' })
);

// READ: tüm fikirler
app.get('/api/ideas', wrap(async (req, res) => {
  res.json(await ideas.find().sort({ createdAt: -1 }).toArray());
}));

// CREATE: yeni tohum ek
app.post('/api/ideas', wrap(async (req, res) => {
  const { title, note = '' } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Başlık gerekli' });
  const doc = {
    title: title.trim(),
    note: String(note).trim(),
    waterCount: 0,
    stage: 'tohum',
    createdAt: new Date(),
  };
  const { insertedId } = await ideas.insertOne(doc);
  res.status(201).json({ ...doc, _id: insertedId });
}));

// UPDATE: başlık / not düzenle
app.put('/api/ideas/:id', wrap(async (req, res) => {
  const { title, note = '' } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Başlık boş olamaz' });
  const _id = new ObjectId(req.params.id);
  const result = await ideas.updateOne(
    { _id },
    { $set: { title: title.trim(), note: String(note).trim(), updatedAt: new Date() } }
  );
  if (!result.matchedCount) return res.status(404).json({ error: 'Fikir bulunamadı' });
  res.json(await ideas.findOne({ _id }));
}));

// UPDATE: fikri sula (büyüt)
app.patch('/api/ideas/:id/water', wrap(async (req, res) => {
  const _id = new ObjectId(req.params.id);
  const idea = await ideas.findOne({ _id });
  if (!idea) return res.status(404).json({ error: 'Fikir bulunamadı' });
  const waterCount = Math.min(idea.waterCount + 1, MAX_WATER);
  await ideas.updateOne({ _id }, { $set: { waterCount, stage: stageOf(waterCount) } });
  res.json(await ideas.findOne({ _id }));
}));

// DELETE: fikri sök
app.delete('/api/ideas/:id', wrap(async (req, res) => {
  const result = await ideas.deleteOne({ _id: new ObjectId(req.params.id) });
  if (!result.deletedCount) return res.status(404).json({ error: 'Fikir bulunamadı' });
  res.sendStatus(204);
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

MongoClient.connect(MONGO_URL)
  .then((client) => {
    ideas = client.db(DB_NAME).collection('ideas');
    app.listen(PORT, () => console.log(`🌱 Fikir Bahçesi çalışıyor: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
