# Computree — Rencana Produk dan Implementasi

**Status:** Rencana implementasi, belum dieksekusi  
**Basis:** Brief Computree yang dilampirkan dan dokumentasi resmi Golem, Open WebUI, serta Replit  
**Batas rencana:** Dokumen ini tidak mengotorisasi transaksi blockchain, pendanaan wallet, deployment produksi, atau perubahan visual UI.

## 1. Ringkasan keputusan

Computree dibangun sebagai lapisan akses dan orkestrasi compute GPU. Pemegang token memverifikasi kepemilikan wallet dan kelayakannya, menerima alokasi compute serta credential sementara, lalu menggunakan layanan melalui API yang kompatibel dengan OpenAI dari aplikasi eksternal. Backend mengautentikasi request, mencatat job, mengelola alokasi, meneruskannya ke provider compute, dan mengembalikan hasil.

MVP dibuktikan dengan satu alur nyata:

> Open WebUI → API Computree → job dan alokasi → Golem requestor → worker GPU yang menjalankan Qwen/Ollama → API Computree → Open WebUI

Produk ini **bukan chatbot**. Landing page, dashboard, demo mode, dan admin UI harus menjelaskan serta mengoperasikan infrastruktur yang benar-benar berjalan; UI yang tampak selesai bukan definisi MVP selesai.

### Rekomendasi teknis utama

- Aplikasi utama TypeScript/Node.js sebagai modular monolith, PostgreSQL untuk data otoritatif, dan antrean durable untuk pekerjaan latar.
- Integrasi Golem dipisah di balik `ComputeProvider` adapter. Mulai dengan Golem JS karena dokumentasi resmi memiliki tutorial requestor JavaScript untuk Qwen/Ollama di GPU.
- Hanya API Computree yang publik. Yagna, credential Golem, layanan Ollama worker, dan detail jaringan provider tidak diekspos kepada pengguna.
- Buktikan integrasi kecil terlebih dahulu; setelah jalur nyata lolos, bangun dashboard dan perluas kapasitas.
- Pertahankan UI proyek yang sudah ada sebagai sumber kebenaran. Jangan mengubah layout, tema, warna, atau desain tanpa persetujuan eksplisit.

## 2. Hasil riset dan batas kepastian

### Golem, GPU, dan Qwen

Dokumentasi resmi Golem menyediakan contoh menjalankan Qwen/Ollama pada provider dengan runtime `vm-nvidia`, kapabilitas GPU/VPN, dan TCP proxy dari sisi requestor. Contoh tersebut memberi dasar yang terdokumentasi untuk menghubungkan Computree dengan worker tanpa membuat endpoint provider publik. Tutorialnya menggunakan model Qwen kecil sebagai contoh; model ini cocok untuk uji konektivitas awal, bukan keputusan final tentang model produksi.

Dokumentasi tutorial menyatakan bahwa testnet Golem menyediakan provider CPU, bukan provider GPU. Karena itu, testnet dapat dipakai untuk menguji sebagian alur atau adapter CPU, tetapi **tidak membuktikan** jalur GPU produksi. Uji GPU nyata memerlukan jaringan dan biaya mainnet. Dokumentasi membuktikan pola integrasi; dokumentasi saja tidak membuktikan bahwa provider GPU tersedia pada waktu tertentu, harga tertentu, atau dengan model GPU tertentu. Ketersediaan itu harus diperiksa ketika uji integrasi dijadwalkan.

### Pembayaran Golem

Golem menerima pembayaran resource dalam GLM. Dokumentasi menyebut Ethereum Mainnet dan Polygon; Polygon direkomendasikan dibanding Ethereum Mainnet karena biaya gas. Wallet requestor Polygon membutuhkan GLM untuk pembayaran dan POL untuk gas. Status “GPU selesai” tidak boleh otomatis dianggap sebagai bukti bahwa transaksi treasury sudah terkonfirmasi. Catat status pembayaran dari sumber Golem/blockchain yang benar-benar tersedia, dan bedakan nilai aktual dari perkiraan.

### Open WebUI

Untuk koneksi Open WebUI paling dasar, Computree perlu menyediakan `POST /v1/chat/completions`; `GET /v1/models` direkomendasikan agar model dapat ditemukan di UI. Open WebUI adalah bukti integrasi aplikasi eksternal, bukan antarmuka utama produk. Fitur seperti embeddings/RAG, audio, dan tool calling bukan bagian otomatis dari kompatibilitas dasar; implementasikan hanya setelah dukungan model dan protokolnya dibuktikan.

