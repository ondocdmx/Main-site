import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ShoppingCart, Search, User, X, Menu, Plus, Minus, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
// Contenido de la web (textos, sopas, fotos, zonas de reparto): se edita en estos JSON.
// Exportado de Sanity en la migración (scripts/export-sanity.mjs); ver AGENTS.md.
import settingsContent from './content/settings.json';
import productsContent from './content/products.json';
import deliveryZonesContent from './content/deliveryZones.json';
import {
  pushEvent, pushEcommerce, productToItem, planItem,
  captureAttribution, saveCheckoutSnapshot, readCheckoutSnapshot, firePurchaseOnce,
} from './analytics';
import { priceCart, discountPercentFor, applyPercent, cartNudge } from './commerce/priceCart';
import { COMMERCE, toCents } from './commerce/config';
import { formatDeliveryDate, nextDeliveryDate } from './commerce/delivery';
import { formatMXN, nudgeMessage } from './commerce/cartCopy';
import type { CheckoutRequest, CheckoutResult } from './components/CartDrawer';
import type { OrderSummary } from './components/OrderSuccess';
import ShopSection from './components/shop/ShopSection';
// Se cargan aparte, solo cuando hacen falta: la home pinta antes (Lighthouse, fase 3).
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const OrderSuccess = lazy(() => import('./components/OrderSuccess'));
const ProductPage = lazy(() => import('./components/shop/ProductPage'));
import { StickyCartBar, AddedToast } from './components/shop/CartBar';
import type { ShopFilter } from './components/shop/shopList';
import HomePage, { type Testimonials } from './components/home/HomePage';
import { AnnouncementBar, SiteFooter, SiteHeader, WhatsAppFloat, useNextDelivery } from './components/home/SiteChrome';
import type { FaqItem } from './components/home/Faq';
import { fillTokens, homeTokens } from './components/home/homeCopy';
import { shopMeta } from './seo';
import faqContent from './content/faq.json';
import testimonialsContent from './content/testimonials.json';

// Dónde se agregó al carrito (add_to_cart → add_location en GA4; ver docs/TRACKING.md).
export type AddLocation = 'grid' | 'product_page' | 'completa_tu_caja' | 'carrito';

// Próxima entrega (hora de Ciudad de México, corte en settings.json). El funnel la calcula al cargar la página;
// el carrito la recalcula cada minuto.
const nextDelivery = nextDeliveryDate();
const nextEs = formatDeliveryDate(nextDelivery, 'es');
const nextEn = formatDeliveryDate(nextDelivery, 'en');

// Carrito guardado en el navegador (solo _id + cantidad; los precios se leen siempre de products.json).
const CART_KEY = 'ondo_cart';
function loadSavedCart(): { product: any; quantity: number }[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return (Array.isArray(saved) ? saved : [])
      .map((l: any) => ({ product: (productsContent as any[]).find(p => p._id === l?.id), quantity: l?.quantity }))
      .filter(l => l.product && !l.product.soldOut && !l.product.onlySubscriptions && Number.isInteger(l.quantity) && l.quantity > 0);
  } catch {
    return [];
  }
}

const t = {
  es: {
    navShop: "TIENDA",
    navSubs: "SUSCRIPCIÓN",
    navSteps: "CÓMO FUNCIONA",
    navAbout: "NOSOTROS",
    emptyCart: "Tu carrito está vacío",
    subtotal: "Subtotal",
    checkout: "Ir a pagar",
    heroTitle: "FIRST WE SOUP",
    heroSub: "Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.",
    shopNow: "¡APAPÁCHATE!",
    filtersTitle: "Filtros",
    filterBundle: "Vegetariano",
    filterNew: "Frío",
    filterBestseller: "Caliente",
    filterVegan: "Vegano",
    sortBy: "Ordenar por",
    addToCart: "Agregar al Carrito",
    splitTitle: "SIPS AND SIMMERS,\nSHIPPED.",
    splitSub: "Sin compromiso • Nunca te quedes sin stock",
    subscribeSave: "SUSCRÍBETE Y AHORRA",
    offLife: "20% de descuento de por vida",
    stepsTitle: "La cena es así de fácil",
    step1Title: "1. Elige tus sopas",
    step1Desc: "Navega y elige de nuestras recetas curadas desde nuestra tienda.",
    step2Title: "2. Recibe fresco",
    step2Desc: "Ingredientes frescos entregados en la puerta de tu casa.",
    step3Title: "3. Disfruta con confianza",
    step3Desc: "Sigue simples instrucciones y disfruta deliciosos platillos caseros sin estrés.",
    aboutTitle: "Nutrición para un\nmundo acelerado.",
    aboutSub: "In soup we trust. Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.",
    bestSellersTitle: "CALDOS MÁS VENDIDOS",
    shopBestSellers: "COMPRA LOS MÁS VENDIDOS",
    subscribeTab: "Suscripción",
    singleTab: "Una sola compra",
    deliverySlotTitle: "¿Cuándo te enviamos tu pedido?",
    deliverySlotSub: `Tu próxima entrega es el ${nextEs}. Elige tu franja horaria:`,
    slot1: `${nextEs.charAt(0).toUpperCase() + nextEs.slice(1)} · 9:00 – 13:00`,
    slot2: `${nextEs.charAt(0).toUpperCase() + nextEs.slice(1)} · 13:00 – 17:00`,
    slot3: `${nextEs.charAt(0).toUpperCase() + nextEs.slice(1)} · 17:00 – 21:00`,
    deliveryContactTitle: "¿Cómo te avisamos cuando vamos de camino?",
    deliveryPhone: "Teléfono",
    deliveryEmail: "Email",
    deliveryContactNote: "Introduce al menos uno para poder avisarte.",
    deliverySlotRequired: "Selecciona una franja horaria para continuar.",
    deliveryContactRequired: "Introduce un teléfono o email para que podamos avisarte de la entrega.",
  },
  en: {
    navShop: "SHOP",
    navSubs: "SUBSCRIPTION",
    navSteps: "HOW IT WORKS",
    navAbout: "ABOUT",
    emptyCart: "Your cart is empty",
    subtotal: "Subtotal",
    checkout: "Go to checkout",
    heroTitle: "FIRST WE SOUP",
    heroSub: "Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.",
    shopNow: "¡APAPÁCHATE!",
    filtersTitle: "Filters",
    filterBundle: "Vegetarian",
    filterNew: "Cold",
    filterBestseller: "Hot",
    filterVegan: "Vegan",
    sortBy: "Sort by",
    addToCart: "Add to Cart",
    splitTitle: "SIPS AND SIMMERS,\nSHIPPED.",
    splitSub: "No Commitment • Never Run Out",
    subscribeSave: "SUBSCRIBE & SAVE",
    offLife: "20% Off for Life",
    stepsTitle: "Dinner's easy as 1, 2, 3",
    step1Title: "1. Pick your meals",
    step1Desc: "Browse and choose from our chef-curated recipes from our shop each week.",
    step2Title: "2. Ingredients arrive fresh",
    step2Desc: "Fresh, portioned ingredients are delivered right to your door in a convenient box.",
    step3Title: "3. Cook with confidence",
    step3Desc: "Follow simple instructions and enjoy delicious, home-cooked meals without the stress.",
    aboutTitle: "Nutrition for a\nrushed world.",
    aboutSub: "In soup we trust. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.",
    bestSellersTitle: "BEST SELLING BROTH",
    shopBestSellers: "SHOP BEST SELLERS",
    subscribeTab: "Subscription",
    singleTab: "Single Purchase",
    deliverySlotTitle: "When should we deliver your order?",
    deliverySlotSub: `Your next delivery is on ${nextEn}. Choose your time slot:`,
    slot1: `${nextEn} · 9:00 – 13:00`,
    slot2: `${nextEn} · 13:00 – 17:00`,
    slot3: `${nextEn} · 17:00 – 21:00`,
    deliveryContactTitle: "How should we notify you when we're on our way?",
    deliveryPhone: "Phone",
    deliveryEmail: "Email",
    deliveryContactNote: "Enter at least one so we can reach you.",
    deliverySlotRequired: "Please select a time slot to continue.",
    deliveryContactRequired: "Please enter a phone or email so we can notify you about your delivery.",
  }
};

// Ruta del funnel de suscripción (usada en nav, routing y vercel.json)
const SOUPSCRIPTION_ROUTE = '/soupscripciones';
// Catálogo completo con filtros (antes /sopas y /#shop, que redirigen aquí)
const SHOP_ROUTE = '/tienda';

