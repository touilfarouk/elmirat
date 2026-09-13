/*
 * Orkestrator pembagian waris.
 *
 * Alur:
 *   1. hitung tirkah (harta yang boleh dibagi)
 *   2. terapkan hijab (siapa yang terhalang)
 *   3. cek kasus khusus yang mengubah aturan
 *   4. bagian tetap (ashabul furudh)
 *   5. sisa untuk ashabah
 *   6. 'aul kalau bagian tetap melebihi harta
 *   7. radd kalau harta tersisa dan tidak ada ashabah
 *   8. konversi ke rupiah
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;
  var F = f.F;

  function lcmList(list) {
    return list.reduce(function (a, b) { return f.lcm(a, b); }, 1);
  }

  /**
   * @param {Object} input
   *   jenisKelamin  : 'L' | 'P'  jenis kelamin pewaris
   *   harta         : { total, hartaBersama, biayaJenazah, hutang, wasiat }
   *   ahliWaris     : { anak_lk: 2, istri: 1, ... }
   *   kondisi       : { bedaAgama, pembunuh, cucuDariAnakWafat, anakAngkat, istriHamil }
   */
  function hitung(input) {
    var kondisi = input.kondisi || {};
    var counts = {};
    Object.keys(input.ahliWaris || {}).forEach(function (k) {
      var v = parseInt(input.ahliWaris[k], 10) || 0;
      if (v > 0 && H.BY_KEY[k]) counts[k] = Math.min(v, H.BY_KEY[k].max);
    });

    // pasangan harus konsisten dengan jenis kelamin pewaris
    if (input.jenisKelamin === 'L') delete counts.suami;
    if (input.jenisKelamin === 'P') delete counts.istri;

    var adaPasangan = (counts.suami || 0) > 0 || (counts.istri || 0) > 0;
    var harta = root.Estate.hitung(input.harta || {}, adaPasangan);

    var hasilHijab = root.Hijab.terapkan(counts);
    var aktif = hasilHijab.aktif;

    var peringatan = [];
    var catatan = harta.catatan.slice();

    var out = {
      input: input,
      harta: harta,
      ahliWaris: [],
      perhitungan: {
        asalMasalah: 0, totalSiham: 0, asalMasalahAkhir: 0,
        siham: {}, aul: false, radd: false,
        kasusKhusus: null, langkah: []
      },
      sisaTidakTerbagi: null,
      pembulatan: 0,
      catatan: catatan,
      peringatan: peringatan,
      valid: true
    };

    if (!Object.keys(aktif).length) {
      out.valid = false;
      out.pesan = Object.keys(counts).length
        ? 'كلُّ الورثة الذين أدخلتَهم محجوبون بغيرهم. راجع إدخالك من جديد.'
        : 'لم يُدخل أيُّ وارثٍ بعد.';
      return out;
    }

    // ── Kasus khusus yang menentukan seluruh hasil ───────────────────
    var khusus = root.Special.cekUmariyyatain(aktif)
              || root.Special.cekAkdariyyah(aktif)
              || root.Special.cekMusyarakah(aktif);

    var final = {};    // key -> Fraction (total per kelompok)
    var jenis = {};    // key -> 'fardh' | 'ashabah' | 'fardh+ashabah' | 'khusus' | 'radd'
    var alasan = {};
    var dalilKey = {};
    var potonganKey = {};   // klausa mana di dalam ayat yang menyebut hak ini
    var dalilLainKey = {};  // sumber pendamping, mis. ayat + hadits sekaligus
    var fardh = {};

    if (khusus) {
      out.perhitungan.kasusKhusus = khusus;
      Object.keys(khusus.bagian).forEach(function (k) {
        final[k] = khusus.bagian[k];
        jenis[k] = 'khusus';
        alasan[k] = (khusus.alasan && khusus.alasan[k]) || khusus.penjelasan;
        dalilKey[k] = (khusus.dalilPerOrang && khusus.dalilPerOrang[k]) || khusus.dalil;
        if (khusus.potongan && khusus.potongan[k]) potonganKey[k] = khusus.potongan[k];
        if (khusus.dalilPerOrang && khusus.dalilPerOrang[k]) {
          // Ahli waris ini punya ayatnya sendiri; ayat kasus khususnya tetap
          // dirujuk sebagai pendamping supaya konteksnya tidak hilang.
          dalilLainKey[k] = (dalilLainKey[k] || []).concat([khusus.dalil]);
        }
      });
      out.perhitungan.langkah.push(khusus.nama + ': ' + khusus.penjelasan);
      if (khusus.khilafiyah) {
        catatan.push({ id: 'khilafiyah', tingkat: 'khilafiyah', teks: khusus.khilafiyah });
      }
    } else {
      // ── Alur normal ────────────────────────────────────────────────
      var kakekVsSaudara = (aktif.kakek || 0) > 0 &&
        ['sdr_lk_kandung', 'sdr_pr_kandung', 'sdr_lk_sebapak', 'sdr_pr_sebapak']
          .some(function (k) { return (aktif[k] || 0) > 0; });

      var hasilShares = root.Shares.hitung(aktif, counts, {
        lewatiKakek: kakekVsSaudara,
        lewatiFardhSaudara: kakekVsSaudara
      });
      fardh = hasilShares.fardh;

      Object.keys(fardh).forEach(function (k) {
        final[k] = fardh[k];
        jenis[k] = 'fardh';
        alasan[k] = hasilShares.alasan[k];
        dalilKey[k] = hasilShares.dalil[k];
        if (hasilShares.potongan[k]) potonganKey[k] = hasilShares.potongan[k];
        if ((hasilShares.dalilLain || {})[k]) {
          dalilLainKey[k] = (dalilLainKey[k] || []).concat(hasilShares.dalilLain[k]);
        }
      });

      // asal masalah sebelum 'aul
      var penyebut = Object.keys(fardh).map(function (k) { return fardh[k].d; });
      var am = penyebut.length ? lcmList(penyebut) : 1;
      var totalSiham = 0;
      Object.keys(fardh).forEach(function (k) {
        var s = fardh[k].n * (am / fardh[k].d);
        out.perhitungan.siham[k] = s;
        totalSiham += s;
      });
      out.perhitungan.asalMasalah = am;
      out.perhitungan.totalSiham = totalSiham;

      var totalFardh = f.sum(Object.keys(fardh).map(function (k) { return fardh[k]; }));

      if (f.gt(totalFardh, f.ONE)) {
        // ── 'AUL ────────────────────────────────────────────────────
        out.perhitungan.aul = true;
        Object.keys(fardh).forEach(function (k) {
          final[k] = f.div(fardh[k], totalFardh);
        });
        out.perhitungan.langkah.push(
          'مجموع الأنصباء المقدرة تجاوزَ موجود التركة (' + totalSiham + '/' + am +
          '). هنا يُرفَع المقام إلى ' + totalSiham +
          ' — ويُسمَّى ذلك العول — فتُنقَص أنصبةُ الجميع بنسبةٍ واحدة ' +
          'ولم يُهضَم أحد.');
        catatan.push({
          id: 'aul', tingkat: 'info',
          teks: 'وقع العول: نقُصت أنصبةُ الجميع بنسبةٍ واحدةٍ لأن مجموع الأنصباء ' +
                'المقدرة تجاوزَ موجودَ التركة.'
        });
      } else {
        var sisa = f.sub(f.ONE, totalFardh);

        if (kakekVsSaudara) {
          // ── Kakek bersama saudara ─────────────────────────────────
          var ks = root.Special.kakekBersamaSaudara(aktif, sisa);
          out.perhitungan.kasusKhusus = ks;
          Object.keys(ks.bagian).forEach(function (k) {
            final[k] = f.add(final[k] || f.ZERO, ks.bagian[k]);
            jenis[k] = k === 'kakek' ? 'khusus' : 'ashabah';
            alasan[k] = k === 'kakek' ? ks.alasanKakek : ks.alasanSaudara;
            dalilKey[k] = ks.dalil;
          });
          out.perhitungan.langkah.push(ks.nama + ': ' + ks.penjelasan);
          if (ks.khilafiyah) {
            catatan.push({ id: 'khilafiyah', tingkat: 'khilafiyah', teks: ks.khilafiyah });
          }
          if (ks.perluKonsultasi) {
            peringatan.push({ id: 'muaddah', teks: ks.perluKonsultasi });
          }
          sisa = f.ZERO;
        } else if (!f.isZero(sisa)) {
          var ash = root.Ashabah.bagi(aktif, sisa);
          if (ash) {
            // ── ASHABAH ─────────────────────────────────────────────
            Object.keys(ash.bagian).forEach(function (k) {
              var sebelum = final[k];
              final[k] = f.add(sebelum || f.ZERO, ash.bagian[k]);
              jenis[k] = sebelum ? 'fardh+ashabah' : 'ashabah';
              alasan[k] = sebelum
                ? alasan[k] + ' ' + ash.alasan
                : ash.alasan;
              dalilKey[k] = dalilKey[k] || ash.dalil;
              if (!potonganKey[k] && ash.potongan) potonganKey[k] = ash.potongan;
              if ((ash.dalilLain || []).length) {
                dalilLainKey[k] = (dalilLainKey[k] || []).concat(ash.dalilLain);
              }
            });
            out.perhitungan.langkah.push('بقي من المال ' + f.toText(sisa) + ' — ' + ash.alasan);
            out.perhitungan.tipeAshabah = ash.tipe;
          } else {
            // ── RADD ────────────────────────────────────────────────
            var pasanganKeys = ['suami', 'istri'].filter(function (k) { return fardh[k]; });
            var lainKeys = Object.keys(fardh).filter(function (k) {
              return pasanganKeys.indexOf(k) === -1;
            });

            if (!lainKeys.length) {
              out.sisaTidakTerbagi = {
                bagian: sisa,
                alasan: 'لا يوجد وارثٌ غيرُ الزوجين. في الفقه الكلاسيكي يُدفَع الباقي إلى بيت ' +
                        'المال (خزينة المسلمين). وفق المذهب المالكي يرى كثيرٌ من الفقهاء ' +
                        'ردَّه على الزوجة/الزوج، وهو ما يميل إليه القضاء هنا.'
              };
            } else {
              out.perhitungan.radd = true;
              var totalLain = f.sum(lainKeys.map(function (k) { return fardh[k]; }));
              lainKeys.forEach(function (k) {
                var tambahan = f.mul(sisa, f.div(fardh[k], totalLain));
                final[k] = f.add(final[k], tambahan);
                jenis[k] = 'radd';
                alasan[k] = alasan[k] + ' ولأنه بقي مالٌ ولا يوجد وارثٌ يأخذ الباقي (تعصيب)، ' +
                  'يُردُّ الباقي على أصحاب الفروض بقدر فروضهم — ويسمَّى ذلك رداً.';
              });
              var teksPasangan = pasanganKeys.length
                ? ' ' + H.label(pasanganKeys[0]) + ' لا يأخذ من الردّ عند جمهور الفقهاء.'
                : '';
              out.perhitungan.langkah.push(
                'بقيَ مالٌ ' + f.toText(sisa) + ' ولا يوجد وارثٌ يأخذ الباقي. ' +
                'يُردُّ الباقي على أصحاب الفروض بقدر فروضهم (الرد).' +
                teksPasangan);
              catatan.push({
                id: 'radd', tingkat: 'info',
                teks: 'وقع الرد: رُدَّ الباقي على الورثة الموجودين بدل أن يبقى بلا صاحب.' +
                      teksPasangan
              });
            }
          }
        }
      }
    }

    // ── Susun daftar ahli waris untuk ditampilkan ────────────────────
    var tirkah = harta.tirkah;
    var totalNominal = 0;

    H.LIST.forEach(function (def) {
      var jumlahAktif = aktif[def.key] || 0;
      var terhalang = hasilHijab.terhalang.filter(function (t) { return t.key === def.key; })[0];

      if (!jumlahAktif && !terhalang) return;

      if (terhalang) {
        out.ahliWaris.push({
          key: def.key, label: def.label, jumlah: terhalang.jumlah,
          gender: def.gender, icon: def.icon, group: def.group,
          status: 'terhalang',
          bagian: f.ZERO, bagianTeks: '0', persen: 0,
          nominal: 0, nominalPerOrang: 0,
          terhalangOleh: terhalang.oleh,
          alasan: terhalang.alasan,
          dalil: 'hadits-ashabah'
        });
        return;
      }

      var b = final[def.key] || f.ZERO;
      var nominal = f.applyTo(tirkah, b);
      totalNominal += nominal;

      // Ahli waris yang berhak tapi tidak kebagian sepeser pun. Ini terjadi
      // saat bagian tetap ahli waris lain sudah menghabiskan seluruh harta
      // ('aul), sehingga tidak ada sisa untuk penerima sisa (ashabah). Tanpa
      // penjelasan ini, kartunya tampil kosong dan terlihat seperti bug.
      if (f.isZero(b) && !alasan[def.key]) {
        alasan[def.key] = out.perhitungan.aul
          ? 'استُحقَّ أخذُ الباقي، لكن فروضَ الورثة الآخرين التهمت التركةَ كلَّها فلم يتبقَّ شيء. ' +
            'هذه نتيجةٌ طبيعية للعول، لا بمعنى الحجب.'
          : 'استُحقَّ أخذُ الباقي، لكن لم يتبقَّ مالٌ بعد دفع جميع الفروض.';
        dalilKey[def.key] = dalilKey[def.key] || 'hadits-ashabah';
      }

      out.ahliWaris.push({
        key: def.key, label: def.label, jumlah: jumlahAktif,
        gender: def.gender, icon: def.icon, group: def.group,
        status: f.isZero(b) ? 'nol' : 'menerima',
        bagian: b,
        bagianTeks: f.toText(b),
        persen: f.toPercent(b),
        nominal: nominal,
        nominalPerOrang: Math.floor(nominal / jumlahAktif),
        jenis: jenis[def.key] || 'ashabah',
        alasan: alasan[def.key] || '',
        dalil: dalilKey[def.key] || null,
        potongan: potonganKey[def.key] || null,
        dalilLain: (dalilLainKey[def.key] || []).filter(function (id, i, a) {
          return id !== dalilKey[def.key] && a.indexOf(id) === i;
        })
      });
    });

    // sisa yang tidak terbagi (baitul mal)
    if (out.sisaTidakTerbagi) {
      out.sisaTidakTerbagi.nominal = f.applyTo(tirkah, out.sisaTidakTerbagi.bagian);
      out.sisaTidakTerbagi.bagianTeks = f.toText(out.sisaTidakTerbagi.bagian);
      out.sisaTidakTerbagi.persen = f.toPercent(out.sisaTidakTerbagi.bagian);
      totalNominal += out.sisaTidakTerbagi.nominal;
    }

    // sisa recehan akibat pembulatan ke bawah
    var perOrangTotal = out.ahliWaris.reduce(function (t, a) {
      return t + a.nominalPerOrang * (a.status === 'menerima' ? a.jumlah : 0);
    }, 0) + (out.sisaTidakTerbagi ? out.sisaTidakTerbagi.nominal : 0);
    out.pembulatan = Math.max(0, tirkah - perOrangTotal);

    // Asal masalah akhir: penyebut bersama setelah semua penyesuaian. Dipakai
    // untuk menampilkan pembagian dalam bentuk "sekian dari sekian bagian",
    // yang lebih mudah dicerna daripada deretan pecahan.
    var penerima = out.ahliWaris.filter(function (a) { return a.status === 'menerima'; });
    var penyebutAkhir = penerima.map(function (a) { return a.bagian.d; });
    if (out.sisaTidakTerbagi) penyebutAkhir.push(out.sisaTidakTerbagi.bagian.d);
    var amAkhir = penyebutAkhir.length ? lcmList(penyebutAkhir) : 0;
    out.perhitungan.asalMasalahAkhir = amAkhir;
    out.perhitungan.sihamAkhir = {};
    penerima.forEach(function (a) {
      a.siham = a.bagian.n * (amAkhir / a.bagian.d);
      out.perhitungan.sihamAkhir[a.key] = a.siham;
    });

    // ── Peringatan dari kondisi khusus ───────────────────────────────
    if (kondisi.istriHamil) {
      peringatan.push({
        id: 'hamil',
        teks: 'يوجد زوجةٌ حامل. الجنين له نصيبه الشرعي، لكنه قد يتغيَّر ' +
              'بعد ولادته وتحديد جنسه. احجز نصيباً قدر نصيب ابنٍ واحدٍ ذكر، ثم ' +
              'أعد الحساب بعد الولادة.'
      });
    }
    if (kondisi.bedaAgama) {
      peringatan.push({
        id: 'beda_agama',
        teks: 'يوجد أحدٌ من العائلة على دينٍ آخر. قال الرسول ﷺ: «لا يَرِثُ المُسْلِمُ الكافِرَ، ' +
              'ولا الكافِرُ المُسْلِمَ» (متفق عليه). لا تُدخِلهم في الحساب أعلاه. لكن يمكن ' +
              'تخصيصُ هبةٍ لهؤلاء أثناء الحياة، أو وصية بحدِّ الثلث.',
        dalil: 'hadits-beda-agama'
      });
    }
    if (kondisi.pembunuh) {
      peringatan.push({
        id: 'pembunuh',
        teks: 'يوجد وارثٌ تسبَّب في وفاة الميت. قال الرسول ﷺ: «القاتِلُ لا يَرِثُ». ' +
              'يسقط حقُّه في الميراث ولا يُدخَل في الحساب. يُفضَّل تثبيت هذا الوضع ' +
              'بحكمٍ من المحكمة المختصة.',
        dalil: 'hadits-pembunuh'
      });
    }

    return out;
  }

  root.Faraid = { hitung: hitung };
})(typeof window !== 'undefined' ? window : globalThis);