### Deployment Replit

Dokumentasi Replit menyebut Reserved VM Deployment sebagai pilihan bagi layanan jangka panjang/background worker. Ini kandidat penempatan API/worker requestor yang selalu aktif, tetapi kemampuan menjalankan Yagna, kebutuhan proses sistem, penyimpanan state, serta perilaku jaringan harus dibuktikan di proyek dan deployment aktual sebelum dipilih sebagai konfigurasi produksi.

## 3. Ruang lingkup produk

### Termasuk dalam sasaran MVP

1. Verifikasi kepemilikan wallet dan pembacaan saldo token di server.
2. Perhitungan kelayakan dan alokasi compute dengan aturan yang dapat dikonfigurasi.
3. Credential Computree sementara yang dapat dicabut dan tidak disimpan dalam bentuk plaintext.
4. API OpenAI-compatible dengan endpoint model dan chat completion; streaming SSE untuk jawaban.
5. Penciptaan job terisolasi, status dan event job, pengukuran pemakaian, serta penggunaan alokasi secara atomik.
6. Adapter Golem dan worker Qwen/Ollama, dengan akses worker melalui jalur jaringan/proxy Golem.
7. Petunjuk untuk menghubungkan Open WebUI dan bukti request nyata melalui API.
8. Tampilan pengguna dan admin secukupnya untuk memeriksa kelayakan, credential, job, status compute, dan kegagalan yang sebenarnya.
9. Demo mode yang terpisah dan diberi label jelas. Data demo tidak boleh tampak sebagai transaksi atau compute produksi.

### Tidak menjadi blocker MVP

- Otomatisasi swap ETH/WETH ke GLM, bridge, dan pengisian wallet Golem.
- Banyak model, ComfyUI, Blender, render, SDK, webhooks, atau provider compute tambahan.
- Pool worker hangat berskala besar.
- Klaim ketersediaan GPU atau SLA yang belum diukur dan didukung data operasional.
- Dukungan untuk semua aplikasi yang mengaku OpenAI-compatible atau untuk seluruh parameter API OpenAI.

## 4. Arsitektur yang diusulkan

```text
Wallet pengguna
    │ tanda tangan nonce / pembuktian kepemilikan
    ▼
Frontend Computree ── Computree API publik
                           │
                 Auth + kelayakan token
                           │
                 Allocation ledger / reserve
                           │
                      Job queue
                           │
                 Compute orchestrator
                           │
                   ComputeProvider
                           │
                    GolemAdapter
                           │
             Yagna + Golem requestor-side proxy
                           │
                 Worker Qwen/Ollama privat
                           │
             hasil, usage, dan status pembayaran
                           ▼
       API Computree → Open WebUI / aplikasi eksternal
```

Frontend tidak menentukan saldo, penggunaan, biaya, status job, atau bukti GPU. Backend membaca atau menghitung data otoritatif dan memvalidasi setiap transisi.

### Komponen

- **Web frontend:** mengikuti pola UI yang telah ada; menampilkan status yang bersumber dari API.
- **API dan gateway:** sesi wallet, eligibility, credential, dokumentasi, OpenAI-compatible routes, error mapping, validasi, dan rate limit.
- **Identity/credential service:** pembuktian kepemilikan wallet, pengelolaan akun, hash credential, expiry, revoke, dan audit.
- **Allocation service:** aturan kelayakan, unit kredit, reserve/commit/release, dan ledger perubahan saldo.
- **Job service/queue:** idempotency, status machine, retry yang aman, isolasi per job, dan event log.
- **Compute orchestrator:** memilih/menyiapkan worker, mengirim request, streaming, cleanup, dan recovery.
- **Golem adapter:** menerjemahkan interface internal Computree ke Golem JS/Yagna dan menyimpan data provider privat.
- **Worker image:** Ollama, model Qwen yang dipilih, pemeriksaan kesehatan, startup/shutdown, dan hanya jaringan internal yang diperlukan.
- **Usage meter dan treasury recorder:** mengumpulkan bukti dari backend/provider, membedakan nilai estimasi dan aktual.
- **Admin views:** hanya bagi admin, dilindungi autentikasi terpisah dan audit log.

