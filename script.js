const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const TARGET = new Set(["btc","eth","bnb","sol","okb"]);
const HEADERS = [
  "名称","符号",
  "历史最高价 (USD)","现价 (USD)",
  "流通量","历史最高市值 (USD)",
  "现市值 (USD)","跌幅 (%)"
];

async function fetchData() {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: "250",
    page: "1",
    sparkline: "false"
  });
  const resp = await fetch(`${API_URL}?${params}`);
  if (!resp.ok) throw new Error("请求失败");
  return resp.json();
}

function computeMetrics(coins) {
  return coins
    .filter(c => TARGET.has(c.symbol))
    .map(c => {
      const ath = c.ath || 0, price = c.current_price || 0, sup = c.circulating_supply || 0;
      const draw = ath ? ((ath - price) / ath * 100).toFixed(2) : "0.00";
      return {
        名称: c.name,
        符号: c.symbol.toUpperCase(),
        "历史最高价 (USD)": ath.toFixed(4),
        "现价 (USD)": price.toFixed(4),
        流通量: Intl.NumberFormat().format(Math.floor(sup)),
        "历史最高市值 (USD)": Intl.NumberFormat().format(Math.floor(ath * sup)),
        "现市值 (USD)": Intl.NumberFormat().format(c.market_cap || 0),
        "跌幅 (%)": draw
      };
    })
    .sort((a,b) => parseInt(b["现市值 (USD)"].replace(/,/g,"")) 
                  - parseInt(a["现市值 (USD)"].replace(/,/g,"")));
}

function renderTable(data) {
  const thead = document.getElementById("tableHead");
  thead.innerHTML = "<tr>" + HEADERS.map(h=>`<th>${h}</th>`).join("") + "</tr>";

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = data
    .map(row => "<tr>" + HEADERS.map(h=>`<td>${row[h]}</td>`).join("") + "</tr>")
    .join("");
}

// 启动
fetchData()
  .then(computeMetrics)
  .then(renderTable)
  .catch(err => console.error(err));
