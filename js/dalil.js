/*
 * DALIL — sumber hukum untuk setiap aturan yang dipakai kalkulator ini.
 *
 * Dataset statis. Aturan waris dalam Islam sudah baku dan tertutup: tidak
 * berubah sejak diturunkan, tidak perlu ditanyakan ulang ke mesin pencari
 * atau AI setiap kali orang menghitung. Jadi sumbernya dikumpulkan sekali,
 * disimpan di sini, lalu dipanggil berulang-ulang lewat lookup biasa.
 *
 * Setiap entri menyimpan `tautan` ke sumber daring yang bisa dibuka pembaca
 * untuk memeriksa sendiri teks Arab, terjemahan, sanad, dan derajat haditsnya.
 * Nomor hadits dan derajat di bawah sudah dicocokkan satu per satu dengan
 * hadits.id (Agustus 2026).
 *
 * ─────────────────────────────────────────────────────────────────────
 * CATATAN UNTUK PEMILIK SITUS
 * Ini menyangkut hukum agama. Pencocokan dengan sumber daring memastikan
 * nomor dan teksnya benar, tapi TIDAK menggantikan pemeriksaan seorang ustadz
 * yang kompeten di bidang faraid — terutama untuk penilaian derajat hadits,
 * yang antar ulama pun bisa berbeda. Kode bisa diuji dengan test suite;
 * keabsahan kutipan tidak bisa.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Terjemahan di bawah sengaja ditulis dalam bahasa Indonesia sehari-hari
 * agar mudah dipahami orang awam, bukan salinan terjemahan resmi.
 */