### Strategi proses

Mulai dengan satu codebase utama yang modulnya terpisah dan satu proses worker latar yang dapat dijalankan secara terkontrol. Hindari overhead banyak microservice pada MVP. PostgreSQL menjadi sumber kebenaran untuk job dan ledger; gunakan Redis/BullMQ bila tersedia dan cocok untuk antrean, atau pilih antrean durable lain setelah memeriksa fasilitas proyek. Jangan mengandalkan memori proses sebagai satu-satunya penyimpanan job.

## 5. Alur request dan akuntansi

1. Pengguna menghubungkan wallet. Server mengeluarkan nonce sekali pakai; tanda tangan diverifikasi server untuk mengikat sesi pada alamat wallet dan mencegah replay.
2. Server membaca saldo token melalui RPC pada chain dan alamat kontrak yang dikonfigurasi. Nilai yang dikirim frontend tidak dipercaya.
3. Eligibility service menghitung kelayakan dan alokasi. Rumus dan threshold disimpan sebagai konfigurasi, bukan kode UI.
4. Credential acak dengan prefix `ct_live_` ditampilkan penuh hanya sekali. Database menyimpan hash, prefix, pemilik, expiry, status, batas alokasi, dan waktu pemakaian terakhir.
5. API memvalidasi credential, eligibility terkini sesuai kebijakan, rate limit, model yang diminta, request body, dan sisa alokasi.
6. Allocation service melakukan `reserveCompute` secara atomik sebelum job diterima agar dua request bersamaan tidak menghabiskan kredit yang sama.
7. Job baru mendapat ID unik, status awal, event audit, dan item antrean. Idempotency key mencegah retry klien membuat duplikasi yang tak disengaja.
8. Orchestrator memilih/menyiapkan worker, mengirim workload, lalu menerjemahkan respons Ollama menjadi skema OpenAI-compatible.
9. Saat streaming aktif, gateway mengirim SSE. Disconnect klien, timeout, pembatalan, atau proses restart harus punya perilaku eksplisit dan tercatat.
10. Setelah hasil atau kegagalan, backend menghitung pemakaian dari data eksekusi yang tersedia. `commitCompute` memotong alokasi sesuai pemakaian aktual; `releaseCompute` membebaskan reserve jika workload tidak menggunakan compute. Jika penggunaan pada kegagalan belum dapat diukur, tandai dan rekonsiliasi dengan aturan yang jelas, jangan mengarang nol atau angka.
11. Worker dipakai ulang bila kebijakan pool mengizinkan; jika tidak, worker dibersihkan. Job, worker, usage, dan pembayaran memiliki status serta timestamp yang terpisah.

Semua nilai ekonomi harus menggunakan satuan integer terkecil yang ditetapkan, bukan floating point tanpa batas presisi. Token balance, kredit internal, waktu GPU, dan GLM adalah satuan berbeda dan tidak boleh disajikan seolah bisa dikonversi tanpa aturan yang tervalidasi.

## 6. Kontrak API awal

### API platform

- `GET /api/eligibility?wallet=...` — saldo yang dibaca server, status eligibility, alokasi, satuan, dan waktu pemeriksaan.
- `POST /api/credentials` — menerbitkan credential bila pengguna eligible.
- `GET /api/credentials` — metadata credential milik pengguna; jangan mengembalikan secret plaintext.
- `POST /api/credentials/:id/revoke` — mencabut credential milik pengguna.
- Endpoint akun/sesi wallet — nonce dan verifikasi tanda tangan; detail rute final disesuaikan setelah audit codebase.

### OpenAI-compatible API

- `GET /v1/models` — model yang benar-benar tersedia.
- `POST /v1/chat/completions` — request/response chat, termasuk SSE ketika `stream=true`.

Awal implementasi mendukung subset yang diperlukan oleh model dan Open WebUI: `model`, `messages`, `temperature`, `top_p`, `max_tokens` atau `max_completion_tokens` sesuai kompatibilitas yang telah diuji, `stop`, dan streaming. `tools`/`tool_choice` hanya diaktifkan setelah round-trip format tool dibuktikan. Parameter tidak dikenal atau tidak didukung ditolak atau diabaikan dengan aturan konsisten dan pesan jelas; jangan mengiklankan dukungan palsu. Kesalahan memakai bentuk OpenAI-compatible dan kode stabil seperti `COMPUTE_ALLOCATION_EXHAUSTED`, `NO_GPU_AVAILABLE`, `WORKER_START_FAILED`, `MODEL_NOT_READY`, dan `WORKLOAD_TIMEOUT`.

