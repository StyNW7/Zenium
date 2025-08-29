# Zenium - Agentic AI Workflow System

Sistem journaling cerdas dengan AI yang mengotomatisasi analisis, generasi quote, dan rekomendasi personal.

## 🚀 Fitur Utama

### Core Functionality
- **Journal Creation**: Pengguna dapat membuat dan menulis entri journal personal
- **AI Quote Generation**: AI secara otomatis menghasilkan quote motivasi berdasarkan konten journal
- **Quote Display**: Quote yang dihasilkan ditampilkan di halaman "zenium-quote"
- **Smart Recommendations**: AI memberikan rekomendasi personal berdasarkan analisis journal

### Journal Page Features (3 Tombol Spesifik)
1. **Analyze Button**: Memicu analisis AI terhadap konten journal
2. **Export to PDF Button**: Mengkonversi entri journal ke format PDF yang dapat diunduh
3. **Save to Database Button**: Menyimpan entri journal ke database

## 🏗️ Arsitektur Sistem

### Backend (Node.js + Express + MongoDB)
- **AI Workflow Service**: Mengelola workflow otomatis AI
- **Journal Controller**: Mengelola operasi CRUD journal
- **Recommendation Controller**: Mengelola rekomendasi AI
- **Qwen AI Integration**: Menggunakan OpenRouter API untuk analisis AI
- **Database Models**: Journal, DailyQuote, Recommendation, User

### Frontend (React + TypeScript + Tailwind CSS)
- **Journaling Page**: Interface untuk menulis dan mengelola journal
- **Quote Page**: Menampilkan quote motivasi yang dihasilkan AI
- **Recommendation Page**: Menampilkan rekomendasi personal AI
- **Responsive Design**: UI yang responsif dan modern

## 🔄 AI Workflow Otomatis

### Expected AI Workflow:
1. **User writes journal** → Pengguna menulis entri journal
2. **AI analyzes content** → AI menganalisis konten journal
3. **AI generates motivational quote** → AI menghasilkan quote motivasi
4. **Quote appears on zenium-quote page** → Quote muncul di halaman quote
5. **AI creates personalized recommendations** → AI membuat rekomendasi personal
6. **All data saved to database** → Semua data disimpan ke database

### Technical Implementation:
- **Automatic Trigger**: Workflow AI otomatis berjalan setelah journal disimpan
- **Real-time Processing**: Analisis AI real-time menggunakan Qwen model
- **Contextual Analysis**: Analisis berdasarkan mood, sentiment, dan konten
- **Personalized Output**: Quote dan rekomendasi disesuaikan dengan konteks pengguna

## 📊 Fitur AI

### Journal Analysis
- **Sentiment Analysis**: Analisis sentiment positif/negatif/neutral
- **Keyword Extraction**: Ekstraksi kata kunci emosional
- **Risk Assessment**: Penilaian risiko kesehatan mental
- **Mood Context**: Analisis berdasarkan mood pengguna

### Quote Generation
- **Personalized Quotes**: Quote yang disesuaikan dengan konten journal
- **Mood-Aware**: Quote yang sesuai dengan mood saat ini
- **Contextual**: Quote yang relevan dengan situasi pengguna
- **Fallback System**: Sistem cadangan jika AI gagal

### Smart Recommendations
- **Actionable**: Rekomendasi yang dapat diimplementasikan
- **Categorized**: Dikelompokkan berdasarkan tipe (activity, mindfulness, social, dll)
- **Prioritized**: Prioritas tinggi/medium/rendah
- **Time-Estimated**: Estimasi waktu untuk implementasi

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB
- OpenRouter API Key

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database dan API key
npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env dengan URL backend
npm run dev
```

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/zenium
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=your_jwt_secret

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🔌 API Endpoints

### Journal Routes
- `POST /api/journals` - Create journal
- `GET /api/journals` - Get user journals
- `PUT /api/journals/:id` - Update journal
- `DELETE /api/journals/:id` - Delete journal
- `POST /api/journals/:id/analyze-attach` - Analyze journal with AI

### AI Workflow Routes
- `POST /api/journals/:id/trigger-workflow` - Manual trigger AI workflow

### Recommendation Routes
- `GET /api/recommendations` - Get user recommendations
- `GET /api/recommendations/stats` - Get recommendation statistics
- `PUT /api/recommendations/:id/complete` - Mark recommendation completed

### Quote Routes
- `GET /api/daily-quote` - Get daily quote
- `GET /api/quotes` - Get user quotes

## 🎯 Use Cases

### 1. Daily Journaling
- Pengguna menulis journal harian
- AI otomatis menganalisis konten
- Quote motivasi personal dihasilkan
- Rekomendasi aktivitas diberikan

### 2. Mood Tracking
- Pengguna mencatat mood dan rating
- AI menganalisis pola mood
- Rekomendasi disesuaikan dengan mood
- Quote motivasi yang relevan

### 3. Mental Health Monitoring
- AI mendeteksi tanda-tanda risiko
- Klasifikasi kesehatan mental otomatis
- Rekomendasi intervensi dini
- Tracking progress kesehatan mental

## 🔒 Security Features

- **JWT Authentication**: Sistem autentikasi yang aman
- **User Isolation**: Data pengguna terisolasi
- **Input Validation**: Validasi input yang ketat
- **Rate Limiting**: Pembatasan rate API
- **CORS Protection**: Proteksi cross-origin

## 📱 User Experience

### Responsive Design
- **Mobile-First**: Design yang optimal untuk mobile
- **Dark Theme**: Tema gelap yang nyaman di mata
- **Smooth Animations**: Animasi yang halus dan responsif
- **Intuitive Navigation**: Navigasi yang intuitif

### Accessibility
- **Screen Reader Support**: Dukungan untuk screen reader
- **Keyboard Navigation**: Navigasi menggunakan keyboard
- **High Contrast**: Kontras tinggi untuk keterbacaan
- **Voice Input**: Input suara untuk journaling

## 🚀 Performance Features

- **Lazy Loading**: Loading komponen secara lazy
- **Caching**: Cache data untuk performa optimal
- **Optimized Queries**: Query database yang dioptimasi
- **Background Processing**: Proses AI di background

## 🔮 Future Enhancements

### Planned Features
- **Voice Journaling**: Journaling menggunakan suara
- **Image Analysis**: Analisis gambar untuk mood
- **Social Features**: Berbagi journal dengan teman
- **Progress Tracking**: Tracking progress kesehatan mental
- **Integration**: Integrasi dengan aplikasi kesehatan mental

### AI Improvements
- **Multi-language Support**: Dukungan multi bahasa
- **Advanced Sentiment Analysis**: Analisis sentiment yang lebih canggih
- **Predictive Analytics**: Analisis prediktif untuk kesehatan mental
- **Personalized Learning**: AI yang belajar dari preferensi pengguna

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter**: Untuk API AI yang powerful
- **Qwen Model**: Untuk kemampuan analisis AI yang canggih
- **MongoDB**: Untuk database yang scalable
- **React Community**: Untuk framework frontend yang excellent

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini atau hubungi tim development.

---

**Zenium** - Empowering mental wellness through intelligent AI journaling 🧠✨

