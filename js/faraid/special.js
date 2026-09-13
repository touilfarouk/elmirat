/*
 * Kasus-kasus khusus yang menyimpang dari pola biasa.
 *
 * Empat kasus ini punya nama sendiri dalam kitab faraid karena penerapan aturan
 * umum di situ menghasilkan sesuatu yang janggal, dan para sahabat Nabi sudah
 * memutuskannya secara khusus. Semuanya harus dicek SEBELUM pembagian normal.
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;
  var F = f.F;

  function kunciAktif(aktif) {
    return Object.keys(aktif).filter(function (k) { return aktif[k] > 0; }).sort();
  }

  function samaPersis(aktif, arr) {
    var a = kunciAktif(aktif);
    var b = arr.slice().sort();
    return a.length === b.length && a.every(function (k, i) { return k === b[i]; });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. Umariyyatain (Gharrawain)
  //    Pasangan + ayah + ibu, tidak ada ahli waris lain.
  //    Ibu mendapat 1/3 SISA setelah bagian pasangan, bukan 1/3 harta.
  //    Kalau tidak begitu, ibu justru dapat lebih besar dari ayah.
  //    Putusan Umar bin Khattab, diikuti jumhur ulama termasuk Imam Syafi'i.
  // ═══════════════════════════════════════════════════════════════════
  function cekUmariyyatain(aktif) {
    var pasangan = null;
    if (samaPersis(aktif, ['suami', 'ayah', 'ibu'])) pasangan = 'suami';
    else if (samaPersis(aktif, ['istri', 'ayah', 'ibu'])) pasangan = 'istri';
    else return null;

    var bagianPasangan = pasangan === 'suami' ? F(1, 2) : F(1, 4);
    var sisa = f.sub(f.ONE, bagianPasangan);
    var bagianIbu = f.mul(sisa, F(1, 3));
    var bagianAyah = f.sub(sisa, bagianIbu);

    var bagian = {};
    bagian[pasangan] = bagianPasangan;
    bagian.ibu = bagianIbu;
    bagian.ayah = bagianAyah;

    return {
      id: 'umariyyatain',
      nama: 'مسألة العمريتين (الغروين)',
      bagian: bagian,
      alasan: {
        suami: 'الزوج يأخذ النصف لعدم وجود فرعٍ وارث.',
        istri: 'الزوجة تأخذ الربع لعدم وجود فرعٍ وارث.',
        ibu: 'تأخذ الأم ثلثَ الباقي بعد أخذِ ' + H.label(pasangan) +
             ' — وليس ثلثَ المال كله.',
        ayah: 'يأخذ الأب الباقي، وهو ضعفُ نصيب الأم.'
      },
      penjelasan: 'لو أُعطيت الأمُّ ثلثَ المال كله، لصار نصيبها أكبرَ من الأب. وفي نظام ' +
        'الميراث حين يتساوى الموقعُ يأخذ الذكرُ مثلَ حظِّ الأنثيين. وقد قرّر عمر بن الخطاب ' +
        'أن تأخذ الأم ثلثَ الباقي، وهو ما عليه الجمهور ومنهم المالكية والشافعية.',
      // Bagian pasangan di sini berasal dari QS An-Nisa 12, bukan ayat 11 —
      // ayat 11 tidak menyinggung suami/istri sama sekali. Yang khas pada
      // Umariyyatain adalah bagian IBU: 1/3 dari sisa, bukan 1/3 harta.
      dalil: 'qs4-11',
      dalilPerOrang: {
        suami: 'qs4-12',
        istri: 'qs4-12',
        // Di kasus ini pewaris TIDAK punya anak, jadi ayah bukan mengambil 1/6
        // bagian tetap melainkan seluruh sisa sebagai ashabah. Menunjuk klausa
        // "masing-masing seperenam jika ia punya anak" justru salah keadaan.
        ayah: 'hadits-ashabah'
      },
      potongan: {
        suami: 'suamiTanpaAnak',
        istri: 'istriTanpaAnak',
        // Angka 1/3 untuk ibu memang dari ayat ini; yang menjadi ijtihad Umar
        // adalah membacanya sebagai 1/3 SISA, bukan 1/3 seluruh harta.
        ibu: 'ibuTanpaAnak'
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. Al-Akdariyyah
  //    Suami + ibu + kakek + satu saudara perempuan.
  //    Solusi Zaid bin Tsabit: saudara perempuan tetap diberi bagian tetapnya
  //    (sehingga terjadi 'aul), lalu bagiannya digabung dengan kakek dan
  //    dibagi 2:1.
  // ═══════════════════════════════════════════════════════════════════
  function cekAkdariyyah(aktif) {
    var sdr = null;
    if (samaPersis(aktif, ['suami', 'ibu', 'kakek', 'sdr_pr_kandung'])) sdr = 'sdr_pr_kandung';
    else if (samaPersis(aktif, ['suami', 'ibu', 'kakek', 'sdr_pr_sebapak'])) sdr = 'sdr_pr_sebapak';
    else return null;
    if (aktif[sdr] !== 1) return null;

    var bagian = {
      suami: F(9, 27),
      ibu: F(6, 27),
      kakek: F(8, 27)
    };
    bagian[sdr] = F(4, 27);

    var alasan = {
      suami: 'الزوج يأخذ النصف ثم ينقص بالعول.',
      ibu: 'الأم تأخذ الثلث ثم تنقص بالعول.',
      kakek: 'الجد يأخذ السدس ثم يُدمج نصيبه مع نصيب الأخت وتُقسَّم بنسبة 2:1.'
    };
    alasan[sdr] = 'تُعطى الأختُ نصيبَها المقدر (النصف) ثم يُدمج نصيبُها مع الجد ويُقسَّم بينهما 2:1.';

    return {
      id: 'akdariyyah',
      nama: 'مسألة الأكدَريَّة',
      bagian: bagian,
      alasan: alasan,
      penjelasan: 'هذه أصعبُ الصور في الفرائض تناسباً. لو طُبقت القاعدةُ العادية لما نالت ' +
        'الأختُ شيئاً. قرّر زيد بن ثابت: تُعطى الأختُ النصفَ، ويرتفع المقام من 6 إلى 9 (عول)، ' +
        'ثم يُدمَج نصيبُ الجدِّ مع الأخت ويُقسَّم 2:1 — فيصير المقامُ الأخير 27. ' +
        'هذا قولُ المالكية والشافعية.',
      dalil: 'atsar-zaid',
      khilafiyah: 'اختلف الفقهاء في هذه المسألة. الرقمُ أعلاه على قول زيد بن ثابت ' +
        'المعتمد عند المالكية والشافعية.'
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. Musyarakah (Himariyyah / Musytarakah)
  //    Suami + ibu/nenek + dua saudara seibu atau lebih + saudara kandung.
  //    Bagian tetap habis persis 1/1, saudara kandung tidak kebagian apa-apa.
  //    Imam Syafi'i: saudara kandung ikut berbagi 1/3 bersama saudara seibu,
  //    karena mereka sama-sama satu ibu dengan pewaris.
  // ═══════════════════════════════════════════════════════════════════
  function cekMusyarakah(aktif) {
    function n(k) { return aktif[k] || 0; }
    var seibu = n('sdr_lk_seibu') + n('sdr_pr_seibu');
    var punyaIbuAtauNenek = n('ibu') > 0 || n('nenek_ayah') > 0 || n('nenek_ibu') > 0;

    if (!(n('suami') === 1 && punyaIbuAtauNenek && seibu >= 2 && n('sdr_lk_kandung') >= 1)) {
      return null;
    }
    // pastikan tidak ada ahli waris lain yang mengubah gambar
    var diizinkan = ['suami', 'ibu', 'nenek_ayah', 'nenek_ibu',
      'sdr_lk_seibu', 'sdr_pr_seibu', 'sdr_lk_kandung', 'sdr_pr_kandung'];
    var adaLain = kunciAktif(aktif).some(function (k) { return diizinkan.indexOf(k) === -1; });
    if (adaLain) return null;

    var bagian = { suami: F(1, 2) };
    var alasan = {
      suami: 'الزوج يأخذ النصف لعدم وجود فرعٍ وارث.'
    };

    var nenekAktif = ['nenek_ayah', 'nenek_ibu'].filter(function (k) { return n(k) > 0; });
    if (n('ibu') > 0) {
      bagian.ibu = F(1, 6);
      alasan.ibu = 'الأم تأخذ السدس لوجود أكثرَ من أخٍ واحدٍ للميت.';
    } else {
      nenekAktif.forEach(function (k) {
        bagian[k] = F(1, 6 * nenekAktif.length);
        alasan[k] = 'الجدة تأخذ السدس مقام الأم.';
      });
    }

    // 1/3 dibagi rata per kepala: saudara seibu + saudara kandung, laki-laki
    // dan perempuan sama besar
    var pesertaKey = ['sdr_lk_seibu', 'sdr_pr_seibu', 'sdr_lk_kandung', 'sdr_pr_kandung']
      .filter(function (k) { return n(k) > 0; });
    var totalKepala = pesertaKey.reduce(function (t, k) { return t + n(k); }, 0);

    pesertaKey.forEach(function (k) {
      bagian[k] = f.mul(F(1, 3), F(n(k), totalKepala));
      alasan[k] = 'شُرك مع الإخوة لأمٍّ في الثلث، يُقسَّم بالتساوي على الرؤوس (' +
        totalKepala + ' أشخاص)، للذكر مثل الأنثى.';
    });

    return {
      id: 'musyarakah',
      nama: 'مسألة المشتركة',
      bagian: bagian,
      alasan: alasan,
      penjelasan: 'بعد الزوج (النصف)، والأم (السدس)، والإخوة لأمٍّ (الثلث)، يَنفد المالُ كله. ' +
        'فالأخُ الشقيق الذي يُفترض أن يأخذ الباقي يبقى بلا شيء. قرّر عمر بن الخطاب ' +
        'أن يشاركهم في الثلث — لأنهم جميعاً أبناء أمِّ الميت. وهو قولُ المالكية والشافعية.',
      dalil: 'atsar-umar-musyarakah',
      khilafiyah: 'المذهبان الحنفي والحنبلي يريان أن الشقيق لا يرث في هذه الصورة ' +
        'إطلاقاً. الرقمُ أعلاه على المذهب المالكي والشافعي.'
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. Kakek bersama saudara
  //    Mazhab Syafi'i mengikuti Zaid bin Tsabit: kakek TIDAK menggugurkan
  //    saudara kandung/seayah. Kakek mengambil yang paling menguntungkan dari
  //    tiga pilihan: muqasamah (berbagi seperti saudara), 1/3 sisa, atau 1/6
  //    harta.
  // ═══════════════════════════════════════════════════════════════════
  function kakekBersamaSaudara(aktif, sisa) {
    function n(k) { return aktif[k] || 0; }

    var sdrKeys = ['sdr_lk_kandung', 'sdr_pr_kandung', 'sdr_lk_sebapak', 'sdr_pr_sebapak']
      .filter(function (k) { return n(k) > 0; });
    if (!n('kakek') || !sdrKeys.length) return null;

    // Muqasamah: kakek dihitung sebagai satu saudara laki-laki (2 bagian),
    // saudara laki-laki 2 bagian, saudara perempuan 1 bagian.
    var unitSaudara = sdrKeys.reduce(function (t, k) {
      return t + n(k) * (H.BY_KEY[k].gender === 'L' ? 2 : 1);
    }, 0);
    var unitTotal = 2 + unitSaudara;

    var opsiMuqasamah = f.mul(sisa, F(2, unitTotal));
    var opsiSepertigaSisa = f.mul(sisa, F(1, 3));
    var opsiSeperenamHarta = F(1, 6);

    var pilihan = [
      { nama: 'muqasamah', nilai: opsiMuqasamah,
        teks: 'مشاركةَ الإخوة في الباقي كأخٍ ذكر' },
      { nama: 'sepertiga_sisa', nilai: opsiSepertigaSisa,
        teks: 'ثلثَ الباقي' },
      { nama: 'seperenam_harta', nilai: opsiSeperenamHarta,
        teks: 'سدسَ الجميع' }
    ];

    var terbaik = pilihan[0];
    pilihan.forEach(function (p) { if (f.gt(p.nilai, terbaik.nilai)) terbaik = p; });

    // tidak boleh melebihi sisa yang tersedia
    var bagianKakek = f.gt(terbaik.nilai, sisa) ? sisa : terbaik.nilai;
    var sisaSaudara = f.sub(sisa, bagianKakek);

    var bagian = { kakek: bagianKakek };
    if (!f.isZero(sisaSaudara) && unitSaudara > 0) {
      sdrKeys.forEach(function (k) {
        var unit = n(k) * (H.BY_KEY[k].gender === 'L' ? 2 : 1);
        bagian[k] = f.mul(sisaSaudara, F(unit, unitSaudara));
      });
    } else {
      sdrKeys.forEach(function (k) { bagian[k] = f.ZERO; });
    }

    var adaKandung = n('sdr_lk_kandung') + n('sdr_pr_kandung') > 0;
    var adaSebapak = n('sdr_lk_sebapak') + n('sdr_pr_sebapak') > 0;

    return {
      id: 'kakek_saudara',
      nama: 'الجد مع الإخوة',
      bagian: bagian,
      metode: terbaik.nama,
      alasanKakek: 'يأخذ الجدُّ الخيارَ الأنفعَ له، وهو ' + terbaik.teks + '.',
      alasanSaudara: 'يتقاسم الإخوةُ الباقيَ بعد نصيب الجدِّ بنسبة 2 : 1 بين الذكر والأنثى.',
      penjelasan: 'عند المالكية والشافعية لا يحجب الجدُّ الشقيقَ ولا الأخَ لأب — ' +
        'فكلهم متصلٌ بالميت من جهة الأب. يُخيَّر الجدُّ بين ثلاثة: المشاركة كأحد الإخوة ' +
        '(المقاسمة)، ثلثُ الباقي، أو سدسُ الجميع. الأنفعُ هنا هو ' + terbaik.teks + '.',
      dalil: 'atsar-zaid',
      khilafiyah: 'الحنفية يرون أن الجدَّ يحجب الإخوةَ كلَّهم فلا يرثون. الرقمُ أعلاه ' +
        'على قول زيد بن ثابت المعتمد عند المالكية والشافعية.',
      perluKonsultasi: adaKandung && adaSebapak
        ? 'اجتمع هنا الجدُّ مع أخٍ شقيقٍ وأخٍ لأبٍّ معاً. لهذه الصورة قاعدةٌ زائدة ' +
          'في كتب الفرائض (المعادّة) لم تُطبَّق في هذه الحاسبة. استشر عالماً أو قسمَ ' +
          'شؤون الأسرة قبل التنفيذ.'
        : null
    };
  }

  root.Special = {
    cekUmariyyatain: cekUmariyyatain,
    cekAkdariyyah: cekAkdariyyah,
    cekMusyarakah: cekMusyarakah,
    kakekBersamaSaudara: kakekBersamaSaudara
  };
})(typeof window !== 'undefined' ? window : globalThis);
