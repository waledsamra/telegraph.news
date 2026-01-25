import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// تم وضع بيانات الربط الخاصة بمشروعك
// ------------------------------------------------------------------

const supabaseUrl = 'https://rovmvfevlhhmscnilgpz.supabase.co';
const supabaseKey = 'sb_publishable_rk_XoSlHs38D7Q755nJJ9w_Wa64UHD0';

export const supabase = createClient(supabaseUrl, supabaseKey);