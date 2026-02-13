# Risk Score Display

Single-page app to show **Early Clinical Deterioration** risk scores. Designed to be deployed on **Vercel** via **GitHub** and to receive payloads from **n8n** HTTP/Redirect flows.

## Deploy on Vercel via GitHub

1. Push this repo to: **https://github.com/niharnalashaa/RiskScoreDisplay.git**
2. In [Vercel](https://vercel.com), **Add New Project** → **Import** the repo `niharnalashaa/RiskScoreDisplay`.
3. Deploy (no build step needed; it’s static HTML).
4. Your page will be live at `https://<your-project>.vercel.app`.

## Receiving data from n8n (POST to API)

Same approach as CustomerOnboardingReview: n8n **POST**s the risk payload to the API; the page **GET**s the latest payload on load.

1. In n8n, add an **HTTP Request** node after your risk score is computed.
2. **Method:** **POST**
3. **URL:** `https://<your-vercel-app>.vercel.app/api/receive` (e.g. `https://risk-score-display.vercel.app/api/receive`)
4. **Body:** JSON — send your risk object (or array of one object) with `risk_score`, `risk_level`, `trigger_indicators`, `pattern_comparison`, `trend_summary`, `explanation`.
5. Users open the main page; it fetches the latest payload from `/api/receive` and displays it. Use **Refresh Data** (or **Refresh** on the no-data screen) to re-fetch.

- The JSON can be the **array** format from your HTTP node, e.g.  
  `[{ "risk_score": 72, "risk_level": "High", "trigger_indicators": [...], ... }]`

### In n8n (for Option B — URL param)

1. **Add a Code node** before the HTTP Request node. Input: one item whose JSON has `risk_score`, `risk_level`, `trigger_indicators`, etc. Use this to create the base64 payload and the full URL:

   ```js
   const item = $input.first().json;
   const payload = [item]; // page expects array of one object
   const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
   const baseUrl = 'https://risk-score-display.vercel.app'; // use your Vercel URL
   const displayUrl = `${baseUrl}/?data=${encodeURIComponent(base64Payload)}`;
   return { json: { ...item, base64Payload, displayUrl } };
   ```

2. **HTTP Request node**
   - **Method:** GET  
   - **URL:** `https://risk-score-display.vercel.app/?data={{ $json.base64Payload }}`  
   - Use a **single** slash before `?`, the parameter name **data**, and the expression **`{{ $json.base64Payload }}`** (double curly braces).  
   - This node only fetches the HTML inside n8n; it does **not** open a browser.

3. **To actually see the data on the Vercel page**, a user must open the **full URL including the query string** in a browser. Copy the **displayUrl** from the Code node output and paste it into the browser, or use it in an email/link, or in a node that opens a URL and pass `{{ $json.displayUrl }}`.

Original steps (alternative): After computing the risk result, use a **Redirect** or **Open URL** (or similar) node to send the user to your Vercel URL with the payload in the query string.
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
