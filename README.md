# Risk Score Display

Single-page app to show **Early Clinical Deterioration** risk scores. Designed to be deployed on **Vercel** via **GitHub** and to receive payloads from **n8n** HTTP/Redirect flows.

## Deploy on Vercel via GitHub

1. Push this repo to: **https://github.com/niharnalashaa/RiskScoreDisplay.git**
2. In [Vercel](https://vercel.com), **Add New Project** → **Import** the repo `niharnalashaa/RiskScoreDisplay`.
3. Deploy (no build step needed; it’s static HTML).
4. Your page will be live at `https://<your-project>.vercel.app`.

## Receiving data from n8n

The page reads the risk payload from the **URL** when the user is sent to it (e.g. from n8n).

- **Query parameter:** `data` or `payload` = **base64-encoded JSON** of the risk payload.
- The JSON can be the **array** format from your HTTP node, e.g.  
  `[{ "risk_score": 72, "risk_level": "High", "trigger_indicators": [...], ... }]`

### In n8n

1. After computing the risk result, use a **Redirect** or **Open URL** (or similar) node to send the user to your Vercel URL with the payload in the query string.
2. Encode the JSON and attach it to the URL:
   - In a **Code** or **Set** node:  
     `btoa(JSON.stringify(items))` (or your server’s equivalent for base64).
   - Then build the URL:  
     `https://<your-project>.vercel.app/?data=<base64-string>`
3. Use that URL in a **Open URL** / **Redirect** node so the user opens the page with `?data=...` (or `?payload=...`).

If the page is loaded **without** a `data` or `payload` parameter, it shows: *"No risk score data received."*

## Data format (from n8n HTTP node)

The page expects a single object (or an array of one object) with:

| Field               | Type     | Description                    |
|---------------------|----------|--------------------------------|
| `risk_score`        | number   | e.g. 72                        |
| `risk_level`        | string   | e.g. "High"                    |
| `trigger_indicators`| string[] | List of trigger descriptions   |
| `pattern_comparison`| string   | Pattern comparison text        |
| `trend_summary`     | string   | Trend summary text             |
| `explanation`       | string   | Clinical explanation           |

## Local test with sample data

Open the file locally and append the payload as base64. Example (run in browser console to get the URL):

```js
const payload = [{ "risk_score": 72, "risk_level": "High", "trigger_indicators": ["tachycardia > 110 bpm", "systolic blood pressure drop > 20 mmHg from baseline"], "pattern_comparison": "Similar to early sepsis...", "trend_summary": "Progressive increase...", "explanation": "The combination of vital sign abnormalities..." }];
const url = 'file:///path/to/index.html?data=' + btoa(JSON.stringify(payload));
console.log(url);
```

Or use a local server and visit:  
`http://localhost:8080/?data=<base64-output-from-above>`.
