/*
 * Ashabah — penerima sisa harta.
 *
 * Dasarnya hadits: "Berikan bagian-bagian tetap kepada yang berhak, lalu sisanya
 * untuk kerabat laki-laki yang paling dekat." (HR Bukhari & Muslim)
 *
 * Tiga bentuk:
 *  - bin nafsihi : laki-laki yang jadi ashabah karena dirinya sendiri
 *  - bil ghair   : perempuan yang jadi ashabah karena ditarik saudara laki-lakinya (2:1)
 *  - ma'al ghair : saudara perempuan yang jadi ashabah karena adanya anak/cucu perempuan
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;
  var F = f.F;

  /*
   * Aturan 2 : 1 punya DUA ayat yang berbeda, dan keduanya tidak saling
   * menggantikan:
   *   - QS An-Nisa 11  berbicara tentang ANAK ("fii awlaadikum"). Cucu ikut
   *                    ayat ini karena mengambil kedudukan anak saat anak
   *                    laki-laki tidak ada.
   *   - QS An-Nisa 176 berbicara tentang SAUDARA dalam keadaan kalalah, dan
   *                    kalimat terakhirnya menyebut 2 : 1 secara khusus untuk
   *                    saudara laki-laki dan perempuan.
   * Dulu semua pasangan ditunjukkan ke QS An-Nisa 11 — keliru, karena ayat itu
   * tidak menyinggung saudara sama sekali.
   */
  var DALIL_BIL_GHAIR = {
    anak_lk: 'qs4-11',
    cucu_lk: 'qs4-11',
    sdr_lk_kandung: 'qs4-176',
    sdr_lk_sebapak: 'qs4-176'
  };

  /* Klausa di dalam ayat yang benar-benar menyebut perbandingan 2 : 1. */
  var POTONGAN_BIL_GHAIR = {
    anak_lk: 'anak',
    cucu_lk: 'anak',
    sdr_lk_kandung: 'saudaraCampur',
    sdr_lk_sebapak: 'saudaraCampur'
  };

  var KETERANGAN_BIL_GHAIR = {
    anak_lk: 'قد ذُكرت هذه النسبة صراحةً في الآية 11 من سورة النساء في شأن الأولاد.',
    cucu_lk: 'ابنُ الابن يقوم مقام الابن حين لا يترك الميتُ ابناً، فيأخذ الحكم ذاته.',
    sdr_lk_kandung: 'ذُكرت هذه النسبة في آخر الآية 176 من سورة النساء — آية الكلالة، ' +
      'أي من لا يترك ولداً ولا أباً.',
    sdr_lk_sebapak: 'الأخُ لأبٍّ يقوم مقام الشقيق حين لا يوجد شقيق، فيأخذ الحكم ذاته ' +
      'من الآية 176 من سورة النساء.'
  };

  /**
   * @param {Object} aktif
   * @param {Fraction} sisa  sisa harta setelah bagian tetap
   * @returns {null|{bagian:Object, tipe:string, penerima:Array, alasan:string, dalil:string}}
   */
  function bagi(aktif, sisa) {
    function n(k) { return aktif[k] || 0; }
    function ada(k) { return n(k) > 0; }

    var faruPr = ada('anak_pr') || ada('cucu_pr');

    // ── Ashabah bin nafsihi / bil ghair ──────────────────────────────
    for (var i = 0; i < H.URUTAN_ASHABAH.length; i++) {
      var key = H.URUTAN_ASHABAH[i];
      if (!ada(key)) continue;

      var partner = H.PASANGAN_BIL_GHAIR[key];
      var bagian = {};

      if (partner && ada(partner)) {
        var unit = 2 * n(key) + n(partner);
        bagian[key] = f.mul(sisa, F(2 * n(key), unit));
        bagian[partner] = f.mul(sisa, F(n(partner), unit));
        return {
          bagian: bagian,
          tipe: 'bil_ghair',
          penerima: [key, partner],
          alasan: H.label(key) + ' و' + H.label(partner) +
            ' يتقاسمان الباقي بنسبة 2 : 1 — للذكر ضعفُ الأنثى. ' + KETERANGAN_BIL_GHAIR[key],
          dalil: DALIL_BIL_GHAIR[key],
          potongan: POTONGAN_BIL_GHAIR[key],
          // Ayat menetapkan PERBANDINGANNYA; hadits menetapkan bahwa merekalah
          // yang mengambil sisa harta. Dua hal berbeda, jadi dua-duanya dirujuk.
          dalilLain: ['hadits-ashabah']
        };
      }

      bagian[key] = sisa;
      return {
        bagian: bagian,
        tipe: 'bin_nafsihi',
        penerima: [key],
        alasan: (key === 'ayah' || key === 'kakek')
          ? H.label(key) + ' يأخذ الباقي كله بعد دفع الفروض.'
          : H.label(key) + ' أقربُ الذكور، فالباقي كلُّه حقٌّ له.',
        dalil: 'hadits-ashabah',
        // Hak anak dan cucu untuk mewarisi sendiri berasal dari QS An-Nisa 11.
        dalilLain: (key === 'anak_lk' || key === 'cucu_lk') ? ['qs4-11']
                 : (key === 'ayah' || key === 'kakek') ? ['qs4-11'] : []
      };
    }

    // ── Ashabah ma'al ghair ──────────────────────────────────────────
    if (faruPr) {
      var kandidat = ada('sdr_pr_kandung') ? 'sdr_pr_kandung'
                   : ada('sdr_pr_sebapak') ? 'sdr_pr_sebapak' : null;
      if (kandidat) {
        var b = {};
        b[kandidat] = sisa;
        return {
          bagian: b,
          tipe: 'maal_ghair',
          penerima: [kandidat],
          // HR Bukhari 6736 menyebut keadaan ini apa adanya: "...dan sisanya
          // untuk saudara perempuan" — lebih tepat daripada hadits ashabah
          // yang sifatnya umum.
          alasan: H.label(kandidat) + ' صارت عصبةً لأن الميت ترك فرعاً أنثوياً (بنتاً أو بنت ابن)، ' +
            'فتأخذ الباقي بعد دفع الفروض. وقد نصَّ على هذا الحال ابنُ مسعود: ' +
            '«والباقي للأخوات».',
          dalil: 'hadits-cucu-pr',
          dalilLain: ['qs4-176']
        };
      }
    }

    return null;
  }

  root.Ashabah = { bagi: bagi };
})(typeof window !== 'undefined' ? window : globalThis);
