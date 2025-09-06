import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, threadId } = await req.json();

    if (!question || !threadId) {
      return new Response(
        JSON.stringify({ error: 'Question and threadId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing question:', question);
    console.log('Thread ID:', threadId);

    // Query Flowise RAG system
    const flowiseResponse = await fetch(
      "https://cloud.flowiseai.com/api/v1/prediction/a4b352cc-50f3-4221-b63e-b41ac3cf7949",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      }
    );

    if (!flowiseResponse.ok) {
      console.error('Flowise API error:', flowiseResponse.status, flowiseResponse.statusText);
      throw new Error(`Flowise API error: ${flowiseResponse.status}`);
    }

    const ragResult = await flowiseResponse.json();
    console.log('RAG response received:', ragResult);

    // Extract the answer and sources from Flowise response
    const answer = ragResult.text || ragResult.answer || ragResult.message || 'I apologize, but I could not find a relevant answer in our knowledge base.';
    
    // Extract sources if available (adjust based on your Flowise response structure)
    const sources = ragResult.sourceDocuments?.map((doc: any) => ({
      title: doc.metadata?.title || doc.metadata?.source || 'Knowledge Base Document',
      section: doc.metadata?.section || doc.metadata?.page ? `Page ${doc.metadata.page}` : undefined
    })) || [];

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save the assistant response to the database
    const { error: insertError } = await supabase
      .from('messages')
      .insert([
        {
          thread_id: threadId,
          sender: 'agent',
          content: answer,
          metadata: {
            sources: sources,
            timestamp: new Date().toISOString(),
            model: 'flowise-rag'
          }
        }
      ]);

    if (insertError) {
      console.error('Error saving message:', insertError);
      throw new Error('Failed to save response');
    }

    // Update thread timestamp
    const { error: updateError } = await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (updateError) {
      console.error('Error updating thread:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        answer,
        sources,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-rag function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        answer: 'I apologize, but I encountered an error while processing your question. Please try again or contact support if the issue persists.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});