(function (root) {
  'use strict';

  var DALIL = {

    // ── Al-Qur'an ───────────────────────────────────────────────────
    'qs4-7': {
      jenis: 'quran',
      rujukan: 'سورة النساء: 7',
      tautan: { label: 'اقرأ في Quran.com', url: 'https://quran.com/4/7' },
      arab: 'لِّلرِّجَالِ نَصِيبٌ مِّمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ وَلِلنِّسَاءِ نَصِيبٌ مِّمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ مِمَّا قَلَّ مِنْهُ أَوْ كَثُرَ ۚ نَصِيبًا مَّفْرُوضًا',
      terjemah: 'للرجال نصيبٌ مما ترك الوالدان والأقربون، وللنساء نصيبٌ مما ترك الوالدان ' +
        'والأقربون — قلَّ ذلك أو كثر. نصيباً مفروضاً.',
      ringkas: 'للمرأة حقُّ الإرث. هذه الآية نسخت عادة أهل الجاهلية التي لا تورِّث إلا الرجل.'
    },

    /*
     * AYAT DITAMPILKAN UTUH — TIDAK PERNAH DIPENGGAL.
     *
     * Satu ayat waris memuat beberapa ketetapan sekaligus. Kalau yang
     * ditampilkan hanya klausa yang sedang dibahas, pembaca kehilangan konteks
     * dan kutipannya berubah menjadi potongan yang bisa menyesatkan. Karena itu
     * ayat disimpan sebagai deretan RUAS: seluruh ruas selalu ditampilkan, dan
     * ruas yang menetapkan bagian orang yang sedang dibaca cukup disorot,
     * sisanya dipudarkan.
     *
     * Ruas yang bukan ketetapan bagian (kalimat penghubung dan penutup ayat)
     * memakai id null — ia tetap tampil, hanya tidak pernah menjadi sorotan.
     */
    'qs4-11': {
      jenis: 'quran',
      rujukan: 'سورة النساء: 11',
      tautan: { label: 'اقرأ في Quran.com', url: 'https://quran.com/4/11' },
      segmen: [
        { id: 'anak',
          arab: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ ۚ',
          arti: 'يوصيكم الله في أولادكم: للذَّكر مثلُ حظِّ الأنثيين.' },
        { id: 'anakPrBanyak',
          arab: 'فَإِنْ كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ',
          arti: 'فإن كنَّ نساءً فوق اثنتين فلهنّ ثلثا ما ترك.' },
        { id: 'anakPrTunggal',
          arab: 'وَإِنْ كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ ۚ',
          arti: 'وإن كانت واحدةً فلها النصف.' },
        { id: 'ortuAdaAnak',
          arab: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِنْ كَانَ لَهُ وَلَدٌ ۚ',
          arti: 'ولأبويه لكلِّ واحدٍ منهما السدسُ مما ترك إن كان له ولد.' },
        { id: 'ibuTanpaAnak',
          arab: 'فَإِنْ لَمْ يَكُنْ لَهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ ۚ',
          arti: 'فإن لم يكن له ولدٌ وورثه أبواه فلأمه الثلث.' },
        { id: 'ibuAdaSaudara',
          arab: 'فَإِنْ كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ ۚ',
          arti: 'فإن كان له إخوةٌ فلأمه السدس.' },
        { id: 'urutan',
          arab: 'مِنْ بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ ۗ',
          arti: 'من بعد وصيةٍ يوصي بها أو دين.' },
        { id: null,
          arab: 'آبَاؤُكُمْ وَأَبْنَاؤُكُمْ لَا تَدْرُونَ أَيُّهُمْ أَقْرَبُ لَكُمْ نَفْعًا ۚ فَرِيضَةً مِنَ اللَّهِ ۗ إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا',
          arti: 'آباؤكم وأبناؤكم لا تدرون أيُّهم أقرب لكم نفعاً. فريضةً من الله، إن الله كان عليماً حكيماً.' }
      ],
      potongan: {
        anak: { ket: 'نصيب الابن والبنت' },
        anakPrBanyak: { ket: 'بنتان فأكثر بلا ابن' },
        anakPrTunggal: { ket: 'بنتٌ واحدة بلا ابن' },
        ortuAdaAnak: { ket: 'الأبوان عندما يترك الميت ولداً أو حفيداً' },
        ibuTanpaAnak: { ket: 'الأم عندما لا يوجد ولدٌ ولا حفيدٌ' },
        ibuAdaSaudara: { ket: 'الأم عندما يكون للميت أخوان أو أكثر' },
        urutan: { ket: 'الوصية والدين مُسلَّمان أولاً' }
      },
      ringkas: 'أساس أنصبة الأولاد والأبوين. وقد قررت الآية أن التقسيم يقع بعد الوصية ' +
        'والدين.'
    },

    'qs4-12': {
      jenis: 'quran',
      rujukan: 'سورة النساء: 12',
      tautan: { label: 'اقرأ في Quran.com', url: 'https://quran.com/4/12' },
      segmen: [
        { id: 'suamiTanpaAnak',
          arab: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِنْ لَمْ يَكُنْ لَهُنَّ وَلَدٌ ۚ',
          arti: 'ولكم نصفُ ما تركت أزواجكم إن لم يكن لهنّ ولد.' },
        { id: 'suamiAdaAnak',
          arab: 'فَإِنْ كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ ۚ',
          arti: 'فإن كان لهنّ ولدٌ فلكم الربع مما تركن.' },
        { id: null,
          arab: 'مِنْ بَعْدِ وَصِيَّةٍ يُوصِينَ بِهَا أَوْ دَيْنٍ ۚ',
          arti: 'من بعد وصيةٍ يوصين بها أو دين.' },
        { id: 'istriTanpaAnak',
          arab: 'وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِنْ لَمْ يَكُنْ لَكُمْ وَلَدٌ ۚ',
          arti: 'ولهنّ الربع مما تركتم إن لم يكن لكم ولد.' },
        { id: 'istriAdaAnak',
          arab: 'فَإِنْ كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُمْ ۚ',
          arti: 'فإن كان لكم ولدٌ فلهنّ الثمن مما تركتم.' },
        { id: null,
          arab: 'مِنْ بَعْدِ وَصِيَّةٍ تُوصُونَ بِهَا أَوْ دَيْنٍ ۗ',
          arti: 'من بعد وصيةٍ توصون بها أو دين.' },
        { id: 'seibuTunggal',
          arab: 'وَإِنْ كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ ۚ',
          arti: 'وإن كان رجلٌ يُورث كلالةً أو امرأةٌ وله أخٌ أو أختٌ فلكلِّ واحدٍ منهما السدس.' },
        { id: 'seibuBanyak',
          arab: 'فَإِنْ كَانُوا أَكْثَرَ مِنْ ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ ۚ',
          arti: 'فإن كانوا أكثر من ذلك فهم شركاء في الثلث.' },
        { id: null,
          arab: 'مِنْ بَعْدِ وَصِيَّةٍ يُوصَىٰ بِهَا أَوْ دَيْنٍ غَيْرَ مُضَارٍّ ۚ وَصِيَّةً مِنَ اللَّهِ ۗ وَاللَّهُ عَلِيمٌ حَلِيمٌ',
          arti: 'من بعد وصيةٍ يوصى بها أو دينٍ غير مضار. وصيةً من الله، والله عليم حلِيم.' }
      ],
      potongan: {
        suamiTanpaAnak: { ket: 'الزوج عندما لا يترك الزوج فرعاً وارثاً' },
        suamiAdaAnak: { ket: 'الزوج عندما يترك فرعاً وارثاً' },
        istriTanpaAnak: { ket: 'الزوجة عندما لا يترك الزوج فرعاً وارثاً' },
        istriAdaAnak: { ket: 'الزوجة عندما يترك الزوج فرعاً وارثاً' },
        seibuTunggal: { ket: 'أخو/أخت لأمٍّ واحد في حالة الكلالة' },
        seibuBanyak: { ket: 'أخوان فأكثر لأم' }
      },
      ringkas: 'أساس نصيب الزوجين ونصيب الإخوة لأم.'
    },

    'qs4-176': {
      jenis: 'quran',
      rujukan: 'سورة النساء: 176',
      tautan: { label: 'اقرأ في Quran.com', url: 'https://quran.com/4/176' },
      segmen: [
        { id: null,
          arab: 'يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ',
          arti: 'يستفتونك، قل: الله يفتيكم في الكلالة.' },
        { id: 'sdrPrTunggal',
          arab: 'إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ ۚ',
          arti: 'إن امرؤٌ هلك ليس له ولدٌ وله أختٌ فلها نصفُ ما ترك.' },
        { id: 'sdrLkSendiri',
          arab: 'وَهُوَ يَرِثُهَا إِنْ لَمْ يَكُنْ لَهَا وَلَدٌ ۚ',
          arti: 'وهو يرثها إن لم يكن لها ولد.' },
        { id: 'sdrPrBanyak',
          arab: 'فَإِنْ كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ ۚ',
          arti: 'فإن كانتا اثنتين فلهما الثلثان مما ترك.' },
        { id: 'saudaraCampur',
          arab: 'وَإِنْ كَانُوا إِخْوَةً رِجَالًا وَنِسَاءً فَلِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ ۗ',
          arti: 'وإن كانوا إخوةً رجالاً ونساءً فللذكر مثلُ حظِّ الأنثيين.' },
        { id: null,
          arab: 'يُبَيِّنُ اللَّهُ لَكُمْ أَنْ تَضِلُّوا ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ',
          arti: 'يبين الله لكم أن تضلوا، والله بكل شيء عليم.' }
      ],
      potongan: {
        sdrPrTunggal: { ket: 'أختٌ واحدة في حالة الكلالة' },
        sdrLkSendiri: { ket: 'يرث الأخُ أختَه' },
        sdrPrBanyak: { ket: 'أختان فأكثر' },
        saudaraCampur: { ket: 'الإخوة الذكور والإناث مجتمعين' }
      },
      ringkas: 'أساس نصيب الإخوة الأشقاء والإخوة لأب في حالة الكلالة — ' +
        'لا يكون للميت ولدٌ ولا أب. وخاتمة الكلام فيها هي أصل القسمة 2 : 1 بين ' +
        'الأخ وأخته.'
    },

    'qs4-13': {
      jenis: 'quran',
      rujukan: 'سورة النساء: 13',
      tautan: { label: 'اقرأ في Quran.com', url: 'https://quran.com/4/13' },
      arab: 'تِلْكَ حُدُودُ اللَّهِ ۚ وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ',
      terjemah: 'تلك حدودُ الله. ومن يُطع اللهَ ورسولَه يدخله جناتٍ تجري من تحتها الأنهار.',
      ringkas: 'خاتمة آيات المواريث: القاعدة ليست اقتراحاً بل حدودٌ فرضها الله ' +
        'لا يُزاد فيها ولا يُنقص.'
    },

    // ── Hadits ──────────────────────────────────────────────────────
    'hadits-ashabah': {
      jenis: 'hadits',
      rujukan: 'البخاري 6732 ومسلم 1615',
      arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا، فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
      terjemah: 'أعطوا الفرائضَ أهلَها، وما بقي فهو لأولى رجلٍ ذكر.',
      sumber: 'عن ابن عباس رضي الله عنهما. متفق عليه.',
      tautan: { label: 'اقرأ في hadits.id — البخاري 6732', url: 'https://www.hadits.id/hadits/bukhari/6732' },
      tautanLain: [{ label: 'مسلم 1615', url: 'https://www.hadits.id/hadits/muslim/1615' }],
      ringkas: 'أصل نظام العصبة كله: من يأخذ الباقي بعد أداء أصحاب الفروض، وترتيب قُربهم.'
    },

    'hadits-nenek': {
      jenis: 'hadits',
      rujukan: 'الترمذي 2101، أبو داود 2894، ابن ماجه 2724',
      arab: 'جَاءَتِ الْجَدَّةُ إِلَى أَبِي بَكْرٍ الصِّدِّيقِ تَسْأَلُهُ مِيرَاثَهَا ... فَشَهِدَ الْمُغِيرَةُ بْنُ شُعْبَةَ أَنَّ النَّبِيَّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ أَعْطَاهَا السُّدُسَ',
      terjemah: 'جاءت جدة إلى أبي بكر الصديق تسأله عن ميراثها، فقال: ما أجد لك في كتاب الله ' +
        'شيئاً... فشهد المغيرة بن شعبة أن النبي ﷺ أعطاها السدس، وشدّد شهادته محمد بن مسلمة.',
      sumber: 'عن قبيصة بن ذؤيب. طريق الترمذي صححه محققو دار السلام، وضعف الألباني طريق ' +
        'أبي داود. والعمل بفرض السدس للجدة عليه المذاهب الأربعة.',
      tautan: { label: 'اقرأ في hadits.id — الترمذي 2101', url: 'https://www.hadits.id/hadits/tirmidzi/2101' },
      tautanLain: [
        { label: 'أبو داود 2894', url: 'https://www.hadits.id/hadits/abudawud/2894' },
        { label: 'ابن ماجه 2724', url: 'https://www.hadits.id/hadits/ibnmajah/2724' }
      ],
      ringkas: 'فرض الجدة (السدس) لم يُذكر في القرآن بل ثبت بالسنة. وإن اجتمعت جدتان ' +
        'مستحقتان قُسم السدس بينهما بالسوية.'
    },

    'hadits-cucu-pr': {
      jenis: 'hadits',
      rujukan: 'البخاري 6736',
      arab: 'لِلِابْنَةِ النِّصْفُ، وَلِابْنَةِ الِابْنِ السُّدُسُ تَكْمِلَةَ الثُّلُثَيْنِ، وَمَا بَقِيَ فَلِلْأُخْتِ',
      terjemah: 'للابنة النصف، ولابنة الابن السدس تكملةً للثلثين، وما بقي فللأخت.',
      sumber: 'مما قضى به ابن مسعود رضي الله عنه وقال إنه قضى به كقضاء النبي ﷺ. صحيح.',
      tautan: { label: 'اقرأ في hadits.id — البخاري 6736', url: 'https://www.hadits.id/hadits/bukhari/6736' },
      ringkas: 'أصل فرض السدس للبنت ابن الابن تكملةً للثلثين عند وجود بنتٍ صلبية واحدة، ' +
        'وأصل مشاركة الأخت للبنت في العصبة.'
    },

    'hadits-wasiat-sepertiga': {
      jenis: 'hadits',
      rujukan: 'البخاري 2742 ومسلم 1628',
      arab: 'الثُّلُثُ، وَالثُّلُثُ كَثِيرٌ. إِنَّكَ أَنْ تَذَرَ وَرَثَتَكَ أَغْنِيَاءَ خَيْرٌ مِنْ أَنْ تَذَرَهُمْ عَالَةً يَتَكَفَّفُونَ النَّاسَ',
      terjemah: 'الثُّلُث، والثُّلُث كثير. إنك إن تذر ورثتك أغنياءَ خيرٌ من أن تذرهم عالةً ' +
        'يتكففون الناسَ.',
      sumber: 'عن سعد بن أبي وقاص رضي الله عنه. متفق عليه.',
      tautan: { label: 'اقرأ في hadits.id — مسلم 1628', url: 'https://www.hadits.id/hadits/muslim/1628' },
      tautanLain: [{ label: 'البخاري 2742', url: 'https://www.hadits.id/hadits/bukhari/2742' }],
      ringkas: 'الحد الأقصى للوصية الثلث، وما زاد عن ذلك لا ينفذ إلا برضا الورثة كلهم.'
    },

'hadits-wasiat-ahli-waris': {
      jenis: 'hadits',
      rujukan: 'أبو داود 2870، الترمذي 2120، ابن ماجه 2713',
      arab: 'إِنَّ اللَّهَ قَدْ أَعْطَى كُلَّ ذِي حَقٍّ حَقَّهُ، فَلَا وَصِيَّةَ لِوَارِثٍ',
      terjemah: 'إن الله قد أعطى كل ذي حقٍّ حقَّه، فلا وصيةَ لوارث.',
      sumber: 'عن أبي أمامة الباهلي رضي الله عنه، من خطبة النبي ﷺ في حجة الوداع. ' +
        'حسنه الألباني ودار السلام، وحسنه الترمذي.',
      tautan: { label: 'اقرأ في hadits.id — الترمذي 2120', url: 'https://www.hadits.id/hadits/tirmidzi/2120' },
      tautanLain: [
        { label: 'أبو داود 2870', url: 'https://www.hadits.id/hadits/abudawud/2870' },
        { label: 'ابن ماجه 2713', url: 'https://www.hadits.id/hadits/ibnmajah/2713' }
      ],
      ringkas: 'لا وصية لوارث لأن نصيبه محدد بالفرض. إلا إذا أجازها بقية الورثة.'
    },

    'hadits-beda-agama': {
      jenis: 'hadits',
      rujukan: 'البخاري 6764 ومسلم 1614',
      arab: 'لَا يَرِثُ الْمُسْلِمُ الْكَافِرَ، وَلَا الْكَافِرُ الْمُسْلِمَ',
      terjemah: 'لا يرث المسلمُ الكافرَ، ولا الكافرُ المسلمَ.',
      sumber: 'عن أسامة بن زيد رضي الله عنهما. متفق عليه.',
      tautan: { label: 'اقرأ في hadits.id — البخاري 6764', url: 'https://www.hadits.id/hadits/bukhari/6764' },
      tautanLain: [{ label: 'مسلم 1614', url: 'https://www.hadits.id/hadits/muslim/1614' }],
      ringkas: 'اختلاف الدين يسقط حق الإرث من الجانبين معاً، ويبقى باب الهبة في الحياة ' +
        'أو الوصية في حدود الثلث.'
    },

    'hadits-pembunuh': {
      jenis: 'hadits',
      rujukan: 'أبو داود 4564 وابن ماجه 2735',
      arab: 'لَيْسَ لِلْقَاتِلِ شَىْءٌ ... وَلاَ يَرِثُ الْقَاتِلُ شَيْئًا',
      terjemah: 'ليس للقاتل شيء... ولا يرث القاتل شيئاً.',
      sumber: 'روى أبو داود في كتاب الديات حسنه الألباني. ورواه ابن ماجه عن أبي هريرة ' +
        'بلفظ «القاتل لا يرث» حسنه دار السلام.',
      tautan: { label: 'اقرأ في hadits.id — أبو داود 4564', url: 'https://www.hadits.id/hadits/abudawud/4564' },
      tautanLain: [{ label: 'ابن ماجه 2735', url: 'https://www.hadits.id/hadits/ibnmajah/2735' }],
      ringkas: 'قتلُ المورِّث يُسقط حق الإرث؛ سداً لذريعة استعجال الموت لأجل المال.'
    },

    // ── أثار الصحابة والإجماع ───────────────────────────────────────
    'atsar-zaid': {
      jenis: 'atsar',
      rujukan: 'قضاء زيد بن ثابت رضي الله عنه',
      terjemah: 'زيد بن ثابت — أشهر أصحاب النبي ﷺ في علم الفرائض — قضى بأن الجد لا يُسقط ' +
        'الإخوة الأشقاء ولا الإخوة لأب، بل يقاسمهم ويأخذ في المقاسمة أنفعَ الحالين له.',
      sumber: 'رواه الإمام مالك في الموطأ والبيهقي في السنن الكبرى، وهو ما أخذ به المذهبان ' +
        'الشافعي والمالكي.',
      ringkas: 'أصل حكم الجد مع الإخوة، وأصل حل مسألة الأكدرية.',
      khilafiyah: 'وذهب أبو حنيفة إلى خلافه: الجد يُسقط الإخوة جميعاً. وهذه الآلة تتبع ' +
        'زيد بن ثابت بموجب مذهب المالكي.'
    },

    'atsar-umar-musyarakah': {
      jenis: 'atsar',
      rujukan: 'قضاء عمر بن الخطاب رضي الله عنه',
      terjemah: 'في مسألة شغلت فيها نصيبُ الزوج والأم والإخوة لأم التركة كلها حتى لم يبق ' +
        'للأشقاء شيء، قضى عمر بمشاركة الأشقاء في الثلث مع الإخوة لأم — لاتحاد الأم.',
      sumber: 'رواه الإمام مالك في الموطأ والبيهقي في السنن الكبرى، وهو ما أخذ به ' +
        'المذهبان الشافعي والمالكي.',
      ringkas: 'أصل حل مسألة المشتركة.',
      khilafiyah: 'وذهب الحنفية والحنابلة إلى أن الأشقاء لا يأخذون شيئاً في هذه المسألة.'
    },

    'ijma-kakek': {
      jenis: 'ijma',
      rujukan: 'إجماع العلماء',
      terjemah: 'عند فقد الأب، يحل الجدُّ لأب مقامه في الإرث — مع استثناءات، أخصها ' +
        'عند اجتماعه مع إخوة الميت.',
      sumber: 'إجماع مذاهب الأئمة الأربعة، استناداً إلى عموم آيات المواريث.',
      ringkas: 'أصل فرض الجد (السدس) وعصوبته.'
    },

    // انفصل عمداً كنوع 'حكم'، لا قوله/حديث/أثر/إجماع.
    // المشاركة في مال الزوجية ليست من آيات ولا أحاديث المواريث، والكتب الفقهية
    // القديمة لا تعرف هذا المصطلح. ما يقع في الواقع الجزائري هو تحديد الملكية
    // أولاً، ثم ورث الباقي.
    'harta-bersama': {
      jenis: 'hukum',
      rujukan: 'المادة 37 من قانون الأسرة (الأمر 84-11)',
      terjemah: 'المادة 37: لكل واحد من الزوجين ملكية خاصة بما كسبه، وما أسهم به الزوجان ' +
        'في قيام البيت أو في تنميته يُحسب عند القسمة في صورة الفسخ أو الوفاة — لا أنه ' +
        'نصيبُ إرث.',
      sumber: 'هذا حكم قانون الأسرة الجزائري، لا دليلُ ميراثٍ. لا توجد فكرة «مال مشترك» ' +
        'تلقائية تخرج نصف التركة قبل القسمة؛ بل تُثبت المشاركةُ بالبيِّنة، والأصل أن كل ' +
        'زوج يملك ما كسب. أساس هذا الشراكة في الفقه: الشركة والعرف.',
      khilafiyah: 'إن أثبت الزوج الباقي مشاركةً مادية مالية، تُقوَّم حصته في القسمة قبل ' +
        'وراثة الباقي — وتقدير هذه المساهمة يترك للنظر القضائي المختص.',
      tautan: { label: 'الأمر 84-11 — النص الفرنسي', url: 'https://consulat-strasbourg-algerie.fr/wp-content/uploads/2022/08/Loi-n%C2%B0-84-11-du-09-juin-84-code-de-la-famille.pdf' },
      tautanLain: [
        { label: 'النسخة العربية للنظام 84-11',
          url: 'https://learningpartnership.org/sites/default/files/resources/pdfs/Algeria-Family-Code-2007-Arabic.pdf' }
      ],
      ringkas: 'أصل تحديد ملكية الزوجين قبل الميراث في القانون الجزائري — حكمٌ قانوني' +
        'وليست دليلاً فقهياً.'
    },

    'hadits-hutang': {
      jenis: 'hadits',
      rujukan: 'الترمذي 2122',
      arab: 'قَضَى بِالدَّيْنِ قَبْلَ الْوَصِيَّةِ',
      terjemah: 'قضى النبي ﷺ بالدين قبل الوصية، وأنتم تقرؤون الوصية مقدَّمة على الدين.',
      sumber: 'عن علي بن أبي طالب رضي الله عنه. حسنه دار السلام، وأجمع العلماء على هذا الترتيب.',
      tautan: { label: 'اقرأ في hadits.id — الترمذي 2122', url: 'https://www.hadits.id/hadits/tirmidzi/2122' },
      ringkas: 'الترتيب الصحيح: تكاليف التجهيز، ثم الدين، ثم الوصية، ثم الميراث.'
    }
  };

  function ambil(id) {
    return DALIL[id] || null;
  }

  /** Semua dalil yang dipakai dalam satu hasil perhitungan, tanpa duplikat. */
  function kumpulkan(hasil) {
    var ids = [];
    function tambah(id) { if (id && ids.indexOf(id) === -1 && DALIL[id]) ids.push(id); }

    tambah('qs4-11');
    tambah('qs4-12');
    (hasil.ahliWaris || []).forEach(function (a) { tambah(a.dalil); });
    if (hasil.perhitungan && hasil.perhitungan.kasusKhusus) {
      tambah(hasil.perhitungan.kasusKhusus.dalil);
    }
    (hasil.catatan || []).forEach(function (c) { tambah(c.dalil); });
    (hasil.peringatan || []).forEach(function (p) { tambah(p.dalil); });
    if (hasil.harta && hasil.harta.bagianHartaBersama > 0) tambah('harta-bersama');
    if (hasil.harta && hasil.harta.wasiat > 0) tambah('hadits-wasiat-sepertiga');
    if (hasil.harta && hasil.harta.hutang > 0) tambah('hadits-hutang');
    tambah('hadits-ashabah');

    return ids.map(function (id) {
      return Object.assign({ id: id }, DALIL[id]);
    });
  }

  /*
   * Ayat yang tersimpan sebagai ruas diberi `arab` dan `terjemah` utuh hasil
   * gabungan ruasnya. Dengan begitu pemakai data ini — kartu hasil, halaman
   * rujukan, ekspor PNG — tidak perlu tahu soal ruas kalau hanya butuh ayat
   * lengkapnya, dan tidak mungkin ada dua versi teks yang berbeda.
   */
  Object.keys(DALIL).forEach(function (id) {
    var d = DALIL[id];
    if (!d.segmen) return;
    d.arab = d.segmen.map(function (s) { return s.arab; }).join(' ');
    d.terjemah = d.segmen.map(function (s) { return s.arti; }).join(' ');
  });

  root.Dalil = { DATA: DALIL, ambil: ambil, kumpulkan: kumpulkan };
})(typeof window !== 'undefined' ? window : globalThis);
