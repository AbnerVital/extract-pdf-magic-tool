import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req: Request) => {
  return new Response(JSON.stringify({ message: "Função Edge ativa com sucesso!" }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
