import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('Speech-to-text request started');

  try {
    const { audio } = await req.json()
    console.log('Request parsed, audio data size:', audio?.length || 0);
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    // Convert base64 to binary more efficiently
    const binaryString = atob(audio);
    const binaryAudio = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryAudio[i] = binaryString.charCodeAt(i);
    }
    
    console.log('Audio converted to binary, size:', binaryAudio.length, 'bytes');
    
    // Prepare form data
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')
    
    console.log('Sending request to OpenAI Whisper API...');

    // Send to OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId);
    console.log('OpenAI response received, status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const processingTime = Date.now() - startTime;
    
    console.log('Transcription completed:', {
      text: result.text,
      processingTime: `${processingTime}ms`
    });

    return new Response(
      JSON.stringify({ 
        text: result.text,
        processingTime 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Speech-to-text error:', {
      error: error.message,
      processingTime: `${processingTime}ms`
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        processingTime 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})