## 7. Model data minimum

Skema final mengikuti repo yang ada, tetapi perlu menyimpan konsep berikut:

- `users` dan `wallets`: identitas internal, alamat, chain, dan hubungan akun.
- `wallet_challenges` atau sesi nonce: nonce, expiry, penggunaan, hasil verifikasi.
- `token_balance_snapshots`: saldo terverifikasi, blok/waktu pemeriksaan, chain, kontrak.
- `compute_allocations` dan `allocation_ledger`: allocated/used/reserved/remaining, perubahan, alasan, job terkait.
- `credentials`: user, hash, prefix, waktu terbit/expiry/revoke, limit dan status.
- `jobs` dan `job_events`: ID, user, credential, model, status, timestamps, idempotency key, error code.
- `workers` dan `worker_events`: provider privat, runtime, status, lifecycle, informasi GPU hanya bila tersedia.
- `usage_events`: request/job/user, token masuk/keluar jika bisa diukur, runtime, compute unit, biaya aktual atau estimasi dengan label sumber.
- `treasury_transactions` dan `compute_purchases`: chain, tx hash, asset, amount, direction, tujuan, status, referensi receipt/invoice bila nyata.
- `provider_records`, `system_settings`, dan `audit_logs`: konfigurasi dan perubahan terkontrol.

Tambahkan index yang relevan pada wallet, hash credential, job ID, user, worker, status, timestamp, serta tx hash. Semua query harus parameterized; akses user dibatasi ke baris miliknya.

## 8. Tahapan implementasi

### Tahap 0 — Audit proyek dan pembuktian risiko

1. Periksa struktur repo, framework, database, secrets, deployment config, autentikasi yang ada, test, dan UI saat ini.
2. Catat baseline UI dan perilaku existing sebelum mengubah apa pun. Perubahan visual di luar kebutuhan minimal tidak dilakukan tanpa persetujuan.
3. Konfirmasi detail yang belum ada: chain dan kontrak token, model Qwen sasaran, aturan alokasi, unit kredit, expiry credential, batas request, kebijakan privasi prompt, target domain, serta biaya/uji produksi.
4. Bangun/ujikan spike terisolasi untuk Golem JS → worker Qwen/Ollama → requestor proxy → balasan. Mulai dengan jalur development yang aman; jangan mengasumsikan testnet dapat membuktikan GPU.
5. Pastikan cara Yagna berjalan dan menyimpan state di lingkungan deployment yang dipilih. Catat blocker atau prasyarat sebelum mengunci desain produksi.

**Gerbang keluar:** integrasi minimum, kebutuhan jaringan, cara mendapatkan status job/pembayaran, dan risiko biaya dipahami. Setiap uji mainnet berbiaya menunggu persetujuan terpisah yang spesifik.

### Tahap 1 — MVP end-to-end

1. Bangun/rapikan skema Postgres dan migrasi.
2. Implementasikan sesi wallet yang memverifikasi tanda tangan, token eligibility server-side, dan konfigurasi alokasi.
3. Implementasikan ledger reserve/commit/release dan tes transaksi atomik.
4. Implementasikan lifecycle credential, hashing, expiry, revoke, dan rate limit.
5. Implementasikan model list, chat completion, SSE, error mapping, validasi parameter, dan idempotency.
6. Implementasikan antrean, job state machine, event log, timeout, cancellation, serta worker recovery dasar.
7. Implementasikan Golem adapter berbasis SDK resmi dan image worker awal. Mulai dengan model kecil terdokumentasi untuk membuktikan jaringan; uji model tujuan terpisah setelah kebutuhan resource diketahui.
8. Hubungkan Open WebUI ke base URL Computree dan credential uji.
9. Tambahkan layar status minimum tanpa merombak bahasa visual proyek.
10. Pisahkan demo provider dari produksi pada konfigurasi, tabel/data, dan UI. Produksi tidak pernah mengembalikan job mock.

**Gerbang keluar:** satu request nyata menempuh jalur GPU yang disetujui, jawabannya kembali lewat API, job dan penggunaan tercatat, worker dibersihkan/dipakai ulang, serta tidak ada secret terekspos.

