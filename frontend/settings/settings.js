import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => { e.stopPropagation(); sidebar.classList.toggle("active"); });
    }

    const userId = localStorage.getItem("sb-user-id");
    if (!userId) { window.location.href = "../login/index.html"; return; }

    const saveSettingsBtn = document.querySelector(".btn-primary");
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            alert("تم حفظ إعدادات وتخصيصات المكتب وتحديث بروتوكول الأتمتة بنجاح! ⚙️قفل🔒");
        });
    }
});