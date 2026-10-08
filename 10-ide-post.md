# 10 Ide Post — Computree

Bank ide konten berbahasa Indonesia. Setiap ide berisi hook, angle, format, dan CTA. Ini masih ide/draft, bukan klaim produk yang siap dipublikasikan.

## Catatan status produk

Landing page Computree sudah ada, tetapi API compute, worker GPU, integrasi provider, dan alokasi produksi belum dibuktikan berjalan. Gunakan kata seperti **rancangan**, **target MVP**, atau **sedang diuji** sampai ada bukti operasional. Jangan mengarang angka alokasi, harga, jumlah GPU, transaksi, SLA, atau ketersediaan provider.

---

## 01 — GPU compute tanpa harus membeli hardware

- **Audiens:** developer, startup, dan tim produk.
- **Hook:** “Akses GPU seharusnya tidak dimulai dengan membeli GPU.”
- **Angle:** Bahas hambatan umum—biaya awal perangkat, kapasitas yang sulit diperkirakan, dan pengalaman berpindah antarprovider. Perkenalkan ide compute sebagai resource yang bisa diakses lewat infrastruktur, bukan janji penghematan.
- **Format:** Carousel LinkedIn 4 slide: hambatan → dampak → pendekatan access layer → pertanyaan.
- **CTA:** “Apa hambatan terbesar tim Anda saat membutuhkan GPU?”
- **Batas klaim:** Jangan menyatakan Computree sudah menyediakan kapasitas atau lebih murah dari penyedia lain.

## 02 — Computree bukan chatbot

- **Audiens:** calon pengguna dan builder aplikasi AI.
- **Hook:** “Computree bukan chatbot lain—ini rancangan access layer untuk compute GPU.”
- **Angle:** Bedakan aplikasi yang dipakai pengguna dari infrastruktur yang menjalankan workload. Jelaskan peran API sebagai antarmuka, sementara aplikasi tetap menentukan pengalaman dan kegunaannya.
- **Format:** Diagram berlapis: aplikasi → API Computree → infrastruktur compute.
- **CTA:** “Aplikasi apa yang seharusnya bisa memakai compute lewat API?”
- **Batas klaim:** Gambarkan sebagai konsep produk sampai alur API nyata berhasil diuji.

## 03 — Perjalanan satu request sampai kembali ke aplikasi

- **Audiens:** engineer dan orang yang ingin memahami arsitektur.
- **Hook:** “Satu request bisa melewati lebih banyak daripada satu API call.”
- **Angle:** Visualisasikan target alur: aplikasi → API Computree → job dan alokasi → requestor Golem → worker Qwen/Ollama → hasil kembali ke aplikasi.
- **Format:** Diagram arsitektur atau thread singkat, satu langkah per panel.
- **CTA:** “Bagian mana dari alur ini yang ingin Anda lihat dijelaskan lebih detail?”
- **Batas klaim:** Labeli diagram sebagai alur yang direncanakan; jangan tampilkan seolah sudah berjalan di produksi.

## 04 — Saldo token, alokasi compute, dan biaya provider bukan hal yang sama

- **Audiens:** pemegang token dan pengguna produk compute.
- **Hook:** “Saldo token, alokasi compute, dan biaya provider bukan hal yang sama.”
- **Angle:** Jelaskan bahwa ketiganya punya satuan dan sumber data berbeda. Tunjukkan mengapa aturan eligibility, unit kredit, pemakaian, dan pembayaran perlu didefinisikan terpisah.
- **Format:** Carousel edukasi dengan tiga kolom: saldo, alokasi, pembayaran.
- **CTA:** “Data apa yang perlu terlihat agar penggunaan compute terasa transparan?”
- **Batas klaim:** Jangan memberi threshold eligibility, rumus alokasi, nilai konversi, atau harga sebelum aturan resminya ditetapkan.

## 05 — Satu API untuk menghubungkan aplikasi

- **Audiens:** developer aplikasi dan pengguna Open WebUI.
- **Hook:** “Bagaimana kalau aplikasi tidak harus memilih provider GPU satu per satu?”
- **Angle:** Perkenalkan tujuan API Computree dan gagasan memisahkan aplikasi dari adapter provider. Open WebUI direncanakan sebagai integrasi awal; aplikasi lain, termasuk LibreChat, perlu dites sebelum dukungannya diumumkan.
- **Format:** Diagram aplikasi → API Computree → provider; atau post tanya-jawab teknis.
- **CTA:** “Aplikasi mana yang paling berguna untuk diuji setelah Open WebUI?”
- **Batas klaim:** Jangan mengatakan aplikasi sudah terhubung atau semua endpoint kompatibel sebelum pengujian berhasil.

