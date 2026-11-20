/**
 * BACKEND GOOGLE APPS SCRIPT
 * Proyek: Website Booking Konsultasi Tahsin Sobat Ngaji
 * 
 * Sistem Pemilihan Hari & Jam:
 * - Peserta memilih Hari (Senin - Ahad) dan Jam (10.00, 14.00, 16.00 WIB).
 * - Tanggal sesi akan ditentukan dan dikonfirmasi oleh admin kemudian.
 * - Seluruh pendaftaran masuk otomatis ke sheet DATA PESERTA.
 */

// Konfigurasi ID Spreadsheet Sobat Ngaji
const SPREADSHEET_ID = '1ZQkz7cLlyGxHNiJrrdMizwSyf_fUiGwuZzife9ejhTc';

// Nama Sheet Database
const SHEET_JADWAL = 'JADWAL';
const SHEET_PESERTA = 'DATA PESERTA';

// Daftar Jam Resmi Konsultasi
const ALLOWED_HOURS = ['10.00 WIB', '14.00 WIB', '16.00 WIB'];

// Daftar Hari Resmi Konsultasi (Senin sampai Jumat)
const ALLOWED_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

// Daftar Materi Resmi Konsultasi
const ALLOWED_MATERI = [
  'Perbaikan bacaan Al-Qur\'an',
  'Makhorijul huruf',
  'Hukum tajwid',
  'Kelancaran membaca',
  'Konsultasi umum tahsin'
];

/**
 * Mendapatkan referensi spreadsheet aktif atau berdasarkan ID
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'GANTI_DENGAN_SPREADSHEET_ID_ANDA') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Endpoint GET Web App
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || 'getAvailableSchedules';

    if (action === 'getAvailableSchedules') {
      const result = getAvailableSchedules();
      return createJsonResponse(result);
    }

    if (action === 'getBookingConfirmation') {
      const bookingId = params.bookingId || '';
      const result = getBookingConfirmation(bookingId);
      return createJsonResponse(result);
    }

    if (action === 'createBooking') {
      const result = createBooking(params);
      return createJsonResponse(result);
    }

    return createJsonResponse({
      success: true,
      message: 'API Booking Konsultasi Tahsin Sobat Ngaji aktif.'
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * Endpoint POST Web App
 */
function doPost(e) {
  try {
    let payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || 'createBooking';

    if (action === 'createBooking') {
      const result = createBooking(payload);
      return createJsonResponse(result);
    }

    return createJsonResponse({
      success: false,
      message: 'Action tidak dikenali.'
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Terjadi kesalahan pada request: ' + error.message
    });
  }
}

/**
 * Helper untuk mengembalikan response JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mengambil daftar hari dan jam yang tersedia
 */
function getAvailableSchedules() {
  return {
    success: true,
    days: ALLOWED_DAYS,
    hours: ALLOWED_HOURS,
    teacher: 'Tim Pengajar Sobat Ngaji'
  };
}

/**
 * Membuat Booking Baru
 * Menggunakan LockService dan menyimpan langsung ke sheet DATA PESERTA
 */
