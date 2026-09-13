/*
 * Tirkah — menghitung harta yang benar-benar boleh dibagi.
 *
 * Warisan bukan langsung dibagi dari total harta. Ada urutan yang disebut
 * berulang kali dalam QS An-Nisa ayat 11 dan 12: "...sesudah dipenuhi wasiat
 * yang dibuatnya atau (dan) sesudah dibayar hutangnya."
 *
 * Urutan yang dipakai di sini:
 *   1. keluarkan bagian harta bersama milik pasangan (kalau ada)
 *   2. biaya pengurusan jenazah
 *   3. pelunasan hutang
 *   4. pelaksanaan wasiat, maksimal 1/3
 *   5. sisanya barulah dibagi ke ahli waris
 */

(function (root) {
  'use strict';

  function bulat(x) {
    var v = Number(x) || 0;
    return v > 0 ? Math.floor(v) : 0;
  }

  /**
   * @param {Object} h  { total, hartaBersama, biayaJenazah, hutang, wasiat }
   * @param {boolean} adaPasangan  apakah ada suami/istri yang masih hidup
   */
  function hitung(h, adaPasangan) {
    var total = bulat(h.total);
    var langkah = [];
    var catatan = [];

    langkah.push({
      id: 'total', label: 'مجموع ما تركه الميت', nilai: total, tipe: 'awal'
    });

    var sisa = total;

    // 1. Harta bersama (gono-gini)
    var bagianPasangan = 0;
    if (h.hartaBersama && adaPasangan) {
      bagianPasangan = Math.floor(total / 2);
      sisa -= bagianPasangan;
      langkah.push({
        id: 'harta_bersama',
        label: 'Bagian harta bersama untuk pasangan',
        nilai: -bagianPasangan,
        tipe: 'kurang',
        ket: 'نصف المالِ المشترك ملكٌ للزوج/الزوجة منذ البداية، ليس ميراثاً. ' +
             'لا يُقسَّم إلا نصفُ الميت. هذه قاعدةٌ من قوانين الدولة في بعض البلدان (كالمادة 37 ' +
             'من قانون الأسرة في بعض تطبيقاته) — وليست من أدلة الفرائض. ' +
             'ما كان ملكاً خاصاً قبل الزواج، وما يُرث أو يُهدى لكلٍّ منهما، لا يدخل في المال المشترك.',
        dalil: 'harta-bersama'
      });
      catatan.push({
        id: 'harta_bersama',
        teks: 'الزوج/الزوجة يأخذ هذا المبلغ ملكاً (نصف المال المشترك)، ثم له ' +
              'نصيبٌ من الميراث أيضاً من مالِ الميت.'
      });
    }

    // 2. Biaya pengurusan jenazah
    var biaya = Math.min(bulat(h.biayaJenazah), sisa);
    if (biaya > 0) {
      sisa -= biaya;
      langkah.push({
        id: 'biaya', label: 'تجهيز الميت (غسل، كفن، دفن)', nilai: -biaya, tipe: 'kurang',
        ket: 'الغسل والتكفين والصلاة عليه والدفن مقدَّمةٌ على كل حقٍّ آخر.'
      });
    }

    // 3. Hutang
    var hutangDiminta = bulat(h.hutang);
    var hutang = Math.min(hutangDiminta, sisa);
    var hutangKurang = hutangDiminta - hutang;
    if (hutangDiminta > 0) {
      sisa -= hutang;
      langkah.push({
        id: 'hutang', label: 'قضاء الديون', nilai: -hutang, tipe: 'kurang',
        ket: 'دَينُ الميت يُقضى قبل كلِّ شيء، سواء كان ديناً بين الناس أو التزاماً مؤجلاً كالزكاة.'
      });
    }
    if (hutangKurang > 0) {
      catatan.push({
        id: 'hutang_lebih_besar',
        tingkat: 'penting',
        teks: 'دينُ الميت أكبرُ من ماله، ينقص ' + hutangKurang + '. ' +
              'لا يوجد ميراثٌ يُقسَّم. الباقي من الدين ليس واجباً على الورثة، لكن يُستحسن أن يتحمله ' +
              'الأقارب حتى يبرأ الميت من تَبِعته.'
      });
    }

    // 4. Wasiat, dibatasi 1/3
    var batasWasiat = Math.floor(sisa / 3);
    var wasiatDiminta = bulat(h.wasiat);
    var wasiat = Math.min(wasiatDiminta, batasWasiat);
    if (wasiatDiminta > 0) {
      sisa -= wasiat;
      langkah.push({
        id: 'wasiat', label: 'تنفيذ الوصية', nilai: -wasiat, tipe: 'kurang',
        ket: 'تُنفَّذ الوصية بعد قضاء الدين، ولا تتجاوز ثلث ما تبقى.'
      });
    }
    if (wasiatDiminta > wasiat) {
      catatan.push({
        id: 'wasiat_dipotong',
        tingkat: 'penting',
        teks: 'الوصية المخططة (' + wasiatDiminta + ') تجاوزت الثلث فقُطعت إلى ' + wasiat + '. ' +
              'الرسول ﷺ قَصَرها على الثلث: «الثُّلُثُ، وَالثُّلُثُ كَثِيرٌ» (رواه البخاري ومسلم). ' +
              'ما زاد على الثلث لا يصح إلا برضا جميع الورثة.',
        dalil: 'hadits-wasiat-sepertiga'
      });
    }

    langkah.push({
      id: 'tirkah', label: 'مقدار التركة الصالح للتقسيم', nilai: sisa, tipe: 'hasil'
    });

    return {
      total: total,
      bagianHartaBersama: bagianPasangan,
      biayaJenazah: biaya,
      hutang: hutang,
      hutangKurang: hutangKurang,
      wasiat: wasiat,
      wasiatDiminta: wasiatDiminta,
      batasWasiat: batasWasiat,
      tirkah: sisa,
      langkah: langkah,
      catatan: catatan
    };
  }

  root.Estate = { hitung: hitung };
})(typeof window !== 'undefined' ? window : globalThis);