### Tahap 2 — Keandalan dan penggunaan bersamaan

- Tambahkan worker pool dengan batas biaya, idle timeout, maksimal job/runtime, health checks, dan rekonsiliasi startup.
- Tingkatkan kebijakan provider selection, price limit, reputasi provider jika dukungan SDK/konfigurasi tersedia, dan error status yang jujur.
- Tambahkan tes dua user/job independen, recovery, worker gagal, antrean penuh, serta pencatatan usage yang konsisten.
- Tambahkan dashboard operasional treasury/pembayaran yang bersumber dari data aktual dan label nilai estimasi dengan benar.
- Perluas admin controls, audit log, metrik, dan notifikasi internal operasional sesuai kebutuhan.

### Tahap 3 — Treasury dan model tambahan

- Pertahankan funding manual/read-only terlebih dahulu.
- Rancang `TreasuryRebalancer` adapter untuk saldo, cadangan, quote, swap, bridge, funding Golem, dan verifikasi funding; jangan pilih DEX/bridge sebelum konfigurasi dan persetujuan.
- Aktifkan automasi hanya setelah rekonsiliasi transaksi, kebijakan batas, pengendalian akses, dan persetujuan pengguna/operator dirancang serta diuji.
- Tambahkan beberapa model setelah ketersediaan runtime, kebutuhan VRAM, biaya, dan kontrak API terukur.

### Tahap 4 — Workload dan ekosistem lebih luas

- Evaluasi ComfyUI, Blender/rendering, SDK, webhooks, dan provider lain sebagai adapter terpisah.
- Dokumentasikan kompatibilitas per aplikasi berdasarkan pengujian. Jangan menjanjikan bahwa satu credential/API cocok dengan seluruh aplikasi.

## 9. Isolasi job dan kebijakan concurrency

Setiap job, reserve alokasi, worker assignment, event, dan credential harus berhubungan dengan ID/user yang tepat. Tidak boleh ada global lock yang memblokir seluruh sistem, batas satu-job-per-user, atau batas satu-device-per-user. Error satu job tidak boleh menghalangi job lain.

Ada ketegangan eksplisit pada brief: `MAX_WORKERS=1` direkomendasikan untuk menekan biaya MVP, tetapi definisi selesai juga meminta beberapa job berjalan independen secara bersamaan. Dengan satu worker, server dapat menerima dan mencatat request secara paralel, tetapi workload GPU aktual kemungkinan mengantre. Rekomendasi rencana ini:

- MVP membuktikan penerimaan request paralel, reserve alokasi aman, isolasi job, dan status antrean tanpa saling merusak.
- Kapasitas satu worker berarti eksekusi GPU boleh serial pada tahap awal; UI harus menunjukkan queued/running dengan benar.
- Jika syarat produk adalah dua inferensi GPU nyata berlangsung pada waktu yang sama sejak MVP, perlu menetapkan `MAX_WORKERS >= 2`, anggaran yang sesuai, dan provider availability sebagai gerbang awal.

Jangan melaporkan “parallel compute” bila hanya beberapa job berada dalam antrean.

## 10. Keamanan, privasi, dan operasi

- Simpan semua API key, app key Golem/Yagna, RPC credential, database secret, admin secret, dan kunci treasury hanya di secret store/server.
- Credential user dibuat dengan generator kriptografis, disimpan hash, ditampilkan sekali, dapat dicabut, dan tidak pernah dicatat dalam log.
- Lindungi sesi wallet dengan nonce satu kali, expiry, validasi chain/domain, dan perlindungan replay.
- Terapkan HTTPS, validasi input, SQL parameterization, rate limit, otorisasi row-level, secure cookies bila memakai sesi cookie, CSRF sesuai pola autentikasi, audit log, serta batas ukuran request.
- Jangan mencatat prompt secara default kecuali kebijakan privasi yang disetujui mengizinkannya. Jika perlu debugging, gunakan redaksi dan retention terbatas.
- Yagna tidak publik; API key Yagna tidak pernah dikirim ke browser. Ollama hanya dapat dijangkau melalui koneksi internal/requestor proxy.
- Log terstruktur dengan `request_id`, `job_id`, `user_id`, dan `credential_id` yang aman; jangan log secret.
- Pada restart, baca job aktif dan state Golem, cocokkan worker, tandai record stale, pulihkan yang aman, dan cegah duplikasi workload.
- Status Golem, worker, wallet, GLM, gas, dan pembayaran harus mencerminkan hasil pemeriksaan terakhir serta waktu pemeriksaannya. Jika gagal, tampilkan error sebenarnya yang aman dibuka kepada pengguna/admin.