function createBooking(data) {
  const nama = String(data.nama || '').trim();
  const whatsapp = String(data.whatsapp || '').replace(/[^0-9+]/g, '').trim();
  const materi = String(data.materi || '').trim();
  const hari = String(data.hari || '').trim();
  const jam = String(data.jam || '').trim();
  const ustadz = String(data.ustadz || '').trim() || 'Tim Pengajar Sobat Ngaji';

  // Validasi data
  if (!nama || nama.length < 2) {
    return { success: false, message: 'Nama lengkap wajib diisi minimal 2 karakter.' };
  }

  const cleanWa = whatsapp.replace(/\D/g, '');
  if (!cleanWa || cleanWa.length < 9 || cleanWa.length > 16) {
    return { success: false, message: 'Nomor WhatsApp tidak valid (minimal 9 digit).' };
  }

  if (!ALLOWED_DAYS.includes(hari)) {
    return { success: false, message: 'Pilihan hari konsultasi tidak valid.' };
  }

  if (!ALLOWED_HOURS.includes(jam)) {
    return { success: false, message: 'Pilihan jam konsultasi tidak valid.' };
  }

  if (!ALLOWED_MATERI.includes(materi)) {
    return { success: false, message: 'Materi konsultasi yang dipilih tidak valid.' };
  }

  // Gunakan LockService untuk mencegah konflik bersamaan
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(30000);

  if (!hasLock) {
    return {
      success: false,
      message: 'Sistem sedang memproses booking lain. Silakan coba 5 detik lagi.'
    };
  }

  try {
    const ss = getSpreadsheet();
    let pesertaSheet = ss.getSheetByName(SHEET_PESERTA);
    let jadwalSheet = ss.getSheetByName(SHEET_JADWAL);

    // Otomatis buat sheet DATA PESERTA jika belum ada
    if (!pesertaSheet) {
      pesertaSheet = ss.insertSheet(SHEET_PESERTA);
      pesertaSheet.appendRow([
        'ID Booking', 'Tanggal Pendaftaran', 'Nama Lengkap', 'Nomor WhatsApp',
        'Tanggal Konsultasi', 'Jam Konsultasi', 'Nama Ustadz/Ustadzah', 'Materi Konsultasi',
        'Link Zoom', 'Status Booking', 'Status Kehadiran', 'Catatan Admin', 'Rekomendasi Kelas'
      ]);
      const pHeader = pesertaSheet.getRange(1, 1, 1, 13);
      pHeader.setFontWeight('bold');
      pHeader.setBackground('#e2e8f0');
      pHeader.setFontColor('#0f172a');
    }

    // Otomatis buat sheet JADWAL jika belum ada
    if (!jadwalSheet) {
      jadwalSheet = ss.insertSheet(SHEET_JADWAL);
      jadwalSheet.appendRow(['Tanggal', 'Hari', 'Nama Ustadz/Ustadzah', 'Jam 10.00', 'Jam 14.00', 'Jam 16.00']);
      const jHeader = jadwalSheet.getRange(1, 1, 1, 6);
      jHeader.setFontWeight('bold');
      jHeader.setBackground('#e0f2fe');
      jHeader.setFontColor('#0f172a');
    }

    const timeZone = Session.getScriptTimeZone() || 'Asia/Jakarta';

    // Generate ID Booking unik (contoh: SN-261120-K7M2)
    const dateCode = Utilities.formatDate(new Date(), timeZone, 'yyMMdd');
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = 'SN-' + dateCode + '-' + randomCode;
    const registrationDate = Utilities.formatDate(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss');

    // Kolom E (Tanggal Konsultasi): Diisi keterangan hari pilihan peserta
    // Admin nantinya tinggal mengganti atau mengisi tanggal pasti di kolom ini
    const tanggalKonsultasiPlaceholder = 'Hari ' + hari + ' (Menunggu jadwal admin)';
    const catatanAdmin = 'Permintaan hari: ' + hari;

    // Simpan ke DATA PESERTA
    pesertaSheet.appendRow([
      bookingId,
      registrationDate,
      nama,
      whatsapp,
      tanggalKonsultasiPlaceholder,
      jam,
      ustadz,
      materi,
      '',               // Link Zoom (diisi admin)
      'TERKONFIRMASI',  // Status Booking
      '-',              // Status Kehadiran
      catatanAdmin,     // Catatan Admin
      '-'               // Rekomendasi Kelas
    ]);

    // Jika di sheet JADWAL ada baris untuk hari tersebut, update status jamnya
    if (jadwalSheet.getLastRow() > 1) {
      const jData = jadwalSheet.getDataRange().getValues();
      let slotCol = (jam === '10.00 WIB') ? 4 : (jam === '14.00 WIB') ? 5 : 6;

      for (let i = 1; i < jData.length; i++) {
        const rowHari = String(jData[i][1] || '').trim();
        if (rowHari.toLowerCase() === hari.toLowerCase()) {
          jadwalSheet.getRange(i + 1, slotCol).setValue('TERBOOKING');
          break;
        }
      }
    }

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Booking konsultasi berhasil.',
      booking: {
        id: bookingId,
        nama: nama,
        whatsapp: whatsapp,
        hari: hari,
        jam: jam,
        ustadz: ustadz,
        materi: materi,
        tanggalPendaftaran: registrationDate
      }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Gagal memproses booking: ' + error.message
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mengambil Konfirmasi Booking Berdasarkan ID
 */
function getBookingConfirmation(bookingId) {
  if (!bookingId) {
    return { success: false, message: 'ID Booking wajib disertakan.' };
  }

  const ss = getSpreadsheet();
  const pesertaSheet = ss.getSheetByName(SHEET_PESERTA);

  if (!pesertaSheet) {
    return { success: false, message: 'Sheet DATA PESERTA tidak ditemukan.' };
  }

  const data = pesertaSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = String(row[0] || '').trim();

    if (id === bookingId.trim()) {
      return {
        success: true,
        booking: {
          id: id,
          tanggalPendaftaran: String(row[1] || ''),
          nama: String(row[2] || ''),
          whatsapp: String(row[3] || ''),
          tanggalKonsultasi: String(row[4] || ''),
          jam: String(row[5] || ''),
          ustadz: String(row[6] || ''),
          materi: String(row[7] || ''),
          linkZoom: String(row[8] || ''),
          statusBooking: String(row[9] || '')
        }
      };
    }
  }

  return {
    success: false,
    message: 'Data booking dengan ID ' + bookingId + ' tidak ditemukan.'
  };
}

/**
 * Setup Header Otomatis jika spreadsheet masih kosong
 */
function setupSpreadsheet() {
  const ss = getSpreadsheet();

  let jadwalSheet = ss.getSheetByName(SHEET_JADWAL);
  if (!jadwalSheet) {
    jadwalSheet = ss.insertSheet(SHEET_JADWAL);
  }

  const jadwalHeaders = ['Tanggal', 'Hari', 'Nama Ustadz/Ustadzah', 'Jam 10.00', 'Jam 14.00', 'Jam 16.00'];
  if (jadwalSheet.getLastRow() === 0) {
    jadwalSheet.appendRow(jadwalHeaders);
    const headerRange = jadwalSheet.getRange(1, 1, 1, jadwalHeaders.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e0f2fe');
    headerRange.setFontColor('#0f172a');
  }

  let pesertaSheet = ss.getSheetByName(SHEET_PESERTA);
  if (!pesertaSheet) {
    pesertaSheet = ss.insertSheet(SHEET_PESERTA);
  }

  const pesertaHeaders = [
    'ID Booking', 'Tanggal Pendaftaran', 'Nama Lengkap', 'Nomor WhatsApp',
    'Tanggal Konsultasi', 'Jam Konsultasi', 'Nama Ustadz/Ustadzah', 'Materi Konsultasi',
    'Link Zoom', 'Status Booking', 'Status Kehadiran', 'Catatan Admin', 'Rekomendasi Kelas'
  ];

  if (pesertaSheet.getLastRow() === 0) {
    pesertaSheet.appendRow(pesertaHeaders);
    const pHeaderRange = pesertaSheet.getRange(1, 1, 1, pesertaHeaders.length);
    pHeaderRange.setFontWeight('bold');
    pHeaderRange.setBackground('#e2e8f0');
    pHeaderRange.setFontColor('#0f172a');
  }

  Logger.log('Inisialisasi spreadsheet berhasil.');
}
