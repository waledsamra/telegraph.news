
import { createClient } from '@supabase/supabase-js';

/**
 * ⚠️ تنبيه هام جداً:
 * المفتاح الذي يبدأ بـ "sb_publishable_..." هو مفتاح خاطئ.
 * يجب أن تستخدم مفتاح "anon public key" من إعدادات Supabase.
 * تجده في: Settings -> API -> anon public key
 * التنسيق الصحيح للمفتاح يبدأ دائماً بـ: eyJhbGci...
 */

const supabaseUrl = 'https://rovmvfevlhhmscnilgpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2YmdpanRleXpod2J5ZmRtYmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjg0NDAsImV4cCI6MjA4NDkwNDQ0MH0.QoO6Y9YYF2RkpewBSNMHCLTAIkETH9HeOV-7mMgUyR8'; // قم بتغيير هذا المفتاح فوراً لمفتاح يبدأ بـ eyJ...

export const supabase = createClient(supabaseUrl, supabaseKey);
