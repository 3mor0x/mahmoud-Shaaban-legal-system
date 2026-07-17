import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const otpGroup = document.getElementById("otpGroup");
    const otpInput = document.getElementById("otpInput");
    const submitBtn = document.getElementById("submitBtn");

    let isOtpRequired = false;

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            // 1. القيد الصارم: يجب أن يكون النطاق @gmail.com
            if (!email.endsWith("@gmail.com")) {
                alert("❌ عذراً، يُسمح فقط بتسجيل الدخول باستخدام حسابات @gmail.com فقط!");
                return;
            }

            // 2. إذا كان حقل الـ OTP ظاهر، نقوم بالتحقق من الرمز المدخل
            if (isOtpRequired) {
                const token = otpInput.value.trim();
                if (token.length < 6) {
                    alert("برجاء إدخال رمز OTP المكون من 6 أرقام!");
                    return;
                }

                submitBtn.innerHTML = `جاري تأكيد الرمز... <i class="fas fa-spinner fa-spin"></i>`;
                
                try {
                    const { data, error } = await supabase.auth.verifyOtp({
                        email,
                        token,
                        type: 'signup' // أو 'login' حسب إعدادات السيرفر عندك
                    });

                    if (error) throw error;

                    alert("تم التحقق بنجاح! جاري تحويلك للوحة التحكم... 🎉");
                    window.location.href = "../dashboard/dashboard.html";
                } catch (err) {
                    alert("خطأ في رمز الـ OTP: " + err.message);
                    submitBtn.innerHTML = `تأكيد الرمز <i class="fas fa-check"></i>`;
                }
                return;
            }

            // 3. محاولة تسجيل الدخول العادية
            submitBtn.innerHTML = `جاري التحقق... <i class="fas fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    // إذا كان الحساب يحتاج لتأكيد البريد الإلكتروني (Email not confirmed)
                    if (error.message.includes("Email not confirmed") || error.status === 400) {
                        alert("📧 هذا الحساب يتطلب تفعيل الـ OTP. تم إرسال الرمز إلى بريدك الإلكتروني!");
                        
                        // إظهار حقل الـ OTP وتحويل وظيفة الزرار
                        otpGroup.style.display = "block";
                        otpInput.required = true;
                        isOtpRequired = true;
                        
                        submitBtn.innerHTML = `تأكيد رمز الـ OTP <i class="fas fa-key"></i>`;
                        submitBtn.disabled = false;
                        return;
                    }
                    throw error;
                }

                // جلب الصلاحيات والتوجه للداشبورد مباشرة إذا كان مفعل مسبقاً
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) throw profileError;

                localStorage.setItem("sb-user-id", data.user.id);
                localStorage.setItem("sb-user-role", profile.role);

                window.location.href = "../dashboard/dashboard.html";

            } catch (error) {
                alert("خطأ صارم في تسجيل الدخول: " + error.message);
                submitBtn.innerHTML = `تسجيل الدخول <i class="fas fa-arrow-left"></i>`;
                submitBtn.disabled = false;
            }
        });
    }
});