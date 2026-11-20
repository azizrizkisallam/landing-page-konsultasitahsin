# Panduan Website Booking Konsultasi Tahsin Sobat Ngaji

Aplikasi website pemesanan konsultasi tahsin gratis untuk Sobat Ngaji. Peserta memilih preferensi Hari (Senin s/d Jumat) dan Jam (10.00 WIB, 14.00 WIB, atau 16.00 WIB) secara mandiri. Admin tidak perlu membuat tanggal terlebih dahulu di Google Sheets. Tanggal pelaksanaan sesi akan ditentukan dan dikonfirmasi langsung oleh admin melalui WhatsApp.

---

## 1. Alur Kerja Sistem

1. **Peserta Membuka Website**:
   - Memilih **Hari**: Senin, Selasa, Rabu, Kamis, atau Jumat.
   - Memilih **Jam Mulai**: 10.00 WIB, 14.00 WIB, atau 16.00 WIB.
   - Mengisi Nama Lengkap, Nomor WhatsApp aktif, dan Materi Konsultasi.
   - Klik **BOOKING SEKARANG**.
2. **Data Masuk ke Google Sheets**:
   - Seluruh data tersimpan otomatis di sheet **`DATA PESERTA`**.
   - Kolom `Tanggal Konsultasi` (Kolom E) terisi otomatis dengan hari pilihan peserta: `Hari [Hari] (Menunggu jadwal admin)`.
   - Admin tinggal menentukan tanggal pastinya di spreadsheet saat menghubungi peserta via WhatsApp.
3. **Layar Konfirmasi**:
   - Menampilkan ID Booking unik (contoh: `SN-261120-7A9B`).
   - Tombol "Salin Informasi Booking".
   - Tombol "Hubungi Admin WhatsApp" yang otomatis membuka chat dengan pesan terformat rapi.

---

## 2. Struktur Database Google Sheets

Spreadsheet:
`https://docs.google.com/spreadsheets/d/1ZQkz7cLlyGxHNiJrrdMizwSyf_fUiGwuZzife9ejhTc/edit`

### Sheet: `DATA PESERTA`
| Kolom | Nama Header | Terisi Otomatis / Diisi Admin | Keterangan |
|---|---|---|---|
| A | ID Booking | Otomatis | Kode unik pendaftaran peserta |
| B | Tanggal Pendaftaran | Otomatis | Waktu submit formulir |
| C | Nama Lengkap | Otomatis | Nama lengkap peserta |
| D | Nomor WhatsApp | Otomatis | Nomor WhatsApp aktif peserta |
| E | Tanggal Konsultasi | Otomatis awal, Admin final | Awal: `Hari [Hari] (Menunggu jadwal admin)`, diisi tanggal pasti oleh admin |
| F | Jam Konsultasi | Otomatis | 10.00 WIB / 14.00 WIB / 16.00 WIB |
| G | Nama Ustadz/Ustadzah | Otomatis | Default: `Tim Pengajar Sobat Ngaji` |
| H | Materi Konsultasi | Otomatis | Materi tahsin yang dipilih peserta |
| I | Link Zoom | Admin | Link ruang Zoom konsultasi |
| J | Status Booking | Otomatis | Default: `TERKONFIRMASI` (atau `DIBATALKAN`) |
| K | Status Kehadiran | Admin | Kehadiran peserta (default: `-`) |
| L | Catatan Admin | Otomatis / Admin | Catatan hari pilihan peserta |
| M | Rekomendasi Kelas | Admin | Tindak lanjut kelas tahsin berikutnya |

### Sheet: `JADWAL`
| Kolom | Nama Header | Keterangan |
|---|---|---|
| A | Tanggal | Tanggal sesi |
| B | Hari | Nama hari (Senin s/d Jumat) |
| C | Nama Ustadz/Ustadzah | Pengajar yang bertugas |
| D | Jam 10.00 | Status slot (`BUKA` / `TERBOOKING` / `TUTUP`) |
| E | Jam 14.00 | Status slot (`BUKA` / `TERBOOKING` / `TUTUP`) |
| F | Jam 16.00 | Status slot (`BUKA` / `TERBOOKING` / `TUTUP`) |

---

## 3. Langkah Update Backend di Google Apps Script

1. Buka spreadsheet database Anda, lalu buka menu **Ekstensi** > **Apps Script**.
2. Salin seluruh isi dari file [Code.gs](file:///c:/Users/bandu/Desktop/Landing%20Page%20Konsultasi%20Tahsin/Code.gs) dan gantikan kode di Apps Script.
3. Klik tombol **Simpan** (`Ctrl + S`).
4. Update deployment:
   - Klik **Terapkan (Deploy)** di kanan atas > pilih **Kelola Penerapan (Manage deployments)**.
   - Klik ikon pensil (**Edit**) di sebelah kanan.
   - Pada pilihan versi, pilih **Versi baru (New version)**.
   - Klik **Terapkan (Deploy)**.

---

## 4. Penggunaan di Website

Buka file [index.html](file:///c:/Users/bandu/Desktop/Landing%20Page%20Konsultasi%20Tahsin/index.html) di browser Anda.
Tampilan akan langsung menyajikan tombol pilihan Hari dan Jam. Begitu peserta mendaftar, data langsung masuk ke Google Sheets tanpa admin perlu mengisi jadwal di awal.
