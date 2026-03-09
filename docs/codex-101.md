# Codex 101

Bu belge, Codex'i is ortaminda verimli ve guvenli kullanmak icin hazirlanmis giris dersidir.
Amac, sadece "prompt yazmak" degil; Codex'i bir muhendis gibi yonlendirmeyi ogrenmektir.

## Bu dokuman nasil okunmali?

- Ilk okumada bastan sona gec.
- Sonraki okumlarda `Hizli Baslangic`, `Prompt Kaliplari` ve `Guvenli Kullanim` bolumlerine geri don.
- Bu belge yasayan bir dokumandir; ileride `Codex 201`, ekip standartlari ve ornek vakalar eklenebilir.

## 1. Codex nedir?

Codex, sadece soru-cevap yapan bir model degildir. Dogru ortamda:

- kod tabanini okuyabilir,
- terminal komutlari calistirabilir,
- dosya duzenleyebilir,
- test kosabilir,
- hata ayiklamaya yardimci olabilir,
- kod incelemesi yapabilir,
- yaptigi degisiklikleri ozetleyebilir.

Kisaca: Codex, "yazilim isini anlayan ve makinede is yapabilen" bir asistandir.

## 2. Chat asistanindan farki nedir?

Genel sohbet asistanlari daha cok fikir uretir. Codex ise daha operasyoneldir.

Ornek fark:

- Genel asistan: "Bu hatanin nedeni state yonetimi olabilir."
- Codex: "State yonetimini inceledim, sorun su dosyada su satir civarinda. Patch uyguladim ve test ekledim."

Bu nedenle Codex'ten verim almak icin "fikir sorusu" degil, "gorev tanimi" vermek daha etkilidir.

## 3. Codex'i hangi islerde kullanmaliyim?

En guclu oldugu alanlar:

- bug fix
- test yazma veya eksik testi tamamlama
- refactor
- kod inceleme
- dokumantasyon hazirlama
- repo kesfi
- tekrar eden muhendislik gorevleri
- yeni bir modulu mevcut koda uygun sekilde ekleme

Daha dikkatli olunmasi gereken alanlar:

- uretim verisi veya gizli bilgilerle calisma
- finansal, hukuki, guvenlik etkisi yuksek kararlar
- mimariyi kokten degistiren buyuk tasarimlar
- dogrulanmamis varsayimlarla yapilan degisiklikler

## 4. Zihinsel model: Codex'e nasil bakmaliyim?

Codex'i su sekilde konumlandir:

- junior degil, hizli calisan bir uygulayici muhendis
- ama baglam verilmezse yanlis varsayim yapabilir
- verdigin hedef kadar iyidir
- dogrulama istemezsen eksik kalabilir

En onemli kural:

`Belirsiz istek = belirsiz sonuc`

## 5. Basarili bir Codex isteginin 5 parcasi

Iyi bir istek genelde su parcalari icerir:

1. Hedef
2. Baglam
3. Sinirlar
4. Dogrulama beklentisi
5. Cikti formati

### Ornek istek sablonu

```text
Amac: Checkout sayfasindaki vergi hesaplama bug'ini duzelt.
Baglam: Sorun sadece indirim kuponu uygulandiginda ortaya cikiyor.
Sinirlar: Mevcut API kontratini degistirme. UI davranisini koru.
Dogrulama: Ilgili testleri ekle veya guncelle, sonra calistir.
Cikti: Neyi degistirdigini ve varsa riskleri kisa ozetle.
```

Bu seviye netlik, sonuc kalitesini ciddi bicimde artirir.

## 6. Kotu prompt vs iyi prompt

### Zayif ornek

```text
Burayi duzelt.
```

Sorun:

- hedef yok
- kapsam yok
- basari tanimi yok
- dogrulama yok

### Daha iyi ornek

```text
Odeme adiminda toplam tutar bazen eksiye dusuyor. Repo'yu incele, nedeni bul, duzeltmeyi uygula, ilgili testleri calistir ve sonucu kisa ozetle.
```

### Daha da iyi ornek

```text
Odeme adiminda toplam tutar, kupon tutari ara toplamdan buyuk oldugunda eksiye dusuyor.
`app/checkout` altini incele.
Beklenen davranis: toplam en az 0 olmali.
API payload'ini degistirme.
Test ekle.
Degisikligi uyguladiktan sonra ilgili testleri calistirip sonucu raporla.
```

## 7. Hizli baslangic is akisi

Codex ile calisirken standart akisin su olmasi gerekir:

1. Kesif yap
2. Plan cikar
3. Uygula
4. Dogrula
5. Ozetle

### 1. Kesif yap

Iyi bir baslangic komutu:

```text
Bu ozelligi uygulamadan once ilgili kodu incele ve mevcut akisi bana kisa ozetle.
```

Bu, yanlis dosyada degisiklik yapma riskini azaltir.

### 2. Plan cikar

Ozellikle orta ve buyuk islerde su faydalidir:

```text
Kod degistirmeden once kisacik bir plan cikar.
```

### 3. Uygula

Plan dogruysa su tip komut ver:

```text
Plani uygula. Gerekiyorsa test ekle.
```

