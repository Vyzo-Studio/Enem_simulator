/** Bloco 02/A — Edge Function pública apenas via JWT válido; IA desligada por padrão. */
import {handleResearchRequest} from './gateway.mjs';
Deno.serve(handleResearchRequest);
