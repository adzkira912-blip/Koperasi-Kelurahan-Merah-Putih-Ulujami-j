/**
 * public.js - Interaktivitas Halaman Publik Koperasi Merah Putih Ulujami
 * Mengelola Identitas Koperasi, Galeri Gambar Kustom, Profil Pengurus,
 * dan Alur Pendaftaran Calon Anggota WhatsApp Berprivasi Tinggi.
 */

document.addEventListener('DOMContentLoaded', () => {
  const Store = window.KMPStore;
  if (!Store) {
    console.error('KMPStore belum dimuat.');
    return;
  }

  // Elemen DOM Utama
  const elements = {
    // Profil & Header
    brandLogos: document.querySelectorAll('.brand-logo-img'),
    brandTitles: document.querySelectorAll('.brand-title-text'),
    brandSubtitles: document.querySelectorAll('.brand-subtitle-text'),
    heroTagline: document.getElementById('heroTagline'),
    legalBadges: document.querySelectorAll('.legal-badge-text'),
    navMenu: document.getElementById('navMenu'),
    navToggleBtn: document.getElementById('navToggleBtn'),
    
    // CMS Gambar Dinamis
    heroImageEl: document.getElementById('heroImageEl'),
    heroStatMembers: document.getElementById('heroStatMembers'),
    aboutBannerImg: document.getElementById('aboutBannerImg'),
    ctaSection: document.getElementById('ctaSection'),
    ctaWaBtn: document.getElementById('ctaWaBtn'),

    // Statistik Riil
    statMembers: document.getElementById('statMembers'),
    statRw: document.getElementById('statRw'),
    statSatisfaction: document.getElementById('statSatisfaction'),
    statAssets: document.getElementById('statAssets'),

    // Pengurus
    boardContainer: document.getElementById('boardContainer'),

    // Pendaftaran Anggota
    regForm: document.getElementById('registrationForm'),
    regSuccessModal: document.getElementById('regSuccessModal'),
    regSuccessCode: document.getElementById('regSuccessCode'),
    regSuccessSummary: document.getElementById('regSuccessSummary'),
    regWaBtn: document.getElementById('regWaBtn'),

    // Kontak & Operasional
    contactAddress: document.getElementById('contactAddress'),
    contactPhone: document.getElementById('contactPhone'),
    contactWaLink: document.getElementById('contactWaLink'),
    contactWaText: document.getElementById('contactWaText'),
    contactEmail: document.getElementById('contactEmail'),
    contactHours: document.getElementById('contactHours'),
    contactMapEmbed: document.getElementById('contactMapEmbed'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // Helper Notifikasi Toast
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'warning' ? 'toast-warning' : ''}`;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${Store.sanitize(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // 1. Tampilkan Identitas & Gambar CMS Koperasi
  function renderProfile() {
    const profile = Store.getProfile();

    // Terapkan Logo & Skala Responsif
    const logoSrc = profile.logoUrl && profile.logoUrl.trim() !== '' ? profile.logoUrl : Store.DEFAULT_LOGO_SVG;
    elements.brandLogos.forEach(img => {
      img.onerror = () => { img.onerror = null; img.src = Store.DEFAULT_LOGO_SVG; };
      img.src = logoSrc;
      img.alt = profile.name;
      if (img.closest('.site-header')) {
        if (window.innerWidth <= 860) {
          img.style.height = (profile.logoScaleMobile || 38) + 'px';
        } else {
          img.style.height = (profile.logoScaleDesktop || 48) + 'px';
        }
      } else if (img.closest('.footer-brand')) {
        img.style.height = '42px';
      }
    });

    // Sinkronisasi Favicon Dinamis Sesuai Logo Aktif atau Fallback ke Default
    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon) {
      favicon.href = logoSrc || Store.DEFAULT_LOGO_SVG;
    }

    // Nama & Tagline
    elements.brandTitles.forEach(el => el.textContent = profile.shortName || 'KKMP Ulujami');
    elements.brandSubtitles.forEach(el => el.textContent = profile.name);
    if (elements.heroTagline) elements.heroTagline.textContent = profile.tagline;
    elements.legalBadges.forEach(el => el.textContent = profile.legalBadge);

    // CMS Gambar: Hero Image
    if (elements.heroImageEl && profile.heroImageUrl) {
      elements.heroImageEl.src = profile.heroImageUrl;
    }

    // CMS Gambar: Banner Visi Misi & Profil
    if (elements.aboutBannerImg && profile.aboutBannerUrl) {
      elements.aboutBannerImg.src = profile.aboutBannerUrl;
    }

    // CMS Gambar: Background Section CTA
    if (elements.ctaSection) {
      if (profile.ctaBannerUrl && profile.ctaBannerUrl.trim() !== '') {
        elements.ctaSection.style.backgroundImage = `linear-gradient(rgba(143, 23, 34, 0.88), rgba(112, 15, 23, 0.92)), url('${profile.ctaBannerUrl}')`;
        elements.ctaSection.style.backgroundPosition = 'center';
        elements.ctaSection.style.backgroundSize = 'cover';
        elements.ctaSection.style.backgroundRepeat = 'no-repeat';
      } else {
        elements.ctaSection.style.backgroundImage = '';
      }
    }

    // Statistik Riil
    const activeCount = profile.stats?.activeMembers || 348;
    if (elements.statMembers) elements.statMembers.textContent = activeCount + '+';
    if (elements.heroStatMembers) elements.heroStatMembers.textContent = activeCount + '+ Warga Ulujami';
    if (elements.statRw) elements.statRw.textContent = profile.stats?.rwCount || 9;
    if (elements.statSatisfaction) elements.statSatisfaction.textContent = profile.stats?.satisfaction || '100%';
    if (elements.statAssets) elements.statAssets.textContent = profile.stats?.assetTurnover || 'Rp 1,45 M';

    // Kontak & Jam Operasional
    if (elements.contactAddress) elements.contactAddress.textContent = profile.address;
    if (elements.contactPhone) {
      elements.contactPhone.textContent = profile.phone;
      elements.contactPhone.href = `tel:${profile.phone.replace(/[^0-9]/g, '')}`;
    }
    if (elements.contactWaText) elements.contactWaText.textContent = profile.phone;
    if (elements.contactWaLink) {
      elements.contactWaLink.href = Store.buildWhatsAppUrl(profile.whatsapp, 'Halo Pengurus Koperasi Merah Putih Ulujami, saya ingin berkonsultasi mengenai pendaftaran dan layanan koperasi.');
    }
    if (elements.ctaWaBtn) {
      elements.ctaWaBtn.href = Store.buildWhatsAppUrl(profile.whatsapp, 'Halo Pengurus Koperasi Merah Putih Ulujami, saya ingin menanyakan informasi seputar keanggotaan koperasi.');
    }
    if (elements.contactEmail) {
      elements.contactEmail.textContent = profile.email;
      elements.contactEmail.href = `mailto:${profile.email}`;
    }
    if (elements.contactHours) elements.contactHours.textContent = profile.operationalHours;
    if (elements.contactMapEmbed && profile.mapsEmbed) elements.contactMapEmbed.src = profile.mapsEmbed;
  }

  // 2. Render Profil Pengurus & Dewan Pengawas
  function renderBoard() {
    if (!elements.boardContainer) return;
    const board = Store.getBoard();

    if (board.length === 0) {
      elements.boardContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--pure-white); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted); margin-bottom: 0;">Data struktur pengurus sedang disinkronkan.</p>
        </div>
      `;
      return;
    }

    elements.boardContainer.innerHTML = board.map(m => `
      <div class="board-card">
        <div class="board-photo-wrapper">
          <img class="board-photo" src="${Store.sanitize(m.photo)}" alt="${Store.sanitize(m.name)}" loading="lazy">
        </div>
        <h4 class="board-name">${Store.sanitize(m.name)}</h4>
        <div class="board-position">${Store.sanitize(m.position)}</div>
        <div class="board-period">${Store.sanitize(m.period)}</div>
        <p class="board-bio">${Store.sanitize(m.bio)}</p>
      </div>
    `).join('');
  }

  // 3. Alur Pendaftaran Calon Anggota via WhatsApp
  function setupRegistrationFlow() {
    if (!elements.regForm) return;

    elements.regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('regFullName')?.value.trim() || '';
      const phone = document.getElementById('regPhone')?.value.trim() || '';
      const rtrw = document.getElementById('regRTRW')?.value.trim() || '';
      const reason = document.getElementById('regReason')?.value.trim() || '';

      if (!fullName || !phone || !rtrw || !reason) {
        showToast('Mohon lengkapi seluruh kolom formulir pendaftaran.', 'warning');
        return;
      }

      // Validasi Nomor WhatsApp
      const cleanedPhone = phone.replace(/[^0-9]/g, '');
      if (cleanedPhone.length < 9) {
        showToast('Format nomor WhatsApp tidak valid (minimal 9 digit angka).', 'warning');
        return;
      }

      // Simpan Pendaftaran (0ms Instant Local-first + Cloud Upsert)
      const savedReg = Store.createRegistration({
        fullName,
        phone,
        rtrw,
        reason
      });

      // Siapkan Pesan WhatsApp Terformat
      const profile = Store.getProfile();
      const waMsg = Store.Templates.memberRegistration(savedReg);
      const waUrl = Store.buildWhatsAppUrl(profile.whatsapp, waMsg);

      // Tampilkan Modal Sukses Pendaftaran & Rangkuman Data
      if (elements.regSuccessModal && elements.regSuccessCode && elements.regWaBtn) {
        elements.regSuccessCode.textContent = savedReg.refCode;

        if (elements.regSuccessSummary) {
          elements.regSuccessSummary.innerHTML = `
            <div style="font-weight: 700; color: var(--deep-burgundy); margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Rangkuman Data Calon Anggota:</div>
            <div style="display: grid; grid-template-columns: 110px 1fr; gap: 4px;">
              <span style="color: var(--text-muted);">Nama Lengkap:</span>
              <strong>${Store.sanitize(savedReg.fullName)}</strong>
              <span style="color: var(--text-muted);">No. WhatsApp:</span>
              <span>${Store.sanitize(savedReg.phone)}</span>
              <span style="color: var(--text-muted);">Domisili:</span>
              <span>${Store.sanitize(savedReg.rtrw)}</span>
              <span style="color: var(--text-muted);">Alasan Minat:</span>
              <span>${Store.sanitize(savedReg.reason)}</span>
            </div>
          `;
        }

        elements.regWaBtn.onclick = () => {
          window.open(waUrl, '_blank');
        };
        elements.regSuccessModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      // Reset Formulir
      elements.regForm.reset();
      showToast('Formulir pendaftaran berhasil diproses & disimpan!', 'success');
    });
  }

  // Tutup Semua Modal
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }

  // Event Listener Penutup Modal
  document.querySelectorAll('.modal-close-btn, .btn-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // Mobile Menu Toggle
  if (elements.navToggleBtn && elements.navMenu) {
    elements.navToggleBtn.addEventListener('click', () => {
      elements.navMenu.classList.toggle('open');
    });

    elements.navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        elements.navMenu.classList.remove('open');
      });
    });
  }

  // Inisialisasi Tampilan
  renderProfile();
  renderBoard();
  setupRegistrationFlow();

  // Dengarkan Pembaruan Data Cloud dari Supabase & Mutasi Lokal
  window.addEventListener('kmp_data_synced', () => {
    renderProfile();
    renderBoard();
  });

  // Sinkronisasi Lintas Tab Otomatis (Saat Admin Mengubah Logo/Ukuran/Data di Tab Admin)
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('kmp_')) {
      renderProfile();
      renderBoard();
    }
  });

  // Dengarkan perubahan ukuran jendela untuk penyesuaian tinggi logo mobile/desktop
  window.addEventListener('resize', () => {
    const profile = Store.getProfile();
    elements.brandLogos.forEach(img => {
      if (img.closest('.site-header')) {
        img.style.height = (window.innerWidth <= 860 ? profile.logoScaleMobile || 38 : profile.logoScaleDesktop || 48) + 'px';
      }
    });
  });
});
