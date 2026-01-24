import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// تم وضع بيانات الربط الخاصة بمشروعك
// ------------------------------------------------------------------

const supabaseUrl = 'https://rovmvfevlhhmscnilgpz.supabase.co';
const supabaseKey = 'sb_publishable_5OrRwOzbHr85Em35ubb81A_O_5D-ay3';

export const supabase = createClient(supabaseUrl, supabaseKey);