export default function App() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [purchaseMode, setPurchaseMode] = useState<'subscription' | 'single'>('subscription');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>(loadSavedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // El carrito se monta la primera vez que se abre (y se queda montado para su animación).
  const [cartMounted, setCartMounted] = useState(false);
  useEffect(() => { if (isCartOpen) setCartMounted(true); }, [isCartOpen]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settings: any = settingsContent;
  // Productos ya ordenados por `order` (asc)
  const displayProducts: any[] = productsContent;

  // Zona de reparto del funnel de suscripción (el carrito comprueba el CP en CartDrawer)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPostal, setDeliveryPostal] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'ok' | 'nok'>('idle');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const deliveryZones: any = deliveryZonesContent;


  // Cart mixing warning
  const [showMixWarning, setShowMixWarning] = useState(false);
  const [mixPendingProduct, setMixPendingProduct] = useState<{ product: any; location: AddLocation; quantity: number } | null>(null);
  // Aviso "Agregada · Ver carrito": cambia en cada agregado (0 = cerrado)
  const [toastStamp, setToastStamp] = useState(0);

  // Product detail popup
  // Ficha de producto (/sopas/:slug): página propia; al volver, la home recupera su scroll.
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const homeScrollY = useRef<number | null>(null);
  const cameFromSite = useRef(false);
  const viewedProductId = useRef<string | null>(null);

  // Filtros de la tienda (settings.json → shopFilters)
  const shopFilters = (settingsContent as any).shopFilters as ShopFilter[];

  // Subscription Popup / Funnel
  const [showPopupModal, setShowPopupModal] = useState(false);
  type FunnelStep = 'intro' | 'delivery' | 'plan' | 'soups' | 'slot' | 'summary';
  const [funnelStep, setFunnelStep] = useState<FunnelStep>('intro');
  const [funnelFrequency, setFunnelFrequency] = useState<'quincenal' | 'mensual'>('quincenal');
  const [funnelQuantity, setFunnelQuantity] = useState<4 | 6 | 10>(4);
  const [funnelSoupQty, setFunnelSoupQty] = useState<Record<string, number>>({});
  const [funnelContingencies, setFunnelContingencies] = useState('');
  const [funnelSlot, setFunnelSlot] = useState<'slot_9_13' | 'slot_13_17' | 'slot_17_21' | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Payment success confirmation
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessType, setPaymentSuccessType] = useState<'subscription' | 'payment' | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null | false>(null);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart.map(l => ({ id: l.product._id, quantity: l.quantity })))); } catch { /* noop */ }
  }, [cart]);

  useEffect(() => {
    // Capturar atribución ANTES de limpiar la URL
    captureAttribution();
    const params = new URLSearchParams(window.location.search);
    const isSubscriptionSuccess = params.get('subscription') === 'success';
    const isPaymentSuccess = params.get('payment') === 'success';
    if (isSubscriptionSuccess || isPaymentSuccess) {
      const type = isSubscriptionSuccess ? 'subscription' : 'payment';
      setPaymentSuccessType(type);
      setShowPaymentSuccess(true);
      // purchase con transaction_id único (session_id de Stripe) y guard anti-refresco
      const sessionId = params.get('session_id') || '';
      const snap = readCheckoutSnapshot();
      const matchingSnap = snap && snap.type === type ? snap : null;
      if (type === 'subscription') {
        if (matchingSnap) firePurchaseOnce(sessionId, type, matchingSnap.items, matchingSnap.value);
      } else {
        // Pedido del carrito: se vacía el carrito guardado y se lee el resumen real de Stripe.
        setCart([]);
        fetch(`/api/checkout-summary?session_id=${encodeURIComponent(sessionId)}`)
          .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
          .then((summary: OrderSummary) => {
            setOrderSummary(summary);
            // OXXO sin pagar todavía no es una venta: no se manda purchase (ver docs/TRACKING.md).
            if (matchingSnap && summary.paymentStatus !== 'unpaid') {
              firePurchaseOnce(sessionId, type, matchingSnap.items, (summary.amountSubtotal - summary.amountDiscount) / 100);
            }
          })
          .catch(() => {
            setOrderSummary(false);
            if (matchingSnap) firePurchaseOnce(sessionId, type, matchingSnap.items, matchingSnap.value);
          });
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // ── Client-side routing (pathname) ─────────────────────────────
  const [route, setRoute] = useState<string>(() => window.location.pathname);
  const productRouteMatch = route.match(/^\/sopas\/(.+?)\/?$/);
  const productSlugFromRoute = productRouteMatch ? decodeURIComponent(productRouteMatch[1]) : null;
  const isProductRoute = !!productSlugFromRoute;
  const isSoupcripcionesRoute = route === SOUPSCRIPTION_ROUTE || route === `${SOUPSCRIPTION_ROUTE}/`;
  const isShopRoute = route.replace(/\/+$/, '') === SHOP_ROUTE;
  const routeProduct = productSlugFromRoute
    ? (displayProducts.find((p: any) => p.slug === productSlugFromRoute) ?? null)
    : null;

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  // Back/forward del navegador: sincroniza UI con la ruta
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setRoute(path);
      if (!path.startsWith('/sopas/')) {
        setSelectedProduct(null);
        viewedProductId.current = null;
      }
      if (path !== SOUPSCRIPTION_ROUTE && path !== `${SOUPSCRIPTION_ROUTE}/`) setShowPopupModal(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // URLs viejas de la tienda: /sopas y /#shop -> /tienda (Vercel ya redirige /sopas; esto cubre el resto)
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path === '/sopas' || (path === '' && window.location.hash === '#shop')) {
      window.history.replaceState({}, '', SHOP_ROUTE + window.location.search);
      setRoute(SHOP_ROUTE);
    }
  }, []);

  // Título de /tienda (el HTML del build ya lo trae; esto cubre la navegación dentro de la web)
  useEffect(() => {
    if (!isShopRoute) return;
    const old = document.title;
    document.title = shopMeta(lang).title;
    return () => { document.title = old; };
  }, [isShopRoute, lang]);

  // URLs legacy ?product=slug -> /sopas/slug
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('product');
    if (!slug) return;
    const target = `/sopas/${encodeURIComponent(slug)}`;
    window.history.replaceState({}, '', target);
    setRoute(target);
  }, []);

  // /sopas/:slug -> abre la ficha de producto correspondiente
  useEffect(() => {
    if (!productSlugFromRoute) return;
    const product = displayProducts.find((p: any) => p.slug === productSlugFromRoute);
    if (product) {
      if (product._id !== viewedProductId.current) {
        // Ref y no estado: el efecto vuelve a correr al terminar la carga y no debe repetir view_item.
        viewedProductId.current = product._id;
        setSelectedProduct(product);
        pushEcommerce('view_item', [productToItem(product)]);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [productSlugFromRoute, displayProducts]);

  useEffect(() => {
    if (routeProduct || homeScrollY.current === null) return;
    const y = homeScrollY.current;
    homeScrollY.current = null;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [routeProduct]);

  // /soupscripciones -> abre el funnel de suscripción sobre la home
  useEffect(() => {
    if (isSoupcripcionesRoute) openFunnel();
  }, [isSoupcripcionesRoute]);

  // Al llegar con un ancla (/#preguntas), baja a esa sección.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  const getSetting = (key: string, defaultVal: any = null) => {
    return settings?.[key] ?? defaultVal;
  };

  const getSettingText = (key: string, defaultVal: any = null): string => {
    return resolveText(getSetting(key, defaultVal));
  };

  const content = t[lang];

  // Helper: resolve title/description fields that may be translationRecord or plain string
  const resolveText = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    const val = field[lang] || field.es || field.en;
    if (typeof val === 'string') return val;
    return '';
  };

  const products = displayProducts;

  // Helper: ruta de imagen (texto, ej. /images/cms/foto.webp) o '' si no hay
  const resolveImage = (img: any): string => (typeof img === 'string' ? img : '');

  const ONDO_CHOICE_ID = '__ondo_choice__';
  // Funnel: todos los productos salvo los excluidos (campo excludeFromFunnel en products.json — ej. el box de 5 sopas)
  const subscriptionProds = displayProducts.filter((p: any) => !p.excludeFromFunnel);
  const funnelTotal: number = (Object.values(funnelSoupQty) as number[]).reduce((a, b) => a + b, 0);
  const funnelRemaining: number = (funnelQuantity as number) - funnelTotal;
  const funnelCanProceed = funnelTotal === funnelQuantity;
  const funnelPlanAmount = getSetting(`amount${funnelFrequency.charAt(0).toUpperCase() + funnelFrequency.slice(1)}${funnelQuantity}`, null) as number | null;
  const funnelPlanPrice = funnelPlanAmount ? `$${funnelPlanAmount}` : '';
  // Precio por sopa del plan = monto de los 3 meses / sopas totales (quincenal 6 entregas, mensual 3).
  // Se muestra en vez de un % de ahorro: es exacto sin importar qué sopas elija el cliente.
  const funnelPlanDeliveries = funnelFrequency === 'quincenal' ? 6 : 3;
  const funnelPerSoup = funnelPlanAmount ? funnelPlanAmount / ((funnelQuantity as number) * funnelPlanDeliveries) : 0;
  const funnelPerSoupText = funnelPerSoup ? `$${Number.isInteger(funnelPerSoup) ? funnelPerSoup : funnelPerSoup.toFixed(2)}` : '';
  const funnelPlanSavings = funnelPerSoupText ? (lang === 'es' ? `${funnelPerSoupText} por sopa` : `${funnelPerSoupText} per soup`) : '';

  const openFunnel = () => {
    setFunnelStep('intro');
    setFunnelFrequency('quincenal');
    setFunnelQuantity(4);
    setFunnelSoupQty({});
    setFunnelContingencies('');
    setFunnelSlot(null);
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
    setNotifyEmail('');
    setEmailSent(false);
    setShowPopupModal(true);
    pushEvent('view_item_list', { item_list_name: 'soupscripciones', item_list_id: 'soupscripciones' });
  };

  const openFunnelToDelivery = () => {
    setFunnelFrequency('quincenal');
    setFunnelQuantity(4);
    setFunnelSoupQty({});
    setFunnelContingencies('');
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
    setNotifyEmail('');
    setEmailSent(false);
    setFunnelStep('delivery');
    setShowPopupModal(true);
    pushEvent('view_item_list', { item_list_name: 'soupscripciones', item_list_id: 'soupscripciones' });
  };

  // Enlaces internos de cabecera, home y footer: '/tienda', '/soupscripciones' o una sección de la home ('/#preguntas').
  const goTo = (href: string) => {
    const [path, hash] = href.split('#');
    const target = path || '/';
    if (hash) {
      if (route !== '/' || target !== '/') navigate(`/#${hash}`);
      else window.history.replaceState({}, '', `/#${hash}`);
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }));
      return;
    }
    if (target === SOUPSCRIPTION_ROUTE) { navigate(target); return; } // el funnel se abre sobre la página actual
    if (target !== route) navigate(target);
    window.scrollTo(0, 0);
  };

  // Selección de plan confirmada (paso plan -> sopas)
  const confirmPlanSelection = () => {
    pushEvent('select_plan', {
      plan_frequency: funnelFrequency,
      plan_soups: funnelQuantity,
      value: funnelPlanAmount || 0,
      currency: 'MXN',
    });
    setFunnelStep('soups');
  };

  // Abrir ficha de producto con URL propia (/sopas/:slug)
  // Toque en una tarjeta de la tienda: select_item (con su posición) y luego la ficha.
  const selectProduct = (product: any, index: number, list = 'tienda') => {
    pushEcommerce('select_item', [{ ...productToItem(product), index, item_list_id: list, item_list_name: list }], {
      item_list_id: list, item_list_name: list,
    });
    openProduct(product);
  };

  const openProduct = (product: any) => {
    if (!product?.slug) return;
    if (!isProductRoute) homeScrollY.current = window.scrollY;
    cameFromSite.current = true;
    navigate(`/sopas/${encodeURIComponent(product.slug)}`);
  };

  // Flecha de la ficha: atrás en el historial si vinimos de la web; si se entró directo, a la tienda.
  const closeProductPage = () => {
    if (cameFromSite.current) { window.history.back(); return; }
    homeScrollY.current = null;
    navigate(SHOP_ROUTE);
    window.scrollTo(0, 0);
  };

  const closeFunnelModal = () => {
    setShowPopupModal(false);
    if (isSoupcripcionesRoute) navigate('/');
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      const productId = getSetting(`productId${cap(funnelFrequency)}${funnelQuantity}`, '');
      const amount = getSetting(`amount${cap(funnelFrequency)}${funnelQuantity}`, 0);
      if (!productId || !amount) {
        alert(lang === 'es' ? 'Precio no configurado. Contacta al administrador.' : 'Price not configured. Contact admin.');
        setIsCheckingOut(false);
        return;
      }
      const soupNames = Object.entries(funnelSoupQty)
        .filter(([, qty]: [string, number]) => qty > 0)
        .map(([id, qty]: [string, number]) => {
          if (id === ONDO_CHOICE_ID) return `Elección de ONDO x${qty}`;
          const p = displayProducts.find((p: any) => p._id === id);
          return p ? `${resolveText(p.title)} x${qty}` : `${id} x${qty}`;
        });
      const letOndoChoose = ONDO_CHOICE_ID in funnelSoupQty && funnelSoupQty[ONDO_CHOICE_ID] > 0;
      const savedAddress = localStorage.getItem('ondo_delivery_address') || '';
      const savedPostal = localStorage.getItem('ondo_delivery_postal') || '';
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: window.location.origin,
          productId,
          amount,
          frequency: funnelFrequency,
          quantity: funnelQuantity,
          selectedSoups: soupNames,
          letOndoChoose,
          contingencies: funnelContingencies,
          deliverySlot: funnelSlot,
          deliveryAddress: savedAddress,
          deliveryPostal: savedPostal,
        }),
      });
      // begin_checkout + snapshot para reconstruir el purchase tras el redirect
      const subItem = planItem(productId, funnelFrequency, funnelQuantity, amount);
      pushEcommerce('begin_checkout', [subItem]);
      saveCheckoutSnapshot('subscription', [subItem], amount);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(lang === 'es' ? 'Error al proceder al pago. Inténtalo de nuevo.' : 'Payment error. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const doAddToCart = (product: any, location: AddLocation, quantity = 1) => {
    setCart(prev => {
      const exists = prev.find(item => item.product._id === product._id);
      if (exists) {
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
    pushEcommerce('add_to_cart', [productToItem(product, quantity)], { add_location: location });
    setToastStamp(Date.now());
  };

  const addToCart = (product: any, location: AddLocation, quantity = 1) => {
    // Check purchase type mixing
    const cartType = cart.length > 0 ? (cart[0].product as any).purchaseType : null;
    const productType = (product as any).purchaseType || purchaseMode;
    if (cartType && cartType !== productType) {
      setMixPendingProduct({ product, location, quantity });
      setShowMixWarning(true);
      return;
    }
    doAddToCart(product, location, quantity);
  };

  const saveDeliveryLead = (lead: { address: string; postalCode: string; isServiceable: boolean; email?: string }) => {
    fetch('/api/submit-delivery-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    }).catch(e => console.error('Lead save error', e));
  };

  const checkDelivery = async () => {
    setDeliveryStatus('checking');
    const allowed: string[] = deliveryZones?.allowedPostalCodes || [];
    const isOk = allowed.length === 0 || allowed.map((c: string) => c.trim()).includes(deliveryPostal.trim());
    setDeliveryStatus(isOk ? 'ok' : 'nok');
    // Guarda el lead (dirección + CP) en Google Sheets; si falla no bloquea al cliente
    saveDeliveryLead({ address: deliveryAddress, postalCode: deliveryPostal, isServiceable: isOk });
    if (isOk) {
      localStorage.setItem('ondo_delivery_validated', 'true');
      localStorage.setItem('ondo_delivery_address', deliveryAddress);
      localStorage.setItem('ondo_delivery_postal', deliveryPostal);
    }
  };

  const submitNotifyEmail = async () => {
    // Fuera de zona: el cliente deja su correo para que le avisemos (nueva fila con email)
    saveDeliveryLead({ address: deliveryAddress, postalCode: deliveryPostal, isServiceable: false, email: notifyEmail });
    setEmailSent(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    // Bajar a 0 (desde la tienda o el carrito) quita la sopa del carrito.
    setCart(prev => prev
      .map(item => item.product._id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0));
  };

  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const openCart = () => {
    setIsCartOpen(true);
    if (cart.length > 0) pushEcommerce('view_cart', cart.map((item: any) => productToItem(item.product, item.quantity)));
  };

  // Precios, descuento y envío del carrito: siempre desde el motor (src/commerce/priceCart.ts),
  // el mismo que usa el servidor al crear el pago. Aquí no se hacen cuentas de dinero.
  const pricing = priceCart(cart);
  // % que recibe el producto con el carrito actual (0 = sin descuento). La caja nunca recibe el 20%.
  const productDiscountPct = (product: any) => discountPercentFor(product, pricing);
  const productUnitPrice = (product: any) => applyPercent(toCents(product.price), productDiscountPct(product));
  // Precio de tarjeta y ficha: con el % del carrito actual si aplica (tachado el de lista).
  const shopPriceOf = (product: any) => {
    const pct = productDiscountPct(product);
    return pct
      ? { now: formatMXN(productUnitPrice(product)), before: formatMXN(toCents(product.price)), percent: pct }
      : { now: formatMXN(toCents(product.price)) };
  };
  // Aviso "te falta poco": sobre la rejilla y en el aviso que sale al agregar.
  const nudgeText = nudgeMessage(cartNudge(pricing), lang);
  const handleCartCheckout = async ({ slot, postal, deliveryDate }: CheckoutRequest): Promise<CheckoutResult> => {
    const genericError = lang === 'es' ? 'No pudimos abrir el pago. Inténtalo de nuevo.' : "We couldn't open checkout. Please try again.";
    // begin_checkout + snapshot (value con descuento aplicado, sin envío)
    const cartGA4Items = cart.map((item: { product: any; quantity: number }) => productToItem(item.product, item.quantity));
    const cartValue = (pricing.subtotal - pricing.discountAmount) / 100;
    pushEcommerce('begin_checkout', cartGA4Items, { value: Number(cartValue.toFixed(2)) });
    saveCheckoutSnapshot('payment', cartGA4Items, cartValue);
    try {
      const res = await fetch('/api/create-cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: window.location.origin,
          items: cart.map(item => ({ id: item.product._id, quantity: item.quantity })),
          deliverySlot: slot,
          deliveryPostal: postal,
          deliveryDate,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.deliveryDate) return { deliveryDate: data.deliveryDate };
      if (data.url) {
        window.location.href = data.url;
        return {};
      }
      return { error: data.error || genericError };
    } catch (err) {
      console.error('Cart checkout error:', err);
      return { error: genericError };
    }
  };

  // Home y cabecera: próxima entrega (se recalcula sola) y textos con sus datos de settings.json.
  const nextDeliveryIso = useNextDelivery();
  const copyTokens = homeTokens(nextDeliveryIso, lang, settings);
  const homeText = (key: string) => fillTokens(getSettingText(key, ''), copyTokens);
  const es = lang === 'es';
  const navLinks = [
    { href: SHOP_ROUTE, label: es ? 'Tienda' : 'Shop' },
    { href: SOUPSCRIPTION_ROUTE, label: es ? 'Soup-scripción' : 'Soup-scription' },
    { href: '/#preguntas', label: es ? 'Preguntas' : 'FAQ' },
  ];
  const footerLinks = [
    { href: '/#faq-zonas', label: es ? 'Envíos y zonas' : 'Delivery areas' },
    { href: '/#preguntas', label: es ? 'Preguntas' : 'FAQ' },
  ];
  const quantityOf = (id: string) => cart.find(item => item.product._id === id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-ondo-beige text-ondo-black font-body">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-card focus:px-4 focus:py-2 focus:rounded-lg">
        {es ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <AnnouncementBar deliveryIso={nextDeliveryIso} lang={lang} />
      <SiteHeader lang={lang} setLang={setLang} links={navLinks} cartCount={cartItemCount} onOpenCart={openCart} onNavigate={goTo} />

      {/* Carrito: src/components/CartDrawer.tsx */}
      {cartMounted && (
      <Suspense fallback={null}>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onBrowse={() => { setIsCartOpen(false); goTo(SHOP_ROUTE); }}
        cart={cart}
        pricing={pricing}
        lang={lang}
        resolveText={resolveText}
        resolveImage={resolveImage}
        onChangeQuantity={updateQuantity}
        products={products}
        onAddProduct={(product: any) => addToCart(product, 'carrito')}
        onCheckout={handleCartCheckout}
      />
      </Suspense>
      )}

      {/* Barra del carrito (móvil) y aviso al agregar: src/components/shop/CartBar.tsx */}
      {!isCartOpen && <StickyCartBar pricing={pricing} lang={lang} onOpenCart={openCart} />}
      <AddedToast
        stamp={isCartOpen ? 0 : toastStamp}
        lang={lang}
        raised={pricing.itemCount > 0}
        message={nudgeText}
        onOpenCart={() => { setToastStamp(0); openCart(); }}
        onDone={() => setToastStamp(0)}
      />

      {routeProduct ? (
        <Suspense fallback={<div className="min-h-screen" />}>
        <ProductPage
          product={routeProduct}
          products={products}
          lang={lang}
          resolveText={resolveText}
          heatingText={getSettingText('productHeating', { es: '[CÓMO CALENTARLA]', en: '[HOW TO HEAT IT]' })}
          storageText={getSettingText('productStorage', { es: '[CONSERVACIÓN]', en: '[STORAGE]' })}
          priceOf={shopPriceOf}
          unitCents={productUnitPrice}
          onAdd={addToCart}
          onBack={closeProductPage}
          onOpenFunnel={openFunnel}
          onSelect={(product: any, index: number) => selectProduct(product, index, 'completa_tu_caja')}
        />
        </Suspense>
      ) : (
      <>
      {isShopRoute ? (
        <main id="contenido">
          {/* Tienda completa: src/components/shop/ */}
          <ShopSection
            products={products}
            filters={shopFilters}
            lang={lang}
            resolveText={resolveText}
            title={getSettingText('shopTitle', { es: 'El menú', en: 'The menu' })}
            headingLevel={1}
            boxBadge={getSettingText('boxBadge', '')}
            nudgeText={nudgeText}
            priceOf={shopPriceOf}
            quantityOf={quantityOf}
            onAdd={(product: any) => addToCart(product, 'grid')}
            onRemove={(product: any) => updateQuantity(product._id, -1)}
            onOpen={selectProduct}
            onOpenFunnel={openFunnel}
          >
            {/* Soup-scripción bajo la rejilla (se replantea en la fase 5) */}
            <div className="mt-12 pt-8 border-t border-brand-ink/15 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-body text-[17px] text-brand-ink text-center md:text-left">
                {homeText('shopClubText')}
              </p>
              <a
                href={SOUPSCRIPTION_ROUTE}
                onClick={(e) => { e.preventDefault(); goTo(SOUPSCRIPTION_ROUTE); }}
                className="shrink-0 min-h-[48px] px-6 inline-flex items-center rounded-xl border-2 border-brand-ink text-brand-ink font-title font-bold text-[17px]"
              >
                {es ? 'Conocer planes' : 'See the plans'}
              </a>
            </div>
          </ShopSection>
        </main>
      ) : (
        <HomePage
          lang={lang}
          text={homeText}
          tokens={copyTokens}
          onNavigate={goTo}
          onOpenFunnel={openFunnel}
          products={products}
          filters={shopFilters}
          resolveText={resolveText}
          boxBadge={getSettingText('boxBadge', '')}
          nudgeText={nudgeText}
          priceOf={shopPriceOf}
          quantityOf={quantityOf}
          onAdd={(product: any) => addToCart(product, 'grid')}
          onRemove={(product: any) => updateQuantity(product._id, -1)}
          onOpen={selectProduct}
          faq={faqContent.preguntas as FaqItem[]}
          testimonials={testimonialsContent as Testimonials}
        />
      )}
      </>
      )}

      <SiteFooter
        lang={lang}
        tagline={homeText('footerTagline')}
        links={footerLinks}
        instagramUrl={getSetting('instagramUrl', '')}
        email={getSetting('contactEmail', '')}
        onNavigate={goTo}
        raised={!isCartOpen && pricing.itemCount > 0}
      />

      {/* ── MODAL: Cart Mix Warning ── */}
      {showMixWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-ondo-white shadow-2xl max-w-sm w-full p-8 relative text-center">
            <AlertTriangle className="w-12 h-12 text-ondo-orange mx-auto mb-4" />
            <h2 className="font-title font-bold text-xl uppercase text-ondo-black mb-3">
              {lang === 'es' ? 'No se puede mezclar' : 'Cannot mix types'}
            </h2>
            <p className="font-body text-gray-500 text-sm mb-6 leading-relaxed">
              {lang === 'es'
                ? 'No puedes combinar productos de suscripción con compras únicas en el mismo pedido. ¿Quieres vaciar el carrito y añadir este producto?'
                : 'You cannot combine subscription and single-purchase products in the same order. Would you like to clear the cart and add this product?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCart([]);
                  if (mixPendingProduct) {
                    doAddToCart(mixPendingProduct.product, mixPendingProduct.location, mixPendingProduct.quantity);
                    setShowMixWarning(false);
                  }
                  setMixPendingProduct(null);
                }}
                className="flex-1 bg-ondo-orange text-white font-title font-bold uppercase tracking-wide py-3 text-xs"
              >
                {lang === 'es' ? 'Vaciar y añadir' : 'Clear & add'}
              </button>
              <button
                onClick={() => { setShowMixWarning(false); setMixPendingProduct(null); }}
                className="flex-1 border border-gray-200 text-gray-500 font-title font-bold uppercase tracking-wide py-3 text-xs hover:border-ondo-black transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 404: producto no encontrado ── */}
      {isProductRoute && !routeProduct && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ondo-beige p-4">
          <div className="text-center max-w-md">
            <h2 className="font-title font-black text-[56px] uppercase text-ondo-green mb-4 leading-none">404</h2>
            <p className="font-body text-ondo-green/70 text-[15px] font-bold mb-8">
              {lang === 'es' ? 'No encontramos esa sopa. Puede que ya no esté disponible.' : 'We could not find that soup. It may no longer be available.'}
            </p>
            <button
              onClick={() => navigate(SHOP_ROUTE)}
              className="border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-3 px-8 transition-colors text-[13px]"
            >
              {lang === 'es' ? 'VOLVER A LA TIENDA' : 'BACK TO SHOP'}
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp flotante (móvil): no en la ficha, que tiene su propia barra; se oculta mientras sale el aviso "Agregada" */}
      {!routeProduct && !isCartOpen && !toastStamp && <WhatsAppFloat lang={lang} raised={pricing.itemCount > 0} />}
      {/* ── MODAL: Subscription Funnel Popup ── */}
      {showPopupModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-ondo-white shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeFunnelModal}
              className="absolute top-4 right-4 z-10 p-2 hover:opacity-60 transition-opacity"
            >
              <X className="w-5 h-5 text-ondo-green" />
            </button>

            {/* ── PASO 1: INTRO — estética sección About ────────────────── */}
            {funnelStep === 'intro' && (
              <div className="flex flex-col md:flex-row min-h-[480px]">
                {/* Imagen lateral (si existe introImage en settings.json) */}
                {getSetting('introImage') && (
                  <div className="md:w-2/5 shrink-0 overflow-hidden">
                    <img
                      src={resolveImage(getSetting('introImage'))}
                      alt="ONDO Club"
                      className="w-full h-full object-cover"
                      style={{ minHeight: '220px' }}
                    />
                  </div>
                )}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between bg-ondo-white">
                  {/* Etiqueta sección */}
                  <div>
                    <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-6 inline-block pr-6">
                      {lang === 'es' ? 'SUSCRIPCIÓN' : 'SUBSCRIPTION'}
                    </p>
                    {/* Título grande */}
                    <h2 className="font-title font-black text-[36px] sm:text-[48px] md:text-[62px] uppercase leading-[0.88] text-ondo-green mb-6 tracking-tight">
                      {resolveText(getSetting('introTitle', { es: 'ÚNETE\nAL CLUB\nONDO', en: 'JOIN\nTHE ONDO\nCLUB' }))}
                    </h2>
                    <div className="w-12 h-[3px] bg-ondo-green mb-6" />
                    <p className="font-body text-ondo-green text-[15px] md:text-[17px] font-bold leading-relaxed mb-8">
                      {resolveText(getSetting('introDescription', { es: 'Sopas artesanales de temporada directamente en tu puerta.', en: 'Seasonal artisan soups delivered straight to your door.' }))}
                    </p>
                    {/* Beneficios con guión */}
                    <ul className="mb-10 space-y-2">
                      {(getSetting('introBenefits') || [
                        { es: 'Precio de socio - Desde $90 por sopa', en: 'Member pricing - From $90 per soup' },
                        { es: 'Entrega a domicilio incluida', en: 'Free home delivery included' },
                        { es: 'Cancela cuando quieras', en: 'Cancel anytime' },
                        { es: 'Acceso anticipado a recetas exclusivas', en: 'Early access to exclusive recipes' },
                      ]).map((b: any, i: number) => (
                        <li key={i} className="font-body text-ondo-green text-[14px] flex gap-3 leading-snug">
                          <span className="font-title font-black shrink-0 mt-0.5">—</span>
                          <span>{b[lang] || b.es || b.en || ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* CTA estilo outlined */}
                  <button
                    onClick={() => setFunnelStep('delivery')}
                    className="border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-4 px-8 transition-colors text-[14px] self-start"
                  >
                    {resolveText(getSetting('introCtaText', { es: 'COMENZAR', en: 'GET STARTED' }))} &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 2: ZONA DE REPARTO ───────────────────────────────── */}
            {funnelStep === 'delivery' && (
              <div className="p-8 md:p-10 bg-ondo-white">
                <button
                  onClick={() => setFunnelStep('intro')}
                  className="text-ondo-green/50 font-body text-sm mb-8 flex items-center gap-1 hover:text-ondo-green transition-colors"
                >
                  ← {lang === 'es' ? 'Atrás' : 'Back'}
                </button>

                {deliveryStatus === 'idle' || deliveryStatus === 'checking' ? (
                  <>
                    <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-6 inline-block pr-6">
                      {lang === 'es' ? 'ZONA DE REPARTO' : 'DELIVERY ZONE'}
                    </p>
                    <h2 className="font-title font-black text-[28px] md:text-[34px] uppercase leading-tight text-ondo-green mb-3">
                      {lang === 'es' ? '¿REPARTIMOS\nEN TU ZONA?' : 'DO WE DELIVER\nTO YOUR AREA?'}
                    </h2>
                    <div className="w-12 h-[3px] bg-ondo-green mb-6" />
                    <p className="font-body text-ondo-green/70 text-[14px] leading-relaxed mb-8">
                      {lang === 'es'
                        ? 'Introduce tu código postal para confirmar que hacemos reparto en tu área.'
                        : 'Enter your postal code to confirm we deliver to your area.'}
                    </p>
                    <div className="flex flex-col gap-3 mb-6">
                      <input
                        type="text"
                        value={deliveryPostal}
                        onChange={e => setDeliveryPostal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && deliveryPostal.trim() && checkDelivery()}
                        placeholder={lang === 'es' ? 'Código postal *' : 'Postal code *'}
                        className="w-full border border-ondo-green/20 px-4 py-3 font-body text-sm focus:outline-none focus:border-ondo-green bg-ondo-beige/30"
                      />
                    </div>
                    <button
                      onClick={checkDelivery}
                      disabled={!deliveryPostal.trim() || deliveryStatus === 'checking'}
                      className="border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-4 px-8 transition-colors text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deliveryStatus === 'checking'
                        ? (lang === 'es' ? 'Comprobando...' : 'Checking...')
                        : (lang === 'es' ? 'VERIFICAR ZONA' : 'CHECK ZONE')}
                    </button>
                  </>
                ) : deliveryStatus === 'ok' ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-ondo-green flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-title font-black text-[22px] uppercase leading-tight text-ondo-green">
                          {lang === 'es' ? 'GENIAL, REPARTIMOS AHÍ' : 'GREAT, WE DELIVER THERE'}
                        </h2>
                        <p className="font-body text-[13px] text-gray-500 mt-1">
                          {deliveryZones?.inZoneMessageEs && lang === 'es'
                            ? deliveryZones.inZoneMessageEs
                            : deliveryZones?.inZoneMessageEn || (lang === 'es' ? 'Podemos llegar hasta tu puerta.' : 'We can reach your door.')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setFunnelStep('plan')}
                      className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[14px]"
                    >
                      {lang === 'es' ? 'ELEGIR MI PLAN' : 'CHOOSE MY PLAN'} &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-ondo-orange flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-title font-black text-[20px] uppercase leading-tight text-ondo-black">
                          {lang === 'es' ? 'AÚN NO LLEGAMOS AHÍ' : 'NOT IN OUR AREA YET'}
                        </h2>
                        <p className="font-body text-[13px] text-gray-500 mt-1">
                          {deliveryZones?.outOfZoneMessageEs && lang === 'es'
                            ? deliveryZones.outOfZoneMessageEs
                            : deliveryZones?.outOfZoneMessageEn || (lang === 'es' ? 'Pronto repartiremos en tu zona.' : "We'll be in your area soon.")}
                        </p>
                      </div>
                    </div>
                    {!emailSent ? (
                      <div className="flex flex-col gap-3">
                        <p className="font-body text-[13px] text-gray-500">
                          {lang === 'es' ? 'Déjanos tu correo y te avisamos cuando lleguemos.' : "Leave your email and we'll notify you when we arrive."}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={notifyEmail}
                            onChange={e => setNotifyEmail(e.target.value)}
                            placeholder={lang === 'es' ? 'tu@correo.com' : 'your@email.com'}
                            className="flex-1 border border-gray-200 px-4 py-3 font-body text-sm focus:outline-none focus:border-ondo-orange"
                          />
                          <button
                            onClick={submitNotifyEmail}
                            disabled={!notifyEmail.trim()}
                            className="bg-ondo-orange text-white font-title font-bold uppercase tracking-widest px-5 py-3 text-[11px] disabled:opacity-40 hover:bg-ondo-green transition-colors"
                          >
                            {lang === 'es' ? 'AVISAR' : 'NOTIFY'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-ondo-beige px-4 py-3">
                        <CheckCircle className="w-5 h-5 text-ondo-green shrink-0" />
                        <p className="font-body text-[13px] text-ondo-green font-bold">
                          {lang === 'es' ? 'Te avisamos en cuanto lleguemos.' : "We'll notify you as soon as we arrive."}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => { setDeliveryStatus('idle'); setDeliveryPostal(''); }}
                      className="font-body text-[12px] text-gray-400 underline underline-offset-2 text-left hover:text-ondo-black transition-colors"
                    >
                      {lang === 'es' ? 'Probar con otro código postal' : 'Try a different postal code'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── PASO 3: PLAN — selector visual con dots ───────────────── */}
            {funnelStep === 'plan' && (() => {
              const deliveries = funnelFrequency === 'quincenal' ? 6 : 3;
              const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <div className="p-8 md:p-10 bg-ondo-white">
                  <button
                    onClick={() => setFunnelStep('delivery')}
                    className="text-ondo-green/50 font-body text-sm mb-8 flex items-center gap-1 hover:text-ondo-green transition-colors"
                  >
                    ← {lang === 'es' ? 'Atrás' : 'Back'}
                  </button>

                  <p className="font-title text-[18px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-1 inline-block pr-6">
                    {resolveText(getSetting('planTitle', { es: 'TU PLAN', en: 'YOUR PLAN' }))}
                  </p>
                  <p className="font-body text-gray-400 text-[13px] mt-2 mb-8">
                    {resolveText(getSetting('subscriptionDurationLabel', { es: '3 meses · sin compromiso · cancela cuando quieras', en: '3 months · no commitment · cancel anytime' }))}
                  </p>

                  {/* Cantidad — cards con total acumulado */}
                  <p className="font-title text-[14px] uppercase tracking-widest text-gray-400 mb-4">
                    {resolveText(getSetting('quantityLabel', { es: 'Sopas por envío', en: 'Soups per delivery' }))}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
                    {([4, 6, 10] as const).map(qty => {
                      const selected = funnelQuantity === qty;
                      const total = qty * deliveries;
                      return (
                        <button
                          key={qty}
                          onClick={() => { setFunnelQuantity(qty); setFunnelSoupQty({}); }}
                          className={`relative p-2.5 sm:p-4 border-2 flex flex-col gap-2 transition-all text-left ${selected ? 'border-ondo-green bg-ondo-green' : 'border-gray-200 hover:border-ondo-green/50 bg-white'}`}
                        >
                          {/* Dot grid — sopas por envío */}
                          <div className="flex flex-wrap gap-1 min-h-[20px] sm:min-h-[24px]">
                            {Array.from({ length: qty }).map((_, i) => (
                              <span key={i} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${selected ? 'bg-white/80' : 'bg-ondo-green/25'}`} />
                            ))}
                          </div>
                          {/* Cantidad por envío */}
                          <div className="leading-none">
                            <span className={`font-title font-black text-[32px] sm:text-[47px] leading-none ${selected ? 'text-white' : 'text-ondo-black'}`}>{qty}</span>
                            <span className={`font-body text-[11px] sm:text-[13px] block mt-0.5 ${selected ? 'text-white/70' : 'text-gray-400'}`}>
                              {lang === 'es' ? 'sopas/envío' : 'soups/delivery'}
                            </span>
                          </div>
                          {/* Total acumulado */}
                          <div className={`text-[12px] sm:text-[14px] font-title font-bold border-t pt-2 mt-1 ${selected ? 'border-white/20 text-white' : 'border-gray-100 text-ondo-green'}`}>
                            {total} {lang === 'es' ? 'en total' : 'total'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Frecuencia — dos cards con info de entregas */}
                  <p className="font-title text-[14px] uppercase tracking-widest text-gray-400 mb-3">
                    {resolveText(getSetting('frequencyLabel', { es: 'Frecuencia de entrega', en: 'Delivery frequency' }))}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8">
                    {(['quincenal', 'mensual'] as const).map(freq => {
                      const sel = funnelFrequency === freq;
                      const freqDeliveries = freq === 'quincenal' ? 6 : 3;
                      const freqDeliveriesLabel = freq === 'quincenal'
                        ? resolveText(getSetting('quincenalDeliveriesLabel', { es: '6 entregas en 3 meses', en: '6 deliveries in 3 months' }))
                        : resolveText(getSetting('mensualDeliveriesLabel', { es: '3 entregas en 3 meses', en: '3 deliveries in 3 months' }));
                      return (
                        <button
                          key={freq}
                          onClick={() => { setFunnelFrequency(freq); setFunnelSoupQty({}); }}
                          className={`p-3 sm:p-5 border-2 flex flex-col gap-1 text-left transition-all ${sel ? 'border-ondo-green bg-ondo-green' : 'border-gray-200 hover:border-ondo-green/50 bg-white'}`}
                        >
                          <span className={`font-title font-black uppercase text-[15px] sm:text-[20px] tracking-widest ${sel ? 'text-white' : 'text-ondo-black'}`}>
                            {freq === 'quincenal'
                              ? resolveText(getSetting('quincenalLabel', { es: 'Quincenal', en: 'Biweekly' }))
                              : resolveText(getSetting('mensualLabel', { es: 'Mensual', en: 'Monthly' }))}
                          </span>
                          <span className={`font-body text-[13px] sm:text-[16px] leading-snug ${sel ? 'text-white/70' : 'text-gray-400'}`}>
                            {freqDeliveriesLabel}
                          </span>
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: freqDeliveries }).map((_, i) => (
                              <span key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${sel ? 'bg-white/60' : 'bg-ondo-green/20'}`} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Texto dinámico del plan */}
                  <p className="font-body text-[14px] text-ondo-black/70 mb-4 text-center">
                    {lang === 'es' ? 'Recibirás ' : 'You will receive '}
                    <span className="font-title font-black text-ondo-orange">{funnelQuantity}</span>
                    {lang === 'es' ? ' sopas ' : ' soups '}
                    <span className="font-title font-black text-ondo-orange">
                      {lang === 'es'
                        ? (funnelFrequency === 'quincenal' ? 'cada 15 días' : 'cada mes')
                        : (funnelFrequency === 'quincenal' ? 'every 2 weeks' : 'every month')}
                    </span>
                    {lang === 'es' ? ' durante los próximos ' : ' for the next '}
                    <span className="font-title font-black text-ondo-orange">
                      {lang === 'es' ? '3 meses' : '3 months'}
                    </span>
                  </p>

                  {/* Botón continuar */}
                  <button
                    onClick={confirmPlanSelection}
                    className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[18px] flex items-center justify-center gap-3"
                  >
                    <span>{lang === 'es' ? 'CONTINUAR' : 'CONTINUE'}</span>
                    {funnelPlanSavings && (
                      <span className="font-body font-normal text-[15px] text-white/80 normal-case tracking-normal">
                        · {funnelPlanSavings}
                      </span>
                    )}
                    <span>&rarr;</span>
                  </button>
                </div>
              );
            })()}

            {/* ── PASO 3: SELECCIÓN CON CANTIDAD ───────────────────────── */}
            {/* ── PASO 4: SELECCIÓN CON CANTIDAD ───────────────────────── */}
            {funnelStep === 'soups' && (
              <div className="p-6 md:p-8 bg-ondo-white">
                <button
                  onClick={() => setFunnelStep('plan')}
                  className="text-ondo-green/50 font-body text-sm mb-4 flex items-center gap-1 hover:text-ondo-green transition-colors"
                >
                  ← {lang === 'es' ? 'Atrás' : 'Back'}
                </button>

                <h2 className="font-title font-black text-[22px] md:text-[26px] uppercase leading-tight text-ondo-green mb-1">
                  {resolveText(getSetting('selectionTitle', { es: '¿QUÉ SOPAS QUIERES?', en: 'PICK YOUR SOUPS' }))}
                </h2>

                {/* Barra de progreso */}
                <div className="mb-6 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-title font-bold text-[11px] uppercase tracking-widest text-ondo-green">
                      {funnelTotal}/{funnelQuantity} {lang === 'es' ? 'sopas' : 'soups'}
                    </span>
                    {funnelRemaining > 0 && (
                      <span className="font-body text-[12px] text-gray-400">
                        {lang === 'es' ? `${funnelRemaining} por elegir` : `${funnelRemaining} left`}
                      </span>
                    )}
                    {funnelRemaining === 0 && (
                      <span className="font-body text-[12px] text-ondo-green font-bold">
                        {lang === 'es' ? 'Listo' : 'Done'}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-gray-100">
                    <div
                      className="h-full bg-ondo-green transition-all duration-300"
                      style={{ width: `${Math.min((funnelTotal / funnelQuantity) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Grid de productos con stepper — ONDO choice es la primera card */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                  {/* Card "Elección de ONDO" — integrada en el grid */}
                  {(() => {
                    const ondoQty = funnelSoupQty[ONDO_CHOICE_ID] || 0;
                    const ondoImg = getSetting('ondoChoiceImage');
                    const ondoBg = getSetting('ondoChoiceBgColor', 'bg-ondo-beige');
                    return (
                      <div className={`border transition-all flex flex-col justify-between ${ondoQty > 0 ? 'border-ondo-green' : 'border-gray-100'}`}>
                        <div className={`aspect-[3/2] ${ondoBg} relative overflow-hidden shrink-0`}>
                          {ondoImg ? (
                            <img
                              src={resolveImage(ondoImg)}
                              alt={resolveText(getSetting('ondoChoiceTitle', { es: 'Elección de ONDO', en: "ONDO's Choice" }))}
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <span className="font-title font-black text-[48px] text-ondo-orange/40 leading-none">?</span>
                              <span className="font-title font-black text-[11px] uppercase tracking-widest text-ondo-orange/40">ONDO</span>
                            </div>
                          )}
                          {ondoQty > 0 && (
                            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-ondo-green flex items-center justify-center">
                              <span className="font-title font-black text-white text-[11px] sm:text-[12px]">{ondoQty}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between">
                          <div>
                            <p className="font-title font-bold uppercase text-[12px] sm:text-[13px] truncate text-ondo-black leading-tight">
                              {resolveText(getSetting('ondoChoiceTitle', { es: 'Elección de ONDO', en: "ONDO's Choice" }))}
                            </p>
                            <p className="font-body text-[10px] sm:text-[11px] text-gray-400 mt-0.5 leading-tight line-clamp-2 mb-3">
                              {resolveText(getSetting('ondoChoiceDescription', { es: 'Sorpresa de temporada seleccionada por nuestro chef', en: 'Seasonal surprise selected by our chef' }))}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <button
                              onClick={() => setFunnelSoupQty(prev => { const n = { ...prev }; if ((n[ONDO_CHOICE_ID] || 0) > 0) n[ONDO_CHOICE_ID]--; if (n[ONDO_CHOICE_ID] === 0) delete n[ONDO_CHOICE_ID]; return n; })}
                              disabled={ondoQty === 0}
                              className="w-7 h-7 sm:w-9 sm:h-9 border border-gray-200 flex items-center justify-center text-ondo-black disabled:opacity-30 hover:border-ondo-green transition-colors"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="font-title font-bold text-[16px] sm:text-[20px] text-ondo-black w-6 sm:w-8 text-center">{ondoQty}</span>
                            <button
                              onClick={() => { if (funnelRemaining <= 0) return; setFunnelSoupQty(prev => ({ ...prev, [ONDO_CHOICE_ID]: (prev[ONDO_CHOICE_ID] || 0) + 1 })); }}
                              disabled={funnelRemaining <= 0}
                              className="w-7 h-7 sm:w-9 sm:h-9 bg-ondo-green text-white flex items-center justify-center disabled:opacity-30 hover:bg-ondo-light-green transition-colors"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {subscriptionProds.map((p: any) => {
                    const qty = funnelSoupQty[p._id] || 0;
                    return (
                      <div
                        key={p._id}
                        className={`border transition-all flex flex-col justify-between ${qty > 0 ? 'border-ondo-green' : 'border-gray-100'}`}
                      >
                        <div className={`aspect-[3/2] ${p.bgColor || 'bg-ondo-beige'} relative overflow-hidden shrink-0`}>
                          <img
                            src={resolveImage(p.image)}
                            alt={resolveText(p.title)}
                            className="w-full h-full object-cover mix-blend-multiply"
                          />
                          {p.soldOut && (
                            <div className="absolute inset-0 bg-gray-500/55 flex items-center justify-center z-10">
                              <span className="font-title text-white font-bold uppercase tracking-widest text-[11px] bg-gray-800/60 px-3 py-1.5">
                                {lang === 'es' ? 'AGOTADO' : 'SOLD OUT'}
                              </span>
                            </div>
                          )}
                          {!p.soldOut && qty > 0 && (
                            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-ondo-green flex items-center justify-center">
                              <span className="font-title font-black text-white text-[11px] sm:text-[12px]">{qty}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between">
                          <div>
                            <p className="font-title font-bold uppercase text-[12px] sm:text-[13px] leading-tight text-ondo-black mb-1 line-clamp-2">
                              {resolveText(p.title)}
                            </p>
                            {resolveText(p.ingredients) && (
                              <p className="font-body text-[10px] sm:text-[11px] text-gray-500 mt-0.5 mb-3 leading-tight line-clamp-2">
                                {resolveText(p.ingredients)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <button
                              onClick={() => setFunnelSoupQty(prev => { const n = { ...prev }; if ((n[p._id] || 0) > 0) n[p._id]--; if (n[p._id] === 0) delete n[p._id]; return n; })}
                              disabled={qty === 0 || p.soldOut}
                              className="w-7 h-7 sm:w-9 sm:h-9 border border-gray-200 flex items-center justify-center text-ondo-black disabled:opacity-30 hover:border-ondo-green transition-colors"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="font-title font-bold text-[16px] sm:text-[20px] text-ondo-black w-6 sm:w-8 text-center">{qty}</span>
                            <button
                              onClick={() => { if (funnelRemaining <= 0 || p.soldOut) return; setFunnelSoupQty(prev => ({ ...prev, [p._id]: (prev[p._id] || 0) + 1 })); }}
                              disabled={funnelRemaining <= 0 || p.soldOut}
                              className={`w-7 h-7 sm:w-9 sm:h-9 text-white flex items-center justify-center disabled:opacity-30 transition-colors ${p.soldOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-ondo-green hover:bg-ondo-light-green'}`}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Contingencias */}
                <div className="mb-6">
                  <label className="font-title text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                    {resolveText(getSetting('contingenciesLabel', { es: 'Alergias o preferencias especiales', en: 'Allergies or special preferences' }))}
                  </label>
                  <textarea
                    rows={2}
                    value={funnelContingencies}
                    onChange={e => setFunnelContingencies(e.target.value)}
                    placeholder={resolveText(getSetting('contingenciesPlaceholder', { es: 'Ej: sin gluten, sin picante, sin lácteos...', en: 'E.g. gluten-free, no spice, dairy-free...' })) || ''}
                    className="w-full px-4 py-3 border border-gray-100 font-body text-sm focus:outline-none focus:border-ondo-orange resize-none"
                  />
                </div>

                <button
                  onClick={() => setFunnelStep('slot')}
                  disabled={!funnelCanProceed}
                  className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[14px] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <span>{lang === 'es' ? 'SIGUIENTE' : 'NEXT'} &rarr;</span>
                  {funnelPlanPrice && (
                    <span className="font-body font-normal text-[17px] text-white/80 normal-case tracking-normal">
                      · {funnelPlanPrice} MXN
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* ── PASO 5: SELECCIÓN DE HORARIO ─────────────────────────── */}
            {funnelStep === 'slot' && (
              <div className="p-8 md:p-10 bg-ondo-white">
                <button
                  onClick={confirmPlanSelection}
                  className="text-ondo-green/50 font-body text-sm mb-8 flex items-center gap-1 hover:text-ondo-green transition-colors"
                >
                  ← {lang === 'es' ? 'Atrás' : 'Back'}
                </button>

                <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-6 inline-block pr-6">
                  {lang === 'es' ? 'ENTREGA' : 'DELIVERY'}
                </p>
                <h2 className="font-title font-black text-[28px] md:text-[34px] uppercase leading-tight text-ondo-green mb-3">
                  {lang === 'es' ? '¿CUÁNDO TE\nENVIAMOS?' : 'WHEN SHOULD\nWE DELIVER?'}
                </h2>
                <div className="w-12 h-[3px] bg-ondo-green mb-6" />
                <p className="font-body text-ondo-green/70 text-[14px] leading-relaxed mb-8">
                  {content.deliverySlotSub}
                </p>

                <div className="flex flex-col gap-3 mb-10">
                  {(['slot_9_13', 'slot_13_17', 'slot_17_21'] as const).map((slotKey, i) => {
                    const labels = [content.slot1, content.slot2, content.slot3];
                    const sel = funnelSlot === slotKey;
                    return (
                      <button
                        key={slotKey}
                        onClick={() => setFunnelSlot(slotKey)}
                        className={`w-full text-left px-5 py-4 border-2 font-title font-bold text-[15px] uppercase tracking-wide transition-colors ${sel ? 'border-ondo-green bg-ondo-green text-white' : 'border-gray-200 hover:border-ondo-green/50 text-ondo-black'}`}
                      >
                        {labels[i]}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setFunnelStep('summary')}
                  disabled={!funnelSlot}
                  className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {lang === 'es' ? 'VER RESUMEN' : 'SEE SUMMARY'} &rarr;
                </button>
              </div>
            )}

            {/* ── PASO 6: RESUMEN + CHECKOUT ────────────────────────────── */}
            {funnelStep === 'summary' && (
              <div className="p-8 md:p-10 bg-ondo-white">
                <button
                  onClick={() => setFunnelStep('slot')}
                  className="text-ondo-green/50 font-body text-sm mb-6 flex items-center gap-1 hover:text-ondo-green transition-colors"
                >
                  ← {lang === 'es' ? 'Atrás' : 'Back'}
                </button>
                <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-6 inline-block pr-6">
                  {resolveText(getSetting('summaryTitle', { es: 'RESUMEN', en: 'SUMMARY' }))}
                </p>

                <div className="border border-ondo-green/20 divide-y divide-ondo-green/10 mb-8">
                  {/* Plan */}
                  <div className="flex justify-between items-center px-5 py-4">
                    <span className="font-title text-[11px] uppercase tracking-widest text-gray-400">
                      {lang === 'es' ? 'Plan' : 'Plan'}
                    </span>
                    <span className="font-title font-bold text-ondo-black text-[14px]">
                      {funnelFrequency === 'quincenal'
                        ? resolveText(getSetting('quincenalLabel', { es: 'Quincenal', en: 'Biweekly' }))
                        : resolveText(getSetting('mensualLabel', { es: 'Mensual', en: 'Monthly' }))}
                      {' · '}{funnelQuantity} {lang === 'es' ? 'sopas' : 'soups'}
                    </span>
                  </div>

                  {/* Franja horaria */}
                  {funnelSlot && (
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="font-title text-[11px] uppercase tracking-widest text-gray-400">
                        {lang === 'es' ? 'Entrega' : 'Delivery'}
                      </span>
                      <span className="font-title font-bold text-ondo-black text-[14px]">
                        {funnelSlot === 'slot_9_13' ? content.slot1 : funnelSlot === 'slot_13_17' ? content.slot2 : content.slot3}
                      </span>
                    </div>
                  )}

                  {/* Sopas */}
                  <div className="px-5 py-4">
                    <span className="font-title text-[11px] uppercase tracking-widest text-gray-400 block mb-3">
                      {lang === 'es' ? 'Sopas' : 'Soups'}
                    </span>
                    <ul className="space-y-1.5">
                      {Object.entries(funnelSoupQty)
                        .filter(([, qty]: [string, number]) => qty > 0)
                        .map(([id, qty]: [string, number]) => {
                          const name = id === ONDO_CHOICE_ID
                            ? resolveText(getSetting('letOndoChooseText', { es: 'Elección de ONDO', en: "ONDO's Choice" }))
                            : resolveText(displayProducts.find((p: any) => p._id === id)?.title) || id;
                          return (
                            <li key={id} className="font-body text-[14px] text-ondo-black flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-ondo-green rounded-full shrink-0" />
                                {name}
                              </span>
                              <span className="font-title font-bold text-ondo-green text-[13px]">x{qty}</span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>

                  {/* Notas */}
                  {funnelContingencies && (
                    <div className="px-5 py-4">
                      <span className="font-title text-[11px] uppercase tracking-widest text-gray-400 block mb-1">
                        {lang === 'es' ? 'Notas' : 'Notes'}
                      </span>
                      <p className="font-body text-sm text-gray-600 italic">{funnelContingencies}</p>
                    </div>
                  )}

                  {/* Precio */}
                  {funnelPlanPrice && (
                    <div className="flex justify-between items-center px-5 py-4 bg-ondo-beige/40">
                      <span className="font-title text-[11px] uppercase tracking-widest text-gray-400">
                        {lang === 'es' ? 'Precio' : 'Price'}
                      </span>
                      <span className="font-title font-black text-ondo-green text-[20px]">{funnelPlanPrice} MXN</span>
                    </div>
                  )}

                  {/* Frase dinámica integrada en el resumen */}
                  <div className="px-5 py-4 bg-ondo-green/5">
                    <p className="font-body text-[14px] text-ondo-black/70">
                      {lang === 'es' ? 'Recibirás ' : 'You will receive '}
                      <span className="font-title font-black text-ondo-orange">{funnelQuantity}</span>
                      {lang === 'es' ? ' sopas ' : ' soups '}
                      <span className="font-title font-black text-ondo-orange">
                        {lang === 'es'
                          ? (funnelFrequency === 'quincenal' ? 'cada 15 días' : 'cada mes')
                          : (funnelFrequency === 'quincenal' ? 'every 2 weeks' : 'every month')}
                      </span>
                      {lang === 'es' ? ' durante los próximos ' : ' for the next '}
                      <span className="font-title font-black text-ondo-orange">
                        {lang === 'es' ? '3 meses' : '3 months'}
                      </span>
                      {funnelPlanSavings && (
                        <>, <span className="font-title font-black text-ondo-green">{lang === 'es' ? 'a ' : 'at '}{funnelPlanSavings}</span></>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[14px] mb-4 disabled:opacity-60"
                >
                  {isCheckingOut
                    ? (lang === 'es' ? 'Procesando...' : 'Processing...')
                    : resolveText(getSetting('checkoutButtonText', { es: 'PROCEDER AL PAGO', en: 'PROCEED TO PAYMENT' }))}
                  {!isCheckingOut && ' →'}
                </button>
                <p className="text-center font-body text-[11px] text-gray-400">
                  {resolveText(getSetting('termsText', { es: 'Al continuar aceptas nuestros términos y condiciones. Cancela cuando quieras.', en: 'By continuing you accept our terms and conditions. Cancel anytime.' }))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── PAYMENT SUCCESS POPUP ─────────────────────────────────── */}
      {showPaymentSuccess && paymentSuccessType === 'payment' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Suspense fallback={null}><OrderSuccess summary={orderSummary} lang={lang} onClose={() => setShowPaymentSuccess(false)} /></Suspense>
        </div>
      )}
      {showPaymentSuccess && paymentSuccessType === 'subscription' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-ondo-white shadow-2xl w-full max-w-md flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="absolute top-4 right-4 z-10 p-2 hover:opacity-60 transition-opacity"
            >
              <X className="w-5 h-5 text-ondo-green" />
            </button>

            <div className="bg-ondo-green p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mb-5">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <h2 className="font-title font-black text-[32px] uppercase leading-tight text-white tracking-tight mb-2">
                {lang === 'es' ? '¡Pago completado!' : 'Payment complete!'}
              </h2>
              <p className="font-body text-white/80 text-[14px] uppercase tracking-widest">
                {paymentSuccessType === 'subscription'
                  ? (lang === 'es' ? 'Suscripción activada' : 'Subscription activated')
                  : (lang === 'es' ? 'Pedido confirmado' : 'Order confirmed')}
              </p>
            </div>

            <div className="p-8 flex flex-col gap-5">
              <div className="flex gap-4 items-start">
                <Mail className="w-5 h-5 text-ondo-green shrink-0 mt-0.5" />
                <p className="font-body text-ondo-green text-[15px] leading-relaxed">
                  {lang === 'es'
                    ? 'Deberías haber recibido un correo de confirmación de Stripe con el resumen de tu pedido.'
                    : 'You should have received a confirmation email from Stripe with your order summary.'}
                </p>
              </div>

              <div className="border-t border-ondo-green/10 pt-5">
                <p className="font-body text-gray-500 text-[13px] leading-relaxed">
                  {lang === 'es'
                    ? '¿No has recibido el correo? Revisa tu carpeta de spam o contáctanos directamente:'
                    : "Didn't receive the email? Check your spam folder or contact us directly:"}
                </p>
                <a
                  href={`mailto:${getSetting('contactEmail', 'ondocdmx@gmail.com')}`}
                  className="inline-flex items-center gap-2 mt-3 font-title font-bold text-[13px] uppercase tracking-widest text-ondo-green hover:text-ondo-orange transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {getSetting('contactEmail', 'ondocdmx@gmail.com')}
                </a>
              </div>

              <button
                onClick={() => setShowPaymentSuccess(false)}
                className="mt-2 border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-3 px-8 transition-colors text-[13px] self-center"
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
