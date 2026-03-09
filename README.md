# ABK Pixel Prompt Gate

`ABK Pixel Prompt Gate`, ham bir teknik gorevi once daha iyi bir Codex prompt'una ceviren, sonra bu prompt'u onay akisindan geciren bir MCP urunudur.

Bu repo artik uc farkli kullanim bicimi sunuyor:

- `stdio MCP` entegrasyonu
- `HTTP MCP + REST API`
- tarayici uzerinden kullanilabilen yerel `web arayuzu`

## Problem

Ekiplerde en sik gorulen sorun su:

- kullanici problemi eksik veya daginik anlatiyor,
- agent dogrudan uygulamaya geciyor,
- scope kayiyor,
- sonradan "aslinda bunu istememistim" durumu cikiyor.

Bu urun, o bosluga giriyor.

Akis:

1. Kullanici ham problemi yazar.
2. Sistem bunu hizli bir prompt taslagina cevirir.
3. Kullanici prompt'u duzeltir veya aynen kabul eder.
4. Prompt onayli kayda doner.
5. Asil uygulama sadece onayli prompt uzerinden ilerler.

## Onemli sinir

Tek basina MCP sunucusu "kullanici onay vermeden agent asla ilerlemesin" kuralini zorlayamaz. Bunun icin iki katman gerekir:

- bu sunucu
- istemci/agent tarafinda bu akisi zorlayan kural

Onerilen agent talimati icin [docs/agent-instructions.md](/Users/ahmet/Projects/codex-learn/docs/agent-instructions.md) dosyasini kullanin.

## Ozellikler

- ham problemi yapilandirilmis prompt taslagina cevirme
- taslagi revize etme
- onaylama / reddetme
- prompt kalite skoru ve eksik baglam ipuclari
- yerel dosya tabanli prompt depolama
- MCP tool, prompt ve resource kaydi
- HTTP REST API
- sade ama kullanisli web arayuzu
- CLI komutlari

## Araclar

MCP tarafinda su araclar kayitli:

- `preview_codex_prompt`
- `draft_codex_prompt`
- `finalize_codex_prompt`
- `revise_codex_prompt`
- `approve_codex_prompt`
- `reject_codex_prompt`
- `get_codex_prompt`
- `list_codex_prompts`
- `codex_prompt_gate_stats`

Ek olarak:

- `codex-gated-workflow` isimli bir MCP prompt'u
- workflow ve agent kuralini tasiyan iki MCP resource'u

## Kurulum

```bash
npm install
```

Gereksinim:

- Node.js 20+

## Hizli baslangic

### 1. Stdio MCP olarak calistir

```bash
npm start
```

Bu mod, MCP istemcileri tarafindan process spawn edilmesi icindir.

Ornek konfigurasyon: [mcp-config.example.json](/Users/ahmet/Projects/codex-learn/mcp-config.example.json)

### 1.a Codex'e dogrudan ekle

`codex` CLI bu akisi dogrudan destekliyor. Sunucuyu Codex'e tanitmak icin:

```bash
codex mcp add abk-pixel-prompt-gate --env PROMPT_GATE_DATA_DIR=/Users/ahmet/Projects/codex-learn/.codex-prompt-mcp -- node /Users/ahmet/Projects/codex-learn/src/index.mjs
```

Kontrol etmek icin:

```bash
codex mcp list
```

Bu noktadan sonra Codex oturumlarinda `abk-pixel-prompt-gate` MCP sunucusu gorunur.
`PROMPT_GATE_DATA_DIR` env'i, stdio MCP `cwd=/` gibi bir baglamda calistiginda yazma akisinin takilmamasi icin onerilir.

### 2. HTTP + web arayuzu ile calistir

```bash
npm run start:http
```

Varsayilan adres:

```text
http://127.0.0.1:3334
```

### 3. CLI ile kullan

```bash
npm run cli -- draft --problem "Filtre degisince liste bosa dusuyor" --repo-area src/features/search --constraint "API kontratini degistirme"
```

Ilk cevap gecikmesini azaltmak icin product akisi artik su sekilde onerilir:

1. `preview_codex_prompt`
2. kullanici onayi veya duzeltmesi
3. `finalize_codex_prompt`

## Web arayuzu

Web arayuzu su ihtiyaclar icin var:

