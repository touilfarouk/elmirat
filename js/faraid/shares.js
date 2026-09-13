/*
 * Ashabul furudh — ahli waris yang bagiannya sudah dipatok Al-Qur'an.
 * Hanya ada enam angka: 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6.
 *
 * Fungsi di sini mengembalikan bagian per KELOMPOK (misal total untuk semua
 * istri), bukan per orang. Pembagian per orang dilakukan di solve.js.
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;

  var F = f.F;

  /**
   * @param {Object} aktif        ahli waris yang lolos hijab
   * @param {Object} countsAsli   jumlah sebelum hijab (untuk hitung saudara
   *                              yang tetap menurunkan bagian ibu)
   * @param {Object} opts         { lewatiKakek, lewatiFardhSaudara }
   *   lewatiKakek / lewatiFardhSaudara dipakai saat kakek berkumpul dengan
   *   saudara: di situ saudara perempuan tidak mengambil bagian tetapnya
   *   melainkan ikut muqasamah bersama kakek (lihat special.js).
   */
  function hitung(aktif, countsAsli, opts) {
    opts = opts || {};
    var fardh = {};   // key -> Fraction (total kelompok)
    var alasan = {};  // key -> penjelasan singkat
    var dalil = {};      // key -> id dalil di dalil.js
    var potongan = {};   // key -> potongan ayat mana yang menyebut hak ini
    var dalilLain = {};  // key -> sumber pendamping (mis. ayat + hadits qiyas)

    function ada(k) { return (aktif[k] || 0) > 0; }
    function n(k) { return aktif[k] || 0; }

    var faruLk = H.FARU_LK.some(ada);
    var faruPr = ada('anak_pr') || ada('cucu_pr');
    var faru = faruLk || faruPr;

    /*
     * idPotongan menunjuk klausa mana di dalam ayat yang menetapkan bagian ini.
     * Tanpa itu, kartu ibu menampilkan kalimat tentang anak — ayatnya benar,
     * tapi kutipannya tidak membuktikan apa pun bagi pembaca yang memeriksa.
     */
    function set(key, frac, teks, idDalil, idPotongan) {
      fardh[key] = frac;
      alasan[key] = teks;
      dalil[key] = idDalil;
      if (idPotongan) potongan[key] = idPotongan;
    }

    // ── Pasangan ─────────────────────────────────────────────────────
    if (ada('suami')) {
      set('suami', faru ? F(1, 4) : F(1, 2),
        faru
          ? 'يأخذ الزوج الربع لوجود فرعٍ وارثٍ للميت (ولد أو حفيد).'
          : 'يأخذ الزوج النصف لعدم وجود فرعٍ وارثٍ للميت.',
        'qs4-12', faru ? 'suamiAdaAnak' : 'suamiTanpaAnak');
    }
    if (ada('istri')) {
      set('istri', faru ? F(1, 8) : F(1, 4),
        faru
          ? 'تأخذ الزوجة الثمن لوجود فرعٍ وارثٍ للميت' +
            (n('istri') > 1 ? '، يُقسَّم بالتساوي على ' + n('istri') + ' زوجات.' : '.')
          : 'تأخذ الزوجة الربع لعدم وجود فرعٍ وارثٍ للميت' +
            (n('istri') > 1 ? '، يُقسَّم بالتساوي على ' + n('istri') + ' زوجات.' : '.'),
        'qs4-12', faru ? 'istriAdaAnak' : 'istriTanpaAnak');
    }

    // ── Ibu ──────────────────────────────────────────────────────────
    var jmlSaudaraAsli = H.SEMUA_SAUDARA.reduce(function (t, k) {
      return t + (countsAsli[k] || 0);
    }, 0);

    if (ada('ibu')) {
      if (faru) {
        set('ibu', F(1, 6), 'تأخذ الأم السدس لوجود فرعٍ وارثٍ (ولد أو حفيد).',
          'qs4-11', 'ortuAdaAnak');
      } else if (jmlSaudaraAsli >= 2) {
        set('ibu', F(1, 6),
          'تأخذ الأم السدس لوجود أخوين أو أكثر للميت — ولو كان الإخوة أنفسهم ' +
          'محجوبين بالأب.',
          'qs4-11', 'ibuAdaSaudara');
      } else {
        set('ibu', F(1, 3), 'تأخذ الأم الثلث لعدم وجود فرعٍ وارثٍ ولا أخوين.',
          'qs4-11', 'ibuTanpaAnak');
      }
    }

    // ── Nenek ────────────────────────────────────────────────────────
    var nenekAktif = ['nenek_ayah', 'nenek_ibu'].filter(ada);
    if (nenekAktif.length) {
      var bagianNenek = F(1, 6 * nenekAktif.length);
      nenekAktif.forEach(function (k) {
        set(k, bagianNenek,
          nenekAktif.length > 1
            ? 'الجدتان تشتركان في السدس بينهما بالتساوي.'
            : 'تأخذ الجدة السدس.',
          'hadits-nenek');
      });
    }

    // ── Ayah ─────────────────────────────────────────────────────────
    if (ada('ayah')) {
      if (faruLk) {
        set('ayah', F(1, 6),
          'يأخذ الأب السدس لوجود فرعٍ وارثٍ ذكَر. الباقي للفرع الذكَر.',
          'qs4-11', 'ortuAdaAnak');
      } else if (faruPr) {
        set('ayah', F(1, 6),
          'يأخذ الأب السدس فرضاً مقدراً، مع ما يتبقى من المال بعد دفع ' +
          'جميع الفروض.', 'qs4-11', 'ortuAdaAnak');
      }
    }

    // ── Kakek (bila ayah tidak ada) ──────────────────────────────────
    if (ada('kakek') && !opts.lewatiKakek) {
      if (faruLk) {
        set('kakek', F(1, 6),
          'يقوم الجد مقام الأب فيأخذ السدس لوجود فرعٍ وارثٍ ذكَر.', 'ijma-kakek');
      } else if (faruPr) {
        set('kakek', F(1, 6),
          'يأخذ الجد السدس فرضاً مقدراً، مع الباقي الذي يتبقى.', 'ijma-kakek');
      }
    }

    // ── Anak perempuan ───────────────────────────────────────────────
    if (ada('anak_pr') && !ada('anak_lk')) {
      if (n('anak_pr') === 1) {
        set('anak_pr', F(1, 2), 'البنت الوحيدة بلا أخٍ تأخذ النصف.',
          'qs4-11', 'anakPrTunggal');
      } else {
        set('anak_pr', F(2, 3),
          n('anak_pr') + ' بناتٍ بلا أخٍ يتقاسمن الثلثين.',
          'qs4-11', 'anakPrBanyak');
      }
    }

    // ── Cucu perempuan dari anak laki-laki ───────────────────────────
    if (ada('cucu_pr') && !ada('cucu_lk')) {
      if (n('anak_pr') === 1) {
        set('cucu_pr', F(1, 6),
          'تأخذ بنتُ الابن السدس إتماماً للثلثين: البنت أخذت النصف، ' +
          'ويُكمل هذا السدس نصيبَها إلى الثلثين.', 'hadits-cucu-pr');
      } else if (!ada('anak_pr')) {
        if (n('cucu_pr') === 1) {
          set('cucu_pr', F(1, 2), 'تأخذ بنت الابن الوحيدة النصف مقام البنت.',
            'qs4-11', 'anakPrTunggal');
        } else {
          set('cucu_pr', F(2, 3), n('cucu_pr') + ' بناتُ الابن يتقاسمن الثلثين مقام البنات.',
            'qs4-11', 'anakPrBanyak');
        }
      }
    }

    // ── Saudara seibu ────────────────────────────────────────────────
    var seibuTotal = n('sdr_lk_seibu') + n('sdr_pr_seibu');
    if (seibuTotal > 0) {
      var totalSeibu = seibuTotal === 1 ? F(1, 6) : F(1, 3);
      var teksSeibu = seibuTotal === 1
        ? 'من الإخوة لأمٍّ واحدٍ (ذكراً كان أو أنثى) يأخذ السدس.'
        : seibuTotal + ' من الإخوة لأمٍّ يتقاسمن الثلث بالتساوي — للذَّكر مثل الأنثى.';
      // dibagi rata per kepala tanpa membedakan laki-laki/perempuan
      if (ada('sdr_lk_seibu')) {
        set('sdr_lk_seibu', f.mul(totalSeibu, F(n('sdr_lk_seibu'), seibuTotal)), teksSeibu,
          'qs4-12', seibuTotal === 1 ? 'seibuTunggal' : 'seibuBanyak');
      }
      if (ada('sdr_pr_seibu')) {
        set('sdr_pr_seibu', f.mul(totalSeibu, F(n('sdr_pr_seibu'), seibuTotal)), teksSeibu,
          'qs4-12', seibuTotal === 1 ? 'seibuTunggal' : 'seibuBanyak');
      }
    }

    // ── Saudara perempuan kandung ────────────────────────────────────
    if (!opts.lewatiFardhSaudara && ada('sdr_pr_kandung') && !ada('sdr_lk_kandung') && !faruPr) {
      if (n('sdr_pr_kandung') === 1) {
        set('sdr_pr_kandung', F(1, 2), 'الأخت الشقيقة الوحيدة بلا أخٍ تأخذ النصف.',
          'qs4-176', 'sdrPrTunggal');
      } else {
        set('sdr_pr_kandung', F(2, 3), n('sdr_pr_kandung') + ' شقيقاتٍ بلا أخٍ يتقاسمن الثلثين.',
          'qs4-176', 'sdrPrBanyak');
      }
    }

    // ── Saudara perempuan seayah ─────────────────────────────────────
    if (!opts.lewatiFardhSaudara && ada('sdr_pr_sebapak') && !ada('sdr_lk_sebapak') && !faruPr) {
      if (n('sdr_pr_kandung') === 1) {
        // Angka 1/6 ini TIDAK disebut dalam QS An-Nisa 176. Ia diqiyaskan pada
        // putusan Ibnu Mas'ud tentang cucu perempuan yang melengkapi 2/3
        // bersama satu anak perempuan (HR Bukhari 6736) — keadaannya sama
        // persis, hanya tingkatannya yang berbeda. Menunjuk ayat 176 di sini
        // menyesatkan, karena pembaca tidak akan menemukan angka 1/6 di sana.
        set('sdr_pr_sebapak', F(1, 6),
          'تأخذ الأختُ لأبٍّ السدس إتماماً للثلثين، لوجود أختٍ شقيقةٍ واحدة. ' +
          'هذا الرقم مقيسٌ على حكم بنت الابن المُكمِّلة لنصيب البنت.',
          'hadits-cucu-pr');
        dalilLain['sdr_pr_sebapak'] = ['qs4-176'];
      } else if (!ada('sdr_pr_kandung')) {
        if (n('sdr_pr_sebapak') === 1) {
          set('sdr_pr_sebapak', F(1, 2), 'الأخت لأبٍّ الوحيدة بلا أخٍ تأخذ النصف.',
            'qs4-176', 'sdrPrTunggal');
        } else {
          set('sdr_pr_sebapak', F(2, 3), n('sdr_pr_sebapak') + ' أخواتٍ لأبٍّ بلا أخٍ يتقاسمن الثلثين.',
            'qs4-176', 'sdrPrBanyak');
        }
      }
    }

    return { fardh: fardh, alasan: alasan, dalil: dalil, potongan: potongan,
             dalilLain: dalilLain, faru: faru, faruLk: faruLk, faruPr: faruPr };
  }

  root.Shares = { hitung: hitung };
})(typeof window !== 'undefined' ? window : globalThis);
