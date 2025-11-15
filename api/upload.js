export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const {
      GITHUB_TOKEN,
      GITHUB_USERNAME,
      GITHUB_REPO
    } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
      return res.status(500).json({
        error: "Missing environment variables",
        details: {
          token: !!GITHUB_TOKEN,
          username: !!GITHUB_USERNAME,
          repo: !!GITHUB_REPO
        }
      });
    }

    const data = JSON.parse(req.body);
    const timestamp = new Date().toISOString();
    const fileName = `${timestamp}.json`;

    const path = `data-json/${fileName}`;
    const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${path}`;

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString(
      "base64"
    );

    // upload json
    const uploadJson = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Add new registration entry",
        content: content,
      }),
    });

    const resultJson = await uploadJson.json();

    if (!uploadJson.ok) {
      return res.status(500).json({
        error: "GitHub Upload Failed",
        github_response: resultJson
      });
    }

    // vcf
    const vcfContent = `
BEGIN:VCARD
VERSION:3.0
FN:${data.name}
TEL:${data.phone}
NOTE:Survey by ${data.surveyor}
END:VCARD
`.trim();

    const vcfPath = `vcf/${data.phone}.vcf`;
    const vcfUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${vcfPath}`;

    const uploadVcf = await fetch(vcfUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Add VCF entry",
        content: Buffer.from(vcfContent).toString("base64"),
      }),
    });

    const resultVcf = await uploadVcf.json();

    if (!uploadVcf.ok) {
      return res.status(500).json({
        error: "VCF Upload Failed",
        github_response: resultVcf
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({
      error: "Server crash",
      details: err.message,
      stack: err.stack
    });
  }
}
