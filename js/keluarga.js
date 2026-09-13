/*
 * Model susunan keluarga.
 *
 * KENAPA INI ADA
 * Mengisi jumlah ahli waris satu per satu ternyata rawan salah, dan salahnya
 * tidak kelihatan. Contoh nyata: seorang ibu wafat meninggalkan 3 anak
 * perempuan yang masing-masing sudah punya anak. Kalau cucu-cucu itu diisi ke
 * kolom "cucu", kalkulator menganggapnya cucu lewat anak LAKI-LAKI — satu-
 * satunya cucu yang mewarisi dalam Islam — lalu menyimpulkan almarhumah pernah
 * punya anak laki-laki yang wafat lebih dulu. Padahal anak laki-laki itu tidak
 * pernah ada, dan cucu lewat anak perempuan memang bukan ahli waris.
 *
 * Model ini menutup celah tersebut dengan menyimpan STRUKTUR keluarga, bukan
 * angka: cucu selalu menempel pada anak tertentu, keponakan pada saudara
 * tertentu, sepupu pada paman tertentu. Siapa yang mewarisi lalu diturunkan
 * dari struktur itu — bukan ditebak.
 */

(function (root) {
  'use strict';

  var nomor = 0;
  function id() { return 'p' + (++nomor); }

  function baru(jenisKelamin) {
    return {
      jenisKelamin: jenisKelamin || null,   // jenis kelamin pewaris
      pasangan: [],                          // {id, hidup}
      anak: [],                              // {id, gender, hidup, angkat, tiri, anak:[{id,gender}]}
      ayah: null,                            // {hidup}
      ibu: null,
      kakek: null,
      nenekAyah: null,
      nenekIbu: null,
      saudara: [],                           // {id, jenis, gender, hidup, anak:[{id,gender}]}
      paman: []                              // {id, jenis, hidup, anak:[{id,gender}]}
    };
  }

  var MAKS_PASANGAN = function (jk) { return jk === 'L' ? 4 : 1; };

  // ═══════════════════════════════════════════════════════════════
  // Perubahan isi
  // ═══════════════════════════════════════════════════════════════

  // Batas 4 istri hanya berlaku untuk pasangan yang MASIH HIDUP saat pewaris
  // wafat. Istri yang sudah wafat lebih dulu bukan ahli waris, jadi tidak ikut
  // dihitung — seorang laki-laki bisa punya banyak mantan istri yang telah
  // wafat tanpa melanggar batas itu.
  function tambahPasangan(k, opsi) {
    opsi = opsi || {};
    var hidup = opsi.hidup !== false;
    if (hidup && jumlahPasanganHidup(k) >= MAKS_PASANGAN(k.jenisKelamin)) return null;
    var o = { id: id(), hidup: hidup };
    k.pasangan.push(o);
    return o;
  }

  function jumlahPasanganHidup(k) {
    return k.pasangan.filter(function (o) { return o.hidup !== false; }).length;
  }

  function tambahAnak(k, gender, opsi) {
    opsi = opsi || {};
    var o = {
      id: id(), gender: gender, hidup: opsi.hidup !== false,
      // angkat dan tiri sama-sama bukan ahli waris, tapi alasannya berbeda dan
      // akibat hukumnya di Indonesia juga berbeda — jadi disimpan terpisah.
      // Anak angkat: KHI Pasal 209 memberi wasiat wajibah maksimal 1/3.
      // Anak tiri  : tidak. Ia mewarisi dari orang tua kandungnya sendiri.
      angkat: !!opsi.angkat, tiri: !!opsi.tiri, anak: []
    };
    k.anak.push(o);
    return o;
  }

  function tambahSaudara(k, jenis, gender, opsi) {
    opsi = opsi || {};
    var o = { id: id(), jenis: jenis, gender: gender, hidup: opsi.hidup !== false, anak: [] };
    k.saudara.push(o);
    return o;
  }

  function tambahPaman(k, jenis, opsi) {
    opsi = opsi || {};
    var o = { id: id(), jenis: jenis, hidup: opsi.hidup !== false, anak: [] };
    k.paman.push(o);
    return o;
  }

  /** Tambah anak pada seseorang (cucu / keponakan / sepupu). */
  function tambahKeturunan(orang, gender) {
    var o = { id: id(), gender: gender };
    orang.anak.push(o);
    return o;
  }

  /** Cari orang mana pun berdasarkan id, sekalian tahu ia ada di mana. */
  function cari(k, cariId) {
    var hasil = null;

    k.pasangan.forEach(function (o) {
      if (o.id === cariId) hasil = { orang: o, tipe: 'pasangan', induk: null };
    });
    k.anak.forEach(function (o) {
      if (o.id === cariId) hasil = { orang: o, tipe: 'anak', induk: null };
      o.anak.forEach(function (c) {
        if (c.id === cariId) hasil = { orang: c, tipe: 'cucu', induk: o };
      });
    });
    k.saudara.forEach(function (o) {
      if (o.id === cariId) hasil = { orang: o, tipe: 'saudara', induk: null };
      o.anak.forEach(function (c) {
        if (c.id === cariId) hasil = { orang: c, tipe: 'keponakan', induk: o };
      });
    });
    k.paman.forEach(function (o) {
      if (o.id === cariId) hasil = { orang: o, tipe: 'paman', induk: null };
      o.anak.forEach(function (c) {
        if (c.id === cariId) hasil = { orang: c, tipe: 'sepupu', induk: o };
      });
    });
    ['ayah', 'ibu', 'kakek', 'nenekAyah', 'nenekIbu'].forEach(function (t) {
      if (k[t] && cariId === t) hasil = { orang: k[t], tipe: t, induk: null };
    });
    return hasil;
  }

  function hapus(k, hapusId) {
    function saring(arr) {
      return arr.filter(function (o) {
        if (o.id === hapusId) return false;
        if (o.anak) o.anak = o.anak.filter(function (c) { return c.id !== hapusId; });
        return true;
      });
    }
    if (['ayah', 'ibu', 'kakek', 'nenekAyah', 'nenekIbu'].indexOf(hapusId) > -1) {
      k[hapusId] = null;
      // kakek hilang berarti paman kehilangan jalurnya
      if (hapusId === 'kakek') k.paman = [];
      return;
    }
    k.pasangan = saring(k.pasangan);
    k.anak = saring(k.anak);
    k.saudara = saring(k.saudara);
    k.paman = saring(k.paman);
  }

  // ═══════════════════════════════════════════════════════════════
  // Menurunkan daftar ahli waris dari struktur
  // ═══════════════════════════════════════════════════════════════

  var JENIS_KE_KUNCI = { kandung: 'kandung', seayah: 'sebapak', seibu: 'seibu' };

  /**
   * @returns {{counts: Object, catatan: Array, petaOrang: Object}}
   *   counts    -> masukan untuk Faraid.hitung()
   *   catatan   -> hal-hal yang perlu diberitahukan ke user
   *   petaOrang -> id orang => kunci ahli waris (untuk mewarnai pohon)
   */
  function keAhliWaris(k) {
    var counts = {};
    var catatan = [];
    var peta = {};

    function tambah(kunci, orangId) {
      counts[kunci] = (counts[kunci] || 0) + 1;
      if (orangId) peta[orangId] = kunci;
    }

    // ── Pasangan ──────────────────────────────────────────────────
    // Syarat mewarisi adalah pernikahan yang masih sah SAAT pewaris wafat, dan
    // ahli warisnya sendiri masih hidup pada saat itu. Pasangan yang wafat
    // lebih dulu tidak mewarisi apa pun — hubungan warisnya justru terbalik:
    // dulu pewaris yang mewarisi dari dia.
    var kunciPasangan = k.jenisKelamin === 'P' ? 'suami' : 'istri';
    var pasanganWafat = 0;
    k.pasangan.forEach(function (o) {
      if (o.hidup === false) { pasanganWafat++; return; }
      tambah(kunciPasangan, o.id);
    });

    if (pasanganWafat) {
      var adaAnakKandung = k.anak.some(function (a) { return !a.angkat && !a.tiri; });
      catatan.push({
        id: 'pasangan_wafat',
        tingkat: 'penting',
        teks: 'يوجد ' + pasanganWafat + ' من الزوجين تُوفي قبل المورِّث. من مات قبل المتوفى ' +
          'ليس وارثاً — ويرث فقط مَن كان حياً وقتَ الوفاة. ' +
          (adaAnakKandung
            ? 'واختبار من هذا الزواج يظل يرث نصيبه كاملاً؛ نسبُه إلى المتوفى لا ينقطع بموت ' +
              'أمه/أبيه، ونصيبه مثل نصيب أيِّ ابنٍ من زواجٍ آخر. '
            : '') +
          'وإن كان المتوفى قد ورث من هذا الزوج المتوفى سابقاً، فذلك المال أصبح ملكاً له ' +
          'ويدخل في مجموع التركة.'
      });
    }

    // ── Anak & cucu ───────────────────────────────────────────────
    var adaCucuLewatAnakPr = 0;
    var adaAnakAngkat = 0;
    var adaAnakTiri = 0;

    k.anak.forEach(function (a) {
      if (a.angkat) {
        adaAnakAngkat++;
        return; // anak angkat bukan ahli waris
      }
      if (a.tiri) {
        adaAnakTiri++;
        return; // anak tiri mewarisi dari orang tua kandungnya, bukan dari pewaris
      }
      if (a.hidup) {
        tambah(a.gender === 'L' ? 'anak_lk' : 'anak_pr', a.id);
      }

      a.anak.forEach(function (c) {
        if (a.gender === 'L') {
          // Cucu lewat anak laki-laki. Kalau anak laki-lakinya masih hidup,
          // cucu ini akan terhalang olehnya — biar mesin faraid yang
          // memutuskan, supaya user melihat sendiri alasannya.
          tambah(c.gender === 'L' ? 'cucu_lk' : 'cucu_pr', c.id);
        } else {
          // Cucu lewat anak perempuan tidak mewarisi.
          adaCucuLewatAnakPr++;
        }
      });
    });

    if (adaCucuLewatAnakPr) {
      catatan.push({
        id: 'cucu_lewat_anak_pr',
        tingkat: 'penting',
        teks: 'يوجد ' + adaCucuLewatAnakPr + ' حفيد من طريق البنت. هؤلاء لَيْسوا من الورثة في ' +
          'هذه القسمة — في الفرائض يرث الحفيد من طريق الابن الذكر فقط. الحفيد من البنت ' +
          'من ذوي الأرحام. وما دامت أمهم (بنت المتوفى) حيةً فهي التي ترث، ثم يصل إليهم ' +
          'المال بوارثها فيما بعد.'
      });
    }

    if (adaAnakAngkat) {
      catatan.push({
        id: 'anak_angkat',
        tingkat: 'penting',
        teks: 'يوجد ' + adaAnakAngkat + ' مولودٌ مكفول. الطفل المكفول ليس وارثاً لأن الكفالة ' +
          'لا تنقل النسب. في الجزائر لا يُعترف بالتبني (الكفالة فقط كنظام قانوني)، ولا ' +
          'يجوز للكافل الوصيةُ له بأكثر من الثلث.'
      });
    }

    if (adaAnakTiri) {
      catatan.push({
        id: 'anak_tiri',
        tingkat: 'penting',
        teks: 'يوجد ' + adaAnakTiri + ' ربيبٌ — ابنُ الزوج/الزوجة من زواجٍ سابق. الربيب ليس ' +
          'وارثاً لعدم وجود نسبٍ بينه وبين المتوفى؛ يرث من أبويه الأصليين فقط. الربيب ' +
          'يختلف عن المكفول. إن أراد الميت أن ينتفع به فله الهبة أثناء الحياة أو الوصية ' +
          'بحدِّ الثلث — وتصحُّ الوصية له لأنه ليس وارثاً.'
      });
    }

    // ── Orang tua & kakek nenek ───────────────────────────────────
    if (k.ayah && k.ayah.hidup) tambah('ayah', 'ayah');
    if (k.ibu && k.ibu.hidup) tambah('ibu', 'ibu');
    if (k.kakek && k.kakek.hidup) tambah('kakek', 'kakek');
    if (k.nenekAyah && k.nenekAyah.hidup) tambah('nenek_ayah', 'nenekAyah');
    if (k.nenekIbu && k.nenekIbu.hidup) tambah('nenek_ibu', 'nenekIbu');

    // ── Saudara & keponakan ───────────────────────────────────────
    var keponakanTakBerhak = 0;

    k.saudara.forEach(function (s) {
      var sufiks = JENIS_KE_KUNCI[s.jenis];
      if (s.hidup) {
        tambah('sdr_' + (s.gender === 'L' ? 'lk' : 'pr') + '_' + sufiks, s.id);
      }

      s.anak.forEach(function (c) {
        // Yang mewarisi hanya anak LAKI-LAKI dari saudara LAKI-LAKI kandung
        // atau seayah. Anak dari saudara perempuan, dan anak dari saudara
        // seibu, tidak termasuk ahli waris.
        var berhak = c.gender === 'L' && s.gender === 'L' && s.jenis !== 'seibu';
        if (berhak) {
          tambah('keponakan_' + (s.jenis === 'kandung' ? 'kandung' : 'sebapak'), c.id);
        } else {
          keponakanTakBerhak++;
        }
      });
    });

    if (keponakanTakBerhak) {
      catatan.push({
        id: 'keponakan_tak_berhak',
        tingkat: 'info',
        teks: 'يوجد ' + keponakanTakBerhak + ' من أنباء الإخوة ليسوا من الورثة. ' +
          'لا يرث إلا ابنُ الأخ الشقيق أو الأخ لأب. أما أنباء الأخت، وأنباء الأخ لأم، ' +
          'والإناث من أنباء الإخوة، فلا نصيب لهم.'
      });
    }

    // ── Paman & sepupu ────────────────────────────────────────────
    var sepupuTakBerhak = 0;

    k.paman.forEach(function (p) {
      var sufiks = p.jenis === 'kandung' ? 'kandung' : 'sebapak';
      if (p.hidup) tambah('paman_' + sufiks, p.id);
      p.anak.forEach(function (c) {
        if (c.gender === 'L') tambah('sepupu_' + sufiks, c.id);
        else sepupuTakBerhak++;
      });
    });

    if (sepupuTakBerhak) {
      catatan.push({
        id: 'sepupu_tak_berhak',
        tingkat: 'info',
        teks: 'بنتُ العم ليست من الورثة. لا يرث إلا ابنُ العم الشقيق أو العم لأب (ذكراً).'
      });
    }

    return { counts: counts, catatan: catatan, petaOrang: peta, anakAngkat: adaAnakAngkat };
  }

  /** Ada isinya atau belum? */
  function kosong(k) {
    return !k.pasangan.length && !k.anak.length && !k.saudara.length && !k.paman.length &&
      !k.ayah && !k.ibu && !k.kakek && !k.nenekAyah && !k.nenekIbu;
  }

  // ═══════════════════════════════════════════════════════════════
  // Jembatan ke tampilan daftar (penghitung + / −)
  //
  // Daftar dan pohon menyunting model yang SAMA, supaya keduanya tidak
  // pernah bertentangan. Menambah lewat daftar berarti membuat orang baru
  // dengan struktur yang paling masuk akal.
  // ═══════════════════════════════════════════════════════════════

  /** Berapa orang yang saat ini terhitung sebagai ahli waris tertentu. */
  function jumlah(k, kunci) {
    var c = keAhliWaris(k).counts;
    return c[kunci] || 0;
  }

  var PERLU_INDUK = {
    cucu_lk: 'الابن', cucu_pr: 'الابن',
    keponakan_kandung: 'الأخ الشقيق',
    keponakan_sebapak: 'الأخ لأب',
    sepupu_kandung: 'العم الشقيق',
    sepupu_sebapak: 'العم لأب'
  };

  /**
   * Tambah satu orang lewat tampilan daftar.
   * @returns {null|{peringatan:string}} peringatan kalau penambahan ini
   *          memaksa mengarang kerabat penghubung yang belum disebut user.
   */
  function tambahLewatDaftar(k, kunci) {
    switch (kunci) {
      case 'suami': case 'istri':
        return tambahPasangan(k) ? null : { gagal: true };
      case 'anak_lk': tambahAnak(k, 'L'); return null;
      case 'anak_pr': tambahAnak(k, 'P'); return null;

      case 'cucu_lk': case 'cucu_pr': {
        var gender = kunci === 'cucu_lk' ? 'L' : 'P';
        var ortu = k.anak.filter(function (a) {
          return a.gender === 'L' && !a.angkat && !a.tiri;
        })[0];
        var mengarang = false;
        if (!ortu) {
          // Cucu hanya bisa ada lewat anak laki-laki. Kalau belum ada,
          // dibuatkan satu dan ditandai sudah wafat — dan user diberi tahu,
          // karena inilah asal-usul kesalahan yang sering terjadi.
          ortu = tambahAnak(k, 'L', { hidup: false });
          mengarang = true;
        }
        tambahKeturunan(ortu, gender);
        return mengarang ? {
          peringatan: 'إن الحفيد لا يرث إلا عن طريق الابن الذكر، لذا أضفنا ابنَ ذَكَرٍ ' +
            'متوفَّى كحلقة وصل. إذا كان حفيدك من البنت فليس وارثاً — احذفه ' +
            'وادخله عبر شجرة العائلة.'
        } : null;
      }

      case 'ayah': k.ayah = { hidup: true }; return null;
      case 'ibu': k.ibu = { hidup: true }; return null;
      case 'kakek': k.kakek = { hidup: true }; return null;
      case 'nenek_ayah': k.nenekAyah = { hidup: true }; return null;
      case 'nenek_ibu': k.nenekIbu = { hidup: true }; return null;

      case 'sdr_lk_kandung': tambahSaudara(k, 'kandung', 'L'); return null;
      case 'sdr_pr_kandung': tambahSaudara(k, 'kandung', 'P'); return null;
      case 'sdr_lk_sebapak': tambahSaudara(k, 'seayah', 'L'); return null;
      case 'sdr_pr_sebapak': tambahSaudara(k, 'seayah', 'P'); return null;
      case 'sdr_lk_seibu': tambahSaudara(k, 'seibu', 'L'); return null;
      case 'sdr_pr_seibu': tambahSaudara(k, 'seibu', 'P'); return null;

      case 'keponakan_kandung': case 'keponakan_sebapak': {
        var jenis = kunci === 'keponakan_kandung' ? 'kandung' : 'seayah';
        var sdr = k.saudara.filter(function (s) { return s.jenis === jenis && s.gender === 'L'; })[0];
        var karang = false;
        if (!sdr) { sdr = tambahSaudara(k, jenis, 'L', { hidup: false }); karang = true; }
        tambahKeturunan(sdr, 'L');
        return karang ? {
          peringatan: 'ابن الأخ يرث عن طريق الأخ الذكر، لذا أضفنا أخاً ذكراً ' +
            'متوفَّى كحلقة وصل. راجِع الشجرة هل الوضع كذلك فعلاً.'
        } : null;
      }

      case 'paman_kandung': tambahPaman(k, 'kandung'); return null;
      case 'paman_sebapak': tambahPaman(k, 'seayah'); return null;

      case 'sepupu_kandung': case 'sepupu_sebapak': {
        var jp = kunci === 'sepupu_kandung' ? 'kandung' : 'seayah';
        var pm = k.paman.filter(function (p) { return p.jenis === jp; })[0];
        var karang2 = false;
        if (!pm) { pm = tambahPaman(k, jp, { hidup: false }); karang2 = true; }
        tambahKeturunan(pm, 'L');
        return karang2 ? {
          peringatan: 'ابن العم يرث عن طريق العم، لذا أضفنا عماً متوفّى كحلقة ' +
            'وصل. راجِع ذلك في شجرة العائلة.'
        } : null;
      }
    }
    return null;
  }

  /** Kurangi satu orang lewat tampilan daftar. */
  function kurangiLewatDaftar(k, kunci) {
    var peta = keAhliWaris(k).petaOrang;
    var kandidat = Object.keys(peta).filter(function (pid) { return peta[pid] === kunci; });
    if (!kandidat.length) return;
    // buang yang terakhir ditambahkan
    hapus(k, kandidat[kandidat.length - 1]);
    rapikan(k);
  }

  /**
   * Buang penghubung yang sudah tidak menghubungkan apa-apa — misalnya anak
   * laki-laki yang sudah wafat dan cucunya sudah dihapus semua.
   */
  function rapikan(k) {
    k.anak = k.anak.filter(function (a) {
      return a.hidup || a.angkat || a.tiri || a.anak.length;
    });
    k.saudara = k.saudara.filter(function (s) {
      return s.hidup || s.anak.length;
    });
    k.paman = k.paman.filter(function (p) {
      return p.hidup || p.anak.length;
    });
  }

  root.Keluarga = {
    baru: baru,
    MAKS_PASANGAN: MAKS_PASANGAN,
    jumlahPasanganHidup: jumlahPasanganHidup,
    tambahPasangan: tambahPasangan,
    tambahAnak: tambahAnak,
    tambahSaudara: tambahSaudara,
    tambahPaman: tambahPaman,
    tambahKeturunan: tambahKeturunan,
    cari: cari,
    hapus: hapus,
    rapikan: rapikan,
    keAhliWaris: keAhliWaris,
    kosong: kosong,
    jumlah: jumlah,
    tambahLewatDaftar: tambahLewatDaftar,
    kurangiLewatDaftar: kurangiLewatDaftar,
    PERLU_INDUK: PERLU_INDUK
  };
})(typeof window !== 'undefined' ? window : globalThis);
