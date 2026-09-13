/*
 * Catatan hukum positif yang berlaku di wilayah hukum kalkulator ini.
 *
 * Hasil utama kalkulator menuruti faraid mazhab Maliki. Tapi kalau perkaranya
 * dibawa ke Pengadilan (Bagian Keluarga), hakim bisa memakai ketentuan
 * tersendiri dalam undang-undang positif yang di beberapa titik berbeda dengan
 * fiqh klasik. Catatan di bawah hanya memunculkan "kalau perkara ini
 * diselesaikan secara hukum positif, hasilnya bisa begini" — tanpa mengubah
 * hitungan apa pun.
 *
 * BATASAN YANG DISENGAJA
 * Rujukan utama tetaplah Al-Qur'an dan sunnah. Ketentuan negara hanya
 * dicantumkan bila benar-benar berlaku — di sini: Undang-Undang Keluarga
 * (Ordonansi 84-11 Tahun 1984 yang telah diubah dan disempurnakan oleh Ordonansi
 * 05-02 Tahun 2005), khususnya soal zawiyyah/tanzil dan hak waris zawi al-arham.
 * Hukum perdata umum dan kebiasaan adat setempat sengaja tidak dipakai.
 */

(function (root) {
  'use strict';

  /*
   * Sumber hukum yang dipakai, dicocokkan ke dokumen resmi undang-undang
   * keluarga: teks asli Ordonansi 84-11 (Perancis) dan teks Arab resminya.
   */
  var SUMBER = {
    khi: {
      label: 'قانون الأسرة الجزائري — الأمر 84-11 (النسخة العربية)',
      url: 'https://learningpartnership.org/sites/default/files/resources/pdfs/Algeria-Family-Code-2007-Arabic.pdf'
    },
    uuKawin35: {
      label: 'النص الفرنسي الرسمي للأمر 84-11 (للاستناد لمواد الملكية بين الزوجين)',
      url: 'https://consulat-strasbourg-algerie.fr/wp-content/uploads/2022/08/Loi-n%C2%B0-84-11-du-09-juin-84-code-de-la-famille.pdf'
    },
    peradilanAgama: {
      label: 'الصورة المعدلة والمتممة بالأمر 05-02 (للاطلاع على مادتي التنزيل 169-172)',
      url: 'https://notaire-touati.com/wp-content/uploads/2025/06/قانون-الأسرة.pdf'
    },
    putusan: {
      label: 'نسخة عربية كاملة للنظام 84-11',
      url: 'https://learningpartnership.org/sites/default/files/resources/pdfs/Algeria-Family-Code-2007-Arabic.pdf'
    }
  };

  /**
   * @param {Object} hasil   keluaran Faraid.hitung()
   * @returns {Array<{id, judul, teks, pasal, tautan}>}
   */
  function catatan(hasil) {
    var out = [];
    var input = hasil.input || {};
    var kondisi = input.kondisi || {};
    var harta = input.harta || {};
    var aw = input.ahliWaris || {};

    var adaPasangan = (aw.suami || 0) > 0 || (aw.istri || 0) > 0;

    // ── التنزيل: حفيد من ابنٍ مات قبل المورِّث ──────────────────────
    if (kondisi.cucuDariAnakWafat) {
      out.push({
        id: 'khi-185',
        judul: 'الحفيد الذي مات أبوه قبل المورِّث',
        pasal: 'المواد 169–172 من قانون الأسرة (التنزيل)',
        tautan: [SUMBER.peradilanAgama, SUMBER.putusan],
        teks: 'في الفرائض الكلاسيكية يُحجَب هذا الحفيد ما دام الميت ترك فرعاً وارثاً — لذلك ' +
          'لم يُحسب في النتيجة أعلاه. أما قانون الأسرة الجزائري فأقرَّ مبدأ التنزيل: ' +
          'يحلُّ الحفيدُ محلَّ أبيه المتوفى في نصيبه، لكن في حدود الثلث فقط، ولا يشارك ' +
          'مع الورثة الأصليين في أكثر من ذلك (المادة 169). إن أُحيلت المسألة إلى قسم ' +
          'شؤون الأسرة فسيُعطى الحفيدُ على الأرجح التنزيل، وهو خيارٌ كثيراً ما يختاره ' +
          'الأقارب حسماً للخلاف.'
      });
    }

    // ── الطفل المكفول ــ لا تبنٍّ في القانون الجزائري ───────────────
    if (kondisi.anakAngkat) {
      out.push({
        id: 'khi-209',
        judul: 'الطفل المكفول',
        pasal: 'نظام الكفالة — قانون الأسرة',
        tautan: [SUMBER.khi],
        teks: 'لا يُعترف في الجزائر بالتبني المورِّث (التبني الذي ينقل النسب)، بل بنظام ' +
          'الكفالة: المحضونُ يبقى على نسبه، فلا يرث من كافله. ويبقى بابُ الإحسان مشروعاً ' +
          'بالوصية في حدود الثلث، وبالهبة أثناء الحياة. إن وُجدت رغبة في ذلك، يُستشار ' +
          'قسم شؤون الأسرة للموالاة بين الفرض والوصية.'
      });
    }

    if (kondisi.bedaAgama) {
      out.push({
        id: 'khi-wasiat-wajibah',
        judul: 'فردٌ من العائلة على دينٍ آخر',
        pasal: 'الاجتهاد في تنزيل الأحوال الخاصة',
        tautan: [SUMBER.khi],
        teks: 'اختلاف الدين يمنع الإرث في الفروع المذهبية المعمول بها: «لا يرث المسلم ' +
          'الكافرَ ولا الكافرُ المسلم» (متفق عليه)، وبهذا لم يُدخل في الحساب أعلاه. ' +
          'الطريق المباح للبرِّ بهم: الهبة في الحياة، أو الوصية في حدود الثلث. إن ' +
          'طرأت أحوالٌ خاصة فقد يُرجع في الوثائق المتنازَع فيها إلى الجهة القضائية المختصة.'
      });
    }

    // ── الملكية بين الزوجين: لا مالَ مشتركاً تلقائياً ───────────────
    if (adaPasangan && !harta.hartaBersama) {
      out.push({
        id: 'khi-96',
        judul: 'الملكية بين الزوجين والتركة',
        pasal: 'المادتان 37–38 من قانون الأسرة',
        tautan: [SUMBER.uuKawin35, SUMBER.putusan],
        teks: 'لا يوجد في القانون الجزائري نظام «مال مشترك» يُحمَّل تلقائياً على الزوجية، ' +
          'فكلُّ زوجٍ يملكُ ما كسبه بذاته. المادة 37 لا تعني سوى أن الإسهامات التي ' +
          'أدَّاها الزوجان في قيام البيت تُحاسَب عند الحساب في صورتي الطلاق أو الوفاة — ' +
          'وهذا تصفيةُ ملكيةٍ لا حصةُ إرث. لذلك لم نقتطع هنا شيئاً باسم الزوجية. إن ' +
          'كانت للميت مساهماتٌ أو شركةُ زواج مادّية لم تحسم، يُستأنف ذلك قضائياً قبل ' +
          'توزيع التركة.'
      });
    }

    // ── الرد مع وجود الزوجين ────────────────────────────────────────
    if (hasil.perhitungan && hasil.perhitungan.radd && adaPasangan) {
      out.push({
        id: 'khi-radd',
        judul: 'اشتراك الزوجين في الرد',
        pasal: 'الممارسة المألوفة في أقسام شؤون الأسرة',
        tautan: [SUMBER.putusan, SUMBER.peradilanAgama],
        teks: 'في الحساب أعلاه رُدَّ الباقي على غير الزوجين بحسب مذهب الجمهور المالكي ' +
          'الذي لا يُشرك الزوجَ في الرد. بعض الممارسات القضائية تشركه مع جمهور الشركاء ' +
          'فتزيد نصيبه. الطريقان سائغان باتفاق الورثة، ويُستحسن البتُّ فيه أمام المختص.'
      });
    }

    if (hasil.sisaTidakTerbagi) {
      out.push({
        id: 'khi-sisa',
        judul: 'الباقي بعد نصيب الزوجين',
        pasal: 'الممارسة القضائية مع قصور بيت المال',
        tautan: [SUMBER.putusan],
        teks: 'بما أنه لا يوجد وارثٌ غير الزوجين، فالفقه الكلاسيكي يدفع الفاضل إلى بيت ' +
          'المال. وحيثُ انتفى في عصرنا دورُ تلك المؤسسة كما كانت، تُغلب الممارسةُ ' +
          'المحكمةَ على سلِمه إلى الزوج أو الزوجة الباقي، وإلا فإلى جهة البر أو الوقف ' +
          'بعد استشارة القاضي.'
      });
    }

    return out;
  }

  root.KHI = { catatan: catatan, SUMBER: SUMBER };
})(typeof window !== 'undefined' ? window : globalThis);