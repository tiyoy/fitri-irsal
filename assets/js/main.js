/* ==========================================================================
   Undangan Pernikahan Fitri & Irsal — Vanilla JavaScript (tanpa library)
   ========================================================================== */

(function () {
    'use strict';

    /* ==========================================================================
       1. MODAL SAMPUL + MUSIK
       ========================================================================== */

    var modal = document.getElementById('modalx');
    var btnOpen = document.getElementById('btn-open');
    var song = document.getElementById('song');

    // kunci scroll saat sampul masih tampil
    document.body.style.overflow = 'hidden';

    btnOpen.addEventListener('click', function () {
        modal.classList.add('removeModals');
        document.body.style.overflow = 'auto';
        // musik baru mulai diputar setelah tombol Buka Undangan ditekan
        playSong();
        setAudioIcon(true);
    });

    function playSong() {
        var promise = song.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () { /* autoplay ditolak browser */ });
        }
    }

    /* ==========================================================================
       2. NAMA TAMU DARI URL (?to=Nama)
       ========================================================================== */

    var urlParams = new URLSearchParams(window.location.search);
    var guestName = urlParams.get('to') || '';
    document.querySelector('.wdp-name').textContent = guestName;

    // isi otomatis kolom nama pada form ucapan dari URL (?to=Nama);
    // bila URL kosong, kolom nama ikut kosong
    var wishNameField = document.querySelector('#comments input[name="name"]');
    if (wishNameField && guestName) {
        wishNameField.value = guestName;
    }

    /* ==========================================================================
       3. COUNTDOWN
       ========================================================================== */

    var countdownEl = document.getElementById('countdown');
    var targetDate = new Date(countdownEl.getAttribute('data-date')).getTime();
    var elDays = countdownEl.querySelector('[data-days]');
    var elHours = countdownEl.querySelector('[data-hours]');
    var elMinutes = countdownEl.querySelector('[data-minutes]');
    var elSeconds = countdownEl.querySelector('[data-seconds]');

    function updateCountdown() {
        var diff = targetDate - new Date().getTime();
        if (diff <= 0) {
            diff = 0;
        }
        elDays.textContent = Math.floor(diff / 86400000);
        elHours.textContent = Math.floor((diff % 86400000) / 3600000);
        elMinutes.textContent = Math.floor((diff % 3600000) / 60000);
        elSeconds.textContent = Math.floor((diff % 60000) / 1000);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ==========================================================================
       4. SALIN NO. REKENING (dipanggil dari atribut onclick)
       ========================================================================== */

    window.copyText = function (el) {
        var content = el.querySelector('.copy-content').textContent;

        var temp = document.createElement('textarea');
        document.body.appendChild(temp);
        temp.value = content.replace(/<br ?\/?>/g, '\n');
        temp.select();
        document.execCommand('copy');
        temp.remove();

        var original = el.innerHTML;
        el.innerHTML = el.getAttribute('data-message');
        setTimeout(function () {
            el.innerHTML = original;
        }, 10000);
    };

    /* ==========================================================================
       5. GALERI — CAROUSEL + LIGHTBOX
       ========================================================================== */

    var carousel = document.getElementById('gallery-carousel');
    var viewport = carousel.querySelector('.carousel-viewport');
    var track = carousel.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(track.children);
    var slideCount = slides.length;
    var speed = 500;
    var autoplayDelay = 5000;
    var autoplayTimer = null;
    var autoplayDisabled = false;

    // clone slide pertama & terakhir untuk loop tanpa putus
    var firstClone = slides[0].cloneNode(true);
    var lastClone = slides[slideCount - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    var currentIndex = 1;
    var isAnimating = false;

    function setPosition(animate) {
        track.style.transition = animate ? 'transform ' + speed + 'ms ease' : 'none';
        track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';
    }

    function goTo(index) {
        if (isAnimating) {
            return;
        }
        isAnimating = true;
        currentIndex = index;
        setPosition(true);
    }

    function nextSlide() {
        goTo(currentIndex + 1);
    }

    function prevSlide() {
        goTo(currentIndex - 1);
    }

    track.addEventListener('transitionend', function () {
        isAnimating = false;
        if (currentIndex === slideCount + 1) {
            currentIndex = 1;
            setPosition(false);
        } else if (currentIndex === 0) {
            currentIndex = slideCount;
            setPosition(false);
        }
    });

    setPosition(false);

    function startAutoplay() {
        if (autoplayDisabled || autoplayTimer) {
            return;
        }
        autoplayTimer = setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }

    function disableAutoplay() {
        autoplayDisabled = true;
        stopAutoplay();
    }

    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);

    carousel.querySelector('.carousel-prev').addEventListener('click', function () {
        disableAutoplay();
        prevSlide();
    });

    carousel.querySelector('.carousel-next').addEventListener('click', function () {
        disableAutoplay();
        nextSlide();
    });

    // dukungan geser (swipe) di layar sentuh
    var touchStartX = 0;
    var touchDiffX = 0;

    viewport.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        stopAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchmove', function (e) {
        touchDiffX = e.touches[0].clientX - touchStartX;
    }, { passive: true });

    viewport.addEventListener('touchend', function () {
        if (Math.abs(touchDiffX) > 40) {
            disableAutoplay();
            if (touchDiffX < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        touchDiffX = 0;
        startAutoplay();
    });

    startAutoplay();

    /* ---------- Lightbox ---------- */

    var lightbox = document.getElementById('lightbox');
    var lightboxImage = lightbox.querySelector('.lightbox-image');
    var lightboxTitle = lightbox.querySelector('.lightbox-title');
    var lightboxLinks = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-track a[data-lightbox]'));
    var lightboxIndex = 0;

    function realIndex(index) {
        // abaikan slide clone saat memetakan index lightbox
        if (index >= slideCount) {
            return index - slideCount;
        }
        if (index < 0) {
            return index + slideCount;
        }
        return index;
    }

    function showLightbox(index) {
        lightboxIndex = realIndex(index);
        // +1 karena posisi 0 pada daftar adalah slide clone
        var link = lightboxLinks[lightboxIndex + 1];
        lightboxImage.src = link.getAttribute('href');
        lightboxImage.alt = link.getAttribute('title') || '';
        lightboxTitle.textContent = link.getAttribute('title') || '';
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        lightboxImage.src = '';
        document.body.style.overflow = 'auto';
    }

    lightboxLinks.forEach(function (link, index) {
        // posisi 0 = clone terakhir, 1..slideCount = slide asli, terakhir = clone pertama
        var dataIndex = (index - 1 + slideCount) % slideCount;
        link.addEventListener('click', function (e) {
            e.preventDefault();
            disableAutoplay();
            showLightbox(dataIndex);
        });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () {
        showLightbox(lightboxIndex - 1);
    });

    lightbox.querySelector('.lightbox-next').addEventListener('click', function () {
        showLightbox(lightboxIndex + 1);
    });

    document.addEventListener('keydown', function (e) {
        if (lightbox.style.display !== 'block') {
            return;
        }
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showLightbox(lightboxIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showLightbox(lightboxIndex + 1);
        }
    });

    /* ==========================================================================
       6. BUKU TAMU / UCAPAN — localStorage (tanpa API key)
       ========================================================================== */

    var STORAGE_KEY = 'wedding_guestbook';
    var guestbookList = document.querySelector('.guestbook-list');
    var commentForm = document.getElementById('comments');

    // ucapan bawaan yang selalu tampil bila belum ada data tamu
    var DEFAULT_WISHES = [
        {
            name: 'Cecep Maulana',
            attendance: 'hadir',
            message: 'Selamat menempuh hidup baru untuk kedua mempelai! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.',
            timestamp: '2 jam yang lalu',
            confirm: 'Hadir'
        },
        {
            name: 'Siti Nurhaliza',
            attendance: 'hadir',
            message: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fii khoir. Lancar sampai hari H yaa cantik!",
            timestamp: '5 jam yang lalu',
            confirm: 'Hadir'
        },
        {
            name: 'Andi & Sarah',
            attendance: 'ragu',
            message: 'Happy wedding Alamsyah & Aulia! Semoga cinta kalian selalu bersemi abadi dan saling melengkapi selamanya.',
            timestamp: '1 hari yang lalu',
            confirm: 'Mungkin Hadir'
        }
    ];

    // cache memori + localStorage. Bila localStorage diblokir browser
    // (mis. dibuka via file://, cookies diblokir, atau mode privat),
    // ucapan tetap tersimpan di memori dan tampil selama sesi ini.
    var wishCache = null;

    function getWishes() {
        if (wishCache !== null) {
            return wishCache.slice();
        }
        try {
            wishCache = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            wishCache = null;
        }
        if (!wishCache || wishCache.length === 0) {
            wishCache = DEFAULT_WISHES.slice();
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(wishCache));
            } catch (e) {
                // penyimpanan permanen gagal: data tetap ada di cache memori
            }
        }
        return wishCache.slice();
    }

    function saveWishes(wishes) {
        wishCache = wishes.slice();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
        } catch (e) {
            // penyimpanan permanen gagal: data tetap ada di cache memori
        }
    }

    function renderWish(wish) {
        var main = document.createElement('div');
        var second = document.createElement('div');
        var link = document.createElement('a');
        var span = document.createElement('span');
        var icon = document.createElement('i');
        var message = document.createElement('div');

        main.setAttribute('class', 'user-guestbook');
        second.setAttribute('class', 'guestbook');
        link.setAttribute('class', 'guestbook-name');
        span.setAttribute('class', 'wdp-confirm');
        icon.setAttribute('class', 'fas fa-check-circle');
        message.setAttribute('class', 'guestbook-message');

        link.textContent = wish.name;
        span.textContent = wish.confirm ? wish.confirm : (wish.attendance === 'hadir' ? 'Hadir' : 'Mungkin Hadir');
        message.textContent = wish.message;
        if (wish.timestamp) {
            var time = document.createElement('small');
            time.setAttribute('class', 'guestbook-time');
            time.textContent = wish.timestamp;
            message.appendChild(document.createElement('br'));
            message.appendChild(time);
        }

        guestbookList.appendChild(main);
        main.appendChild(second);
        second.appendChild(link);
        second.appendChild(span);
        span.appendChild(icon);
        second.appendChild(message);
    }

    function renderAllWishes() {
        guestbookList.innerHTML = '';
        getWishes().forEach(renderWish);
    }

    // tampilkan seluruh ucapan tersimpan saat halaman dibuka
    renderAllWishes();

    // simpan ucapan baru ke localStorage
    commentForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var fields = commentForm.elements;
        var wish = {
            name: fields.namedItem('name').value,
            message: fields.namedItem('message').value,
            confirm: fields.namedItem('confirm').value
        };

        var wishes = getWishes();
        wishes.push(wish);
        saveWishes(wishes);

        renderAllWishes();
        guestbookList.scrollTop = guestbookList.scrollHeight;
        showToast('Pesan Anda sudah terkirim.', 'success');

        fields.namedItem('name').value = guestName;
        fields.namedItem('message').value = '';
        fields.namedItem('confirm').value = '';
    });

    // pantau perpindahan hash (misal menuju /#admin tanpa reload)
    window.addEventListener('hashchange', function () {
        if (window.location.hash === '#admin') {
            openAdmin();
        } else {
            closeAdmin();
        }
    });

    /* ==========================================================================
       9. HALAMAN ADMIN (/#admin) — login + hapus ucapan di localStorage
       ========================================================================== */

    var ADMIN_USERNAME = 'admin';
    var ADMIN_PASSWORD = 'superadmin';
    var ADMIN_SESSION_KEY = 'wedding_admin_auth';

    var adminOverlay = document.getElementById('admin-overlay');
    var adminLogin = document.getElementById('admin-login');
    var adminDashboard = document.getElementById('admin-dashboard');
    var adminForm = document.getElementById('admin-form');
    var adminList = document.getElementById('admin-list');
    var adminCount = document.getElementById('admin-count');
    var toast = document.getElementById('toast');
    var toastTimer = null;

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = 'toast toast-' + (type || 'success');
        toast.style.display = 'block';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.style.display = 'none';
        }, 3000);
    }

    function isAdminLoggedIn() {
        return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
    }

    function showLogin() {
        adminLogin.style.display = 'block';
        adminDashboard.style.display = 'none';
        adminForm.reset();
    }

    function showDashboard() {
        adminLogin.style.display = 'none';
        adminDashboard.style.display = 'block';
        renderAdminList();
    }

    function openAdmin() {
        adminOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (isAdminLoggedIn()) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function closeAdmin() {
        adminOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function renderAdminList() {
        var wishes = getWishes();
        adminCount.textContent = wishes.length;
        adminList.innerHTML = '';

        if (wishes.length === 0) {
            var empty = document.createElement('p');
            empty.setAttribute('class', 'admin-empty');
            empty.textContent = 'Belum ada ucapan.';
            adminList.appendChild(empty);
            return;
        }

        wishes.forEach(function (wish, index) {
            var item = document.createElement('div');
            item.setAttribute('class', 'admin-item');

            var head = document.createElement('div');
            head.setAttribute('class', 'admin-item-head');

            var name = document.createElement('span');
            name.setAttribute('class', 'admin-item-name');
            name.textContent = wish.name + ' • ' + wish.confirm;

            var delBtn = document.createElement('button');
            delBtn.setAttribute('type', 'button');
            delBtn.setAttribute('class', 'btn-admin-delete');
            delBtn.innerHTML = '<i class="fal fa-trash"></i> Hapus';
            delBtn.addEventListener('click', function () {
                deleteWish(index);
            });

            var message = document.createElement('div');
            message.setAttribute('class', 'admin-item-message');
            message.textContent = wish.message;

            head.appendChild(name);
            head.appendChild(delBtn);
            item.appendChild(head);
            item.appendChild(message);
            adminList.appendChild(item);
        });
    }

    function deleteWish(index) {
        if (!window.confirm('Hapus ucapan ini?')) {
            return;
        }
        var wishes = getWishes();
        wishes.splice(index, 1);
        saveWishes(wishes);
        renderAdminList();
        renderAllWishes();
        showToast('Ucapan berhasil dihapus.', 'success');
    }

    adminForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var username = adminForm.username.value.trim();
        var password = adminForm.password.value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
            showDashboard();
            showToast('Login berhasil. Selamat datang, Admin!', 'success');
        } else {
            showToast('Login gagal. Username atau password salah.', 'error');
        }
        adminForm.password.value = '';
    });

    document.getElementById('admin-close').addEventListener('click', function () {
        window.location.hash = '';
        closeAdmin();
    });

    document.getElementById('admin-logout').addEventListener('click', function () {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        showLogin();
        showToast('Anda berhasil keluar.', 'success');
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && adminOverlay.style.display !== 'none') {
            window.location.hash = '';
            closeAdmin();
        }
    });

    // buka otomatis jika halaman dimuat dengan /#admin
    if (window.location.hash === '#admin') {
        openAdmin();
    }

    /* ==========================================================================
       7. TOMBOL AUDIO (PLAY / PAUSE)
       ========================================================================== */

    var audioContainer = document.getElementById('audio-container');
    var iconPlay = document.getElementById('unmute-sound');
    var iconPause = document.getElementById('mute-sound');
    var isPlaying = false;

    // musik belum diputar sebelum undangan dibuka: ikon awal adalah play
    iconPlay.style.display = 'block';

    function setAudioIcon(playing) {
        isPlaying = playing;
        iconPlay.style.display = playing ? 'none' : 'block';
        iconPause.style.display = playing ? 'block' : 'none';
    }

    audioContainer.addEventListener('click', function () {
        if (isPlaying) {
            song.pause();
            setAudioIcon(false);
        } else {
            playSong();
            setAudioIcon(true);
        }
    });

    /* ==========================================================================
       8. TAHUN OTOMATIS PADA FOOTER
       ========================================================================== */

    document.getElementById('year').textContent = new Date().getFullYear();

})();
