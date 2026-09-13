/*
 * Definisi 23 ahli waris yang dicakup kalkulator ini.
 *
 * Cakupan sengaja berhenti sebelum dzawil arham (kerabat jauh seperti cucu
 * dari anak perempuan, bibi, paman dari pihak ibu). Kasusnya langka dan
 * ulama berbeda pendapat, jadi lebih jujur mengarahkan ke ustadz/Pengadilan
 * Agama daripada menebak. Lihat solve.js -> catatan "diluarCakupan".
 */

(function (root) {
  'use strict';

  var GROUPS = [
    { id: 'pasangan',  label: 'الزوجان',        utama: true  },
    { id: 'anak',      label: 'الأولاد',        utama: true  },
    { id: 'orangtua',  label: 'الأبوان',        utama: true  },
    { id: 'cucu',      label: 'الأحفاد',        utama: false },
    { id: 'kakeknenek',label: 'الجدّان',        utama: false },
    { id: 'saudara',   label: 'الإخوة',         utama: false },
    { id: 'kerabat',   label: 'أقارب آخرون',    utama: false }
  ];

  // ikon: id <symbol> di sprite SVG (lihat hitung.html)
  var HEIRS = [
    {
      key: 'suami', label: 'الزوج', group: 'pasangan', gender: 'L', max: 1,
      icon: 'i-pria', hanyaJika: 'P',
      panggilan: 'الزوج', jalur: 'زوج الميت',
      ket: 'الزوج الذي تُرك بعده.'
    },
    {
      key: 'istri', label: 'الزوجة', group: 'pasangan', gender: 'P', max: 4,
      icon: 'i-wanita', hanyaJika: 'L',
      panggilan: 'الزوجة', jalur: 'زوجة الميت',
      ket: 'الزوجات اللواتي تُركنَ بعده. إن كنّ أكثر من واحدة قُسِّم نصيبهنّ بالتساوي.'
    },

    {
      key: 'anak_lk', label: 'ابن', group: 'anak', gender: 'L', max: 20,
      icon: 'i-anak-pria',
      panggilan: 'ابن', jalur: 'ذكر',
      ket: 'ابنُ الميت من صلبه.'
    },
    {
      key: 'anak_pr', label: 'بنت', group: 'anak', gender: 'P', max: 20,
      icon: 'i-anak-wanita',
      panggilan: 'بنت', jalur: 'أنثى',
      ket: 'بنتُ الميت من صلبه.'
    },

    {
      key: 'ayah', label: 'الأب', group: 'orangtua', gender: 'L', max: 1,
      icon: 'i-pria',
      panggilan: 'الأب', jalur: 'الأبوان',
      ket: 'أبو الميت.'
    },
    {
      key: 'ibu', label: 'الأم', group: 'orangtua', gender: 'P', max: 1,
      icon: 'i-wanita',
      panggilan: 'الأم', jalur: 'الأبوان',
      ket: 'أمُّ الميت.'
    },

    {
      key: 'cucu_lk', label: 'ابن الابن', group: 'cucu', gender: 'L', max: 20,
      icon: 'i-anak-pria',
      panggilan: 'حفيد', jalur: 'من ابنٍ',
      ket: 'ابنُ ابنِ الميت. الحفيد من طريق البنات لا يُعدّ.'
    },
    {
      key: 'cucu_pr', label: 'بنت الابن', group: 'cucu', gender: 'P', max: 20,
      icon: 'i-anak-wanita',
      panggilan: 'حفيدة', jalur: 'من ابنٍ',
      ket: 'بنتُ ابنِ الميت. الحفيدة من طريق البنات لا تُعدّ.'
    },

    {
      key: 'kakek', label: 'الجد', group: 'kakeknenek', gender: 'L', max: 1,
      icon: 'i-lansia-pria',
      panggilan: 'الجد', jalur: 'أبو الأب',
      ket: 'جدُّ الميت من جهة أبيه. الجد من جهة الأم ليس وارثاً.'
    },
    {
      key: 'nenek_ayah', label: 'الجدة (من الأب)', group: 'kakeknenek', gender: 'P', max: 1,
      icon: 'i-lansia-wanita',
      panggilan: 'الجدة', jalur: 'أم الأب',
      ket: 'جدةُ الميت من جهة أبيه.'
    },
    {
      key: 'nenek_ibu', label: 'الجدة (من الأم)', group: 'kakeknenek', gender: 'P', max: 1,
      icon: 'i-lansia-wanita',
      panggilan: 'الجدة', jalur: 'أم الأم',
      ket: 'جدةُ الميت من جهة أمه.'
    },

    {
      key: 'sdr_lk_kandung', label: 'الأخ الشقيق', group: 'saudara', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'أخ', jalur: 'شقيق',
      ket: 'أخو الميت من أبيه وأمه معاً.'
    },
    {
      key: 'sdr_pr_kandung', label: 'الأخت الشقيقة', group: 'saudara', gender: 'P', max: 20,
      icon: 'i-wanita', panggilan: 'أخت', jalur: 'شقيقة',
      ket: 'أختُ الميت من أبيه وأمه معاً.'
    },
    {
      key: 'sdr_lk_sebapak', label: 'الأخ لأب', group: 'saudara', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'أخ', jalur: 'أخ لأب',
      ket: 'أخو الميت من أبيه دون أمه — مثال: من زواج أبٍ آخر.'
    },
    {
      key: 'sdr_pr_sebapak', label: 'الأخت لأب', group: 'saudara', gender: 'P', max: 20,
      icon: 'i-wanita', panggilan: 'أخت', jalur: 'أخت لأب',
      ket: 'أختُ الميت من أبيه دون أمه — مثال: من زواج أبٍ آخر.'
    },
    {
      key: 'sdr_lk_seibu', label: 'الأخ لأم', group: 'saudara', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'أخ', jalur: 'أخ لأم',
      ket: 'أخو الميت من أمه دون أبيه — مثال: من زواج أمٍّ آخر.'
    },
    {
      key: 'sdr_pr_seibu', label: 'الأخت لأم', group: 'saudara', gender: 'P', max: 20,
      icon: 'i-wanita', panggilan: 'أخت', jalur: 'أخت لأم',
      ket: 'أختُ الميت من أمه دون أبيه — مثال: من زواج أمٍّ آخر.'
    },

    {
      key: 'keponakan_kandung', label: 'ابن الأخ الشقيق', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'ابن الأخ', jalur: 'ابن الأخ الشقيق',
      ket: 'ابنُ الأخ الشقيق. إذا كان لأخيك الذكر ابنٌ فهو هذا.'
    },
    {
      key: 'keponakan_sebapak', label: 'ابن الأخ لأب', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'ابن الأخ', jalur: 'ابن الأخ لأب',
      ket: 'ابنُ الأخ لأب (من أب دون أم).'
    },
    {
      key: 'paman_kandung', label: 'العم الشقيق', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-lansia-pria', panggilan: 'العم', jalur: 'شقيق الأب',
      ket: 'أخو الأب الشقيق (من جدٍّ واحد وجدةٍ واحدة).'
    },
    {
      key: 'paman_sebapak', label: 'العم لأب', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-lansia-pria', panggilan: 'العم', jalur: 'أخو الأب لأب',
      ket: 'أخو الأب من أبيه دون أمه.'
    },
    {
      key: 'sepupu_kandung', label: 'ابن العم الشقيق', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'ابن العم', jalur: 'ابن العم الشقيق',
      ket: 'ابنُ العم الشقيق — وهو المعروف يومياً بابن العم.'
    },
    {
      key: 'sepupu_sebapak', label: 'ابن العم لأب', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'ابن العم', jalur: 'ابن العم لأب',
      ket: 'ابنُ العم الذي أبوه أخو الأب من أبيه دون أمه.'
    }
  ];

  var BY_KEY = {};
  HEIRS.forEach(function (h) { BY_KEY[h.key] = h; });

  /** Urutan ashabah bin nafsihi: jihat dulu, lalu derajat, lalu kekuatan. */
  var URUTAN_ASHABAH = [
    'anak_lk',
    'cucu_lk',
    'ayah',
    'kakek',
    'sdr_lk_kandung',
    'sdr_lk_sebapak',
    'keponakan_kandung',
    'keponakan_sebapak',
    'paman_kandung',
    'paman_sebapak',
    'sepupu_kandung',
    'sepupu_sebapak'
  ];

  /** Pasangan ashabah bil ghair: perempuan yang "diangkat" oleh saudara laki-lakinya. */
  var PASANGAN_BIL_GHAIR = {
    anak_lk: 'anak_pr',
    cucu_lk: 'cucu_pr',
    sdr_lk_kandung: 'sdr_pr_kandung',
    sdr_lk_sebapak: 'sdr_pr_sebapak'
  };

  var SEMUA_SAUDARA = [
    'sdr_lk_kandung', 'sdr_pr_kandung',
    'sdr_lk_sebapak', 'sdr_pr_sebapak',
    'sdr_lk_seibu', 'sdr_pr_seibu'
  ];

  /** Keturunan yang berhak waris (far' warits). */
  var FARU = ['anak_lk', 'anak_pr', 'cucu_lk', 'cucu_pr'];
  /** Keturunan laki-laki (far' warits laki-laki). */
  var FARU_LK = ['anak_lk', 'cucu_lk'];

  function label(key) {
    return BY_KEY[key] ? BY_KEY[key].label : key;
  }

  root.Heirs = {
    GROUPS: GROUPS,
    LIST: HEIRS,
    BY_KEY: BY_KEY,
    URUTAN_ASHABAH: URUTAN_ASHABAH,
    PASANGAN_BIL_GHAIR: PASANGAN_BIL_GHAIR,
    SEMUA_SAUDARA: SEMUA_SAUDARA,
    FARU: FARU,
    FARU_LK: FARU_LK,
    label: label
  };
})(typeof window !== 'undefined' ? window : globalThis);