### 4. Dogrula

Burasi genelde unutulur. Unutma.

```text
Ilgili testleri veya dogrulama adimlarini calistir.
```

### 5. Ozetle

```text
Yapilan degisiklikleri, calisan testleri ve kalan riskleri ozetle.
```

## 8. En cok kullanacagin komut tipleri

### A. Repo kesfi

```text
Bu repoda kimlik dogrulama akislarini bul ve mimariyi kisa ozetle.
```

### B. Bug fix

```text
Filtre secimi yapildiginda liste sifirlaniyor. Nedeni bul, duzelt, test ekle ve sonucu ozetle.
```

### C. Refactor

```text
Bu modulu davranisi degistirmeden sadelestir. Public API ayni kalsin. Sonunda trade-off'lari yaz.
```

### D. Kod inceleme

```text
Bu branch'i review et. Ozellikle bug riskleri, regressions ve test bosluklarina odaklan.
```

### E. Dokumantasyon

```text
Bu modulu yeni bir muhendise anlatan kisa bir markdown dokumani hazirla.
```

### F. Test odakli calisma

```text
Bu ozelligin eksik test senaryolarini bul, en kritik olanlari ekle ve kos.
```

## 9. Codex'ten nasil daha iyi sonuc alirsin?

Su bilgileri paylastikca kalite artar:

- ilgili klasor veya dosya
- beklenen davranis
- yapilmamasi gereken seyler
- performans veya uyumluluk sinirlari
- test beklentisi
- teslim kriteri

### Yarali ifadeler

Sunlari daha az kullan:

- "bir bak"
- "duzelt iste"
- "bir seyler yap"
- "daha iyi hale getir"

Bunlarin yerine olculebilir dil kullan:

- "sayfa acilis suresini azalt"
- "null case bug'ini duzelt"
- "bundle boyutunu etkilemeden sadelestir"
- "sadece su klasorde degisiklik yap"

## 10. Guvenli kullanim kurallari

Sirket ortami icin en kritik kisimlardan biri burasi.

### Temel kurallar

- Kod degisikligi istiyorsan dogrulama da iste.
- Buyuk refactor oncesi plan iste.
- Hassas bilgileri gereksiz yere paylasma.
- Uretim sistemleriyle ilgili varsayimlari ayrica sorgula.
- "Her seyi duzelt" gibi sinirsiz istekler verme.
- Git islemleri, silme, reset gibi adimlarda acik ol.

### Altin komut

```text
Varsayim yapman gerekirse acikca belirt. Riskli veya yikici bir adim atmadan once dur.
```

Bu tek cumle bile cok sey degistirir.

## 11. Kod review icin Codex nasil kullanilir?

Yonetici seviyesinde fark yaratan kullanimlardan biri budur.

Iyi bir review istemi:

```text
Bu degisikligi review et. Once bulgulari yaz.
Ozellikle su alanlara bak:
- davranis bozulmasi
- edge case'ler
- test eksikleri
- veri tutarliligi
- performans riskleri
```

Beklenen cikti:

- bulgular oncelik sirasiyla
- dosya ve satir referanslari
- kisa ama savunulabilir aciklama

Bu sayede "genel yorum" degil, muhendislik degeri ureten inceleme alirsin.

## 12. Bug ayiklamada Codex kullanimi

Hata ayiklamada su format ise yarar:

```text
Sorun: Kullanici filtre degistirdiginde liste bosa dusuyor.
Beklenen: Liste yeni filtreyle yeniden dolmali.
Gorulen: Bazen sonsuz loading'de kaliyor.
Ilgili alan: `src/features/search`
Gorev: Nedeni bul, duzeltmeyi uygula, test ekle, sonucu ozetle.
```

Burada en onemli sey, "semptom" ile "beklenen davranis"i ayirmaktir.

## 13. Refactor islerinde dikkat

Refactor istemlerinde mutlaka su siniri koy:

```text
Davranisi degistirmeden refactor et.
```

Gerekirse sunu da ekle:

```text
Public API degismeyecek.
```

Refactor sonrasi istem:

```text
Hangi kod kokularini giderdigini ve varsa trade-off'lari yaz.
```

## 14. Dokuman uretirken Codex kullanimi

Codex sadece kod yazmak icin degildir.

Asagidaki islerde de etkilidir:

- onboarding dokumani
- modul aciklamasi
- runbook
- incident postmortem taslagi
- test stratejisi notlari
- migration checklist

Ornek:

```text
`src/payments` modulunu yeni katilan bir muhendis icin aciklayan bir markdown dokumani hazirla.
Mimari, veri akisi, kritik riskler ve sik degisen noktalar olsun.
```

## 15. Pratik prompt kaliplari

Asagidaki kaliplari tekrar tekrar kullanabilirsin.

### Kesif

```text
Bu alani incele ve mevcut davranisi kisa ozetle.
```

### Uygulama

```text
Plani uygula. Kapsam disina cikma.
```

### Dogrulama

```text
Ilgili testleri calistir. Calistiramiyorsan nedenini net yaz.
```

### Risk kontrolu

