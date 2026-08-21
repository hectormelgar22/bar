/**
 * LA MAESTRANZA - LÓGICA DE INTERACCIÓN
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHoursStatus();
  initMobileMenu();
  initMenuTabs();
  initDishModal();
  initBookingSimulator();
});

/* --------------------------------------------------------------------------
   1. HORARIO EN TIEMPO REAL
   -------------------------------------------------------------------------- */
function initLiveHoursStatus() {
  const statusText = document.getElementById('liveStatusText');
  if (!statusText) return;

  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeDec = hours + minutes / 60;

  let isOpen = false;
  let closesAt = '';

  if (day >= 1 && day <= 4) {
    if (currentTimeDec >= 12.0 || currentTimeDec < 0.5) {
      isOpen = true;
      closesAt = '00:30h';
    }
  } else if (day === 5 || day === 6) {
    if (currentTimeDec >= 12.0 || currentTimeDec < 2.5) {
      isOpen = true;
      closesAt = '02:30h';
    }
  } else if (day === 0) {
    if (currentTimeDec >= 11.5) {
      isOpen = true;
      closesAt = '00:00h';
    }
  }

  if (isOpen) {
    statusText.textContent = `Abierto ahora • Hoy hasta las ${closesAt}`;
  } else {
    statusText.textContent = 'Abre hoy a las 12:00h';
  }
}

/* --------------------------------------------------------------------------
   2. MENÚ MÓVIL (OPORTUNIDAD #3: TRANSICIÓN SUAVE)
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!btn || !drawer) return;

  const iconMenu = btn.querySelector('.icon-menu');
  const iconClose = btn.querySelector('.icon-close');
  const links = drawer.querySelectorAll('a');

  function toggle(forceClose = false) {
    const isOpen = drawer.classList.contains('open');
    const shouldOpen = forceClose ? false : !isOpen;

    if (shouldOpen) {
      drawer.classList.add('open');
      iconMenu?.classList.add('hidden');
      iconClose?.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      drawer.classList.remove('open');
      iconMenu?.classList.remove('hidden');
      iconClose?.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  btn.addEventListener('click', () => toggle());
  links.forEach(l => l.addEventListener('click', () => toggle(true)));
}

/* --------------------------------------------------------------------------
   3. PESTAÑAS DE LA CARTA (OPORTUNIDAD #1: FILTRADO SUAVE)
   -------------------------------------------------------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab-btn');
  const dishes = document.querySelectorAll('.dish-card');

  if (tabs.length === 0 || dishes.length === 0) return;

  function filterCategory(category, isInitial = false) {
    if (isInitial) {
      dishes.forEach((dish) => {
        const match = category === 'all' || dish.dataset.category === category;
        if (match) {
          dish.classList.remove('dish-hidden', 'dish-fade-out');
          dish.classList.add('dish-fade-in');
        } else {
          dish.classList.add('dish-hidden', 'dish-fade-out');
          dish.classList.remove('dish-fade-in');
        }
      });
      return;
    }

    // Paso 1: Salida suave de las tarjetas actualmente visibles que no encajan
    dishes.forEach((dish) => {
      if (!dish.classList.contains('dish-hidden')) {
        dish.classList.remove('dish-fade-in');
        dish.classList.add('dish-fade-out');
      }
    });

    // Paso 2: Conmutar visibilidad y desplegar las nuevas con animación fluida
    setTimeout(() => {
      let delay = 0;
      dishes.forEach((dish) => {
        const match = category === 'all' || dish.dataset.category === category;
        if (match) {
          dish.classList.remove('dish-hidden');
          // Forzar reflujo para asegurar la animación
          void dish.offsetWidth;
          setTimeout(() => {
            dish.classList.remove('dish-fade-out');
            dish.classList.add('dish-fade-in');
          }, delay);
          delay += 35;
        } else {
          dish.classList.add('dish-hidden');
        }
      });
    }, 140);
  }

  // Filtrado inicial para la categoría activa
  const activeTab = document.querySelector('.menu-tab-btn.active');
  const initialCategory = activeTab?.dataset.category || 'tapas';
  filterCategory(initialCategory, true);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category;
      filterCategory(category);
    });
  });
}

/* --------------------------------------------------------------------------
   4. MODAL DETALLE DE PLATO
   -------------------------------------------------------------------------- */
