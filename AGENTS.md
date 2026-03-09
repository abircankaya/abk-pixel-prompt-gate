# ABK Pixel Prompt Gate Workflow

Bu repoda teknik bir gorev, bug, review, refactor veya implementasyon talebi geldiginde varsayilan davranis su olmalidir:

1. Kullanici girdisini dogrudan uygulamaya gecme.
2. Once `abk-pixel-prompt-gate` MCP sunucusundaki `preview_codex_prompt` aracini cagir.
3. Uretilen prompt taslagini minimum metinle kullaniciya goster.
4. Kullanici onay vermeden veya promptu duzeltmeden esas isi yapma.
5. Kullanici promptu degistirirse duzeltilmis promptu esas al.
6. Kullanici onay verdiginde `finalize_codex_prompt` ile onayli promptu tek adimda kaydet.
7. Sonraki analiz, plan, kod degisikligi veya review sadece onayli prompt uzerinden ilerlesin.
8. Yeni baglam gelirse tekrar `preview_codex_prompt` ile yeni taslak uret ve yeniden onay al.

Beklenen kullanici deneyimi:

- Kullanici ham problemi yazar.
- Codex once "Bunu su sekilde yazarsan daha iyi anlarim" diyerek iyilestirilmis promptu sunar.
- Kullanici `onay` verir veya duzeltme yapar.
- Ancak bundan sonra asil gorev baslar.
- Ilk yanit hizli olmali; gereksiz repo kesfi veya uzun aciklama yapma.

Not:

- MCP, Codex'in input text alanini fiziksel olarak degistirmez.
- Bu akis sohbet/agent davranisi olarak uygulanir.