```text
Kalan riskleri ve emin olmadigin varsayimlari ayri listele.
```

### Review

```text
Bunu review et. Ovguden cok bulgulara odaklan.
```

## 16. Sirket icinde guclu kullanim senaryolari

Gercek hayatta en fazla deger ureten kullanimlar genelde sunlardir:

- PR review hizlandirma
- regresyon risklerini erken yakalama
- test coverage bosluklarini bulma
- legacy modulleri anlama
- onboarding surelerini kisaltma
- tekrar eden dokumantasyon islerini standartlastirma

Bir ekipte olgun kullanim su demektir:

- herkes farkli sekilde prompt yazmiyor,
- ortak kalite beklentileri var,
- degisiklikler test veya dogrulamayla geliyor,
- riskler acikca yaziliyor.

## 17. Yeni baslayanlarin en sik yaptigi hatalar

### 1. Fazla genel istem vermek

`Burayi iyilestir` yerine neyin iyilesecegini soyle.

### 2. Dogrulama istememek

Kod degisti ama test kosulmadiysa is bitmemistir.

### 3. Kapsami sinirlamamak

"Tum repoyu refactor et" gibi istemler, maliyeti ve riski buyutur.

### 4. Varsayimlari takip etmemek

Codex bazen mantikli ama yanlis varsayim yapabilir. Bunu fark etmenin yolu, ondan varsayimlari yazmasini istemektir.

### 5. Sonucu teknik olarak denetlememek

Ozellikle kritik degisikliklerde "uyguladi" demesi yetmez; neyi, neden, nasil dogruladigini goreceksin.

## 18. Bir gorevi verirken kullanabilecegin kisa checklist

Gorev vermeden once su 6 soruya bak:

1. Problem net mi?
2. Ilgili yer belli mi?
3. Kapsam sinirli mi?
4. Basari kriteri belli mi?
5. Test veya dogrulama beklentisi var mi?
6. Cikti formatini soyledim mi?

Bu 6 madde varsa, Codex'ten iyi sonuc alma ihtimalin cok yuksek.

## 19. Mini alistirmalar

Bu belgeyi okumak kadar uygulamak da onemli. Asagidaki alistirmalari zaman buldukca deneyebilirsin.

### Alistirma 1

Bir repoda sunu iste:

```text
Bu projeyi yeni katilan bir muhendise anlatir gibi incele. Ana klasorleri ve mimari akislarini ozetle.
```

Amac: repo kesfi

### Alistirma 2

```text
Bu modulu review et. Bug riskleri ve eksik testlere odaklan.
```

Amac: review kasini guclendirmek

### Alistirma 3

```text
Bu fonksiyonu davranisi degistirmeden sadelestir. Sonra neyi iyilestirdigini acikla.
```

Amac: kontrollu refactor

### Alistirma 4

```text
Bu hata senaryosunu yeniden ureten bir test yaz, sonra sorunu duzelt.
```

Amac: test odakli debug

## 20. Bir ust seviyeye gecmek icin ne ogrenmelisin?

Codex uzmanligi sadece prompt yazmak degildir. Su alanlarda da gelismelisin:

- repo okuma hizi
- test stratejisi
- kod review bakisi
- risk analizi
- scope kontrolu
- net yazili iletisim

Usta kullanici su iki seyi cok iyi yapar:

- dogru gorevi tanimlar
- cikan sonucu hizla denetler

## 21. Tek sayfalik ozet

Kisacasi:

- Codex'e muhtemel cozum degil, net gorev ver.
- Baglam ver ama gereksiz bilgi yukleme.
- Kapsami sinirla.
- Dogrulama iste.
- Riskleri ayri yazdir.
- Ozellikle review, bug fix ve repo kesfinde kullan.

## 22. Hazir komut bankasi

Gunluk hayatta dogrudan kopyalayip uyarlayabilecegin bazi istemler:

```text
Bu ozelligi uygulamadan once ilgili kodu incele ve mevcut akisi ozetle.
```

```text
Su bug'i bul ve duzelt. Kapsam disina cikma. Ilgili testleri ekle veya guncelle.
```

```text
Bu degisikligi review et. Once bulgulari ver, sonra kisa bir ozet yaz.
```

```text
Bu modulu davranisi degistirmeden refactor et. Public API sabit kalsin.
```

```text
Bu klasor icin onboarding dokumani hazirla. Mimari, veri akisi ve kritik riskleri anlat.
```

```text
Yaptigin varsayimlari ve kalan riskleri ayri baslik altinda yaz.
```

## Son soz

Sirket ortaminda Codex'ten yuksek verim almak isteyen kisinin hedefi sunlar olmalidir:

- hizli kesif,
- kontrollu uygulama,
- guvenli degisiklik,
- net dogrulama,
- yazili muhendislik disiplini.

Bu belge `Codex 101` icin ilk temel nottur. Devaminda istersen su konulari da ayri markdown dersleri olarak hazirlayabiliriz:

- `Codex 201: Ileri Prompt Yazimi`
- `Codex ile Code Review Ustaligi`
- `Codex ile Bug Fix Playbook`
- `Codex ile Takim Icindeki Standartlar`
