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

  const startTime = Date.now();
  let ragStartTime: number;
  let dbStartTime: number;

  try {
    const { question, threadId } = await req.json();
    console.log('RAG request started for thread:', threadId);

    if (!question || !threadId) {
      return new Response(
        JSON.stringify({ error: 'Question and threadId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing question:', question.substring(0, 100) + '...');

    // Query Flowise RAG system with timeout and optimizations
    ragStartTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const flowiseResponse = await fetch(
      "https://cloud.flowiseai.com/api/v1/prediction/85fa5000-8173-4a5c-afc7-c84bf033fd27",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive" // Reuse connections
        },
        body: JSON.stringify({ question }),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    const ragTime = Date.now() - ragStartTime;
    console.log('Flowise response received in:', ragTime + 'ms');

    if (!flowiseResponse.ok) {
      console.error('Flowise API error:', flowiseResponse.status, flowiseResponse.statusText);
      throw new Error(`Flowise API error: ${flowiseResponse.status}`);
    }

    const ragResult = await flowiseResponse.json();
    console.log('RAG response parsed, content length:', ragResult.text?.length || 0);

    // Extract the answer and sources from Flowise response
    const answer = ragResult.text || ragResult.answer || ragResult.message || 'I apologize, but I could not find a relevant answer in our knowledge base.';
    
    // Extract sources if available (optimized processing)
    const sources = ragResult.sourceDocuments?.slice(0, 5).map((doc: any) => ({
      title: doc.metadata?.title || 
             (doc.metadata?.pdf?.info?.Title) || 
             'CoopBank Policy Document',
      section: doc.metadata?.section || 
               (doc.metadata?.loc?.pageNumber ? `Page ${doc.metadata.loc.pageNumber}` : 
                doc.metadata?.page ? `Page ${doc.metadata.page}` : undefined)
    })) || [];

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Database operations in parallel for better performance
    dbStartTime = Date.now();
    const [insertResult, updateResult] = await Promise.allSettled([
      // Save the assistant response
      supabase
        .from('messages')
        .insert([{
          thread_id: threadId,
          sender: 'agent',
          content: answer,
          metadata: {
            sources: sources,
            timestamp: new Date().toISOString(),
            model: 'flowise-rag',
            processingTime: ragTime
          }
        }]),
      
      // Update thread timestamp
      supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId)
    ]);

    const dbTime = Date.now() - dbStartTime;
    const totalTime = Date.now() - startTime;

    // Handle database results
    if (insertResult.status === 'rejected') {
      console.error('Error saving message:', insertResult.reason);
      throw new Error('Failed to save response');
    }

    if (updateResult.status === 'rejected') {
      console.error('Error updating thread:', updateResult.reason);
      // Don't throw here as it's not critical
    }

    console.log('RAG request completed:', {
      ragTime: ragTime + 'ms',
      dbTime: dbTime + 'ms', 
      totalTime: totalTime + 'ms',
      answerLength: answer.length,
      sourcesCount: sources.length
    });

    return new Response(
      JSON.stringify({ 
        answer,
        sources,
        success: true,
        metadata: {
          processingTime: totalTime,
          ragTime,
          dbTime
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('Error in chat-with-rag function:', {
      error: error.message,
      totalTime: totalTime + 'ms'
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        answer: 'I apologize, but I encountered an error while processing your question. Please try again or contact support if the issue persists.',
        metadata: {
          processingTime: totalTime,
          failed: true
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});