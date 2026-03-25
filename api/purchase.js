export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const PLAYFAB_TITLE_ID = process.env.PLAYFAB_TITLE_ID;
  const PLAYFAB_SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;

  const packs = {
    "pack-inicial": { gems: 200, description: "Pack Inicial de Gemas" },
    "pack-aventura": { gems: 750, description: "Pack Aventura" },
    "pack-maestro": { gems: 2500, description: "Pack Maestro" },
    "pase-batalla": { special: true, description: "Pase de Batalla" }
  };

  async function grantItemsToUser(playfabId, packKey) {
    const pack = packs[packKey];
    if (!pack) {
      throw new Error('Pack no válido');
    }

    let requestPayload;
    let url;

    if (pack.gems) {
      url = `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/AddUserVirtualCurrency`;
      requestPayload = {
        "PlayFabId": playfabId,
        "VirtualCurrency": "GD",
        "Amount": pack.gems
      };
    } else if (pack.special) {
      url = `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GrantItemsToUser`;
      requestPayload = {
        "PlayFabId": playfabId,
        "ItemIds": ["battlepass_ticket"],
        "CatalogVersion": "Season1"
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-SecretKey': PLAYFAB_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (!response.ok || data.error) {
        throw new Error(data.error ? data.error.message : `Error en API PlayFab: ${response.status}`);
      }
      return data;
    } catch (e) {
      throw new Error('Respuesta inválida de PlayFab: ' + text);
    }
  }

  try {
    const { playfabId, packKey } = req.body;
    if (!playfabId || !packKey) {
      return res.status(400).json({ error: 'playfabId y packKey son requeridos' });
    }

    const result = await grantItemsToUser(playfabId, packKey);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