const DISH_DATA = {
  'torreznos': {
    title: 'Torreznos de Soria',
    price: '10,50 €',
    desc: 'Panceta adobada y curada frita a fuego lento con el golpe final a temperatura fuerte para inflar la corteza. Servidos con sal marina en escamas.',
    pairing: 'Caña bien fría o vino tinto',
    allergens: 'Apto para celíacos (sin gluten)',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  'bravas': {
    title: 'Patatas Bravas Tradicionales',
    price: '8,50 €',
    desc: 'Patata agria cortada a mano en dados irregulares, confitadas y doradas en el momento. Acompañadas de nuestra salsa brava casera y alioli suave.',
    pairing: 'Cerveza IPA o vermut',
    allergens: 'Contiene huevo (en el alioli)',
    img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80'
  },
  'croquetas': {
    title: 'Croquetas de Jamón Ibérico',
    price: '11,00 € (6 uds)',
    desc: 'Bechamel elaborada a diario con jamón ibérico picado fino y caldo de jamón. Rebozado fino y crujiente.',
    pairing: 'Vino blanco o caña de bodega',
    allergens: 'Contiene lácteos, gluten y huevo',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
  },
  'chuleton': {
    title: 'Chuletón de Vaca a la Brasa',
    price: '54,00 € / Kg',
    desc: 'Lomo alto de vaca madurada pasado por nuestra parrilla de carbón. Se sirve trinchado con patatas fritas caseras y pimientos verdes fritos.',
    pairing: 'Vino tinto Ribera o Rioja',
    allergens: 'Sin alérgenos comunes',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80'
  },
  'costillas': {
    title: 'Costillar Asado con Salsa Barbacoa',
    price: '16,50 €',
    desc: 'Costilla de cerdo cocinada despacio al horno y terminada a la brasa con salsa barbacoa casera y patatas rústicas.',
    pairing: 'Cerveza tostada o negra',
    allergens: 'Contiene mostaza y trazas de apio',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  'burger-maestranza': {
    title: 'Hamburguesa La Maestranza',
    price: '13,50 €',
    desc: '180g de carne de ternera picada en el día, queso cheddar curado, bacon crujiente, cebolla pochada y pan brioche de mantequilla. Servida con patatas fritas.',
    pairing: 'Cerveza rubia o refresco',
    allergens: 'Contiene gluten, lácteos y huevo',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  },
  'cerveza-bodega': {
    title: 'Cerveza de Bodega de Tanque',
    price: '2,20 € caña • 3,80 € jarra',
    desc: 'Cerveza servida directa de tanque refrigerado sin pasteurizar. Copa fría y crema densa de espuma.',
    pairing: 'Ideal para acompañar cualquier ración',
    allergens: 'Contiene cebada (gluten)',
    img: 'https://images.unsplash.com/photo-1538488881522-4326c36ad6c9?auto=format&fit=crop&w=800&q=80'
  },
  'tarta-queso': {
    title: 'Tarta de Queso al Horno',
    price: '6,00 €',
    desc: 'Receta casera elaborada a diario con queso fresco y crema. Centro suave y base crujiente de galleta.',
    pairing: 'Café solo o cortado',
    allergens: 'Contiene lácteos, huevo y gluten',
    img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80'
  }
};

function initDishModal() {
  const modal = document.getElementById('dishModal');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('btnModalClose');
  const orderBtn = document.getElementById('btnModalOrder');

  const modalTitle = document.getElementById('modalDishTitle');
  const modalPrice = document.getElementById('modalDishPrice');
  const modalDesc = document.getElementById('modalDishDesc');
  const modalPairing = document.getElementById('modalDishPairing');
  const modalAllergens = document.getElementById('modalDishAllergens');
  const modalImg = document.getElementById('modalDishImg');

  if (!modal) return;

  function openDish(dishId) {
    const data = DISH_DATA[dishId];
    if (!data) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalPrice) modalPrice.textContent = data.price;
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalPairing) modalPairing.textContent = data.pairing;
    if (modalAllergens) modalAllergens.textContent = data.allergens;
    if (modalImg) {
      modalImg.src = data.img;
      modalImg.alt = data.title;
    }

    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 200);
  }

  document.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', () => {
      const dishId = card.dataset.dishId;
      if (dishId) openDish(dishId);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  orderBtn?.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   5. SIMULADOR DE RESERVAS SENCILLO
   -------------------------------------------------------------------------- */
function initBookingSimulator() {
  const form = document.getElementById('bookingForm');
  const dateInput = document.getElementById('bookDate');
  const zoneButtons = document.querySelectorAll('.zone-btn');

  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  let selectedZone = 'Comedor Interior';
  zoneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      zoneButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const z = btn.dataset.zone;
      if (z === 'comedor') selectedZone = 'Comedor Interior';
      if (z === 'terraza') selectedZone = 'Terraza Exterior';
      if (z === 'barra') selectedZone = 'Mesas de Barra';
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('bookName')?.value.trim();
      const phone = document.getElementById('bookPhone')?.value.trim();
      const date = document.getElementById('bookDate')?.value;
      const time = document.getElementById('bookTime')?.value;
      const guests = document.getElementById('bookGuests')?.value;

      if (!name || !phone) {
        showToast('Por favor indica tu nombre y teléfono para la reserva.');
        return;
      }

      showToast(`Mesa solicitada para ${name} (${guests} personas) el ${date} a las ${time}h en ${selectedZone}. Te llamaremos para confirmar.`);
      form.reset();
      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. TOAST DE CONFIRMACIÓN (OPORTUNIDAD #4: SALIDA SIMÉTRICA)
   -------------------------------------------------------------------------- */
function showToast(message, duration = 4500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}
