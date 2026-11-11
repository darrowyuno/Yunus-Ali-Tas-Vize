# 🌱 Fikir Bahçesi

Node.js + Express + MongoDB ile yazılmış Ekle / Sil / Güncelle (CRUD) uygulaması.
Fikirler **tohum** olarak eklenir, **sulandıkça** büyür (🌰 → 🌱 → 🌸), düzenlenebilir ve silinebilir.

## Kurulum

```bash
npm install
cp .env.example .env     # gerekirse MONGO_URL'i değiştir (Atlas de olur)
npm start                # http://localhost:3000
```

Gereksinimler: Node.js 18+ ve çalışan bir MongoDB (yerel veya MongoDB Atlas).

## API

| Metot  | Adres                    | İşlem                          |
|--------|--------------------------|--------------------------------|
| GET    | /api/ideas               | Tüm fikirleri listele          |
| POST   | /api/ideas               | Yeni fikir ekle (title, note)  |
| PUT    | /api/ideas/:id           | Başlık / notu güncelle         |
| PATCH  | /api/ideas/:id/water     | Fikri sula (aşama büyür)       |
| DELETE | /api/ideas/:id           | Fikri sil                      |

Büyüme: 0-2 sulama = tohum, 3-5 = filiz, 6 = çiçek.

## GitHub'a yükleme

1. github.com'da boş bir repo oluştur (ör. `fikir-bahcesi`).
2. Proje klasöründe:

```bash
git init
git add .
git commit -m "İlk commit: Fikir Bahçesi (Express + MongoDB CRUD)"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/fikir-bahcesi.git
git push -u origin main
```
