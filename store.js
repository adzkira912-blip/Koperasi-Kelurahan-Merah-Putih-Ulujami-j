/**
 * store.js - Pusat Data Persisten (Hybrid: LocalStorage & Supabase Cloud PostgreSQL)
 * Koperasi Kelurahan Merah Putih Ulujami
 * Fokus: Portal Pendaftaran Anggota Berbasis WhatsApp & Full Custom Image CMS
 */

(function (window) {
  'use strict';

  // Kunci Penyimpanan localStorage
  const KEYS = {
    PROFILE: 'kmp_profile',
    BOARD: 'kmp_board_members',
    REGISTRATIONS: 'kmp_registrations',
    AUTH_SESSION: 'kmp_auth_session',
    LOGIN_ATTEMPTS: 'kmp_login_attempts',
    ADMIN_CREDENTIALS: 'kmp_admin_credentials',
    SUPABASE_CONFIG: 'kmp_supabase_config',
    PENDING_REGS: 'kmp_pending_regs'
  };

  // Skrip SQL Lengkap Siap Pakai untuk Supabase SQL Editor (Ramping: Profil, Pengurus, & Pendaftaran)
  const SUPABASE_SQL_SCHEMA = `-- SKRIP SKEMA DATABASE KOPERASI MERAH PUTIH ULUJAMI (SUPABASE POSTGRESQL)
-- Fokus: Portal Pendaftaran Warga & Full Image CMS

-- 1. Tabel Profil Koperasi & Manajemen Aset Gambar CMS
CREATE TABLE IF NOT EXISTS kmp_profile (
  id INT PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT,
  legal_badge TEXT,
  decree_date TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  operational_hours TEXT,
  maps_embed TEXT,
  logo_url TEXT,
  logo_scale_desktop INT DEFAULT 48,
  logo_scale_mobile INT DEFAULT 38,
  hero_image_url TEXT,
  about_banner_url TEXT,
  cta_banner_url TEXT,
  stats JSONB,
  mission JSONB,
  values JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom aset logo & gambar eksplisit ada jika tabel profil sudah pernah dibuat sebelumnya
ALTER TABLE kmp_profile ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE kmp_profile ADD COLUMN IF NOT EXISTS logo_scale_desktop INT DEFAULT 48;
ALTER TABLE kmp_profile ADD COLUMN IF NOT EXISTS logo_scale_mobile INT DEFAULT 38;
ALTER TABLE kmp_profile ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE kmp_profile ADD COLUMN IF NOT EXISTS about_banner_url TEXT;
ALTER TABLE kmp_profile ADD COLUMN IF NOT EXISTS cta_banner_url TEXT;

-- 2. Tabel Struktur Pengurus & Pengawas
CREATE TABLE IF NOT EXISTS kmp_board_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  period TEXT DEFAULT '2024 – 2027',
  display_order INT DEFAULT 1,
  bio TEXT,
  photo TEXT
);

-- 3. Tabel Pendaftaran Anggota Warga (Privasi & Integritas Tinggi)
CREATE TABLE IF NOT EXISTS kmp_registrations (
  id TEXT PRIMARY KEY,
  ref_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  rtrw TEXT NOT NULL,
  reason TEXT NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'Menunggu Verifikasi',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kmp_registrations ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE kmp_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Aktifkan Row Level Security (RLS) & Berikan Akses Publik (Anon & Authenticated)
ALTER TABLE kmp_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE kmp_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kmp_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publik Akses Profil" ON kmp_profile;
CREATE POLICY "Publik Akses Profil" ON kmp_profile FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik Akses Pengurus" ON kmp_board_members;
CREATE POLICY "Publik Akses Pengurus" ON kmp_board_members FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik Akses Registrasi" ON kmp_registrations;
CREATE POLICY "Publik Akses Registrasi" ON kmp_registrations FOR ALL TO public USING (true) WITH CHECK (true);

-- Realtime publication untuk notifikasi pendaftaran masuk seketika
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'kmp_registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE kmp_registrations;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
`;

  // Default Logo SVG Institusional Merah-Putih Koperasi
  const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8F1722" />
          <stop offset="60%" stop-color="#C92532" />
          <stop offset="100%" stop-color="#700F17" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE082" />
          <stop offset="50%" stop-color="#FFB300" />
          <stop offset="100%" stop-color="#FF8F00" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#bgGrad)" stroke="#FFD54F" stroke-width="4"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4,3"/>
      
      <path d="M 50 145 C 80 165, 120 165, 150 145 L 146 135 C 120 152, 80 152, 54 135 Z" fill="#FFFFFF" opacity="0.95"/>
      <path d="M 50 145 C 80 165, 120 165, 150 145 L 148 152 C 120 172, 80 172, 52 152 Z" fill="#8F1722"/>

      <g fill="#FFE082" opacity="0.95">
        <circle cx="100" cy="85" r="30" fill="none" stroke="#FFE082" stroke-width="6"/>
        <circle cx="100" cy="85" r="16" fill="#8F1722"/>
        <path d="M 97 48 h 6 v 8 h -6 z M 97 114 h 6 v 8 h -6 z M 63 82 h 8 v 6 h -8 z M 129 82 h 8 v 6 h -8 z M 75 60 l 5 5 l -4 4 l -5 -5 z M 121 106 l 5 5 l -4 4 l -5 -5 z M 125 64 l -5 5 l -4 -4 l 5 -5 z M 79 110 l -5 5 l -4 -4 l 5 -5 z"/>
      </g>

      <path d="M 52 95 C 48 70, 68 52, 85 45" fill="none" stroke="#FFE082" stroke-width="3" stroke-linecap="round"/>
      <circle cx="56" cy="85" r="3.5" fill="#FFE082"/>
      <circle cx="62" cy="72" r="3.5" fill="#FFE082"/>
      <circle cx="72" cy="58" r="3.5" fill="#FFE082"/>
      <circle cx="85" cy="46" r="3.5" fill="#FFE082"/>

      <path d="M 148 95 C 152 70, 132 52, 115 45" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="144" cy="85" r="3.5" fill="#FFFFFF"/>
      <circle cx="138" cy="72" r="3.5" fill="#FFFFFF"/>
      <circle cx="128" cy="58" r="3.5" fill="#FFFFFF"/>
      <circle cx="115" cy="46" r="3.5" fill="#FFFFFF"/>

      <polygon points="100,68 104,78 115,79 107,86 109,96 100,90 91,96 93,86 85,79 96,78" fill="url(#goldGrad)" stroke="#B78103" stroke-width="0.8"/>

      <text x="100" y="172" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="10.5" fill="#FFFFFF" letter-spacing="1">KOPERASI MERAH PUTIH</text>
      <text x="100" y="185" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="8.5" fill="#FFD54F" letter-spacing="1.5">KELURAHAN ULUJAMI</text>
    </svg>
  `)}`;

  // DATA BENIH AWAL (INITIAL SEED DATA)
  const SEED_PROFILE = {
    name: 'Koperasi Kelurahan Merah Putih Ulujami',
    shortName: 'KKMP Ulujami',
    tagline: 'Wadah Gotong Royong Ekonomi Warga Menuju Kemandirian & Kesejahteraan Bersama',
    legalBadge: 'Badan Hukum No: AHU-0012849.AH.01.26.TAHUN 2023',
    decreeDate: '17 Agustus 2023',
    address: 'Jl. Ulujami Raya No. 42, RT 05 / RW 01, Kelurahan Ulujami, Kecamatan Pesanggrahan, Kota Administrasi Jakarta Selatan, DKI Jakarta 12250',
    phone: '0812-8912-3456',
    whatsapp: '6281289123456',
    email: 'kontak@koperasimerahputih-ulujami.id',
    operationalHours: 'Senin – Sabtu: 08.00 – 17.00 WIB (Minggu & Libur Nasional Tutup)',
    mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15864.845814578508!2d106.7589255!3d-6.2358897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f10a80e7d013%3A0x6b7ca2c525f2ee3f!2sUlujami%2C%20Pesanggrahan%2C%20South%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
    logoUrl: '',
    logoScaleDesktop: 48,
    logoScaleMobile: 38,
    heroImageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    aboutBannerUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    ctaBannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80',
    stats: {
      activeMembers: 348,
      rwCount: 9,
      satisfaction: '100%',
      assetTurnover: 'Rp 1,45 Miliar'
    },
    mission: [
      'Membangun jejaring solidaritas sosial dan kemandirian ekonomi keluarga se-Kelurahan Ulujami.',
      'Menyediakan fasilitas pendaftaran dan keanggotaan koperasi yang transparan, mudah, dan aman.',
      'Mengelola permodalan dan simpanan anggota dengan tata kelola profesional dan akuntabel.',
      'Mewujudkan kemakmuran bersama melalui pembagian Sisa Hasil Usaha (SHU) tahunan yang adil.'
    ],
    values: [
      { title: 'Gotong Royong', desc: 'Bahu-membahu dari warga, oleh warga, dan untuk kemakmuran seluruh warga kelurahan.' },
      { title: 'Transparansi Penuh', desc: 'Laporan pertanggungjawaban dan tata kelola terbuka untuk seluruh anggota dalam RAT.' },
      { title: 'Profesional & Andal', desc: 'Pelayanan modern berorientasi amanah dengan kehangatan silaturahmi tetangga.' }
    ]
  };

  const SEED_BOARD = [
    {
      id: 'board-1',
      name: 'H. Hendro Siswanto, S.E.',
      position: 'Ketua Koperasi',
      period: '2024 – 2027',
      order: 1,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Praktisi ekonomi kerakyatan berpengalaman 15 tahun di bidang perkoperasian dan pengembangan unit usaha mikro perkotaan.'
    },
    {
      id: 'board-2',
      name: 'Dra. Hj. Nuraini Wahyuni',
      position: 'Sekretaris',
      period: '2024 – 2027',
      order: 2,
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Tokoh penggerak perempuan Ulujami yang berdedikasi mengawal tertib administrasi, pendaftaran anggota, dan kepatuhan hukum.'
    },
    {
      id: 'board-3',
      name: 'Drs. M. Taufik Kurniawan, Ak.',
      position: 'Bendahara',
      period: '2024 – 2027',
      order: 3,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Akuntan profesional yang memegang teguh asas keterbukaan neraca pembukuan, audit kas berkala, dan kesehatan permodalan.'
    },
    {
      id: 'board-4',
      name: 'Bpk. Drs. H. Achmad Fauzi, M.Si.',
      position: 'Ketua Dewan Pengawas',
      period: '2024 – 2027',
      order: 4,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      bio: 'Mantan pamong senior yang bertugas mengawasi jalannya roda organisasi agar konsisten selaras dengan AD/ART dan regulasi dinas.'
    },
    {
      id: 'board-5',
      name: 'Ibu Ratna Dewi Sartika, S.Sos.',
      position: 'Anggota Dewan Pengawas',
      period: '2024 – 2027',
      order: 5,
      photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
      bio: 'Penggiat sosial kemasyarakatan yang aktif mengawal kepuasan pelayanan anggota dan ketepatan pembagian SHU tahunan.'
    }
  ];

  const SEED_REGISTRATIONS = [
    {
      id: 'reg-1',
      refCode: 'REG-KMPU-20241020-8391',
      fullName: 'Agus Supriyadi',
      phone: '081298765432',
      rtrw: 'RT 03 / RW 01',
      reason: 'Ingin berpartisipasi dalam program simpanan gotong royong dan memajukan kegiatan ekonomi kelurahan.',
      date: '2024-10-20 09:15',
      status: 'Menunggu Verifikasi',
      notes: 'Calon anggota siap hadir verifikasi berkas di sekretariat.'
    },
    {
      id: 'reg-2',
      refCode: 'REG-KMPU-20241021-4920',
      fullName: 'Sri Wahyuni, S.Pd',
      phone: '081311223344',
      rtrw: 'RT 05 / RW 03',
      reason: 'Berminat menjadi anggota aktif dan mengikuti musyawarah tahunan warga.',
      date: '2024-10-21 14:30',
      status: 'Diverifikasi',
      notes: 'KTP dan KK sudah dicocokkan fisik. Buku anggota dalam proses cetak.'
    },
    {
      id: 'reg-3',
      refCode: 'REG-KMPU-20241022-7714',
      fullName: 'Dedi Kurniawan',
      phone: '085712345678',
      rtrw: 'RT 02 / RW 06',
      reason: 'Ingin ikut memajukan ekonomi warga lingkungan Ulujami secara bersama-sama.',
      date: '2024-10-22 11:05',
      status: 'Selesai',
      notes: 'Buku anggota resmi diserahkan. Telah terdaftar anggota penuh.'
    }
  ];

  // Helper Sanitasi XSS Ringan
  function sanitize(str) {
    if (str === null || str === undefined) return '';
    const temp = document.createElement('div');
    temp.textContent = String(str);
    return temp.innerHTML;
  }

  // Format Mata Uang Rupiah
  function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number || 0);
  }

  // Generator Kode Registrasi Unik: REG-KMPU-YYYYMMDD-XXXX
  function generateRefCode() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `REG-KMPU-${yyyy}${mm}${dd}-${code}`;
  }

  // Format Nomor WhatsApp Standar Indonesia (08xxx -> 628xxx)
  function cleanPhoneWA(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  }

  // Pembuat Tautan URL WhatsApp Resmi
  function buildWhatsAppUrl(targetPhone, message) {
    const cleanPhone = cleanPhoneWA(targetPhone);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }

  function isValidHttpUrl(str) {
    if (!str || typeof str !== 'string') return false;
    try {
      const url = new URL(str.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function isValidAnonKey(key) {
    return typeof key === 'string' && key.trim().length >= 20;
  }

  // Helper Eksekusi Query Supabase Aman (Mencegah TypeError PostgrestBuilder thenable .catch)
  function executeCloudQuery(queryPromise, actionLabel = 'Operasi Cloud') {
    return Promise.resolve(queryPromise)
      .then(({ data, error }) => {
        if (error) {
          console.error(
            `[Supabase ${actionLabel} Gagal]:`,
            error.message || error,
            '\n• Detail:', error.details || 'Tidak ada detail',
            '\n• Hint:', error.hint || 'Tidak ada petunjuk',
            '\n• Objek Error:', error
          );
          return { success: false, error };
        }
        return { success: true, data };
      })
      .catch((err) => {
        console.error(`[Supabase ${actionLabel} Eksepsi]:`, err?.message || err, err);
        return { success: false, error: err };
      });
  }

  // Antrean perubahan pendaftaran yang belum terkonfirmasi cloud: { id: 'upsert' | 'delete' }
  function getPending() {
    try { return JSON.parse(localStorage.getItem(KEYS.PENDING_REGS) || '{}'); } catch (_) { return {}; }
  }
  function setPending(p) { localStorage.setItem(KEYS.PENDING_REGS, JSON.stringify(p)); }

  function notifyCloudError(message) {
    try {
      window.dispatchEvent(new CustomEvent('kmp_cloud_error', { detail: { message } }));
    } catch (_) {}
  }

  function regToRow(r) {
    return {
      id: r.id,
      ref_code: r.refCode,
      full_name: r.fullName,
      phone: r.phone,
      rtrw: r.rtrw,
      reason: r.reason,
      date: r.date,
      status: r.status,
      notes: r.notes || ''
    };
  }

  let _lastRegWrite = 0; // penanda: ada tulis lokal setelah fetch dimulai -> jangan timpa

  // Helper Template Pesan WhatsApp
  const Templates = {
    memberRegistration(regData) {
      return (
        `*PENDAFTARAN ANGGOTA BARU*\n` +
        `Koperasi Kelurahan Merah Putih Ulujami\n\n` +
        `Yth. Tim Pengurus Koperasi,\n` +
        `Saya telah melengkapi formulir pendaftaran melalui website resmi dengan rincian sbb:\n\n` +
        `• *Kode Registrasi:* ${regData.refCode}\n` +
        `• *Nama Lengkap:* ${regData.fullName}\n` +
        `• *Nomor WhatsApp:* ${regData.phone}\n` +
        `• *Domisili:* ${regData.rtrw}\n` +
        `• *Alasan/Minat:* ${regData.reason}\n\n` +
        `Demi perlindungan data pribadi, dokumen KTP/KK asli akan saya tunjukkan secara langsung saat verifikasi fisik di Sekretariat Koperasi.\n\n` +
        `Mohon petunjuk jadwal verifikasi dan langkah selanjutnya. Terima kasih!`
      );
    },

    adminFollowUps: {
      inviteVerification(applicant) {
        return (
          `Halo Bapak/Ibu ${applicant.fullName},\n\n` +
          `Terima kasih telah mendaftar menjadi calon anggota Koperasi Kelurahan Merah Putih Ulujami (Kode Registrasi: *${applicant.refCode}*).\n\n` +
          `Kami mengundang Bapak/Ibu untuk hadir verifikasi berkas dokumen identitas (membawa KTP & KK untuk dicocokkan) di Sekretariat Koperasi:\n` +
          `📍 Jl. Ulujami Raya No. 42 (Senin – Sabtu, 08.00 – 17.00 WIB).\n\n` +
          `Mari bersama kita bangun kemandirian dan gotong royong ekonomi warga Ulujami!`
        );
      },
      reminderSchedule(applicant) {
        return (
          `Salam hangat Bapak/Ibu ${applicant.fullName},\n\n` +
          `Mengingatkan kembali tindak lanjut verifikasi keanggotaan Koperasi Merah Putih Ulujami dengan nomor *${applicant.refCode}*.\n\n` +
          `Sekretariat kami siap menyambut kehadiran Bapak/Ibu di hari kerja. Silakan konfirmasi waktu kedatangan yang nyaman bagi Anda. Terima kasih.`
        );
      },
      approvalSuccess(applicant) {
        return (
          `Selamat Bapak/Ibu ${applicant.fullName}! 🎉\n\n` +
          `Proses verifikasi pendaftaran keanggotaan Koperasi Kelurahan Merah Putih Ulujami (Ref: *${applicant.refCode}*) telah *SELESAI & RESMI DISETUJUI*.\n\n` +
          `Kini Anda telah terdaftar sebagai anggota penuh dan berhak menikmati hak Sisa Hasil Usaha (SHU) tahunan serta fasilitas keanggotaan koperasi. Buku keanggotaan dapat diambil di kantor sekretariat.`
        );
      },
      rejectionClarification(applicant) {
        return (
          `Yth. Bapak/Ibu ${applicant.fullName},\n\n` +
          `Sehubungan dengan formulir pendaftaran anggota Anda (Ref: *${applicant.refCode}*), terdapat data domisili atau persyaratan administrasi yang memerlukan klarifikasi lebih lanjut.\n\n` +
          `Silakan menghubungi pengurus kembali atau mengunjungi Sekretariat Koperasi pada hari kerja. Terima kasih.`
        );
      }
    }
  };

  // OBJEK UTAMA STORE (HYBRID: LOCAL + SUPABASE)
  let _supabaseInstance = null;
  let _syncPromise = null;

  const Store = {
    DEFAULT_LOGO_SVG,
    SUPABASE_SQL_SCHEMA,
    sanitize,
    formatRupiah,
    generateRefCode,
    cleanPhoneWA,
    buildWhatsAppUrl,
    isValidHttpUrl,
    isValidAnonKey,
    Templates,

    // Helper Kompresi Berkas Gambar Berbasis Canvas (Hemat Kuota localStorage & Render 0ms)
    compressImage(file, options = {}) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type || !file.type.startsWith('image/')) {
          return reject(new Error('Berkas yang dipilih bukan berkas gambar valid.'));
        }

        if (file.type === 'image/svg+xml') {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
          return;
        }

        const maxWidth = options.maxWidth || 1000;
        const maxHeight = options.maxHeight || 1000;
        const quality = options.quality !== undefined ? options.quality : 0.82;
        const maxBytes = (options.maxKb || 350) * 1024;

        const reader = new FileReader();
        reader.onerror = (err) => reject(err);
        reader.onload = (e) => {
          const img = new Image();
          img.onerror = () => reject(new Error('Gagal memuat berkas gambar ke kanvas.'));
          img.onload = () => {
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width / height > maxWidth / maxHeight) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(e.target.result);

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const isPng = file.type === 'image/png';
            if (isPng && options.keepPng !== false) {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              let result = canvas.toDataURL('image/png');
              if (result.length > maxBytes) {
                const scale = Math.sqrt(maxBytes / result.length) * 0.92;
                canvas.width = Math.max(80, Math.round(width * scale));
                canvas.height = Math.max(80, Math.round(height * scale));
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                result = canvas.toDataURL('image/png');
              }
              resolve(result);
            } else {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              let result = canvas.toDataURL('image/jpeg', quality);
              if (result.length > maxBytes) {
                result = canvas.toDataURL('image/jpeg', 0.65);
              }
              resolve(result);
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    },

    // Inisialisasi awal
    init() {
      // 1. Pastikan cache lokal selalu terisi (0ms instant render)
      if (!localStorage.getItem(KEYS.PROFILE)) {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(SEED_PROFILE));
      }
      if (!localStorage.getItem(KEYS.BOARD)) {
        localStorage.setItem(KEYS.BOARD, JSON.stringify(SEED_BOARD));
      }
      if (!localStorage.getItem(KEYS.REGISTRATIONS)) {
        localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
      }
      if (!localStorage.getItem(KEYS.ADMIN_CREDENTIALS)) {
        localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }));
      }

      // Bersihkan sisa modul produk & unit dari memori lokal
      localStorage.removeItem('kmp_categories');
      localStorage.removeItem('kmp_business_units');
      localStorage.removeItem('kmp_products');

      // 2. Hubungkan ke database Supabase bila online
      const client = this.getSupabaseClient();
      if (client && this.isCloudEnabled()) {
        this.syncFromSupabase().catch(err => {
          console.warn('[Supabase Init Sync]: Offline / Fallback Lokal Aktif', err?.message || err);
        });
      }
    },

    // ==================== DATABASE CONFIGURATION (SUPABASE) ====================
    getSupabaseConfig() {
      const DEFAULT_CONFIG = {
        url: 'https://zjpwjgbalmsjhcshrowh.supabase.co',
        anonKey: 'sb_publishable_bnzh2eOVecYDMYift0v3kg_rZUK9Vzi',
        isEnabled: true
      };

      try {
        const raw = localStorage.getItem(KEYS.SUPABASE_CONFIG);
        if (!raw) return DEFAULT_CONFIG;
        const parsed = JSON.parse(raw);

        const url = isValidHttpUrl(parsed.url) ? parsed.url.trim() : DEFAULT_CONFIG.url;
        const anonKey = isValidAnonKey(parsed.anonKey) ? parsed.anonKey.trim() : DEFAULT_CONFIG.anonKey;
        const isEnabled = parsed.isEnabled !== undefined ? Boolean(parsed.isEnabled) : DEFAULT_CONFIG.isEnabled;

        return { url, anonKey, isEnabled };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    },

    saveSupabaseConfig(cfg) {
      const current = this.getSupabaseConfig();
      const updated = {
        url: isValidHttpUrl(cfg.url) ? cfg.url.trim() : (cfg.url ? cfg.url.trim() : current.url),
        anonKey: isValidAnonKey(cfg.anonKey) ? cfg.anonKey.trim() : (cfg.anonKey ? cfg.anonKey.trim() : current.anonKey),
        isEnabled: cfg.isEnabled !== undefined ? Boolean(cfg.isEnabled) : current.isEnabled
      };
      localStorage.setItem(KEYS.SUPABASE_CONFIG, JSON.stringify(updated));
      _supabaseInstance = null;
      return updated;
    },

    isCloudEnabled() {
      const cfg = this.getSupabaseConfig();
      return Boolean(cfg && cfg.isEnabled && isValidHttpUrl(cfg.url) && isValidAnonKey(cfg.anonKey) && window.supabase);
    },

    getSupabaseClient() {
      if (_supabaseInstance) return _supabaseInstance;
      const cfg = this.getSupabaseConfig();
      if (cfg && cfg.isEnabled && isValidHttpUrl(cfg.url) && isValidAnonKey(cfg.anonKey) && window.supabase) {
        try {
          _supabaseInstance = window.supabase.createClient(cfg.url, cfg.anonKey, {
            auth: { persistSession: false }
          });
          return _supabaseInstance;
        } catch (e) {
          console.warn('[Supabase Client Init Error]:', e);
          return null;
        }
      }
      return null;
    },

    async testSupabaseConnection() {
      const client = this.getSupabaseClient();
      if (!client) {
        return {
          success: false,
          message: 'Klien Supabase belum aktif atau SDK belum dimuat di peramban.'
        };
      }
      try {
        const { data, error } = await client.from('kmp_profile').select('id, name').limit(1);
        if (error) {
          return {
            success: false,
            message: `Gagal query Supabase: ${error.message}`
          };
        }
        return {
          success: true,
          message: 'Koneksi ke Supabase PostgreSQL Berhasil & Responsif!'
        };
      } catch (err) {
        return {
          success: false,
          message: `Eksepsi jaringan: ${err.message || err}`
        };
      }
    },

    // Ekspor / Unggah Semua Data Lokal ke Supabase
    async exportAllToSupabase() {
      const client = this.getSupabaseClient();
      if (!client) throw new Error('Supabase belum terhubung.');

      const profile = this.getProfile();
      const board = this.getBoard();
      const registrations = this.getRegistrations();

      const must = async (q, label) => {
        const { error } = await q;
        if (error) throw new Error(`${label}: ${error.message}`);
      };

      // 1. Profil & Gambar CMS
      await must(client.from('kmp_profile').upsert({
        id: 1,
        name: profile.name,
        short_name: profile.shortName,
        tagline: profile.tagline,
        legal_badge: profile.legalBadge,
        decree_date: profile.decreeDate || '',
        address: profile.address,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        email: profile.email,
        operational_hours: profile.operationalHours,
        maps_embed: profile.mapsEmbed || '',
        logo_url: profile.logoUrl || '',
        logo_scale_desktop: profile.logoScaleDesktop || 48,
        logo_scale_mobile: profile.logoScaleMobile || 38,
        hero_image_url: profile.heroImageUrl || '',
        about_banner_url: profile.aboutBannerUrl || '',
        cta_banner_url: profile.ctaBannerUrl || '',
        stats: profile.stats || {},
        mission: profile.mission || [],
        values: profile.values || []
      }), 'Profil');

      // 2. Pengurus
      if (board.length > 0) {
        await must(client.from('kmp_board_members').upsert(board.map(b => ({
          id: b.id,
          name: b.name,
          position: b.position,
          period: b.period,
          display_order: b.order || 1,
          bio: b.bio,
          photo: b.photo
        }))), 'Pengurus');
      }

      // 3. Registrasi
      if (registrations.length > 0) {
        await must(client.from('kmp_registrations').upsert(registrations.map(regToRow)), 'Pendaftaran');
        setPending({});
      }

      return { success: true };
    },

    // Alias Sinkronisasi ke Supabase Cloud
    async syncToSupabase() {
      try {
        await this.exportAllToSupabase();
        return {
          success: true,
          message: 'Seluruh data profil, aset gambar, pengurus, dan pendaftaran berhasil diunggah ke Supabase Cloud!'
        };
      } catch (err) {
        return {
          success: false,
          message: err?.message || String(err)
        };
      }
    },

    // Tarik Data dari Cloud ke Lokal (Thread-Safe Mutex & Race Condition Guard)
    async syncFromSupabase() {
      if (_syncPromise) return _syncPromise;

      const client = this.getSupabaseClient();
      if (!client) return { success: false, message: 'Supabase belum terhubung.' };

      _syncPromise = (async () => {
        try {
          // Kirim dulu perubahan lokal yang belum sampai cloud, supaya tidak ditimpa data lama
          await this.flushPending();
          const startedAt = Date.now();

          const [pRes, bRes, rRes] = await Promise.all([
            client.from('kmp_profile').select('*').limit(1),
            client.from('kmp_board_members').select('*'),
            client.from('kmp_registrations').select('*')
          ]);

          const fetchErr = [pRes, bRes, rRes].find(r => r.error);
          if (fetchErr) {
            const msg = fetchErr.error.message || String(fetchErr.error);
            console.error('[Supabase Sync Error]:', fetchErr.error);
            notifyCloudError(msg);
            return { success: false, message: msg };
          }

          let hasUpdated = false;

          const mergeById = (localItems, cloudItems) => {
            const map = new Map();
            (localItems || []).forEach(item => {
              if (item && item.id) map.set(item.id, item);
            });
            (cloudItems || []).forEach(item => {
              if (item && item.id) {
                const existing = map.get(item.id) || {};
                map.set(item.id, { ...existing, ...item });
              }
            });
            return Array.from(map.values());
          };

          // 1. Profil Koperasi
          if (pRes.data && pRes.data.length > 0) {
            const row = pRes.data[0];
            const currentProf = this.getProfile();
            const prof = {
              ...currentProf,
              name: row.name || currentProf.name,
              shortName: row.short_name || currentProf.shortName,
              tagline: row.tagline || currentProf.tagline,
              legalBadge: row.legal_badge || currentProf.legalBadge,
              decreeDate: row.decree_date || currentProf.decreeDate,
              address: row.address || currentProf.address,
              phone: row.phone || currentProf.phone,
              whatsapp: row.whatsapp || currentProf.whatsapp,
              email: row.email || currentProf.email,
              operationalHours: row.operational_hours || currentProf.operationalHours,
              mapsEmbed: row.maps_embed !== undefined && row.maps_embed !== null ? row.maps_embed : currentProf.mapsEmbed,
              logoUrl: row.logo_url !== undefined && row.logo_url !== null ? row.logo_url : currentProf.logoUrl,
              logoScaleDesktop: row.logo_scale_desktop ? parseInt(row.logo_scale_desktop, 10) : (currentProf.logoScaleDesktop || 48),
              logoScaleMobile: row.logo_scale_mobile ? parseInt(row.logo_scale_mobile, 10) : (currentProf.logoScaleMobile || 38),
              heroImageUrl: row.hero_image_url || currentProf.heroImageUrl,
              aboutBannerUrl: row.about_banner_url || currentProf.aboutBannerUrl,
              ctaBannerUrl: row.cta_banner_url || currentProf.ctaBannerUrl,
              stats: row.stats || currentProf.stats,
              mission: row.mission || currentProf.mission,
              values: row.values || currentProf.values
            };
            localStorage.setItem(KEYS.PROFILE, JSON.stringify(prof));
            hasUpdated = true;
          }

          // 2. Struktur Pengurus
          if (bRes.data && bRes.data.length > 0) {
            const localBoard = this.getBoard();
            const cloudBoard = bRes.data.map(b => ({
              id: b.id,
              name: b.name,
              position: b.position,
              period: b.period,
              order: b.display_order,
              bio: b.bio,
              photo: b.photo
            }));
            const merged = mergeById(localBoard, cloudBoard);
            merged.sort((a, b) => (a.order || 99) - (b.order || 99));
            localStorage.setItem(KEYS.BOARD, JSON.stringify(merged));
            hasUpdated = true;
          }

          // 3. Pendaftaran Anggota
          // Lewati jika user baru mengubah data selama fetch berjalan (hasil fetch sudah basi)
          if (rRes.data && rRes.data.length > 0 && _lastRegWrite <= startedAt) {
            const pending = getPending();
            const localRegs = this.getRegistrations();
            const cloudRegs = rRes.data.filter(r => !pending[r.id]).map(r => ({
              id: r.id,
              refCode: r.ref_code,
              fullName: r.full_name,
              phone: r.phone,
              rtrw: r.rtrw,
              reason: r.reason,
              date: r.date,
              status: r.status,
              notes: r.notes || ''
            }));
            const merged = mergeById(localRegs, cloudRegs);
            merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(merged));
            hasUpdated = true;
          }

          if (hasUpdated && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            try {
              window.dispatchEvent(new CustomEvent('kmp_data_synced', {
                detail: { timestamp: Date.now() }
              }));
            } catch (_) {}
          }
          return { success: true, message: 'Data terbaru berhasil ditarik dari Supabase Cloud.' };
        } catch (err) {
          console.error('[Supabase Sync Error]:', err?.message || err, err);
          return { success: false, message: err?.message || String(err) };
        } finally {
          _syncPromise = null;
        }
      })();

      return _syncPromise;
    },

    // Kirim satu perubahan pendaftaran ke cloud; tetap di antrean sampai cloud mengonfirmasi
    async pushRegistration(id, op) {
      const pending = getPending();
      pending[id] = op;
      setPending(pending);
      _lastRegWrite = Date.now();

      const client = this.getSupabaseClient();
      if (!client || !this.isCloudEnabled()) return false;

      let q;
      if (op === 'delete') {
        q = client.from('kmp_registrations').delete().eq('id', id);
      } else {
        const reg = this.getRegistrations().find(r => r.id === id);
        if (!reg) { const p = getPending(); delete p[id]; setPending(p); return true; }
        q = client.from('kmp_registrations').upsert(regToRow(reg));
      }

      const res = await executeCloudQuery(q, op === 'delete' ? 'Hapus Pendaftaran' : 'Simpan Pendaftaran');
      if (res.success) {
        const p = getPending(); delete p[id]; setPending(p);
        return true;
      }
      notifyCloudError(res.error?.message || String(res.error));
      return false;
    },

    async flushPending() {
      const ids = Object.keys(getPending());
      for (const id of ids) await this.pushRegistration(id, getPending()[id]);
    },

    // Reset ke Kondisi Pabrikan Default
    resetToDefault() {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(SEED_PROFILE));
      localStorage.setItem(KEYS.BOARD, JSON.stringify(SEED_BOARD));
      localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
      localStorage.setItem(KEYS.ADMIN_CREDENTIALS, JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }));
      localStorage.removeItem('kmp_categories');
      localStorage.removeItem('kmp_business_units');
      localStorage.removeItem('kmp_products');
    },

    // ==================== PROFILE & IMAGE CMS ====================
    getProfile() {
      try {
        const raw = localStorage.getItem(KEYS.PROFILE);
        return raw ? JSON.parse(raw) : SEED_PROFILE;
      } catch (e) {
        return SEED_PROFILE;
      }
    },

    saveProfile(profileData) {
      const current = this.getProfile();
      const updated = {
        ...current,
        ...profileData,
        logoScaleDesktop: parseInt(profileData.logoScaleDesktop !== undefined ? profileData.logoScaleDesktop : current.logoScaleDesktop, 10) || 48,
        logoScaleMobile: parseInt(profileData.logoScaleMobile !== undefined ? profileData.logoScaleMobile : current.logoScaleMobile, 10) || 38
      };
      
      // 1. Simpan 0ms ke Cache Lokal
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));

      // 2. Broadcast Event Lokal
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          window.dispatchEvent(new CustomEvent('kmp_data_synced', {
            detail: { key: 'profile', data: updated, timestamp: Date.now() }
          }));
        } catch (_) {}
      }

      // 3. Upsert ke Supabase Cloud
      const client = this.getSupabaseClient();
      if (client && this.isCloudEnabled()) {
        executeCloudQuery(
          client.from('kmp_profile').upsert({
            id: 1,
            name: updated.name,
            short_name: updated.shortName,
            tagline: updated.tagline,
            legal_badge: updated.legalBadge,
            address: updated.address,
            phone: updated.phone,
            whatsapp: updated.whatsapp,
            email: updated.email,
            operational_hours: updated.operationalHours,
            maps_embed: updated.mapsEmbed || '',
            logo_url: updated.logoUrl || '',
            logo_scale_desktop: updated.logoScaleDesktop,
            logo_scale_mobile: updated.logoScaleMobile,
            hero_image_url: updated.heroImageUrl || '',
            about_banner_url: updated.aboutBannerUrl || '',
            cta_banner_url: updated.ctaBannerUrl || '',
            stats: updated.stats || {},
            mission: updated.mission || [],
            values: updated.values || [],
            updated_at: new Date().toISOString()
          }),
          'Simpan Profil & Aset Gambar'
        );
      }

      return updated;
    },

    // ==================== BOARD MEMBERS (PENGURUS) ====================
    getBoard() {
      try {
        const raw = localStorage.getItem(KEYS.BOARD);
        const list = raw ? JSON.parse(raw) : SEED_BOARD;
        return list.sort((a, b) => (a.order || 99) - (b.order || 99));
      } catch (e) {
        return SEED_BOARD;
      }
    },

    saveBoardMember(member) {
      const list = this.getBoard();
      if (member.id) {
        const idx = list.findIndex(m => m.id === member.id);
        if (idx >= 0) list[idx] = { ...list[idx], ...member };
        else list.push(member);
      } else {
        member.id = 'board-' + Date.now();
        member.order = member.order || (list.length + 1);
        list.push(member);
      }
      localStorage.setItem(KEYS.BOARD, JSON.stringify(list));

      const client = this.getSupabaseClient();
      if (client && this.isCloudEnabled()) {
        executeCloudQuery(
          client.from('kmp_board_members').upsert({
            id: member.id,
            name: member.name,
            position: member.position,
            period: member.period,
            display_order: member.order,
            bio: member.bio,
            photo: member.photo
          }),
          'Simpan Pengurus'
        );
      }

      return member;
    },

    deleteBoardMember(id) {
      let list = this.getBoard();
      list = list.filter(m => m.id !== id);
      localStorage.setItem(KEYS.BOARD, JSON.stringify(list));

      const client = this.getSupabaseClient();
      if (client && this.isCloudEnabled()) {
        executeCloudQuery(
          client.from('kmp_board_members').delete().eq('id', id),
          'Hapus Pengurus'
        );
      }

      return list;
    },

    // ==================== REGISTRATIONS (PENDAFTARAN ANGGOTA WA) ====================
    getRegistrations() {
      try {
        const raw = localStorage.getItem(KEYS.REGISTRATIONS);
        const list = raw ? JSON.parse(raw) : SEED_REGISTRATIONS;
        return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      } catch (e) {
        return SEED_REGISTRATIONS;
      }
    },

    createRegistration(formData) {
      const list = this.getRegistrations();
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const ii = String(now.getMinutes()).padStart(2, '0');

      const newReg = {
        id: 'reg-' + Date.now(),
        refCode: generateRefCode(),
        fullName: String(formData.fullName || '').trim(),
        phone: String(formData.phone || '').trim(),
        rtrw: String(formData.rtrw || '').trim(),
        reason: String(formData.reason || '').trim(),
        date: `${yyyy}-${mm}-${dd} ${hh}:${ii}`,
        status: 'Menunggu Verifikasi',
        notes: 'Pendaftaran otomatis tersimpan via portal web.'
      };

      list.unshift(newReg);
      localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(list));
      this.pushRegistration(newReg.id, 'upsert');

      return newReg;
    },

    updateRegistration(id, updateData) {
      const list = this.getRegistrations();
      const idx = list.findIndex(r => r.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updateData };
        localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(list));
        this.pushRegistration(id, 'upsert');

        return list[idx];
      }
      return null;
    },

    deleteRegistration(id) {
      let list = this.getRegistrations();
      list = list.filter(r => r.id !== id);
      localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(list));
      this.pushRegistration(id, 'delete');

      return list;
    },

    // ==================== AUTH & BRUTE FORCE LIMITER ====================
    getBruteForceStatus() {
      try {
        const raw = localStorage.getItem(KEYS.LOGIN_ATTEMPTS);
        if (!raw) return { attempts: 0, isLocked: false, remainingSeconds: 0 };
        const data = JSON.parse(raw);
        const now = Date.now();
        if (data.lockedUntil && data.lockedUntil > now) {
          const remaining = Math.ceil((data.lockedUntil - now) / 1000);
          return { attempts: data.attempts, isLocked: true, remainingSeconds: remaining };
        }
        if (data.lockedUntil && data.lockedUntil <= now) {
          this.resetFailedAttempts();
          return { attempts: 0, isLocked: false, remainingSeconds: 0 };
        }
        return { attempts: data.attempts || 0, isLocked: false, remainingSeconds: 0 };
      } catch (e) {
        return { attempts: 0, isLocked: false, remainingSeconds: 0 };
      }
    },

    recordFailedAttempt() {
      const status = this.getBruteForceStatus();
      const attempts = (status.attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = Date.now() + 60 * 1000;
      }
      localStorage.setItem(KEYS.LOGIN_ATTEMPTS, JSON.stringify({ attempts, lockedUntil }));
      return { attempts, isLocked: attempts >= 5, remainingSeconds: attempts >= 5 ? 60 : 0 };
    },

    resetFailedAttempts() {
      localStorage.removeItem(KEYS.LOGIN_ATTEMPTS);
    },

    login(username, password) {
      const brute = this.getBruteForceStatus();
      if (brute.isLocked) {
        return {
          success: false,
          locked: true,
          message: `Terlalu banyak percobaan gagal. Akses formulir dikunci selama ${brute.remainingSeconds} detik.`
        };
      }

      let creds = { username: 'admin', password: 'admin123' };
      try {
        const raw = localStorage.getItem(KEYS.ADMIN_CREDENTIALS);
        if (raw) creds = JSON.parse(raw);
      } catch (e) {}

      if (username === creds.username && password === creds.password) {
        this.resetFailedAttempts();
        const session = { loggedIn: true, user: username, timestamp: Date.now() };
        localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(session));
        return { success: true };
      } else {
        const state = this.recordFailedAttempt();
        return {
          success: false,
          locked: state.isLocked,
          attempts: state.attempts,
          message: state.isLocked
            ? `Terlalu banyak percobaan gagal. Akses formulir dikunci selama ${state.remainingSeconds} detik.`
            : `Username atau kata sandi tidak cocok. (Sisa percobaan: ${5 - state.attempts})`
        };
      }
    },

    checkAuth() {
      try {
        const raw = localStorage.getItem(KEYS.AUTH_SESSION);
        if (!raw) return false;
        const session = JSON.parse(raw);
        return !!(session && session.loggedIn);
      } catch (e) {
        return false;
      }
    },

    logout() {
      localStorage.removeItem(KEYS.AUTH_SESSION);
    }
  };

  // Jalankan inisialisasi awal
  Store.init();

  // Daftarkan ke window
  window.KMPStore = Store;

})(window);