- teknik olmayan veya yarim teknik kullanicilarin prompt hazirlamasi
- ekip ici hizli deneme
- prompt onay akisini gorunur hale getirme

Arayuzde sunlar var:

- yeni gorev formu
- prompt editor
- revizyon / onay / red butonlari
- kalite skoru
- eksik baglam ipuclari
- son promptlar listesi

## REST API

Temel endpointler:

- `GET /healthz`
- `GET /api/stats`
- `GET /api/prompts`
- `GET /api/prompts/:id`
- `POST /api/prompts/draft`
- `POST /api/prompts/:id/revise`
- `POST /api/prompts/:id/approve`
- `POST /api/prompts/:id/reject`
- `POST /mcp`

### Ornek draft istegi

```json
{
  "problem": "Filtre degistiginde liste bosa dusuyor",
  "context": "Bazen sonsuz loading goruluyor",
  "repoArea": [
    "src/features/search"
  ],
  "constraints": [
    "API kontratini degistirme",
    "Sadece ilgili klasorde degisiklik yap"
  ],
  "validation": "Ilgili testleri calistir",
  "outputFormat": "Kisa ozet ve kalan riskler"
}
```

## CLI

Desteklenen komutlar:

```bash
npm run cli -- draft --problem "..."
npm run cli -- finalize --problem "..." --prompt "..."
npm run cli -- revise --id <prompt-id> --prompt "..."
npm run cli -- approve --id <prompt-id> --prompt "..."
npm run cli -- reject --id <prompt-id> --reason "..."
npm run cli -- show --id <prompt-id>
npm run cli -- list --limit 20
npm run cli -- serve-http --host 127.0.0.1 --port 3334
```

## Ornek agent kuralı

```text
Kullanici bir bug, teknik sorun, review, refactor veya implementasyon talebi yazdiginda bunu dogrudan uygulamaya gecme.
Once `preview_codex_prompt` aracini cagir ve hizli bir prompt taslagi olustur.
Taslagi minimum metinle kullaniciya goster.
Kullanici acik onay vermeden veya prompt'u duzeltmeden esas isi yapma.
Kullanici taslagi duzeltirse duzeltilmis prompt'u esas al.
Kullanici onay verdiginde `finalize_codex_prompt` ile prompt'u sabitle.
Onaydan sonra sadece onayli prompt'u gorev kapsami olarak kullan.
Yeni baglam gelirse prompt'u tekrar guncelle ve yeniden onay iste.
```

Bu repo icinde ayni davranisi zorlamak icin [AGENTS.md](/Users/ahmet/Projects/codex-learn/AGENTS.md#L1) dosyasi eklendi.

## Veri depolama

Kayitlar varsayilan olarak su klasorde tutulur:

```text
.codex-prompt-mcp/prompts.json
```

Farkli klasor kullanmak isterseniz:

```bash
PROMPT_GATE_DATA_DIR=/some/path npm run start:http
```

HTTP ayarlari:

```bash
PROMPT_GATE_HOST=127.0.0.1
PROMPT_GATE_PORT=3334
```

## Dosya yapisi

- [src/index.mjs](/Users/ahmet/Projects/codex-learn/src/index.mjs): stdio MCP giris noktasi
- [src/httpServer.mjs](/Users/ahmet/Projects/codex-learn/src/httpServer.mjs): HTTP MCP + REST + static UI
- [src/mcpServer.mjs](/Users/ahmet/Projects/codex-learn/src/mcpServer.mjs): MCP tool/prompt/resource kayitlari
- [src/promptService.mjs](/Users/ahmet/Projects/codex-learn/src/promptService.mjs): prompt yasam dongusu
- [src/promptBuilder.mjs](/Users/ahmet/Projects/codex-learn/src/promptBuilder.mjs): prompt iyilestirme mantigi
- [public/index.html](/Users/ahmet/Projects/codex-learn/public/index.html): web arayuzu
- [docs/agent-instructions.md](/Users/ahmet/Projects/codex-learn/docs/agent-instructions.md): agent kurali

## Test

```bash
npm test
```

Kapsam:

- prompt builder
- prompt lifecycle servisi
- HTTP health ve draft endpoint smoke testi

## Teknik not

HTTP tasariminda MCP TypeScript SDK'nin `Streamable HTTP` onerisine uyuldu. Resmi referans:

- [MCP TypeScript SDK README](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md)