## 11. Dashboard dan dokumentasi

### Area pengguna

- Wallet yang terhubung, saldo token terverifikasi, eligibility, allocated/used/reserved/remaining beserta unit.
- Metadata credential, waktu expiry dan status; secret hanya tampak pada saat issuance.
- Daftar job dengan model, status, waktu, penggunaan dan biaya yang dilabeli aktual/perkiraan.
- Detail job berisi timeline state, provider/worker hanya sesuai kebijakan dan data yang terverifikasi.
- Petunjuk Open WebUI: API base URL, nama model yang tersedia, cara memasukkan credential, dan peringatan untuk tidak mempublikasikannya.

### Area admin

- Overview user eligible, credential aktif, job aktif, worker, penggunaan, status Golem, pembayaran dan error.
- Kontrol akses admin dipisah dari autentikasi user, perubahan konfigurasi tercatat.
- Treasury menampilkan transaksi/balance yang benar-benar terbaca; purchase proof harus menyimpan tx hash atau receipt asli.
- Nama “NVIDIA GPU” hanya digunakan jika runtime/provider memberikan bukti yang cukup. Jangan menetapkan H100 atau model GPU tertentu dari asumsi.

### Dokumentasi produk

Jelaskan apa itu Computree, model akses, connect wallet, eligibility/alokasi, penerbitan credential, API reference, OpenAI-compatible subset, Open WebUI, job/status, penggunaan, keamanan, mode demo, dan batasan Golem. LibreChat atau aplikasi kedua baru ditampilkan sebagai integrasi setelah dites.

## 12. Kriteria selesai MVP

MVP dinyatakan lolos hanya bila:

1. Wallet ownership dibuktikan server dan saldo token dibaca dari chain/kontrak terkonfigurasi.
2. Alokasi dihitung server-side dan penggunaan reserve/commit/release terbukti aman pada request bersamaan.
3. Credential nyata dapat dibuat, ditampilkan satu kali, tersimpan hash, kedaluwarsa, dan dicabut.
4. `/v1/models` menemukan model yang benar-benar tersedia; Open WebUI dapat terhubung.
5. `/v1/chat/completions` mengembalikan hasil dan SSE berjalan pada koneksi nyata yang dites.
6. Backend membuat job unik dan meneruskan workload ke Golem GPU worker yang nyata, melalui proxy/networking requestor-side.
7. Qwen/Ollama siap, menjawab request, dan API Computree meneruskan hasil dengan benar.
8. Usage, status, runtime, provider/worker data, dan pembayaran hanya ditampilkan berdasarkan bukti; perkiraan diberi label.
9. Alokasi berkurang sesuai pemakaian yang terukur; kegagalan tidak menagih compute yang tidak digunakan.
10. Worker selesai dipakai ulang atau dibersihkan; restart tidak menggandakan workload.
11. Dua user/job diuji independen sesuai kebijakan concurrency yang telah dipilih; kapasitas serial atau paralel dijelaskan jujur.
12. Secret tidak bocor ke frontend atau log; data demo tidak bercampur dengan data produksi.
13. Dashboard admin memperlihatkan job nyata dan status infrastruktur yang nyata.
14. Uji end-to-end mencatat hasil dan titik kegagalan spesifik apabila dependency provider/jaringan/pembayaran tidak tersedia.

## 13. Risiko dan mitigasi

