document.addEventListener('DOMContentLoaded', () => {
    // We do NOT use sessionStorage so they are forced to log in every time
    let isAuthenticated = false;
    
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const adminPassword = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Default password as requested
    const ADMIN_PASSWORD = 'ahenk2026';

    // When the user comes back via Chrome's back/forward button (bfcache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Force logout if loaded from cache
            logoutBtn.click();
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = adminPassword.value;
        if (pwd === ADMIN_PASSWORD) {
            isAuthenticated = true;
            window.ahenkIsAuthenticated = true; // For onSnapshot checks
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        isAuthenticated = false;
        window.ahenkIsAuthenticated = false;
        adminDashboard.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        adminPassword.value = '';
        loginError.classList.add('hidden');
    });

    function showDashboard() {
        loginScreen.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        renderCustomers();
        renderMenuItems();
    }

    // --- Customer List Logic ---
    const addCustomerForm = document.getElementById('addCustomerForm');
    const custName = document.getElementById('custName');
    const custPhone = document.getElementById('custPhone');
    const customerTableBody = document.getElementById('customerTableBody');
    const emptyState = document.getElementById('emptyState');
    const copyNumbersBtn = document.getElementById('copyNumbersBtn');
    const toast = document.getElementById('toast');

    let customers = [];

    // Setup real-time listener for Firebase
    db.collection("customers").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        customers = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        if (isAuthenticated) {
            renderCustomers();
        }
    });

    addCustomerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newCustomer = {
            name: custName.value.trim(),
            phone: custPhone.value.trim(),
            stamps: [false, false, false, false, false, false, false, false],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection("customers").add(newCustomer);
        
        custName.value = '';
        custPhone.value = '';
    });

    function normalizeStamps(stamps) {
        if (!Array.isArray(stamps)) return [false, false, false, false, false, false, false, false];
        while (stamps.length > 8 && stamps[stamps.length - 1] === false) {
            stamps.pop();
        }
        if (stamps[stamps.length - 1] === true) {
            stamps.push(false);
        }
        while (stamps.length < 8) {
            stamps.push(false);
        }
        return stamps;
    }

    function renderCustomers() {
        customerTableBody.innerHTML = '';
        
        if (customers.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');

        customers.forEach((customer) => {
            const tr = document.createElement('tr');
            
            const tdName = document.createElement('td');
            tdName.textContent = customer.name;
            
            const tdPhone = document.createElement('td');
            tdPhone.textContent = customer.phone;
            
            const tdStamps = document.createElement('td');
            const stampContainer = document.createElement('div');
            stampContainer.className = 'stamp-container';
            
            customer.stamps = normalizeStamps(customer.stamps);
            
            for (let i = 0; i < customer.stamps.length; i++) {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'stamp-checkbox';
                cb.checked = customer.stamps[i];
                cb.title = `${i+1}. Kahve`;
                cb.addEventListener('change', (e) => {
                    customer.stamps[i] = e.target.checked;
                    const newStamps = normalizeStamps(customer.stamps);
                    db.collection("customers").doc(customer.id).update({ stamps: newStamps });
                });
                stampContainer.appendChild(cb);
            }
            tdStamps.appendChild(stampContainer);
            
            const tdActions = document.createElement('td');
            
            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn-clear';
            clearBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>';
            clearBtn.title = 'Damgaları Temizle';
            clearBtn.addEventListener('click', () => {
                if (confirm(`${customer.name} adlı müşterinin tüm damgaları sıfırlanacak. Emin misiniz?`)) {
                    db.collection("customers").doc(customer.id).update({ 
                        stamps: [false, false, false, false, false, false, false, false] 
                    });
                }
            });
            tdActions.appendChild(clearBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'btn-delete';
            delBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
            delBtn.title = 'Müşteriyi Sil';
            delBtn.addEventListener('click', () => {
                if (confirm(`${customer.name} isimli müşteriyi silmek istediğinize emin misiniz?`)) {
                    db.collection("customers").doc(customer.id).delete();
                }
            });
            tdActions.appendChild(delBtn);

            tr.appendChild(tdName);
            tr.appendChild(tdPhone);
            tr.appendChild(tdStamps);
            tr.appendChild(tdActions);
            
            customerTableBody.appendChild(tr);
        });
    }

    function loadCustomers() {
        renderCustomers();
    }

    // Copy Phone Numbers Feature
    copyNumbersBtn.addEventListener('click', () => {
        if (customers.length === 0) {
            alert('Kopyalanacak müşteri bulunmuyor.');
            return;
        }

        // Clean and join numbers separated by comma as requested
        const numbersList = customers.map(c => c.phone).join(', ');
        
        navigator.clipboard.writeText(numbersList).then(() => {
            showToast('Tüm telefon numaraları kopyalandı!');
        }).catch(err => {
            console.error('Kopyalama başarısız oldu: ', err);
            alert('Kopyalama başarısız oldu. Tarayıcınız desteklemiyor olabilir.');
        });
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // --- Tab Switching Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const adminSections = document.querySelectorAll('.admin-section');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            adminSections.forEach(s => {
                s.classList.remove('active-section');
                s.classList.add('hidden');
            });
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active-section');
        });
    });

    // --- Menu Management Logic ---
    const addMenuItemForm = document.getElementById('addMenuItemForm');
    const menuItemName = document.getElementById('menuItemName');
    const menuItemDesc = document.getElementById('menuItemDesc');
    const menuItemPrice = document.getElementById('menuItemPrice');
    const menuItemCategory = document.getElementById('menuItemCategory');
    const menuTableBody = document.getElementById('menuTableBody');
    const menuEmptyState = document.getElementById('menuEmptyState');

    let menuItems = [];

    // Real-time listener for Menu
    db.collection("menu").onSnapshot((snapshot) => {
        menuItems = [];
        snapshot.forEach((doc) => {
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort in memory to avoid composite index requirement
        menuItems.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeA - timeB;
        });

        if (window.ahenkIsAuthenticated) {
            renderMenuItems();
        }
    });

    let editingMenuId = null;
    const menuFormTitle = document.getElementById('menuFormTitle');
    const menuSubmitBtn = document.getElementById('menuSubmitBtn');
    const menuCancelEditBtn = document.getElementById('menuCancelEditBtn');

    if (menuCancelEditBtn) {
        menuCancelEditBtn.addEventListener('click', () => {
            editingMenuId = null;
            menuFormTitle.textContent = 'Yeni Ürün Ekle';
            menuSubmitBtn.textContent = 'Menüye Ekle';
            menuCancelEditBtn.classList.add('hidden');
            addMenuItemForm.reset();
        });
    }

    addMenuItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const itemData = {
            name: menuItemName.value.trim(),
            description: menuItemDesc.value.trim(),
            price: menuItemPrice.value.trim(),
            category: menuItemCategory.value
        };

        if (editingMenuId) {
            db.collection("menu").doc(editingMenuId).update(itemData).then(() => {
                if (menuCancelEditBtn) menuCancelEditBtn.click();
            });
        } else {
            itemData.active = true;
            itemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            db.collection("menu").add(itemData).then(() => {
                addMenuItemForm.reset();
            });
        }
    });

    function renderMenuItems() {
        menuTableBody.innerHTML = '';
        
        if (menuItems.length === 0) {
            menuEmptyState.classList.remove('hidden');
            return;
        }
        
        menuEmptyState.classList.add('hidden');

        menuItems.forEach((item) => {
            const tr = document.createElement('tr');
            
            // Active Toggle Cell
            const tdActive = document.createElement('td');
            const toggleWrapper = document.createElement('label');
            toggleWrapper.className = 'toggle-switch';
            const toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.checked = item.active;
            const toggleSlider = document.createElement('span');
            toggleSlider.className = 'slider';
            
            toggleInput.addEventListener('change', (e) => {
                db.collection("menu").doc(item.id).update({ active: e.target.checked });
            });
            
            toggleWrapper.appendChild(toggleInput);
            toggleWrapper.appendChild(toggleSlider);
            tdActive.appendChild(toggleWrapper);
            
            // Category Cell
            const tdCat = document.createElement('td');
            const catMap = {
                'sicak-icecekler': 'Sıcak İçecekler',
                'sicak-kahveler': 'Sıcak Kahveler',
                'soguk-kahveler': 'Soğuk Kahveler',
                'soguk-icecekler': 'Soğuk İçecekler',
                'tatlilar': 'Tatlılar',
                'sandvicler': 'Sandviçler'
            };
            tdCat.textContent = catMap[item.category] || item.category;
            
            // Name Cell
            const tdName = document.createElement('td');
            tdName.innerHTML = `<strong>${item.name}</strong><br><small style="color:#666">${item.description}</small>`;
            
            // Price Cell
            const tdPrice = document.createElement('td');
            tdPrice.textContent = item.price;
            
            // Actions Cell
            // Actions
            const tdActions = document.createElement('td');
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-delete';
            editBtn.style.backgroundColor = 'var(--clr-primary-500)';
            editBtn.style.marginRight = '8px';
            editBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
            `;
            editBtn.title = 'Düzenle';
            editBtn.addEventListener('click', () => {
                editingMenuId = item.id;
                menuItemName.value = item.name;
                menuItemDesc.value = item.description || '';
                menuItemPrice.value = item.price;
                menuItemCategory.value = item.category;
                
                menuFormTitle.textContent = 'Ürünü Düzenle';
                menuSubmitBtn.textContent = 'Güncelle';
                menuCancelEditBtn.classList.remove('hidden');
                
                // Scroll to form
                document.getElementById('menuSection').scrollIntoView({ behavior: 'smooth' });
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete';
            deleteBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            `;
            deleteBtn.title = 'Sil';
            deleteBtn.addEventListener('click', () => {
                if(confirm(`${item.name} ürününü menüden silmek istediğinize emin misiniz?`)) {
                    db.collection("menu").doc(item.id).delete();
                }
            });
            
            tdActions.appendChild(editBtn);
            tdActions.appendChild(deleteBtn);
            
            tr.appendChild(tdActive);
            tr.appendChild(tdCat);
            tr.appendChild(tdName);
            tr.appendChild(tdPrice);
            tr.appendChild(tdActions);
            
            if(!item.active) {
                tr.style.opacity = '0.5';
            }
            
            menuTableBody.appendChild(tr);
        });
    }
});
