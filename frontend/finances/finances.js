/* ==========================================
   كود تشغيل القائمة الجانبية (للموبايل)
   ========================================== */
const sidebar = document.querySelector('.sidebar');
function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

/* ==========================================
   كود تشغيل النوافذ المنبثقة (المودال)
   ========================================== */
const modal = document.querySelector('.modal-overlay');
function openModal() { 
    if (modal) modal.classList.add('active'); 
}
function closeModal() { 
    if (modal) modal.classList.remove('active'); 
}

// قفل النافذة لو العميل داس في أي مساحة فاضية بره
if (modal) {
    modal.addEventListener('click', function(e) { 
        if (e.target === modal) closeModal(); 
    });
}