| Risiko / hal belum dipastikan | Dampak | Mitigasi / gerbang |
|---|---|---|
| Chain, alamat kontrak, threshold, dan aturan token belum diberikan | Eligibility dan alokasi belum dapat dipercaya | Konfigurasi wajib sebelum mengaktifkan verifikasi produksi; jangan hardcode asumsi |
| GPU tidak tersedia pada testnet | Tidak bisa mengklaim uji GPU nyata dari testnet | Gunakan testnet hanya untuk bagian yang sesuai; uji GPU nyata memerlukan persetujuan biaya mainnet |
| Ketersediaan provider, harga, atau model GPU berubah | Job dapat gagal/mahal atau kapasitas tidak stabil | Probe provider, batas harga, timeout, status unavailable, dan tidak menjanjikan kapasitas |
| Yagna dan requestor-side proxy mungkin membutuhkan konfigurasi khusus di deployment | Integrasi dapat berhasil lokal tetapi gagal setelah deploy | Spike deployment lebih awal; dokumentasikan kebutuhan daemon, networking dan persistence |
| Model lebih besar dari contoh Qwen kecil memerlukan resource berbeda | Worker lambat, gagal start, atau provider tidak memenuhi kebutuhan | Mulai dengan model contoh kecil; ukur kebutuhan model target sebelum menetapkan provider/limit |
| Usage dan biaya tidak tersedia seragam untuk semua kegagalan | Kredit/biaya berpotensi salah hitung | Simpan sumber dan tingkat kepastian; rekonsiliasi; jangan mengisi data yang tidak diketahui dengan klaim |
| Satu worker tidak memenuhi makna “concurrency” sebagai eksekusi paralel | Produk tampak menyatakan kapasitas yang belum ada | Tegaskan antrean vs paralelisme dan tetapkan jumlah worker/anggaran sebelum menyatakan DoD |
| Pengguna menganggap saldo token sama dengan compute yang dijamin | Risiko ekspektasi produk dan ekonomi | Definisikan satuan kredit, masa berlaku, refresh saldo, batas, dan aturan kegagalan sebelum produksi |
| Prompt dapat memuat data sensitif | Risiko privasi | Default tanpa penyimpanan prompt; retention dan akses debugging dibatasi dan dijelaskan |

## 14. Keputusan yang masih harus dikunci

Keputusan berikut belum boleh diisi dengan angka/asumsi buatan:

1. Chain ID dan alamat kontrak COMPUTREE yang benar.
2. Threshold eligibility, formula alokasi, unit kredit, masa berlaku, frekuensi pembaruan saldo, dan perilaku jika saldo wallet berubah.
3. Model Qwen awal untuk demo nyata selain model kecil yang dipakai untuk proof teknis.
4. Kebijakan concurrency MVP: antrean satu worker atau beberapa worker GPU paralel.
5. Batas biaya/price, wallet funding dan pengelolaan pembayaran Golem.
6. Domain API dan URL produksi.
7. Kebijakan logging/retention prompt, kebijakan provider disclosure, dan siapa admin.
8. Apakah prototype/demo boleh menggunakan mock; jika ya, di mana tampilannya dipisah dan siapa yang dapat mengaksesnya.

## 15. Persetujuan, keamanan perubahan, dan cara melanjutkan

Dokumen ini adalah rencana, bukan persetujuan untuk mengubah kode, desain, deployment, kontrak, wallet, atau data produksi. Jika rencana disetujui, langkah pertama adalah audit repo dan baseline UI; kemudian saya akan melaporkan temuan aktual sebelum implementasi berisiko. Tema dan layout yang sudah ada tetap dipertahankan tanpa persetujuan desain tersendiri.

Setiap aktivitas yang mengirim transaksi, membelanjakan GLM/POL, mengubah treasury, melakukan swap/bridge, atau mempublikasikan deployment produksi memerlukan persetujuan terpisah yang menyebut tindakan dan konsekuensinya. Tidak ada dana, GPU usage, provider, atau hasil compute yang boleh difabrikasi untuk menutupi dependency yang belum siap.

## 16. Referensi

- [Brief Computree yang dilampirkan](attached_assets/Pasted-COMPUTREE-BUILD-THE-ACTUAL-GPU-COMPUTE-NETWORK-You-are-_1791431678935.txt)
- [Golem — How to Use Golem Network Providers to Run AI Models](https://docs.golem.network/docs/creators/javascript/tutorials/AI-on-golem-network)
- [Golem — Testnet / Mainnet, Addresses and Wallets](https://docs.golem.network/docs/golem/overview/testnet-mainnet)
- [Golem — Payments in Golem explained](https://docs.golem.network/docs/golem/payments)
- [Golem — golem-js API Reference](https://docs.golem.network/docs/golem-js/reference/README)
- [Golem — Golem-Workers](https://docs.golem.network/docs/creators/golem-workers)
- [Open WebUI — OpenAI-Compatible Providers](https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-openai-compatible/)
- [Replit — Deployment types](https://docs.replit.com/features/publishing/deployment-types)
