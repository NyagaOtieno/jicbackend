export async function pushToNeuron(payload) {
  const base = process.env.NEURON_BASE_URL;
  const key = process.env.NEURON_API_KEY;

  if (!base || !key) return { skipped: true };

  const url = `${base.replace(/\/+$/, "")}/api/vehicle-condition`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": key
    },
    body: JSON.stringify(payload)
  });

  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Neuron push failed: ${r.status} ${text}`);
  }
  return { ok: true };
}