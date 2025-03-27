export default async function handler(req, res) {
  const { Configuration, OpenAIApi } = await import("openai");

  const textToSpeech = async (text) => {
    console.log("[TTS] Converting text to speech:", text);
    return "https://example.com/audio/output.mp3";
  };

  const getSpotifyData = async (query) => {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ grant_type: "client_credentials" })
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=5`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return await searchRes.json();
    } catch (error) {
      console.error("Spotify API error:", error);
      return { error: "Failed to fetch Spotify data" };
    }
  };

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const { text } = req.body;
  const spotifyData = await getSpotifyData(text);

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a Music Discovery Guide who curates musical suggestions based on mood, vibe, artist comparisons, and user requests. When given Spotify data, you incorporate specific tracks or artists into your suggestions, offering commentary on why they are a good fit.`
      },
      { role: "user", content: `User request: ${text}` },
      { role: "user", content: `Here is Spotify search data: ${JSON.stringify(spotifyData)}` }
    ]
  });

  const reply = completion.data.choices[0].message.content;
  const audioUrl = await textToSpeech(reply);

  res.status(200).json({ reply, audioUrl });
}