## 06 — Mengapa mulai dari satu adapter provider

- **Audiens:** engineer infrastruktur dan builder jaringan compute.
- **Hook:** “Kenapa mulai dengan satu provider sebelum membangun jaringan multi-provider?”
- **Angle:** Bahas manfaat membuktikan satu alur end-to-end terlebih dahulu: kontrak API, lifecycle job, pengukuran pemakaian, dan penanganan kegagalan. Golem adalah kandidat integrasi awal dalam rencana, bukan klaim provider aktif.
- **Format:** Carousel “satu jalur yang terbukti” dibanding diagram banyak integrasi yang belum diuji.
- **CTA:** “Kriteria apa yang paling penting saat memilih provider compute?”
- **Batas klaim:** Jangan menjanjikan jumlah provider, kapasitas, harga, atau ketersediaan GPU Golem.

## 07 — Qwen adalah model; Ollama adalah runtime

- **Audiens:** pengguna model open source dan engineer AI.
- **Hook:** “Qwen adalah model; Ollama adalah runtime—keduanya berbeda.”
- **Angle:** Terangkan perbedaan peran model dan runtime, lalu tunjukkan bagaimana keduanya dapat menjadi bagian dari worker pada rancangan sistem.
- **Format:** Kartu istilah atau carousel: model → runtime → worker → API.
- **CTA:** “Istilah infrastruktur AI apa lagi yang sering membingungkan?”
- **Batas klaim:** Jangan mengklaim model produksi, ukuran model, spesifikasi GPU, atau runtime worker sudah diputuskan.

## 08 — Testnet bukan bukti GPU produksi

- **Audiens:** developer Web3 dan pembaca yang mengevaluasi klaim teknis.
- **Hook:** “Lolos uji testnet bukan bukti GPU produksi sudah tersedia.”
- **Angle:** Jelaskan perbedaan antara membuktikan sebagian alur requestor dan membuktikan workload GPU pada jaringan produksi. Tekankan bahwa klaim perlu didukung tes dan status provider yang aktual.
- **Format:** Carousel “apa yang dibuktikan / apa yang belum dibuktikan”.
- **CTA:** “Bukti teknis apa yang Anda harapkan sebelum percaya klaim compute GPU?”
- **Batas klaim:** Rencana produk mencatat testnet Golem sebagai jalur CPU, bukan bukti GPU. Periksa dokumentasi Golem terkini sebelum menerbitkan detail teknis.

## 09 — Bedakan data demo dan data produksi

- **Audiens:** calon pengguna, komunitas, dan orang yang mengikuti proses pembangunan produk.
- **Hook:** “Angka demo tidak boleh disamarkan sebagai data produksi.”
- **Angle:** Ceritakan prinsip transparansi: label demo harus jelas, transaksi tidak boleh dibuat-buat, dan data live hanya ditampilkan jika ada sumber yang dapat diverifikasi.
- **Format:** Post build-in-public dengan perbandingan contoh label “Demo” dan “Live”.
- **CTA:** “Informasi apa yang harus bisa diverifikasi pada dashboard compute?”
- **Batas klaim:** Jangan menyebut metrik demo sebagai penggunaan, pembayaran, atau kapasitas nyata.

## 10 — Job dalam antrean belum tentu berjalan paralel

- **Audiens:** engineer, pengguna API, dan tim yang menjalankan workload.
- **Hook:** “Beberapa job di antrean belum berarti beberapa GPU bekerja bersamaan.”
- **Angle:** Bedakan penerimaan request paralel, antrean job, dan eksekusi GPU yang benar-benar simultan. Jelaskan mengapa status queued/running dan jumlah worker harus dilaporkan dengan jujur.
- **Format:** Diagram dua keadaan: beberapa job menunggu satu worker vs beberapa worker aktif.
- **CTA:** “Untuk workload Anda, mana yang lebih penting: waktu tunggu yang jelas atau eksekusi paralel?”
- **Batas klaim:** Jangan mengiklankan parallel compute sebelum jumlah worker dan eksekusi bersamaan dibuktikan.

## Referensi untuk pengecekan sebelum publikasi

- [Rencana produk Computree](.local/conversation-workspace/files/fullplan.md)
- [Golem: menjalankan model AI pada Golem Network](https://docs.golem.network/docs/creators/javascript/tutorials/AI-on-golem-network)
- [Golem: testnet, mainnet, alamat, dan wallet](https://docs.golem.network/docs/golem/overview/testnet-mainnet)
- [Open WebUI: koneksi OpenAI-compatible provider](https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible/)

