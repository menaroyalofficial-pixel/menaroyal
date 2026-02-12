// Institutional Edge Function: Transmission Protocol
// Aligned with modern Deno.serve standards

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // Protocol Handshake: CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: 'Institutional Error: RESEND_API_KEY is not configured in secrets.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    try {
        const { to, subject, html } = await req.json()

        console.log(`Institutional Transmission: Sending to ${to} | Subject: ${subject}`)

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'MENA ROYAL <institutional@menaroyal.com>',
                to: [to],
                subject: subject,
                html: html,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            console.error("Resend Archival Error:", data)
            return new Response(JSON.stringify(data), {
                status: res.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        console.error("Critical Signal Failure:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
