export default async () => new Response(JSON.stringify({
  coordinatorAvailable: Boolean(process.env.OPENAI_API_KEY)
}), {
  headers: { 'content-type': 'application/json; charset=utf-8' }
});
