/**
 * admin.js - Controller Dashboard Pengurus Koperasi Merah Putih Ulujami
 * Mengelola 5 Modul Inti: Ringkasan KPI, Pendaftaran WhatsApp, Struktur Pengurus,
 * Full Custom Image CMS & Identitas Koperasi, dan Integrasi Database Cloud Supabase.
 */

document.addEventListener('DOMContentLoaded', () => {
  const Store = window.KMPStore;
  if (!Store) {
    console.error('KMPStore belum dimuat.');
    return;
  }

  // 1. Verifikasi Sesi Login
  if (!Store.checkAuth()) {
    window.location.href = 'login.html';
    return;
  }

  // State Manajemen Dashboard
  const state = {
    currentTab: 'overview',
    regFilterStatus: 'all',
    regSearch: '',
    activeFollowUpApplicant: null
  };

  // Elemen DOM
  const elements = {
    // Navigasi Tab
    navLinks: document.querySelectorAll('.admin-nav-link'),
    tabPanes: document.querySelectorAll('.admin-tab-pane'),
    pageTitle: document.getElementById('adminPageTitle'),
    mobileMenuBtn: document.getElementById('adminMobileMenuBtn'),
    sidebar: document.getElementById('adminSidebar'),
    logoutBtn: document.getElementById('adminLogoutBtn'),
    pendingBadge: document.getElementById('navPendingBadge'),

    // Modul 1: KPI Overview
    kpiApplicants: document.getElementById('kpiApplicants'),
    kpiPending: document.getElementById('kpiPending'),
    kpiVerified: document.getElementById('kpiVerified'),
    kpiBoard: document.getElementById('kpiBoard'),
    recentRegsTable: document.getElementById('recentRegsTableBody'),

    // Modul 2: Pendaftaran WA
    regTableBody: document.getElementById('regTableBody'),
    regSearchInput: document.getElementById('regSearchInput'),
    regStatusSelect: document.getElementById('regStatusSelect'),
    followUpModal: document.getElementById('followUpModal'),
    followUpApplicantName: document.getElementById('followUpApplicantName'),
    followUpRefCode: document.getElementById('followUpRefCode'),
    followUpTemplateSelect: document.getElementById('followUpTemplateSelect'),
    followUpMessagePreview: document.getElementById('followUpMessagePreview'),
    btnSendFollowUpWa: document.getElementById('btnSendFollowUpWa'),

    // Modul 3: Struktur Pengurus
    boardTableBody: document.getElementById('boardTableBody'),
    btnAddBoard: document.getElementById('btnAddBoard'),
    boardModal: document.getElementById('boardModal'),
    boardModalTitle: document.getElementById('boardModalTitle'),
    boardForm: document.getElementById('boardForm'),
    boardFormId: document.getElementById('boardFormId'),
    boardFormName: document.getElementById('boardFormName'),
    boardFormPosition: document.getElementById('boardFormPosition'),
    boardFormPeriod: document.getElementById('boardFormPeriod'),
    boardFormOrder: document.getElementById('boardFormOrder'),
    boardFormBio: document.getElementById('boardFormBio'),
    boardFormFileInput: document.getElementById('boardFormFileInput'),
    boardFormPhotoPreview: document.getElementById('boardFormPhotoPreview'),
    boardFormPhoto: document.getElementById('boardFormPhoto'),

    // Modul 4: Manajemen Gambar & Identitas CMS
    settingsForm: document.getElementById('settingsForm'),
    btnResetIdentity: document.getElementById('btnResetIdentity'),
    // 4.1 Logo & Favicon
    logoFileInput: document.getElementById('logoFileInput'),
    logoUrlInput: document.getElementById('logoUrlInput'),
    sliderDesktopScale: document.getElementById('sliderDesktopScale'),
    sliderMobileScale: document.getElementById('sliderMobileScale'),
    valDesktopScale: document.getElementById('valDesktopScale'),
    valMobileScale: document.getElementById('valMobileScale'),
    lblDesktopScale: document.getElementById('lblDesktopScale'),
    lblMobileScale: document.getElementById('lblMobileScale'),
    previewDesktopImg: document.getElementById('previewDesktopImg'),
    previewMobileImg: document.getElementById('previewMobileImg'),
    previewDesktopName: document.getElementById('previewDesktopName'),
    previewMobileName: document.getElementById('previewMobileName'),
    // 4.2 Hero Image
    heroFileInput: document.getElementById('heroFileInput'),
    heroUrlInput: document.getElementById('heroUrlInput'),
    previewHeroImg: document.getElementById('previewHeroImg'),
    // 4.3 Banner Tentang Kami
    aboutFileInput: document.getElementById('aboutFileInput'),
    aboutUrlInput: document.getElementById('aboutUrlInput'),
    previewAboutImg: document.getElementById('previewAboutImg'),
    // 4.4 Background Banner CTA
    ctaFileInput: document.getElementById('ctaFileInput'),
    ctaUrlInput: document.getElementById('ctaUrlInput'),
    previewCtaImg: document.getElementById('previewCtaImg'),
    // 4.5 Profil Resmi & Kontak
    setCoopName: document.getElementById('setCoopName'),
    setShortName: document.getElementById('setShortName'),
    setTagline: document.getElementById('setTagline'),
    setLegalBadge: document.getElementById('setLegalBadge'),
    setAddress: document.getElementById('setAddress'),
    setPhone: document.getElementById('setPhone'),
    setWhatsapp: document.getElementById('setWhatsapp'),
    setEmail: document.getElementById('setEmail'),
    setHours: document.getElementById('setHours'),
    setMapsEmbed: document.getElementById('setMapsEmbed'),

    // Modul 5: Database Cloud (Supabase)
    cloudStatusBadge: document.getElementById('cloudStatusBadge'),
    dbStatusDot: document.getElementById('dbStatusDot'),
    dbStatusLabel: document.getElementById('dbStatusLabel'),
    btnTestSupabaseConn: document.getElementById('btnTestSupabaseConn'),
    supabaseConfigForm: document.getElementById('supabaseConfigForm'),
    cfgSupabaseUrl: document.getElementById('cfgSupabaseUrl'),
    cfgSupabaseAnonKey: document.getElementById('cfgSupabaseAnonKey'),
    cfgSupabaseEnabled: document.getElementById('cfgSupabaseEnabled'),
    btnExportToSupabase: document.getElementById('btnExportToSupabase'),
    btnPullFromSupabase: document.getElementById('btnPullFromSupabase'),
    sqlSchemaPreview: document.getElementById('sqlSchemaPreview'),
    btnCopySqlSchema: document.getElementById('btnCopySqlSchema'),

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

  // ==================== NAVIGASI TAB MODUL ====================
  function switchTab(tabId) {
    state.currentTab = tabId;

    elements.navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
        if (elements.pageTitle) {
          elements.pageTitle.textContent = link.getAttribute('data-title') || 'Dashboard';
        }
      } else {
        link.classList.remove('active');
      }
    });

    elements.tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Refresh data tab aktif
    if (tabId === 'overview') renderOverview();
    else if (tabId === 'registrations') renderRegistrations();
    else if (tabId === 'board') renderBoard();
    else if (tabId === 'settings') renderSettings();
    else if (tabId === 'database') renderDatabase();

    // Tutup mobile sidebar
    if (elements.sidebar) elements.sidebar.classList.remove('open');
  }

  elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  if (elements.mobileMenuBtn && elements.sidebar) {
    elements.mobileMenuBtn.addEventListener('click', () => {
      elements.sidebar.classList.toggle('open');
    });
  }

  // Logout
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar dari Portal Pengurus?')) {
        Store.logout();
        window.location.href = 'login.html';
      }
    });
  }

  // ==================== MODUL 1: DASHBOARD OVERVIEW (KPI) ====================
  function renderOverview() {
    const regs = Store.getRegistrations();
    const board = Store.getBoard();
    const pendingList = regs.filter(r => r.status === 'Menunggu Verifikasi');
    const verifiedList = regs.filter(r => r.status === 'Diverifikasi' || r.status === 'Selesai');

    if (elements.kpiApplicants) elements.kpiApplicants.textContent = regs.length;
    if (elements.kpiPending) elements.kpiPending.textContent = pendingList.length;
    if (elements.kpiVerified) elements.kpiVerified.textContent = verifiedList.length;
    if (elements.kpiBoard) elements.kpiBoard.textContent = board.length;

    // Update badge notifikasi di navbar
    if (elements.pendingBadge) {
      elements.pendingBadge.textContent = pendingList.length;
      elements.pendingBadge.style.display = pendingList.length > 0 ? 'inline-block' : 'none';
    }

    // Tabel 5 Pendaftar Terbaru Memerlukan Tindak Lanjut
    if (elements.recentRegsTable) {
      const recent = regs.slice(0, 5);
      if (recent.length === 0) {
        elements.recentRegsTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">Belum ada pendaftaran masuk.</td></tr>`;
      } else {
        elements.recentRegsTable.innerHTML = recent.map(r => `
          <tr>
            <td><strong style="color: var(--deep-burgundy);">${Store.sanitize(r.refCode)}</strong></td>
            <td><strong>${Store.sanitize(r.fullName)}</strong></td>
            <td>${Store.sanitize(r.rtrw)}</td>
            <td><span class="status-pill status-${r.status.toLowerCase().replace(/\s+/g, '-')}">${Store.sanitize(r.status)}</span></td>
            <td>${Store.sanitize(r.date)}</td>
            <td>
              <button class="btn btn-wa btn-sm btn-quick-followup" data-id="${r.id}">
                Follow-up WA
              </button>
            </td>
          </tr>
        `).join('');

        elements.recentRegsTable.querySelectorAll('.btn-quick-followup').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openFollowUpModal(id);
          });
        });
      }
    }
  }

  // ==================== MODUL 2: PENDAFTARAN ANGGOTA WA ====================
  function renderRegistrations() {
    if (!elements.regTableBody) return;
    let list = Store.getRegistrations();

    // Filter status
    if (state.regFilterStatus !== 'all') {
      list = list.filter(r => r.status === state.regFilterStatus);
    }

    // Filter pencarian
    if (state.regSearch.trim() !== '') {
      const q = state.regSearch.toLowerCase();
      list = list.filter(r =>
        r.refCode.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.rtrw.toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    }

    if (list.length === 0) {
      elements.regTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">Tidak ada data pendaftaran yang sesuai kriteria.</td></tr>`;
      return;
    }

    elements.regTableBody.innerHTML = list.map(r => `
      <tr>
        <td>
          <span style="font-weight: 700; color: var(--deep-burgundy);">${Store.sanitize(r.refCode)}</span>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${Store.sanitize(r.date)}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${Store.sanitize(r.fullName)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${Store.sanitize(r.phone)}</div>
        </td>
        <td>${Store.sanitize(r.rtrw)}</td>
        <td>
          <div style="font-size: 0.85rem; max-width: 200px; white-space: normal;">${Store.sanitize(r.reason)}</div>
        </td>
        <td>
          <select class="form-control status-changer" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.8rem; width: auto;">
            <option value="Menunggu Verifikasi" ${r.status === 'Menunggu Verifikasi' ? 'selected' : ''}>Menunggu Verifikasi</option>
            <option value="Diverifikasi" ${r.status === 'Diverifikasi' ? 'selected' : ''}>Diverifikasi</option>
            <option value="Selesai" ${r.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
            <option value="Ditolak" ${r.status === 'Ditolak' ? 'selected' : ''}>Ditolak</option>
          </select>
        </td>
        <td>
          <input type="text" class="form-control note-editor" data-id="${r.id}" value="${Store.sanitize(r.notes || '')}" placeholder="Catatan internal..." style="padding: 4px 8px; font-size: 0.8rem; min-width: 140px;">
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-wa btn-sm btn-followup" data-id="${r.id}" title="Kirim Follow-up WhatsApp">
              Follow-up
            </button>
            <button class="btn btn-secondary btn-sm btn-delete-reg" data-id="${r.id}" title="Hapus Data">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Event Quick Status Changer
    elements.regTableBody.querySelectorAll('.status-changer').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const newStatus = e.currentTarget.value;
        Store.updateRegistration(id, { status: newStatus });
        showToast(`Status pendaftaran diperbarui menjadi: ${newStatus}`, 'success');
        renderOverview();
      });
    });

    // Event Note Editor
    elements.regTableBody.querySelectorAll('.note-editor').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const notes = e.currentTarget.value.trim();
        Store.updateRegistration(id, { notes });
        showToast('Catatan internal berhasil disimpan.', 'info');
      });
    });

    // Event Follow-up Modal
    elements.regTableBody.querySelectorAll('.btn-followup').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openFollowUpModal(id);
      });
    });

    // Event Hapus Pendaftaran
    elements.regTableBody.querySelectorAll('.btn-delete-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Apakah Anda yakin ingin menghapus data pendaftaran ini?')) {
          Store.deleteRegistration(id);
          renderRegistrations();
          renderOverview();
          showToast('Data pendaftaran berhasil dihapus.', 'info');
        }
      });
    });
  }

  // Modal Follow-up WhatsApp
  function openFollowUpModal(regId) {
    const reg = Store.getRegistrationById(regId);
    if (!reg || !elements.followUpModal) return;

    state.activeFollowUpApplicant = reg;
    const profile = Store.getProfile();

    if (elements.followUpApplicantName) elements.followUpApplicantName.textContent = reg.fullName;
    if (elements.followUpRefCode) elements.followUpRefCode.textContent = reg.refCode;

    // Set template default: inviteVerification
    if (elements.followUpTemplateSelect) {
      elements.followUpTemplateSelect.value = 'inviteVerification';
      updateFollowUpPreview('inviteVerification');
    }

    elements.followUpModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateFollowUpPreview(templateKey) {
    if (!state.activeFollowUpApplicant || !elements.followUpMessagePreview) return;
    const profile = Store.getProfile();
    const templateFn = Store.Templates.adminFollowUps[templateKey];
    if (templateFn) {
      elements.followUpMessagePreview.value = templateFn(state.activeFollowUpApplicant, profile);
    }
  }

  if (elements.followUpTemplateSelect) {
    elements.followUpTemplateSelect.addEventListener('change', (e) => {
      updateFollowUpPreview(e.target.value);
    });
  }

  if (elements.btnSendFollowUpWa) {
    elements.btnSendFollowUpWa.addEventListener('click', () => {
      if (!state.activeFollowUpApplicant || !elements.followUpMessagePreview) return;
      const phone = state.activeFollowUpApplicant.phone;
      const text = elements.followUpMessagePreview.value.trim();
      const url = Store.buildWhatsAppUrl(phone, text);

      window.open(url, '_blank');
      closeAllModals();
      showToast('Pesan tindak lanjut dialihkan ke WhatsApp.', 'success');
    });
  }

  // Filter & Search Registrasi
  if (elements.regSearchInput) {
    elements.regSearchInput.addEventListener('input', (e) => {
      state.regSearch = e.target.value;
      renderRegistrations();
    });
  }

  if (elements.regStatusSelect) {
    elements.regStatusSelect.addEventListener('change', (e) => {
      state.regFilterStatus = e.target.value;
      renderRegistrations();
    });
  }

  // ==================== MODUL 3: STRUKTUR PENGURUS ====================
  function renderBoard() {
    if (!elements.boardTableBody) return;
    const board = Store.getBoard();

    if (board.length === 0) {
      elements.boardTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">Belum ada pengurus terdaftar.</td></tr>`;
      return;
    }

    elements.boardTableBody.innerHTML = board.map(m => `
      <tr>
        <td>
          <img src="${Store.sanitize(m.photo)}" alt="${Store.sanitize(m.name)}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: #eee; border: 1px solid var(--border-color);">
        </td>
        <td>
          <strong>${Store.sanitize(m.name)}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 250px;">${Store.sanitize(m.bio)}</div>
        </td>
        <td><span class="status-pill status-diverifikasi">${Store.sanitize(m.position)}</span></td>
        <td>${Store.sanitize(m.period)}</td>
        <td>${m.order}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm btn-edit-board" data-id="${m.id}" title="Edit Profil">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm btn-delete-board" data-id="${m.id}" title="Hapus Pengurus">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Event Edit Pengurus
    elements.boardTableBody.querySelectorAll('.btn-edit-board').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openBoardModal(id);
      });
    });

    // Event Hapus Pengurus
    elements.boardTableBody.querySelectorAll('.btn-delete-board').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Apakah Anda yakin ingin menghapus profil pengurus ini?')) {
          Store.deleteBoardMember(id);
          renderBoard();
          renderOverview();
          showToast('Profil pengurus berhasil dihapus.', 'info');
        }
      });
    });
  }

  function openBoardModal(boardId = null) {
    if (!elements.boardModal) return;
    const isEdit = !!boardId;

    if (elements.boardModalTitle) {
      elements.boardModalTitle.textContent = isEdit ? 'Edit Profil Pengurus / Pengawas' : 'Tambah Profil Pengurus Baru';
    }

    if (isEdit) {
      const m = Store.getBoard().find(x => x.id === boardId);
      if (!m) return;
      if (elements.boardFormId) elements.boardFormId.value = m.id;
      if (elements.boardFormName) elements.boardFormName.value = m.name;
      if (elements.boardFormPosition) elements.boardFormPosition.value = m.position;
      if (elements.boardFormPeriod) elements.boardFormPeriod.value = m.period;
      if (elements.boardFormOrder) elements.boardFormOrder.value = m.order;
      if (elements.boardFormBio) elements.boardFormBio.value = m.bio;
      if (elements.boardFormPhoto) elements.boardFormPhoto.value = m.photo;
      if (elements.boardFormPhotoPreview) elements.boardFormPhotoPreview.src = m.photo;
    } else {
      if (elements.boardForm) elements.boardForm.reset();
      if (elements.boardFormId) elements.boardFormId.value = '';
      if (elements.boardFormPeriod) elements.boardFormPeriod.value = '2024 – 2027';
      if (elements.boardFormOrder) elements.boardFormOrder.value = Store.getBoard().length + 1;
      const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
      if (elements.boardFormPhoto) elements.boardFormPhoto.value = defaultAvatar;
      if (elements.boardFormPhotoPreview) elements.boardFormPhotoPreview.src = defaultAvatar;
    }

    elements.boardModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (elements.btnAddBoard) {
    elements.btnAddBoard.addEventListener('click', () => openBoardModal());
  }

  // Dual-Input Foto Pengurus (Kompresi Ringan + URL Manual)
  if (elements.boardFormFileInput && elements.boardFormPhoto && elements.boardFormPhotoPreview) {
    elements.boardFormFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressedBase64 = await Store.compressImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.85 });
        elements.boardFormPhoto.value = compressedBase64;
        elements.boardFormPhotoPreview.src = compressedBase64;
        showToast('Foto pengurus berhasil diunggah & dikompresi.', 'success');
      } catch (err) {
        showToast('Gagal memproses file foto pengurus.', 'warning');
      }
    });

    elements.boardFormPhoto.addEventListener('input', (e) => {
      elements.boardFormPhotoPreview.src = e.target.value;
    });
  }

  // Submit Form Pengurus
  if (elements.boardForm) {
    elements.boardForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const memberData = {
        name: elements.boardFormName?.value.trim() || '',
        position: elements.boardFormPosition?.value.trim() || '',
        period: elements.boardFormPeriod?.value.trim() || '2024 – 2027',
        order: parseInt(elements.boardFormOrder?.value || '1', 10),
        bio: elements.boardFormBio?.value.trim() || '',
        photo: elements.boardFormPhoto?.value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      };

      const existingId = elements.boardFormId?.value;
      if (existingId && existingId.trim() !== '') {
        memberData.id = existingId;
      }

      Store.saveBoardMember(memberData);
      closeAllModals();
      renderBoard();
      renderOverview();
      showToast('Profil pengurus berhasil disimpan & disinkronkan.', 'success');
    });
  }

  // ==================== MODUL 4: MANAJEMEN GAMBAR & IDENTITAS CMS ====================
  function renderSettings() {
    const profile = Store.getProfile();

    // 4.1 Logo & Favicon
    const logoSrc = profile.logoUrl && profile.logoUrl.trim() !== '' ? profile.logoUrl : Store.DEFAULT_LOGO_SVG;
    if (elements.logoUrlInput) elements.logoUrlInput.value = profile.logoUrl || '';
    if (elements.previewDesktopImg) {
      elements.previewDesktopImg.src = logoSrc;
      elements.previewDesktopImg.style.height = (profile.logoScaleDesktop || 48) + 'px';
    }
    if (elements.previewMobileImg) {
      elements.previewMobileImg.src = logoSrc;
      elements.previewMobileImg.style.height = (profile.logoScaleMobile || 38) + 'px';
    }

    if (elements.sliderDesktopScale) elements.sliderDesktopScale.value = profile.logoScaleDesktop || 48;
    if (elements.sliderMobileScale) elements.sliderMobileScale.value = profile.logoScaleMobile || 38;
    if (elements.valDesktopScale) elements.valDesktopScale.textContent = (profile.logoScaleDesktop || 48) + 'px';
    if (elements.valMobileScale) elements.valMobileScale.textContent = (profile.logoScaleMobile || 38) + 'px';
    if (elements.lblDesktopScale) elements.lblDesktopScale.textContent = (profile.logoScaleDesktop || 48) + 'px';
    if (elements.lblMobileScale) elements.lblMobileScale.textContent = (profile.logoScaleMobile || 38) + 'px';
    if (elements.previewDesktopName) elements.previewDesktopName.textContent = profile.shortName || 'KKMP Ulujami';
    if (elements.previewMobileName) elements.previewMobileName.textContent = profile.shortName || 'KKMP Ulujami';

    // 4.2 Hero Image
    if (elements.heroUrlInput) elements.heroUrlInput.value = profile.heroImageUrl || '';
    if (elements.previewHeroImg) elements.previewHeroImg.src = profile.heroImageUrl || '';

    // 4.3 About Banner
    if (elements.aboutUrlInput) elements.aboutUrlInput.value = profile.aboutBannerUrl || '';
    if (elements.previewAboutImg) elements.previewAboutImg.src = profile.aboutBannerUrl || '';

    // 4.4 CTA Banner
    if (elements.ctaUrlInput) elements.ctaUrlInput.value = profile.ctaBannerUrl || '';
    if (elements.previewCtaImg) elements.previewCtaImg.src = profile.ctaBannerUrl || '';

    // 4.5 Identitas & Kontak
    if (elements.setCoopName) elements.setCoopName.value = profile.name;
    if (elements.setShortName) elements.setShortName.value = profile.shortName;
    if (elements.setTagline) elements.setTagline.value = profile.tagline;
    if (elements.setLegalBadge) elements.setLegalBadge.value = profile.legalBadge;
    if (elements.setAddress) elements.setAddress.value = profile.address;
    if (elements.setPhone) elements.setPhone.value = profile.phone;
    if (elements.setWhatsapp) elements.setWhatsapp.value = profile.whatsapp;
    if (elements.setEmail) elements.setEmail.value = profile.email;
    if (elements.setHours) elements.setHours.value = profile.operationalHours;
    if (elements.setMapsEmbed) elements.setMapsEmbed.value = profile.mapsEmbed || '';
  }

  // Pasang Live Handler Dual-Input CMS Gambar (File Upload Kompresi + Input URL)
  function setupImageUploader({ fileInput, urlInput, previewImg, maxWidth = 1000, label = 'Gambar' }) {
    if (!fileInput || !urlInput) return;

    // Aksi Unggah Berkas File Lokal
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressedBase64 = await Store.compressImage(file, { maxWidth, quality: 0.82 });
        urlInput.value = compressedBase64;
        if (previewImg) previewImg.src = compressedBase64;
        showToast(`${label} berhasil diproses & dikompresi.`, 'success');
      } catch (err) {
        showToast(`Gagal memproses file ${label}.`, 'warning');
      }
    });

    // Aksi Tempel URL Langsung
    urlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (previewImg && val !== '') {
        previewImg.src = val;
      }
    });
  }

  // Setup 4 Slot Gambar Kustom
  setupImageUploader({
    fileInput: elements.logoFileInput,
    urlInput: elements.logoUrlInput,
    previewImg: elements.previewDesktopImg,
    maxWidth: 600,
    keepPng: true,
    maxKb: 350,
    label: 'Logo Koperasi'
  });

  if (elements.logoUrlInput && elements.previewMobileImg) {
    elements.logoUrlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      elements.previewMobileImg.src = val !== '' ? val : Store.DEFAULT_LOGO_SVG;
    });
    elements.logoFileInput?.addEventListener('change', () => {
      setTimeout(() => {
        if (elements.logoUrlInput?.value) {
          elements.previewMobileImg.src = elements.logoUrlInput.value;
        }
      }, 200);
    });
  }

  setupImageUploader({
    fileInput: elements.heroFileInput,
    urlInput: elements.heroUrlInput,
    previewImg: elements.previewHeroImg,
    maxWidth: 1000,
    label: 'Foto Hero Beranda'
  });

  setupImageUploader({
    fileInput: elements.aboutFileInput,
    urlInput: elements.aboutUrlInput,
    previewImg: elements.previewAboutImg,
    maxWidth: 1000,
    label: 'Banner Profil Tentang Kami'
  });

  setupImageUploader({
    fileInput: elements.ctaFileInput,
    urlInput: elements.ctaUrlInput,
    previewImg: elements.previewCtaImg,
    maxWidth: 1200,
    label: 'Background CTA Banner'
  });

  // Slider Skala Logo Desktop & Mobile (Live Realtime Sync ke Tab Publik)
  if (elements.sliderDesktopScale) {
    elements.sliderDesktopScale.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 48;
      if (elements.valDesktopScale) elements.valDesktopScale.textContent = val + 'px';
      if (elements.lblDesktopScale) elements.lblDesktopScale.textContent = val + 'px';
      if (elements.previewDesktopImg) elements.previewDesktopImg.style.height = val + 'px';

      // Live update localStorage agar tab index.html langsung menerima event storage seketika
      const prof = Store.getProfile();
      prof.logoScaleDesktop = val;
      localStorage.setItem('kmp_profile', JSON.stringify(prof));
    });

    elements.sliderDesktopScale.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10) || 48;
      Store.saveProfile({ logoScaleDesktop: val });
    });
  }

  if (elements.sliderMobileScale) {
    elements.sliderMobileScale.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 38;
      if (elements.valMobileScale) elements.valMobileScale.textContent = val + 'px';
      if (elements.lblMobileScale) elements.lblMobileScale.textContent = val + 'px';
      if (elements.previewMobileImg) elements.previewMobileImg.style.height = val + 'px';

      const prof = Store.getProfile();
      prof.logoScaleMobile = val;
      localStorage.setItem('kmp_profile', JSON.stringify(prof));
    });

    elements.sliderMobileScale.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10) || 38;
      Store.saveProfile({ logoScaleMobile: val });
    });
  }

  // Reset Identitas ke Default
  if (elements.btnResetIdentity) {
    elements.btnResetIdentity.addEventListener('click', () => {
      if (confirm('Kembalikan seluruh identitas dan konfigurasi gambar ke pengaturan awal?')) {
        Store.resetProfile();
        renderSettings();
        showToast('Identitas koperasi telah dikembalikan ke pengaturan awal.', 'info');
      }
    });
  }

  // Simpan Form Pengaturan Identitas & Gambar CMS
  if (elements.settingsForm) {
    elements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const existing = Store.getProfile();
      const updated = {
        ...existing,
        name: elements.setCoopName?.value.trim() || existing.name,
        shortName: elements.setShortName?.value.trim() || existing.shortName,
        tagline: elements.setTagline?.value.trim() || existing.tagline,
        legalBadge: elements.setLegalBadge?.value.trim() || existing.legalBadge,
        address: elements.setAddress?.value.trim() || existing.address,
        phone: elements.setPhone?.value.trim() || existing.phone,
        whatsapp: elements.setWhatsapp?.value.trim().replace(/[^0-9]/g, '') || existing.whatsapp,
        email: elements.setEmail?.value.trim() || existing.email,
        operationalHours: elements.setHours?.value.trim() || existing.operationalHours,
        mapsEmbed: elements.setMapsEmbed?.value.trim() || existing.mapsEmbed,
        // Gambar CMS
        logoUrl: elements.logoUrlInput?.value.trim() || '',
        logoScaleDesktop: parseInt(elements.sliderDesktopScale?.value || '48', 10),
        logoScaleMobile: parseInt(elements.sliderMobileScale?.value || '38', 10),
        heroImageUrl: elements.heroUrlInput?.value.trim() || existing.heroImageUrl,
        aboutBannerUrl: elements.aboutUrlInput?.value.trim() || existing.aboutBannerUrl,
        ctaBannerUrl: elements.ctaUrlInput?.value.trim() || existing.ctaBannerUrl
      };

      Store.saveProfile(updated);
      renderSettings();
      showToast('Seluruh identitas dan gambar CMS berhasil disimpan & disinkronkan ke cloud!', 'success');
    });
  }

  // ==================== MODUL 5: DATABASE CLOUD (SUPABASE) ====================
  function renderDatabase() {
    const cfg = Store.getSupabaseConfig();
    const isReady = Store.isCloudEnabled();

    if (elements.cfgSupabaseUrl) elements.cfgSupabaseUrl.value = cfg.url || '';
    if (elements.cfgSupabaseAnonKey) elements.cfgSupabaseAnonKey.value = cfg.anonKey || '';
    if (elements.cfgSupabaseEnabled) elements.cfgSupabaseEnabled.checked = !!cfg.isEnabled;

    if (elements.sqlSchemaPreview) {
      elements.sqlSchemaPreview.value = Store.SUPABASE_SQL_SCHEMA.trim();
    }

    if (elements.dbStatusDot && elements.dbStatusLabel && elements.cloudStatusBadge) {
      if (isReady && cfg.isEnabled) {
        elements.dbStatusDot.style.background = '#10B981';
        elements.dbStatusLabel.innerHTML = '<span style="color:#10B981;">Terhubung ke Supabase Cloud (Online)</span>';
        elements.cloudStatusBadge.style.display = 'inline-block';
        elements.cloudStatusBadge.textContent = 'Online';
      } else {
        elements.dbStatusDot.style.background = '#9CA3AF';
        elements.dbStatusLabel.innerHTML = '<span style="color:#6B7280;">Mode Lokal (Offline Fallback)</span>';
        elements.cloudStatusBadge.style.display = 'none';
      }
    }
  }

  // Form Simpan Kredensial Supabase
  if (elements.supabaseConfigForm) {
    elements.supabaseConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const url = elements.cfgSupabaseUrl?.value.trim() || '';
      const anonKey = elements.cfgSupabaseAnonKey?.value.trim() || '';
      const isEnabled = elements.cfgSupabaseEnabled?.checked ?? true;

      if (!url.startsWith('http')) {
        showToast('URL Supabase harus diawali dengan https://', 'warning');
        return;
      }

      Store.saveSupabaseConfig({ url, anonKey, isEnabled });
      renderDatabase();
      showToast('Konfigurasi database cloud berhasil disimpan & diterapkan!', 'success');
    });
  }

  // Uji Koneksi Supabase
  if (elements.btnTestSupabaseConn) {
    elements.btnTestSupabaseConn.addEventListener('click', async () => {
      elements.btnTestSupabaseConn.disabled = true;
      elements.btnTestSupabaseConn.innerHTML = 'Menguji Koneksi...';

      const result = await Store.testConnection();
      elements.btnTestSupabaseConn.disabled = false;
      elements.btnTestSupabaseConn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Uji Koneksi
      `;

      if (result.success) {
        showToast(result.message, 'success');
        renderDatabase();
      } else {
        showToast(result.message, 'warning');
      }
    });
  }

  // Ekspor Semua Data Lokal ke Supabase Cloud
  if (elements.btnExportToSupabase) {
    elements.btnExportToSupabase.addEventListener('click', async () => {
      if (!confirm('Apakah Anda ingin mengunggah seluruh data lokal ke database Supabase? Data yang ada di tabel cloud akan diperbarui.')) {
        return;
      }

      elements.btnExportToSupabase.disabled = true;
      elements.btnExportToSupabase.textContent = 'Mengunggah Data ke Cloud...';

      const res = await Store.syncToSupabase();
      elements.btnExportToSupabase.disabled = false;
      elements.btnExportToSupabase.textContent = 'Ekspor Semua Data ke Cloud';

      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(`Gagal ekspor: ${res.message}`, 'warning');
      }
    });
  }

  // Tarik Data Terbaru dari Supabase Cloud
  if (elements.btnPullFromSupabase) {
    elements.btnPullFromSupabase.addEventListener('click', async () => {
      elements.btnPullFromSupabase.disabled = true;
      elements.btnPullFromSupabase.textContent = 'Menarik Data Cloud...';

      const res = await Store.syncFromSupabase();
      elements.btnPullFromSupabase.disabled = false;
      elements.btnPullFromSupabase.textContent = 'Tarik Data dari Supabase';

      if (res.success) {
        showToast(res.message, 'success');
        renderOverview();
        renderRegistrations();
        renderBoard();
        renderSettings();
      } else {
        showToast(`Gagal tarik data: ${res.message}`, 'warning');
      }
    });
  }

  // Salin Skema SQL ke Clipboard
  if (elements.btnCopySqlSchema && elements.sqlSchemaPreview) {
    elements.btnCopySqlSchema.addEventListener('click', () => {
      elements.sqlSchemaPreview.select();
      navigator.clipboard.writeText(elements.sqlSchemaPreview.value).then(() => {
        showToast('Skrip skema SQL berhasil disalin ke clipboard!', 'success');
      }).catch(() => {
        showToast('Gagal menyalin skrip SQL.', 'warning');
      });
    });
  }

  // ==================== SUBSKRIPSI REALTIME SUPABASE ====================
  function setupRealtimeListener() {
    const client = Store.getSupabaseClient();
    if (!client) return;

    try {
      client
        .channel('admin_registrations_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'kmp_registrations' },
          (payload) => {
            const newReg = payload.new;
            if (newReg) {
              showToast(`Pendaftaran Baru Masuk: ${newReg.full_name || 'Calon Anggota'} (${newReg.ref_code})!`, 'success');
              // Sinkronkan ke store lokal
              Store.syncFromSupabase().then(() => {
                renderOverview();
                renderRegistrations();
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('[Realtime Subscription]:', e);
    }
  }

  // ==================== HELPER PENUTUP MODAL ====================
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-close-btn, .btn-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // ==================== INISIALISASI DASHBOARD ====================
  switchTab('overview');
  renderDatabase();

  // Jalankan sinkronisasi background saat dashboard dibuka
  Store.syncFromSupabase().then(() => {
    renderOverview();
    renderRegistrations();
    renderBoard();
    renderSettings();
    renderDatabase();
    setupRealtimeListener();
  });

  // Tampilkan error tulis/baca cloud (sebelumnya hanya masuk console)
  window.addEventListener('kmp_cloud_error', (e) => {
    showToast(`Cloud gagal: ${e.detail?.message || 'tidak diketahui'}. Perubahan tersimpan lokal & akan dicoba lagi.`, 'warning');
  });

  // Dengarkan event sinkronisasi data cloud
  window.addEventListener('kmp_data_synced', () => {
    renderOverview();
    renderRegistrations();
    renderBoard();
    renderSettings();
    renderDatabase();
  });

  // Sinkronisasi Lintas Tab Otomatis
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('kmp_')) {
      renderOverview();
      renderRegistrations();
      renderBoard();
      renderSettings();
      renderDatabase();
    }
  });
});
