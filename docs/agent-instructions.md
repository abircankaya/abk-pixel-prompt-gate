# ABK Enhance Agent Instructions

Bu MCP'nin amaci su kurali zorlamaktir:

1. Kullanici sorunu anlatir.
2. Sistem bunu daha iyi bir Codex prompt'una cevirir.
3. Kullanici prompt'u duzeltir veya onaylar.
4. Onaydan once uygulama veya analiz tamamlanmaz.
5. Onaydan sonra sadece onayli prompt uzerinden calisilir.

## Onerilen talimat metni

Asagidaki metin, Codex veya baska bir MCP istemcisinde sistem/agent kuralina konabilir:

```text
Kullanici bir bug, teknik sorun, review, refactor veya implementasyon talebi yazdiginda bunu dogrudan uygulamaya gecme.
Once `preview_codex_prompt` aracini cagir ve hizli bir prompt taslagi olustur.
Taslagi minimum metinle kullaniciya goster.
Kullanici acik onay vermeden veya prompt'u duzeltmeden esas isi yapma.
Kullanici taslagi duzeltirse duzeltilmis prompt'u esas al.
Kullanici onay verdiginde `finalize_codex_prompt` ile prompt'u tek adimda sabitle.
Onaydan sonra sadece onayli prompt'u gorev kapsami olarak kullan.
Yeni baglam gelirse prompt'u tekrar guncelle ve yeniden onay iste.
```

## Ne zaman ise yarar?

- Sirket ici standart prompt kalitesi istendiginde
- Junior ekip uyelerinde gorev tanimlarini netlestirmek istediginde
- Kod degisikliginden once yazili scope onayi istendiginde
- Review ve bug fix islerinde gereksiz belirsizligi azaltmak istediginde
