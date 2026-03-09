# ABK Pixel Prompt Gate

`ABK Pixel Prompt Gate`, ham teknik istekleri daha net bir Codex prompt'una ceviren ve kullanici onayi olmadan uygulamaya gecilmesini engelleyen bir MCP katmanidir.

Bu repo uc kullanim sekli sunar:

- `stdio MCP`
- `HTTP MCP + REST API`
- yerel `web arayuzu`

## Ne ise yarar?

Tipik problem su:

- kullanici problemi eksik veya daginik anlatir
- agent dogrudan uygulamaya gecer
- kapsam kayar
- sonuc dogru olsa bile beklenen is cikmayabilir

`ABK Pixel Prompt Gate` bu akisi disipline eder:

1. Kullanici ham problemi yazar.
2. Sistem hizli bir prompt taslagi uretir.
3. Kullanici prompt'u duzeltir veya onaylar.
4. Prompt onayli kayda doner.
5. Asil is sadece onayli prompt uzerinden ilerler.

## Onemli sinir

Bu sunucu tek basina "kullanici onay vermeden agent asla ilerlemesin" kuralini zorlayamaz. Bunun icin agent tarafinda da bir kural gerekir.

Bu repo icindeki ornekler:

- [AGENTS.md](AGENTS.md)
- [docs/agent-instructions.md](docs/agent-instructions.md)

## Ozellikler

- ham problemi yapilandirilmis prompt taslagina cevirme
- revizyon, onay ve red akisi
- prompt kalite skoru ve eksik baglam ipuclari
- yerel dosya tabanli prompt depolama
- MCP tool, prompt ve resource kayitlari
- HTTP REST API
- web arayuzu
- CLI komutlari

## MCP araclari

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

- `codex-gated-workflow` isimli MCP prompt'u
- workflow ve agent kuralini tasiyan MCP resource'lari

## Kurulum

Gereksinim:

- Node.js 20+

```bash
npm install
```

## Hizli baslangic

### 1. Stdio MCP

```bash
npm start
```

Ornek konfigurasyon: [mcp-config.example.json](mcp-config.example.json)

### 2. Codex'e ekle

```bash
codex mcp add abk-pixel-prompt-gate --env PROMPT_GATE_DATA_DIR=/Users/ahmet/Projects/codex-learn/.codex-prompt-mcp -- node /Users/ahmet/Projects/codex-learn/src/index.mjs
```

Kontrol:

```bash
codex mcp list
```

Not:

- `PROMPT_GATE_DATA_DIR`, stdio MCP `cwd=/` gibi bir baglamda acildiginda yazma akisinin takilmamasi icin onerilir.

### 3. HTTP + web arayuzu

```bash
npm run start:http
```

Varsayilan adres:

```text
http://127.0.0.1:3334
```

### 4. CLI

```bash
npm run cli -- draft --problem "Filtre degisince liste bosa dusuyor" --repo-area src/features/search --constraint "API kontratini degistirme"
```

## Onerilen akış

Ilk cevap gecikmesini azaltmak icin su akış onerilir:

1. `preview_codex_prompt`
2. kullanici duzeltmesi veya onayi
3. `finalize_codex_prompt`

Bu sayede ilk turda sadece hizli bir onizleme doner, kayit yazimi onay asamasinda yapilir.

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

Ornek draft istegi:

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

## Veri depolama

Varsayilan depolama dizini:

```text
.codex-prompt-mcp/prompts.json
```

Farkli klasor kullanmak icin:

```bash
PROMPT_GATE_DATA_DIR=/some/path npm run start:http
```

HTTP ayarlari:

```bash
PROMPT_GATE_HOST=127.0.0.1
PROMPT_GATE_PORT=3334
```

## Proje yapisi

- [src/index.mjs](src/index.mjs): stdio MCP giris noktasi
- [src/httpServer.mjs](src/httpServer.mjs): HTTP MCP + REST + static UI
- [src/mcpServer.mjs](src/mcpServer.mjs): MCP tool, prompt ve resource kayitlari
- [src/promptService.mjs](src/promptService.mjs): prompt yasam dongusu
- [src/promptBuilder.mjs](src/promptBuilder.mjs): prompt iyilestirme mantigi
- [public/index.html](public/index.html): web arayuzu
- [docs/agent-instructions.md](docs/agent-instructions.md): agent talimati

## Gelistirme

Test:

```bash
npm test
```

Mevcut test kapsami:

- prompt builder
- prompt lifecycle servisi
- HTTP health ve draft endpoint smoke testi

Teknik referans:

- [MCP TypeScript SDK README](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md)
