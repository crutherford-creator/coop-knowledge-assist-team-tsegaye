import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('Text-to-speech request started');

  try {
    const { text, voice } = await req.json()
    console.log('TTS request:', { textLength: text?.length || 0, voice });

    if (!text) {
      throw new Error('Text is required')
    }

    // Truncate text if too long (TTS has limits and long text is slow)
    const maxLength = 4000; // OpenAI TTS limit is ~4096 characters
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    if (text.length > maxLength) {
      console.log('Text truncated from', text.length, 'to', truncatedText.length, 'characters');
    }

    console.log('Sending request to OpenAI TTS API...');
    const apiStartTime = Date.now();

    // Generate speech from text with timeout and optimizations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'Connection': 'keep-alive' // Reuse connections
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Use HD model for better quality but still fast
        input: truncatedText,
        voice: voice || 'alloy',
        response_format: 'mp3',
        speed: 1.1 // Slightly faster speech for efficiency
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const apiTime = Date.now() - apiStartTime;
    console.log('OpenAI TTS response received in:', apiTime + 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorText);
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`)
    }

    // Convert audio buffer to base64 more efficiently
    console.log('Converting audio to base64...');
    const conversionStartTime = Date.now();
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process in chunks for better performance with large audio files
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);
    
    const conversionTime = Date.now() - conversionStartTime;
    const totalTime = Date.now() - startTime;
    
    console.log('TTS completed:', {
      apiTime: apiTime + 'ms',
      conversionTime: conversionTime + 'ms',
      totalTime: totalTime + 'ms',
      audioSize: arrayBuffer.byteLength + ' bytes',
      textLength: truncatedText.length
    });

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        metadata: {
          processingTime: totalTime,
          apiTime,
          conversionTime,
          audioSize: arrayBuffer.byteLength,
          textLength: truncatedText.length,
          truncated: text.length > maxLength
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('Text-to-speech error:', {
      error: error.message,
      totalTime: totalTime + 'ms'
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        metadata: {
          processingTime: totalTime,
          failed: true
        }
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})