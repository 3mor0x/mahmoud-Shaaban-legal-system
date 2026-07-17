import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector("input[type='email']").value;
            const password = loginForm.querySelector("input[type='password']").value;
            const submitBtn = loginForm.querySelector(".btn-submit");

            submitBtn.innerHTML = `جاري التحقق... <i class="fas fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;

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
                alert("خطأ في بيانات الدخول: " + error.message);
                submitBtn.innerHTML = `تسجيل الدخول <i class="fas fa-arrow-left"></i>`;
                submitBtn.disabled = false;
            }
        });
    }
});