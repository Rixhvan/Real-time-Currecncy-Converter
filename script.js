const currencyList = {
  "INR": "in",
  "USD": "us",
  "EUR": "eu",
  "GBP": "gb",
  "JPY": "jp",
  "CNY": "cn",
  "CHF": "ch",
  "CAD": "ca",
  "AUD": "au",
  "AED": "ae"
};

function populateSelects(fromId, toId, fromFlagId, toFlagId) {
  const fromSelect = document.getElementById(fromId);
  const toSelect = document.getElementById(toId);

  for (let code in currencyList) {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(currencyList[code].toUpperCase());
    const opt1 = new Option(name, code);
    const opt2 = new Option(name, code);
    fromSelect.add(opt1);
    toSelect.add(opt2);
  }

  fromSelect.value = "INR";
  toSelect.value = "USD";
  updateFlag(fromId, fromFlagId);
  updateFlag(toId, toFlagId);

  fromSelect.addEventListener("change", () => updateFlag(fromId, fromFlagId));
  toSelect.addEventListener("change", () => updateFlag(toId, toFlagId));
}

function updateFlag(selectId, imgId) {
  const code = document.getElementById(selectId).value;
  const flagPath = `flags/${currencyList[code]}.png`;
  document.getElementById(imgId).src = flagPath;
}

async function convertCurrency() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const amountRaw = document.getElementById("amount").value;
  const amount = parseFloat(amountRaw);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive number.");
    return;
  }

  const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById("result").textContent = `${amount} ${from} = ${data.rates[to]} ${to}`;
  } catch (error) {
    alert("Failed to fetch exchange rate. Please try again.");
  }
}

async function loadChart() {
  const from = document.getElementById("fromChart").value;
  const to = document.getElementById("toChart").value;
  const end = new Date().toISOString().split("T")[0];
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const startDate = start.toISOString().split("T")[0];

  const url = `https://api.frankfurter.app/${startDate}..${end}?from=${from}&to=${to}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const labels = Object.keys(data.rates).map(date =>
      new Date(date).toLocaleDateString("en-GB")
    );
    const rates = Object.values(data.rates).map(rate => rate[to]);

    const ctx = document.getElementById("rateChart").getContext("2d");
    if (window.chartInstance) window.chartInstance.destroy();

    window.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: `${from} to ${to}`,
          data: rates,
          borderColor: "#3a8fd0",
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: context =>
                `Date: ${context.label} | Rate: ${context.parsed.y.toFixed(4)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  } catch (error) {
    alert("Failed to load chart data.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("from") && document.getElementById("to")) {
    populateSelects("from", "to", "from-flag", "to-flag");
  }
  if (document.getElementById("fromChart") && document.getElementById("toChart")) {
    populateSelects("fromChart", "toChart", "from-chart-flag", "to-chart-flag");
  }
});
