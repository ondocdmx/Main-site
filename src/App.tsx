import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, X, ChevronRight, ChevronLeft, Menu, Plus, Minus, Trash2, MapPin, Mail, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { client, writeClient, urlFor } from './sanityClient';

const t = {
  es: {
    banner: "APAPÁCHATE | ENVÍO GRATIS EN 12+ CARTONES",
    midBanner: "¡Aprovecha un regalo con tu primer pedido usando código: ONDOFIRST!",
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
    reviews: "Reseñas",
    subscribeTab: "Suscripción",
    singleTab: "Una sola compra"
  },
  en: {
    banner: "APAPÁCHATE | FREE SHIPPING 12+ CARTONS",
    midBanner: "Get a free gift with your first order using code: ONDOFIRST!",
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
    reviews: "Reviews",
    subscribeTab: "Subscription",
    singleTab: "Single Purchase"
  }
};

// GROQ query — fetch products with dereferenced tags
const PRODUCTS_QUERY = `*[_type == "product"] | order(order asc) {
  _id,
  title,
  purchaseType,
  price,
  stripePriceId,
  description,
  tagline,
  bgColor,
  image,
  hoverImage,
  "tags": tags[]->{ _id, name, slug, icon, color }
}`;

// ── Mock products (fallback when Sanity has no data) ──
const MOCK_TAG_VEG = { _id: 'mt1', name: { es: 'Vegetariano', en: 'Vegetarian' }, slug: { current: 'vegetariano' }, icon: '🥦', color: 'bg-ondo-green' };
const MOCK_TAG_HOT = { _id: 'mt2', name: { es: 'Caliente', en: 'Hot' }, slug: { current: 'caliente' }, icon: '🔥', color: 'bg-red-500' };
const MOCK_TAG_COLD = { _id: 'mt3', name: { es: 'Frío', en: 'Cold' }, slug: { current: 'frio' }, icon: '❄️', color: 'bg-sky-400' };
const MOCK_TAG_VEGAN = { _id: 'mt4', name: { es: 'Vegano', en: 'Vegan' }, slug: { current: 'vegano' }, icon: '🌿', color: 'bg-ondo-light-green' };

const MOCK_PRODUCTS = [
  {
    _id: 'mock-1',
    title: { es: 'Crema de Elote', en: 'Corn Cream Soup' },
    purchaseType: 'subscription',
    price: 89,
    tagline: { es: 'Dulce y ahumado, como debe ser.', en: 'Sweet and smoky, as it should be.' },
    description: { es: 'Crema suave de elote asado con un toque de chile poblano y crema mexicana. Reconfortante y lista en 5 minutos.', en: 'Smooth roasted corn cream with poblano chile and Mexican crema. Comforting and ready in 5 minutes.' },
    bgColor: 'bg-amber-50',
    image: '/images/ondo-113.JPG',
    hoverImage: '/images/ondo-051.JPG',
    tags: [MOCK_TAG_VEG],
  },
  {
    _id: 'mock-2',
    title: { es: 'Pozole Rojo', en: 'Red Pozole' },
    purchaseType: 'subscription',
    price: 115,
    tagline: { es: 'La fiesta en tu mesa.', en: 'The party at your table.' },
    description: { es: 'Caldo rojo intenso con maíz cacahuazintle, chile guajillo y todo el sabor de la tradición mexicana.', en: 'Intense red broth with hominy corn, guajillo chile and all the flavor of Mexican tradition.' },
    bgColor: 'bg-red-50',
    image: '/images/ondo-070.JPG',
    hoverImage: '/images/ondo-113.JPG',
    tags: [MOCK_TAG_HOT],
  },
  {
    _id: 'mock-3',
    title: { es: 'Sopa de Lima Yucateca', en: 'Yucatan Lime Soup' },
    purchaseType: 'subscription',
    price: 99,
    tagline: { es: 'El sur en cada sorbo.', en: 'The south in every sip.' },
    description: { es: 'Caldo ligero con pollo deshebrado, chile xcatic, lima yucateca y tortilla crujiente.', en: 'Light broth with shredded chicken, xcatic chile, Yucatan lime and crispy tortilla.' },
    bgColor: 'bg-lime-50',
    image: '/images/ondo-051.JPG',
    hoverImage: '/images/ondo-070.JPG',
    tags: [MOCK_TAG_HOT],
  },
  {
    _id: 'mock-4',
    title: { es: 'Gazpacho Verde', en: 'Green Gazpacho' },
    purchaseType: 'single',
    price: 79,
    tagline: { es: 'Frío y lleno de vida.', en: 'Cold and full of life.' },
    description: { es: 'Pepino, aguacate, espinaca y limón batidos en frío. Perfecto para el verano.', en: 'Cucumber, avocado, spinach and lemon blended cold. Perfect for summer.' },
    bgColor: 'bg-green-50',
    image: '/images/green-soup.png',
    hoverImage: '/images/green-soup.png',
    tags: [MOCK_TAG_VEGAN, MOCK_TAG_COLD],
  },
  {
    _id: 'mock-5',
    title: { es: 'Caldo Tlalpeño', en: 'Tlalpeño Broth' },
    purchaseType: 'single',
    price: 105,
    tagline: { es: 'Humo, garbanzo y corazón.', en: 'Smoke, chickpea and heart.' },
    description: { es: 'Caldo de pollo ahumado con garbanzos, chile chipotle, epazote y ejotes. Un clásico chilango con alma.', en: 'Smoked chicken broth with chickpeas, chipotle chile and green beans. A soulful classic.' },
    bgColor: 'bg-orange-50',
    image: '/images/ondo-070.JPG',
    hoverImage: '/images/ondo-113.JPG',
    tags: [MOCK_TAG_HOT],
  },
  {
    _id: 'mock-6',
    title: { es: 'Vichyssoise de Huitlacoche', en: 'Huitlacoche Vichyssoise' },
    purchaseType: 'single',
    price: 125,
    tagline: { es: 'Lujo mexicano frío.', en: 'Cold Mexican luxury.' },
    description: { es: 'Crema fría de papa y poro realzada con el intenso sabor terroso del huitlacoche.', en: 'Cold cream of potato and leek elevated with the intense earthy flavor of huitlacoche.' },
    bgColor: 'bg-stone-100',
    image: '/images/ondo-051.JPG',
    hoverImage: '/images/green-soup.png',
    tags: [MOCK_TAG_VEGAN, MOCK_TAG_COLD],
  },
];

export default function App() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [purchaseMode, setPurchaseMode] = useState<'subscription' | 'single'>('subscription');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  // Products state: starts with mock data, replaced only if Sanity returns real products
  const [displayProducts, setDisplayProducts] = useState<any[]>(MOCK_PRODUCTS);

  // Delivery modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPostal, setDeliveryPostal] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'ok' | 'nok'>('idle');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [deliveryZones, setDeliveryZones] = useState<any>(null);
  const hasValidatedDelivery = typeof window !== 'undefined' && localStorage.getItem('ondo_delivery_validated') === 'true';

  // Cart mixing warning
  const [showMixWarning, setShowMixWarning] = useState(false);
  const [mixPendingProduct, setMixPendingProduct] = useState<any>(null);

  // Product detail popup
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  // Tags / filtering
  const [tags, setTags] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Subscription Popup / Funnel
  const [showPopupModal, setShowPopupModal] = useState(false);
  type FunnelStep = 'intro' | 'delivery' | 'plan' | 'soups' | 'summary';
  const [funnelStep, setFunnelStep] = useState<FunnelStep>('intro');
  const [funnelFrequency, setFunnelFrequency] = useState<'quincenal' | 'mensual'>('quincenal');
  const [funnelQuantity, setFunnelQuantity] = useState<4 | 6 | 10>(4);
  const [funnelSoupQty, setFunnelSoupQty] = useState<Record<string, number>>({});
  const [funnelContingencies, setFunnelContingencies] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Soup Request Popup
  const [showSoupModal, setShowSoupModal] = useState(false);
  const [soupIdea, setSoupIdea] = useState('');
  const [soupEmail, setSoupEmail] = useState('');
  const [soupSubmitted, setSoupSubmitted] = useState(false);
  const [isSubmittingSoup, setIsSubmittingSoup] = useState(false);

  const panel1TitleRef = useRef<HTMLDivElement>(null);
  const [panel1TitleSize, setPanel1TitleSize] = useState(80);

  useEffect(() => {
    const wrapper = panel1TitleRef.current;
    if (!wrapper) return;
    const fit = () => {
      const headings = Array.from(wrapper.querySelectorAll('h2')) as HTMLElement[];
      if (!headings.length) return;
      const savedWS = headings.map(h => h.style.whiteSpace);
      headings.forEach(h => { h.style.whiteSpace = 'nowrap'; });
      const containerWidth = wrapper.clientWidth;
      let lo = 12, hi = 200;
      while (hi - lo > 1) {
        const mid = (lo + hi) / 2;
        headings.forEach(h => { h.style.fontSize = `${mid}px`; });
        const maxW = Math.max(...headings.map(h => h.scrollWidth));
        if (maxW > containerWidth) hi = mid; else lo = mid;
      }
      headings.forEach((h, i) => { h.style.fontSize = ''; h.style.whiteSpace = savedWS[i]; });
      setPanel1TitleSize(Math.floor(lo));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(wrapper);
    fit();
    return () => observer.disconnect();
  }, [settings]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteSettings, productSettings, processSettings, manifestoSettings, popupSettings, heroSettings, aboutSettings, funnelSettingsData, footerSettingsData, fetchedTags, fetchedZones, fetchedProducts] = await Promise.all([
          client.fetch('*[_id == "siteSettings" || _type == "siteSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "productSettings" || _type == "productSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "processSettings" || _type == "processSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "manifestoSettings" || _type == "manifestoSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "popupSettings" || _type == "popupSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "heroSettings" || _type == "heroSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "aboutSettings" || _type == "aboutSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "funnelSettings" || _type == "funnelSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_id == "footerSettings" || _type == "footerSettings"] | order(_updatedAt desc)[0]'),
          client.fetch('*[_type == "productTag"] | order(order asc)'),
          client.fetch('*[_type == "deliveryZones"][0]'),
          client.fetch(PRODUCTS_QUERY),
        ]);
        console.log('[Sanity] processSettings raw:', processSettings);
        console.log('[Sanity] siteSettings raw:', siteSettings);
        const merged = {
          ...siteSettings,
          ...productSettings,
          ...processSettings,
          ...manifestoSettings,
          ...popupSettings,
          ...heroSettings,
          ...aboutSettings,
          ...funnelSettingsData,
          ...footerSettingsData,
        };
        console.log('[Sanity] merged settings step1Title:', merged.step1Title);
        setSettings(merged);
        setTags(fetchedTags || []);
        setDeliveryZones(fetchedZones || null);
        // Only replace mock data if Sanity actually has products
        if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          setDisplayProducts(fetchedProducts);
        }
        // If 0 real products: keep showing mock data (already initialized)
      } catch (e) {
        console.error('Sanity fetch error, mock data will stay:', e);
        // Mock data remains unchanged on error
      }
    };
    fetchData();
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

  // Helper: resolve image src from Sanity image or plain URL string
  const resolveImage = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    try { return urlFor(img).width(800).url(); } catch { return ''; }
  };

  const filteredProducts = activeFilters.length === 0
    ? products
    : products.filter((p: any) =>
        p.tags && activeFilters.every((slug: string) =>
          p.tags.some((tag: any) => tag?.slug?.current === slug)
        )
      );

  const ONDO_CHOICE_ID = '__ondo_choice__';
  const subscriptionProds = displayProducts.filter(
    (p: any) => !p.purchaseType || p.purchaseType === 'subscription'
  );
  const funnelTotal: number = (Object.values(funnelSoupQty) as number[]).reduce((a, b) => a + b, 0);
  const funnelRemaining: number = (funnelQuantity as number) - funnelTotal;
  const funnelCanProceed = funnelTotal === funnelQuantity;

  const openFunnel = () => {
    setFunnelStep('intro');
    setFunnelFrequency('quincenal');
    setFunnelQuantity(4);
    setFunnelSoupQty({});
    setFunnelContingencies('');
    // Reset delivery state for fresh check
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
    setNotifyEmail('');
    setEmailSent(false);
    setShowPopupModal(true);
  };

  const openSoupModal = () => {
    setSoupIdea('');
    setSoupEmail('');
    setSoupSubmitted(false);
    setShowSoupModal(true);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      const priceId = getSetting(`stripe${cap(funnelFrequency)}${funnelQuantity}`, '');
      if (!priceId) {
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
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          frequency: funnelFrequency,
          quantity: funnelQuantity,
          selectedSoups: soupNames,
          contingencies: funnelContingencies,
        }),
      });
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

  const doAddToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.product._id === product._id);
      if (exists) {
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const addToCart = (product: any) => {
    // Check purchase type mixing
    const cartType = cart.length > 0 ? (cart[0].product as any).purchaseType : null;
    const productType = (product as any).purchaseType || purchaseMode;
    if (cartType && cartType !== productType) {
      setMixPendingProduct(product);
      setShowMixWarning(true);
      return;
    }
    // First-time delivery validation
    if (!hasValidatedDelivery) {
      setPendingProduct(product);
      setShowDeliveryModal(true);
      return;
    }
    doAddToCart(product);
  };

  const checkDelivery = async () => {
    setDeliveryStatus('checking');
    const allowed: string[] = deliveryZones?.allowedPostalCodes || [];
    const isOk = allowed.length === 0 || allowed.map((c: string) => c.trim()).includes(deliveryPostal.trim());
    setDeliveryStatus(isOk ? 'ok' : 'nok');
    // Save lead to Sanity
    try {
      await writeClient.create({
        _type: 'deliveryLead',
        address: deliveryAddress,
        postalCode: deliveryPostal,
        isServiceable: isOk,
        createdAt: new Date().toISOString(),
      });
    } catch (e) { console.error('Lead save error', e); }
    if (isOk) {
      localStorage.setItem('ondo_delivery_validated', 'true');
    }
  };

  const submitNotifyEmail = async () => {
    try {
      await writeClient.patch(
        { query: `*[_type == "deliveryLead" && postalCode == "${deliveryPostal}" && !defined(email)][0]` }
      ).set({ email: notifyEmail }).commit();
    } catch (e) { console.error(e); }
    setEmailSent(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
    setNotifyEmail('');
    setEmailSent(false);
    if (deliveryStatus === 'ok' && pendingProduct) doAddToCart(pendingProduct);
    setPendingProduct(null);
  };

  const confirmDeliveryAndClose = () => {
    if (pendingProduct) doAddToCart(pendingProduct);
    setPendingProduct(null);
    setShowDeliveryModal(false);
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
  };

  const toggleFilter = (slug: string) => {
    setActiveFilters(prev =>
      prev.includes(slug) ? prev.filter(f => f !== slug) : [...prev, slug]
    );
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = cart.reduce((a, b) => {
    const discountMult = cartItemCount > 9 ? 0.8 : (cartItemCount >= 5 ? 0.9 : 1);
    return a + (b.product.price * discountMult * b.quantity);
  }, 0);
  const progressPercent = Math.min((cartSubtotal / 120) * 100, 100);

  const activeDiscount = (() => {
    const d2Min = getSetting('cartDiscount2Min', null);
    const d1Min = getSetting('cartDiscount1Min', null);
    if (d2Min !== null && cartItemCount >= d2Min) {
      return { label: getSetting('cartDiscount2Label', ''), couponId: getSetting('cartDiscount2CouponId', '') };
    }
    if (d1Min !== null && cartItemCount >= d1Min) {
      return { label: getSetting('cartDiscount1Label', ''), couponId: getSetting('cartDiscount1CouponId', '') };
    }
    return null;
  })();

  const handleCartCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const cartItems = cart.map((item: { product: any; quantity: number }) => ({ priceId: item.product.stripePriceId, quantity: item.quantity }));
      const missingPrice = cartItems.some((i: { priceId: string; quantity: number }) => !i.priceId);
      if (missingPrice) {
        alert(lang === 'es' ? 'Algunos productos no tienen precio configurado. Contacta al administrador.' : 'Some products have no price configured. Contact admin.');
        setIsCheckingOut(false);
        return;
      }
      const res = await fetch('/api/create-cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, couponId: activeDiscount?.couponId || null }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Cart checkout error:', err);
      alert(lang === 'es' ? 'Error al proceder al pago. Inténtalo de nuevo.' : 'Payment error. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleSoupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soupIdea || !soupEmail) return;
    setIsSubmittingSoup(true);
    try {
      await writeClient.create({
        _type: 'soupRequest',
        soupIdea,
        email: soupEmail,
        createdAt: new Date().toISOString(),
      });
      setSoupSubmitted(true);
    } catch (err) {
      console.error('Soup request error:', err);
      alert(lang === 'es' ? 'Error al enviar tu sugerencia. Inténtalo de nuevo.' : 'Error sending your suggestion. Please try again.');
    } finally {
      setIsSubmittingSoup(false);
    }
  };

  return (
    <div className="min-h-screen bg-ondo-beige text-ondo-black font-body">
      {/* Top Banner (ROJO BANNER) */}
      <div className="bg-ondo-red text-white py-2 text-xs md:text-sm font-bold tracking-wider uppercase font-title leading-none overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-flex w-[200%] justify-around">
          <span>{getSettingText('bannerText', content.banner)}</span>
          <span>{getSettingText('bannerText', content.banner)}</span>
        </div>
      </div>
      
      {/* Navbar (Crema Suave) */}
      <nav className="bg-ondo-beige border-b border-black/5 sticky top-0 z-30">
        <div className="w-full mx-auto px-6 py-5 md:py-7 flex items-center justify-between relative">
          <div className="flex items-center gap-8 hidden md:flex font-title font-semibold text-[15px] tracking-wide">
            <a href="#shop" className="hover:text-ondo-orange transition-colors">{getSettingText('navShop', content.navShop)}</a>
            <a href="#manifesto" className="hover:text-ondo-orange transition-colors">{getSettingText('navSubs', content.navSubs)}</a>
          </div>
          <div className="md:hidden">
            <Menu className="w-6 h-6 text-ondo-green" />
          </div>
          
          <a href="#" className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/images/ondo-logo-orange.png" alt="ONDO Logo" className="h-[36px] md:h-[46px] object-contain" />
          </a>
        
        <div className="flex items-center gap-4 sm:gap-6">
           {/* Lang Toggle */}
           <div className="flex items-center gap-2 font-title font-bold text-xs uppercase bg-white/40 px-2 py-1 border border-ondo-black/5">
              <button 
                onClick={() => setLang('es')} 
                className={`${lang === 'es' ? 'text-ondo-orange' : 'text-gray-400 hover:text-ondo-black'}`}
              >
                ES
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setLang('en')} 
                className={`${lang === 'en' ? 'text-ondo-orange' : 'text-gray-400 hover:text-ondo-black'}`}
              >
                EN
              </button>
           </div>

           <div className="relative cursor-pointer group text-ondo-green hover:text-ondo-orange transition-colors" onClick={() => setIsCartOpen(true)}>
             <ShoppingCart className="w-6 h-6" />
             {cartItemCount > 0 && (
               <span className="absolute -top-2 -right-2 bg-ondo-red text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold shadow group-hover:bg-ondo-orange transition-colors">
                 {cartItemCount}
               </span>
             )}
           </div>
        </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-ondo-black/40 z-40 transition-opacity backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-ondo-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="bg-ondo-beige p-4 flex items-center justify-between border-b border-black/5">
          <div className="flex-1" />
          <h2 className="font-title font-bold text-xl uppercase tracking-wide">ONDO</h2>
          <div className="flex-1 flex justify-end">
             <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-ondo-light-green transition-colors"><X className="w-6 h-6 text-ondo-black" /></button>
          </div>
        </div>

        {/* Promo Bar */}
        <div className="bg-ondo-beige/50 p-5 border-b border-gray-100">
          <div className="w-full bg-white h-3 mb-2 relative">
             <div className="bg-ondo-orange h-3 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <ShoppingCart className="w-16 h-16 mb-4 opacity-20 text-ondo-green" />
               <p className="font-title uppercase tracking-widest text-lg">{getSettingText('emptyCart', content.emptyCart)}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product._id} className="flex gap-4 p-4 bg-white shadow-sm border border-gray-50 items-center">
                <div className={`w-16 h-20 ${item.product.bgColor || 'bg-ondo-beige'} overflow-hidden shrink-0`}>
                   <img src={resolveImage(item.product.image)} className="w-full h-full object-cover mix-blend-multiply" alt="product" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between gap-2 mb-2">
                      <h4 className="font-title font-bold text-[15px] leading-tight text-ondo-black pr-2">{resolveText(item.product.title)}</h4>
                      <div className="font-body font-semibold text-sm whitespace-nowrap text-right flex flex-col items-end">
                         {cartItemCount >= 5 ? (
                           <>
                             <span className="line-through text-gray-400 text-xs">€{(item.product.price * item.quantity).toFixed(2)}</span>
                             <span className="text-ondo-orange flex items-center gap-1">
                               €{(item.product.price * item.quantity * (cartItemCount > 9 ? 0.8 : 0.9)).toFixed(2)}
                               <span className="bg-ondo-orange text-white text-[9px] px-1 py-0.5 rounded-sm uppercase tracking-wide">
                                 -{cartItemCount > 9 ? '20' : '10'}%
                               </span>
                             </span>
                           </>
                         ) : (
                           <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                         )}
                      </div>
                   </div>
                   <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-100 bg-ondo-white">
                         <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 px-3 text-ondo-black hover:bg-ondo-light-green transition-colors"><Minus className="w-3 h-3" /></button>
                         <span className="font-title text-[15px] w-6 text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 px-3 text-ondo-black hover:bg-ondo-light-green transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.product._id)} className="text-gray-300 hover:text-ondo-red transition-colors"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-50 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.05)] shrink-0 z-10 relative">
            <div className="flex justify-between items-center mb-1">
              <span className="font-title text-xl text-gray-500">{getSettingText('subtotal', content.subtotal)}</span>
              <span className="font-title text-[28px] font-bold text-ondo-black">€{cartSubtotal.toFixed(2)}</span>
            </div>
            {activeDiscount && (
              <div className="flex justify-between items-center mb-5">
                <span className="font-title text-sm text-ondo-green uppercase tracking-wide">{activeDiscount.label}</span>
              </div>
            )}
            {!activeDiscount && <div className="mb-5" />}
            <button
              onClick={handleCartCheckout}
              disabled={isCheckingOut}
              className="w-full bg-ondo-orange hover:bg-ondo-light-green hover:text-ondo-black text-white font-title font-bold uppercase tracking-widest py-5 text-lg transition-colors shadow-md disabled:opacity-60"
            >
              {isCheckingOut ? (lang === 'es' ? 'Procesando...' : 'Processing...') : getSettingText('checkout', content.checkout)}
            </button>
          </div>
        )}
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-center h-[calc(100vh-98px)] bg-ondo-beige pb-10">
        <div className="absolute inset-0 bg-ondo-beige/10 z-0 transition-opacity duration-300"></div>
        
        {/* Render hero images centered in the right half */}
        <div className="absolute bottom-0 right-0 flex items-end justify-center pointer-events-none z-0 h-[50vh] w-full md:inset-y-0 md:h-auto md:w-1/2 md:items-center pr-4 md:pr-12 lg:pr-20">
            <img
              src={getSetting('heroImages', null)?.[0] ? urlFor(getSetting('heroImages', null)[0]).url() : '/images/green-soup.png'}
              alt="Hero Soup"
              className="h-full w-auto object-contain md:h-auto md:w-[90%] lg:w-[85%] md:max-h-[90vh]"
            />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-16 h-full flex flex-col justify-center">
          <div className="max-w-[500px] w-full flex flex-col justify-center bg-transparent mt-[-10vh]">
             <h1 className="text-[55px] md:text-[85px] lg:text-[110px] font-title leading-[0.85] tracking-tight mb-8 text-ondo-green uppercase w-[150%] max-w-[800px] relative z-20 mix-blend-multiply text-shadow-sm font-black text-left">
              {resolveText(getSetting('heroTitle', content.heroTitle))}
            </h1>
            <div>
              <p className="text-[17px] md:text-[20px] font-body mb-8 text-ondo-green leading-relaxed font-bold max-w-[420px] mix-blend-multiply">
                 {resolveText(getSetting('heroSub', content.heroSub))}
              </p>
              <div>
                <button onClick={openFunnel} className="bg-ondo-green text-white hover:bg-ondo-light-green hover:text-ondo-black font-title font-bold uppercase tracking-widest py-4 px-10 transition-colors text-[15px] shadow-sm">
                  {resolveText(getSetting('heroCTA', content.shopNow))}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      {getSetting('showManifesto', true) && (
        <section id="manifesto" className="bg-ondo-beige py-8 lg:py-16 px-4 lg:px-6">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Panel 1 — CTA Column */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col p-8 relative overflow-hidden"
                 style={{ backgroundColor: getSetting('panel1BgColor', '#6ca53a') }}>
               {/* Top eyebrow */}
               <p className="font-title text-[11px] uppercase tracking-[0.25em] mb-6 z-10"
                  style={{ color: getSetting('panel1TextColor1', '#f1f3b0'), opacity: 0.75 }}>
                 {getSettingText('panel1Eyebrow', { es: 'EL CLUB · MEMBRESÍA', en: 'THE CLUB · MEMBERSHIP' })}
               </p>

               {/* Main Title */}
               <div ref={panel1TitleRef} className="z-10 flex-1">
                 <h2 className="font-title font-black leading-[0.85] tracking-tighter uppercase"
                     style={{ color: getSetting('panel1TextColor1', '#f1f3b0'), fontSize: `${panel1TitleSize}px` }}>
                   {(getSettingText('panel1TitleLine1', { es: 'EL\nCLUB', en: 'THE\nCLUB' }) || '').split('\n').map((line: string, i: number) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}
                 </h2>
                 <h2 className="font-title font-black leading-[0.85] tracking-tighter uppercase"
                     style={{ color: getSetting('panel1TextColor2', '#e8632a'), fontSize: `${panel1TitleSize}px` }}>
                   {getSettingText('panel1TitleLine2', { es: 'ONDO.', en: 'ONDO.' })}
                 </h2>

                 {/* Divider */}
                 <div className="w-10 h-[3px] my-6" style={{ backgroundColor: getSetting('panel1TextColor1', '#f1f3b0'), opacity: 0.4 }} />

                 {/* Subheadline */}
                 <p className="font-body font-bold text-[15px] leading-snug mb-3"
                    style={{ color: getSetting('panel1TextColor1', '#f1f3b0') }}>
                   {(() => { const txt = getSettingText('panel1Subheadline', { es: 'Échate un clavado a la soupscripción de Ondo.', en: "Dive into Ondo's soupscription." }); const accent = getSettingText('panel1SubAccentWord', { es: 'soupscripción', en: 'soupscription' }); if (!accent || !txt.includes(accent)) return txt; const parts = txt.split(accent); return <>{parts[0]}<span style={{ color: getSetting('panel1TextColor2', '#e8632a') }}>{accent}</span>{parts[1]}</>; })()}
                 </p>

                 {/* Tagline italic */}
                 <p className="font-body italic text-[14px] leading-relaxed mt-6 mb-8"
                    style={{ color: getSetting('panel1TextColor1', '#f1f3b0'), opacity: 0.85 }}>
                   {getSettingText('panel1Tagline', { es: 'Para los que saben que una buena sopa cambia el día.', en: 'For those who know a great soup changes the day.' })}
                 </p>
               </div>

               {/* CTA at bottom */}
               <div className="z-10 mt-auto">
                 <button
                   onClick={openFunnel}
                   className="inline-flex items-center justify-center gap-3 font-title font-bold text-[14px] uppercase tracking-widest py-4 px-8 transition-colors shadow-sm group w-max"
                   style={{ 
                     backgroundColor: getSetting('panel1TextColor1', '#f1f3b0'), 
                     color: getSetting('panel1BgColor', '#6ca53a') 
                   }}
                 >
                   {getSettingText('panel1CTAText', { es: 'ÚNETE AL CLUB', en: 'JOIN THE CLUB' })}
                   <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                 </button>
               </div>

               {/* Center Logo shape via mask */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120px] opacity-10" 
                    style={{ 
                      WebkitMaskImage: "url('/images/ondo-logo-orange.png')", 
                      maskImage: "url('/images/ondo-logo-orange.png')", 
                      WebkitMaskSize: "contain", 
                      maskSize: "contain", 
                      WebkitMaskRepeat: "no-repeat", 
                      maskRepeat: "no-repeat", 
                      WebkitMaskPosition: "center", 
                      maskPosition: "center",
                      backgroundColor: getSetting('panel1TextColor1', '#f1f3b0')
                    }} />
            </div>
            
            {/* Panel 2 — Lo que incluye */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col p-8 relative overflow-hidden"
                 style={{ backgroundColor: getSetting('panel2BgColor', '#2d4a1e') }}>
               {/* Eyebrow */}
               <p className="font-title text-[11px] uppercase tracking-[0.25em] mb-6 z-10"
                  style={{ color: '#f1f3b0', opacity: 0.65 }}>
                 {getSettingText('panel2Eyebrow', { es: 'LO QUE INCLUYE', en: "WHAT'S INCLUDED" })}
               </p>

               {/* Headline */}
               <div className="z-10 mb-8">
                 <h2 className="font-title font-black text-[32px] lg:text-[42px] leading-[0.9] tracking-tight">
                   <span style={{ color: '#f1f3b0' }}>{getSettingText('panel2HeadlinePrimary', { es: 'Todo lo que necesitas.', en: 'Everything you need.' })}</span>{' '}
                   <span style={{ color: getSetting('panel1TextColor2', '#e8632a') }}>{getSettingText('panel2HeadlineAccent', { es: 'Nada que no.', en: "Nothing you don't." })}</span>
                 </h2>
               </div>

               {/* Benefits list */}
               <div className="z-10 flex flex-col gap-5 flex-1">
                 {(getSetting('panel2Benefits', null) || [
                   { es: 'Envío incluido', en: 'Shipping included', subtitleEs: 'sin sorpresas ni cargos ocultos', subtitleEn: 'no surprises or hidden charges' },
                   { es: 'Sopas exclusivas de socio', en: 'Member-exclusive soups', subtitleEs: 'nunca en el menú regular', subtitleEn: 'never on the regular menu' },
                   { es: 'Primero en probar lo nuevo', en: 'First to try what\'s new', subtitleEs: 'beta taster oficial', subtitleEn: 'official beta taster' },
                   { es: 'Recetas de temporada', en: 'Seasonal recipes', subtitleEs: 'cada semana en tu correo', subtitleEn: 'every week in your inbox' },
                 ]).map((item: any, i: number) => (
                   <div key={i} className="flex gap-4 items-start">
                     <span className="font-title font-bold text-[11px] mt-1 shrink-0" style={{ color: '#f1f3b0', opacity: 0.45 }}>{String(i + 1).padStart(2, '0')}</span>
                     <div>
                       <p className="font-title font-bold text-[15px] leading-tight" style={{ color: '#f1f3b0' }}>{lang === 'en' && item.en ? item.en : (item.es || item.title || '')}</p>
                       <p className="font-body text-[13px] leading-relaxed" style={{ color: '#f1f3b0', opacity: 0.6 }}>{lang === 'en' && item.subtitleEn ? item.subtitleEn : (item.subtitleEs || item.subtitle || item.sub || '')}</p>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Subtle logo watermark */}
               <div className="absolute bottom-[-2%] right-[-5%] w-[55%] h-[110px] opacity-5"
                    style={{
                      WebkitMaskImage: "url('/images/ondo-logo-orange.png')",
                      maskImage: "url('/images/ondo-logo-orange.png')",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "bottom right",
                      maskPosition: "bottom right",
                      backgroundColor: '#f1f3b0'
                    }} />
            </div>
            
            {/* Panel 3 — Quiénes Somos / Tú Decides */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col gap-4">
               {/* Top: Orange — Quiénes Somos */}
               <div className="flex-1 p-7 flex flex-col relative overflow-hidden"
                    style={{ backgroundColor: getSetting('panel3OrangeBg', '#e8632a') }}>
                 {/* Eyebrow */}
                 <p className="font-title text-[11px] uppercase tracking-[0.25em] mb-4 z-10"
                    style={{ color: '#f1f3b0', opacity: 0.7 }}>
                   {getSettingText('panel3Eyebrow', { es: 'QUIÉNES SOMOS', en: 'WHO WE ARE' })}
                 </p>

                 {/* Illustration */}
                 <div className="flex-1 flex items-center justify-center z-10 py-2">
                   <img
                     src={getSetting('panel3IllustrationImage', null) ? urlFor(getSetting('panel3IllustrationImage', null)).url() : '/images/Group 1597787.png'}
                     alt=""
                     className="max-h-[160px] lg:max-h-[180px] object-contain"
                   />
                 </div>

                 {/* Quote */}
                 <blockquote className="z-10 mt-auto">
                   <p className="font-body font-bold italic text-[14px] lg:text-[15px] leading-snug mb-2"
                      style={{ color: '#f1f3b0' }}>
                     {getSettingText('panel4Quote', { es: '"Hacemos estas sopas porque creemos que comer bien no debería ser complicado."', en: '"We make these soups because we believe eating well shouldn\'t be complicated."' })}
                   </p>
                   <footer className="font-title font-bold text-[11px] uppercase tracking-widest"
                           style={{ color: '#f1f3b0', opacity: 0.7 }}>
                     {getSetting('panel4QuoteAuthor', '— Ana & Omar')}
                   </footer>
                 </blockquote>
               </div>

               {/* Bottom: White — Tú Decides */}
               <div className="flex-1 p-7 bg-ondo-white flex flex-col relative overflow-hidden">
                 {/* Eyebrow */}
                 <p className="font-title text-[11px] uppercase tracking-[0.25em] mb-4"
                    style={{ color: getSetting('panel3BottomTextColor', '#1a2e0f'), opacity: 0.65 }}>
                   {getSettingText('panel3OrangeEyebrow', { es: 'TÚ DECIDES', en: 'YOU DECIDE' })}
                 </p>

                 {/* Headline */}
                 <h3 className="font-title font-black text-[24px] lg:text-[28px] leading-[0.9] tracking-tight mb-4"
                     style={{ color: getSetting('panel3BottomTextColor', '#1a2e0f') }}>
                   {getSettingText('panel3OrangeHeadline', { es: 'CUANDO TÚ LO QUIERAS MÁS.', en: 'WHENEVER YOU NEED IT MOST.' })}
                 </h3>

                 {/* Description */}
                 <p className="font-body text-[13px] leading-relaxed flex-1"
                    style={{ color: getSetting('panel3BottomTextColor', '#1a2e0f'), opacity: 0.7 }}>
                   {getSettingText('panel3Description', { es: 'En familia, con amigos, en la oficina, cuando llueve, te da frío o no ves la vida o cuando necesitas un apapacho.', en: 'With family, with friends, at the office — whenever it rains, you get cold, or you just need a hug.' })}
                 </p>

                 {/* CTA */}
                 <div className="mt-auto pt-4">
                   {getSetting('panel4CTALink', '') ? (
                     <a
                       href={getSetting('panel4CTALink', '')}
                       className="inline-flex items-center justify-center gap-3 font-title font-bold text-[14px] uppercase tracking-widest py-4 px-8 transition-colors shadow-sm group w-full"
                       style={{ backgroundColor: getSetting('panel3BottomTextColor', '#1a2e0f'), color: '#f1f3b0' }}
                     >
                       {getSettingText('panel4CTAText', { es: '¡SOUPSCRÍBEME!', en: 'JOIN NOW' })}
                       <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                     </a>
                   ) : (
                     <button
                       onClick={openFunnel}
                       className="inline-flex items-center justify-center gap-3 font-title font-bold text-[14px] uppercase tracking-widest py-4 px-8 transition-colors shadow-sm group w-full"
                       style={{ backgroundColor: getSetting('panel3BottomTextColor', '#1a2e0f'), color: '#f1f3b0' }}
                     >
                       {getSettingText('panel4CTAText', { es: '¡SOUPSCRÍBEME!', en: 'JOIN NOW' })}
                       <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                     </button>
                   )}
                 </div>
               </div>
            </div>
            
          </div>
        </section>
      )}

      {/* Mid Banner — before products */}
      {getSetting('showMidBanner', true) !== false && (
      <div className="bg-ondo-red text-white py-3 md:py-4 text-center font-title text-sm md:text-base uppercase tracking-widest font-bold overflow-hidden whitespace-nowrap shrink-0">
        <div className="animate-marquee inline-flex w-[200%] justify-around">
          <span>{getSettingText('midBannerText', content.midBanner)}</span>
          <span>{getSettingText('midBannerText', content.midBanner)}</span>
        </div>
      </div>
      )}

      {/* Products Section */}
      <section className="py-20 px-6 bg-ondo-beige" id="shop">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
            {/* Sidebar Filters — dynamic from Sanity productTag */}
             <div className="w-full md:w-1/4 xl:w-1/5 shrink-0 flex flex-col gap-4">
               <h3 className="font-title font-bold text-xl mb-2 text-ondo-black uppercase flex items-center justify-between">
                 {getSettingText('filtersTitle', content.filtersTitle)}
                 {activeFilters.length > 0 && (
                   <button onClick={() => setActiveFilters([])} className="text-xs text-ondo-green font-bold tracking-wide normal-case underline underline-offset-2">
                     {lang === 'es' ? 'Borrar' : 'Clear'}
                   </button>
                 )}
               </h3>

               {tags.length === 0 ? (
                 <>
                   <button className="flex items-center gap-3 bg-white px-5 py-3 border border-gray-100 font-title hover:border-ondo-green group shadow-sm text-sm uppercase font-bold tracking-wide transition-colors w-full text-left">
                     <div className="w-5 h-5 bg-ondo-green flex items-center justify-center shrink-0"><span className="text-white text-[10px]">🥦</span></div>
                     {getSettingText('filterBundle', content.filterBundle)}
                   </button>
                   <button className="flex items-center gap-3 bg-white px-5 py-3 border border-gray-100 font-title hover:border-ondo-green group shadow-sm text-sm uppercase font-bold tracking-wide transition-colors w-full text-left">
                     <div className="w-5 h-5 bg-sky-400 flex items-center justify-center text-white shrink-0"><span className="text-[10px]">❄️</span></div>
                     {getSettingText('filterNew', content.filterNew)}
                   </button>
                   <button className="flex items-center gap-3 bg-white text-ondo-black px-5 py-3 border border-gray-100 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-colors hover:border-ondo-green group w-full text-left">
                     <div className="w-5 h-5 bg-red-500 flex items-center justify-center text-white shrink-0"><span className="text-[12px]">🔥</span></div>
                     {getSettingText('filterBestseller', content.filterBestseller)}
                   </button>
                   <button className="flex items-center gap-3 bg-white text-ondo-black px-5 py-3 border border-gray-100 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-colors hover:border-ondo-green group w-full text-left">
                     <div className="w-5 h-5 bg-ondo-light-green flex items-center justify-center text-white shrink-0"><span className="text-[12px]">🌿</span></div>
                     {getSettingText('filterVegan', content.filterVegan)}
                   </button>
                 </>
               ) : (
                 tags.map((tag: any) => {
                   const slug = tag?.slug?.current || tag._id;
                   const isActive = activeFilters.includes(slug);
                   return (
                     <button
                       key={tag._id}
                       onClick={() => toggleFilter(slug)}
                       className={`flex items-center gap-3 px-5 py-3 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-all w-full text-left border ${
                         isActive
                           ? 'bg-ondo-green text-white border-ondo-green scale-[1.02]'
                           : 'bg-white text-ondo-black border-gray-100 hover:border-ondo-green'
                       }`}
                     >
                       <div className={`w-5 h-5 ${tag.color || 'bg-ondo-green'} flex items-center justify-center shrink-0`}>
                         <span className="text-[12px]">{tag.icon || '•'}</span>
                       </div>
                       {tag.name?.[lang] || tag.name?.es || tag.name?.en || slug}
                     </button>
                   );
                 })
               )}

               <div className="mt-4 flex items-center gap-2 bg-white px-6 py-3 border border-gray-100 font-title font-bold shadow-sm text-sm uppercase tracking-wide cursor-pointer hover:border-ondo-green hover:text-ondo-green transition-colors w-full justify-between">
                 {getSettingText('sortBy', content.sortBy)} <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
            </div>

            {/* Products Grid Area */}
            <div className="flex-1 flex flex-col">
              
              {/* Join the Club Banner */}
              <div className="bg-ondo-orange py-[15px] px-8 md:py-[20px] md:px-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-ondo-green/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                
                <div className="flex-1 relative z-10 text-center md:text-left">
                  <h2 className="font-title text-[24px] md:text-[32px] font-black text-white leading-none uppercase tracking-tight">
                    {resolveText(getSetting('clubBannerTitle', { es: 'Únete al club y obtén un 20% descuento', en: 'Join the club and get 20% off' }))}
                  </h2>
                </div>
                <button
                  onClick={openFunnel}
                  className="bg-white text-ondo-orange hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-4 px-8 text-base transition-all shadow-xl hover:scale-105 active:scale-95 shrink-0 relative z-10"
                >
                  {resolveText(getSetting('clubBannerCTA', { es: '¡LO QUIERO!', en: 'I WANT IT!' }))}
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredProducts.map((product: any) => (
                  <div key={product._id} className="bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-ondo-green flex flex-col group transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 p-4 cursor-pointer" onClick={() => { setSelectedProduct(product); setPopupImageIndex(0); }}>

                    {/* Hover Image Area */}
                    <div
                      className={`w-full aspect-[4/3] ${product.bgColor || 'bg-ondo-beige'} mb-5 relative overflow-hidden flex items-center justify-center p-6`}
                    >
                      <img
                        src={resolveImage(product.image)}
                        alt={resolveText(product.title)}
                        className="w-full h-full object-cover mix-blend-multiply drop-shadow-md absolute inset-0 opacity-100 transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <img
                        src={resolveImage(product.hoverImage) || resolveImage(product.image)}
                        alt={`${resolveText(product.title)} hover`}
                        className="w-full h-full object-cover mix-blend-multiply drop-shadow-md absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 scale-105 group-hover:scale-100"
                      />
                    </div>

                    <div className="flex flex-col flex-1 px-2">
                      <div className="flex items-center text-ondo-yellow text-[11px] mb-2 tracking-widest">
                        ★★★★★ <span className="text-gray-300 font-body tracking-normal ml-2 underline underline-offset-2">(42)</span>
                      </div>
                      {/* Tags badges */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.tags.map((tag: any) => (
                            <span key={tag._id} className={`${tag.color || 'bg-ondo-light-green'} text-white text-[9px] font-title font-bold uppercase tracking-wide px-2 py-0.5`}>
                              {tag.icon} {resolveText(tag.name)}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-title text-[20px] font-bold mb-2 leading-[1.15] text-ondo-black line-clamp-2 uppercase">{resolveText(product.title)}</h3>
                      <div className="font-body font-bold mb-5 text-[16px]">
                        {cartItemCount >= 5 ? (
                          <div className="flex items-center gap-2">
                            <span className="line-through text-gray-400 text-[14px]">€{product.price?.toFixed(2)}</span>
                            <span className="text-ondo-orange">€{(product.price * (cartItemCount > 9 ? 0.8 : 0.9)).toFixed(2)}</span>
                            <span className="bg-ondo-orange text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                              -{cartItemCount > 9 ? '20' : '10'}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-ondo-green">€{product.price?.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="mt-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between w-full overflow-hidden shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              const productInCart = cart.find(item => item.product._id === product._id);
                              if (productInCart && productInCart.quantity > 0) {
                                updateQuantity(product._id, -1);
                              }
                            }}
                            className={`p-3.5 w-1/3 flex justify-center bg-ondo-green text-white ${cart.find(item => item.product._id === product._id)?.quantity ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="font-title text-[15px] font-bold w-1/3 text-center bg-ondo-white py-3.5">
                            {cart.find(item => item.product._id === product._id)?.quantity || 0}
                          </span>

                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="p-3.5 w-1/3 flex justify-center cursor-pointer bg-ondo-green text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {cartItemCount === 4 && (
                          <div className="mt-3 text-ondo-orange flex items-center justify-center gap-1.5 text-[11px] font-body font-semibold opacity-90 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>¡Añade 1 más para -10%!</span>
                          </div>
                        )}
                        {cartItemCount === 9 && (
                          <div className="mt-3 text-ondo-orange flex items-center justify-center gap-1.5 text-[11px] font-body font-semibold opacity-90 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>¡Añade 1 más para -20%!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </section>

      {/* Steps Section */}
      {getSetting('showSteps', true) !== false && (
      <section id="steps" className="py-28 px-6 bg-ondo-beige">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="font-title text-[36px] md:text-[48px] font-bold text-ondo-black uppercase tracking-tight mb-16">{getSettingText('stepsTitle', content.stepsTitle)}</h2>
            <div className="grid md:grid-cols-3 gap-12">

               <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-[85%] mx-auto aspect-square overflow-hidden mb-8 shadow-lg border-8 border-ondo-beige group-hover:scale-105 transition-transform duration-500 relative">
                    <img src={getSetting('step1Image', null) ? urlFor(getSetting('step1Image', null)).url() : '/images/ondo-113.JPG'} alt="Step 1" className="w-full h-full object-cover absolute inset-0" />
                 </div>
                 <h3 className="font-title font-bold text-2xl uppercase tracking-wide mb-4 text-ondo-green">{getSettingText('step1Title', content.step1Title)}</h3>
                 <p className="font-body text-gray-500 text-[17px] leading-relaxed font-medium px-4">{getSettingText('step1Desc', content.step1Desc)}</p>
               </div>

               <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-[85%] mx-auto aspect-square overflow-hidden mb-8 shadow-lg border-8 border-ondo-beige group-hover:scale-105 transition-transform duration-500 relative">
                    <img src={getSetting('step2Image', null) ? urlFor(getSetting('step2Image', null)).url() : '/images/ondo-051.JPG'} alt="Step 2" className="w-full h-full object-cover absolute inset-0" />
                 </div>
                 <h3 className="font-title font-bold text-2xl uppercase tracking-wide mb-4 text-ondo-green">{getSettingText('step2Title', content.step2Title)}</h3>
                 <p className="font-body text-gray-500 text-[17px] leading-relaxed font-medium px-4">{getSettingText('step2Desc', content.step2Desc)}</p>
               </div>

               <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-[85%] mx-auto aspect-square overflow-hidden mb-8 shadow-lg border-8 border-ondo-beige group-hover:scale-105 transition-transform duration-500 relative">
                    <img src={getSetting('step3Image', null) ? urlFor(getSetting('step3Image', null)).url() : '/images/ondo-070.JPG'} alt="Step 3" className="w-full h-full object-cover absolute inset-0" />
                 </div>
                 <h3 className="font-title font-bold text-2xl uppercase tracking-wide mb-4 text-ondo-green">{getSettingText('step3Title', content.step3Title)}</h3>
                 <p className="font-body text-gray-500 text-[17px] leading-relaxed font-medium px-4">{getSettingText('step3Desc', content.step3Desc)}</p>
               </div>

            </div>
         </div>
      </section>
      )}

      {/* Best Sellers deleted. We jump directly to Manifesto Section */}

      {/* Brand Text Section */}
      <section className="bg-ondo-beige py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24">
          <div className="hidden md:block w-32 shrink-0">
             {/* Spacing for typography layout look */}
          </div>
          <div className="flex-1">
             <h2 className="text-[#6ca53a] font-title text-[40px] md:text-[50px] lg:text-[65px] font-bold leading-[0.95] tracking-tight mb-16 whitespace-pre-line">
               {getSettingText('aboutTitle', content.aboutTitle)}
             </h2>

             <h4 className="text-[#6ca53a] font-title text-[12px] font-bold uppercase tracking-[0.2em] mb-6">{getSettingText('aboutHeader', { es: 'ABOUT', en: 'ABOUT' })}</h4>

             <p className="text-[#5b9538] font-body text-[16px] md:text-[18px] font-bold leading-relaxed mb-12 max-w-[80%] whitespace-pre-line">
               {getSettingText('aboutSub', content.aboutSub)}
             </p>
             
             <div className="flex items-center gap-8 border-t border-[#6ca53a]/20 pt-8">
               <a href="#" className="text-[#6ca53a] font-title font-bold text-[13px] tracking-widest uppercase underline underline-offset-8 hover:text-ondo-orange transition-colors">
                 {getSettingText('aboutLink', { es: 'LEARN MORE', en: 'LEARN MORE' })}
               </a>
               <button className="border border-[#6ca53a] text-[#6ca53a] uppercase font-title font-bold text-xs tracking-widest px-6 py-3 hover:bg-[#6ca53a] hover:text-white transition-colors">
                 {getSettingText('aboutCTA', { es: '¡APAPÁCHATE!', en: '¡APAPÁCHATE!' })}
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ondo-beige text-ondo-black py-20 px-6 border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col items-center md:items-start gap-4">
             <img src={getSetting('footerLogo', null) ? urlFor(getSetting('footerLogo')).url() : '/images/ondo-logo-orange.png'} alt="ONDO Logo" className="h-12 object-contain" />
             <div className="text-gray-500 font-body text-sm font-medium">
               {getSetting('copyrightText', '© 2026 ONDO. All rights reserved.')}
             </div>
           </div>
           
           <div className="flex flex-col items-center gap-6">
             {getSetting('showInstagram', true) !== false && (
             <div className="flex gap-8">
               <a href={getSetting('instagramUrl', 'https://instagram.com')} target="_blank" rel="noopener noreferrer" className="bg-ondo-orange p-3 text-white hover:bg-ondo-green transition-all hover:scale-110">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
               </a>
             </div>
             )}
             <div className="flex flex-col items-center gap-2 text-ondo-green font-title font-bold uppercase tracking-widest text-sm text-center">
               <a href={`mailto:${getSetting('contactEmail', 'hola@ondo.mx')}`} className="hover:text-ondo-orange transition-colors flex items-center gap-2">
                 <Mail className="w-4 h-4" /> {(getSetting('contactEmail', 'hola@ondo.mx') || '').toUpperCase()}
               </a>
               {getSetting('contactPhone', '+52 1 234 567 890') && (
                 <a href={`tel:${(getSetting('contactPhone', '+52 1 234 567 890') || '').replace(/\s/g, '')}`} className="hover:text-ondo-orange transition-colors">{getSetting('contactPhone', '+52 1 234 567 890')}</a>
               )}
             </div>
           </div>
         </div>
      </footer>

      {/* ── MODAL: Delivery Address ── */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-ondo-white shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={closeDeliveryModal} className="absolute top-4 right-4 p-2 hover:bg-ondo-beige transition-colors">
              <X className="w-5 h-5 text-ondo-black" />
            </button>

            {deliveryStatus === 'idle' || deliveryStatus === 'checking' ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-ondo-orange flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-title font-bold text-2xl uppercase text-ondo-black">
                    {lang === 'es' ? '¿Dónde te enviamos?' : 'Where do we deliver?'}
                  </h2>
                </div>
                <p className="font-body text-gray-500 text-sm mb-6 leading-relaxed">
                  {lang === 'es'
                    ? 'Antes de añadir al carrito, cuéntanos dónde estás para confirmar que podemos llegar hasta ti.'
                    : 'Before adding to cart, let us know where you are so we can confirm we deliver to you.'}
                </p>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder={lang === 'es' ? 'Tu dirección (opcional)' : 'Your address (optional)'}
                  className="w-full border border-gray-200 px-4 py-3 font-body text-sm mb-3 focus:outline-none focus:border-ondo-orange bg-white"
                />
                <input
                  type="text"
                  value={deliveryPostal}
                  onChange={e => setDeliveryPostal(e.target.value)}
                  placeholder={lang === 'es' ? 'Código postal *' : 'Postal code *'}
                  className="w-full border border-gray-200 px-4 py-3 font-body text-sm mb-5 focus:outline-none focus:border-ondo-orange bg-white"
                />
                <button
                  onClick={checkDelivery}
                  disabled={!deliveryPostal.trim() || deliveryStatus === 'checking'}
                  className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {deliveryStatus === 'checking'
                    ? (lang === 'es' ? 'Comprobando…' : 'Checking…')
                    : (lang === 'es' ? 'Confirmar zona' : 'Confirm zone')}
                </button>
              </>
            ) : deliveryStatus === 'ok' ? (
              <>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <CheckCircle className="w-16 h-16 text-ondo-green" />
                  <h2 className="font-title font-bold text-2xl uppercase text-ondo-black">
                    {deliveryZones?.inZoneMessageEs && lang === 'es'
                      ? deliveryZones.inZoneMessageEs
                      : deliveryZones?.inZoneMessageEn || '¡Perfecto! Repartimos en tu zona 🎉'}
                  </h2>
                  <p className="font-body text-gray-500 text-sm">
                    {lang === 'es' ? 'Ya puedes añadir tus productos al carrito.' : 'You can now add products to your cart.'}
                  </p>
                  <button
                    onClick={confirmDeliveryAndClose}
                    className="bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-4 px-8 text-sm mt-2"
                  >
                    {lang === 'es' ? 'Continuar comprando' : 'Continue shopping'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <AlertTriangle className="w-16 h-16 text-ondo-orange" />
                  <h2 className="font-title font-bold text-xl uppercase text-ondo-black">
                    {deliveryZones?.outOfZoneMessageEs && lang === 'es'
                      ? deliveryZones.outOfZoneMessageEs
                      : deliveryZones?.outOfZoneMessageEn || 'Pronto repartiremos en tu zona.'}
                  </h2>
                  {!emailSent ? (
                    <>
                      <p className="font-body text-gray-500 text-sm">
                        {lang === 'es' ? 'Déjanos tu correo y te avisamos.' : 'Leave your email and we\'ll notify you.'}
                      </p>
                      <div className="flex w-full gap-2 mt-2">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={e => setNotifyEmail(e.target.value)}
                          placeholder={lang === 'es' ? 'tu@correo.com' : 'your@email.com'}
                          className="flex-1 border border-gray-200 px-4 py-3 font-body text-sm focus:outline-none focus:border-ondo-orange bg-white"
                        />
                        <button
                          onClick={submitNotifyEmail}
                          disabled={!notifyEmail.trim()}
                          className="bg-ondo-green text-white font-title font-bold uppercase px-4 text-xs disabled:opacity-40"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="font-body text-ondo-green font-bold text-sm">
                      {lang === 'es' ? '¡Gracias! Te avisamos cuando estemos ahí 🌿' : 'Thanks! We\'ll notify you when we arrive 🌿'}
                    </p>
                  )}
                  <button onClick={closeDeliveryModal} className="text-sm text-gray-400 underline mt-2 font-body">
                    {lang === 'es' ? 'Cerrar' : 'Close'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                    if (!hasValidatedDelivery) {
                      setPendingProduct(mixPendingProduct);
                      setShowMixWarning(false);
                      setShowDeliveryModal(true);
                    } else {
                      doAddToCart(mixPendingProduct);
                      setShowMixWarning(false);
                    }
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

      {/* ── MODAL: Product Detail ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-ondo-white shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col md:flex-row relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 hover:opacity-60 transition-opacity bg-white/50 rounded-full md:bg-transparent"
            >
              <X className="w-5 h-5 text-ondo-green" />
            </button>

            {/* Image column - Now more square and with Carousel */}
            <div className={`md:w-1/2 shrink-0 ${selectedProduct.bgColor || 'bg-ondo-beige'} relative overflow-hidden group`} style={{ minHeight: '300px' }}>
              <div 
                className="w-full h-full flex transition-transform duration-500 ease-out absolute inset-0"
                style={{ transform: `translateX(-${popupImageIndex * 100}%)` }}
              >
                <div className="w-full h-full shrink-0 relative">
                  <img
                    src={resolveImage(selectedProduct.image)}
                    alt={resolveText(selectedProduct.title)}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>
                {selectedProduct.hoverImage && (
                  <div className="w-full h-full shrink-0 relative">
                    <img
                      src={resolveImage(selectedProduct.hoverImage)}
                      alt={`${resolveText(selectedProduct.title)} alternate`}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                )}
              </div>
              
              {/* Carousel Controls */}
              {selectedProduct.hoverImage && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPopupImageIndex(prev => prev === 0 ? 1 : 0); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white text-ondo-green rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPopupImageIndex(prev => prev === 0 ? 1 : 0); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white text-ondo-green rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${popupImageIndex === 0 ? 'bg-ondo-green' : 'bg-ondo-green/30'}`} />
                    <div className={`w-2 h-2 rounded-full transition-colors ${popupImageIndex === 1 ? 'bg-ondo-green' : 'bg-ondo-green/30'}`} />
                  </div>
                </>
              )}
            </div>

            {/* Content column */}
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-ondo-white">
              <div>
                {/* Label */}
                <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-6 inline-block pr-6">
                  {lang === 'es' ? 'PRODUCTO' : 'PRODUCT'}
                </p>

                {/* Stars */}
                <div className="flex items-center text-ondo-yellow text-[11px] tracking-widest mb-4">
                  ★★★★★ <span className="text-gray-300 font-body tracking-normal ml-2 underline underline-offset-2">(42)</span>
                </div>

                {/* Title */}
                <h2 className="font-title font-black text-[32px] md:text-[40px] uppercase leading-[0.92] text-ondo-green mb-4 tracking-tight">
                  {resolveText(selectedProduct.title)}
                </h2>
                <div className="w-12 h-[3px] bg-ondo-green mb-5" />

                {/* Tagline */}
                {selectedProduct.tagline && (
                  <p className="font-body italic text-ondo-green/80 font-bold text-[15px] mb-4">
                    {resolveText(selectedProduct.tagline)}
                  </p>
                )}

                {/* Price */}
                <div className="font-title font-black text-[28px] mb-5">
                  {cartItemCount >= 5 ? (
                    <div className="flex items-center gap-3">
                      <span className="line-through text-gray-400 text-[20px]">€{selectedProduct.price?.toFixed(2)}</span>
                      <span className="text-ondo-orange">€{(selectedProduct.price * (cartItemCount > 9 ? 0.8 : 0.9)).toFixed(2)}</span>
                      <span className="bg-ondo-orange text-white text-[12px] px-2 py-1 rounded-sm uppercase tracking-wide self-center mb-1">
                        -{cartItemCount > 9 ? '20' : '10'}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-ondo-green">€{selectedProduct.price?.toFixed(2)}</span>
                  )}
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <p className="font-body text-ondo-green/70 text-[14px] leading-relaxed mb-6">
                    {resolveText(selectedProduct.description)}
                  </p>
                )}

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProduct.tags.map((tag: any) => (
                      <span key={tag._id || tag} className={`${tag.color || 'bg-ondo-light-green'} text-white text-[10px] font-title font-bold uppercase tracking-wide px-3 py-1`}>
                        {tag.icon} {resolveText(tag.name)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-4 px-8 transition-colors text-[14px] self-start"
              >
                {lang === 'es' ? 'AÑADIR AL CARRITO' : 'ADD TO CART'} &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATIC FLOATING BUTTON (BOTTOM LEFT) ── */}
      {getSetting('enabled', true) !== false && (
        <button
          onClick={openSoupModal}
          className="fixed bottom-6 left-6 z-[45] bg-ondo-orange text-white font-title font-bold uppercase tracking-widest px-6 py-4 shadow-2xl hover:bg-ondo-light-green hover:text-ondo-black transition-colors flex items-center gap-3 border-2 border-transparent hover:border-ondo-black"
        >
          <Mail className="w-5 h-5" />
          {resolveText(getSetting('buttonText', { es: '¿Qué sopa amas?', en: 'What soup do you love?' })) || '¿Qué sopa amas?'}
        </button>
      )}
      {/* ── MODAL: Subscription Funnel Popup ── */}
      {showPopupModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPopupModal(false)}
        >
          <div
            className="bg-ondo-white shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopupModal(false)}
              className="absolute top-4 right-4 z-10 p-2 hover:opacity-60 transition-opacity"
            >
              <X className="w-5 h-5 text-ondo-green" />
            </button>

            {/* ── PASO 1: INTRO — estética sección About ────────────────── */}
            {funnelStep === 'intro' && (
              <div className="flex flex-col md:flex-row min-h-[480px]">
                {/* Imagen lateral (si existe en Sanity) */}
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
                    <h2 className="font-title font-black text-[48px] md:text-[62px] uppercase leading-[0.88] text-ondo-green mb-6 tracking-tight">
                      {resolveText(getSetting('introTitle', { es: 'ÚNETE\nAL CLUB\nONDO', en: 'JOIN\nTHE ONDO\nCLUB' }))}
                    </h2>
                    <div className="w-12 h-[3px] bg-ondo-green mb-6" />
                    <p className="font-body text-ondo-green text-[15px] md:text-[17px] font-bold leading-relaxed mb-8">
                      {resolveText(getSetting('introDescription', { es: 'Sopas artesanales de temporada directamente en tu puerta.', en: 'Seasonal artisan soups delivered straight to your door.' }))}
                    </p>
                    {/* Beneficios con guión */}
                    <ul className="mb-10 space-y-2">
                      {(getSetting('introBenefits') || [
                        { es: '20% de descuento en cada pedido', en: '20% off every order' },
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
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder={lang === 'es' ? 'Dirección (opcional)' : 'Address (optional)'}
                        className="w-full border border-ondo-green/20 px-4 py-3 font-body text-sm focus:outline-none focus:border-ondo-green bg-ondo-beige/30"
                      />
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
              const planPrice = getSetting(`price${cap(funnelFrequency)}${funnelQuantity}`, '') as string;
              return (
                <div className="p-8 md:p-10 bg-ondo-white">
                  <button
                    onClick={() => setFunnelStep('delivery')}
                    className="text-ondo-green/50 font-body text-sm mb-8 flex items-center gap-1 hover:text-ondo-green transition-colors"
                  >
                    ← {lang === 'es' ? 'Atrás' : 'Back'}
                  </button>

                  <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-1 inline-block pr-6">
                    {resolveText(getSetting('planTitle', { es: 'TU PLAN', en: 'YOUR PLAN' }))}
                  </p>
                  <p className="font-body text-gray-400 text-[12px] mt-2 mb-8">
                    {resolveText(getSetting('subscriptionDurationLabel', { es: '3 meses · sin compromiso · cancela cuando quieras', en: '3 months · no commitment · cancel anytime' }))}
                  </p>

                  {/* Frecuencia — dos cards con info de entregas */}
                  <p className="font-title text-[10px] uppercase tracking-widest text-gray-400 mb-3">
                    {resolveText(getSetting('frequencyLabel', { es: 'Frecuencia de entrega', en: 'Delivery frequency' }))}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
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
                          className={`p-5 border-2 flex flex-col gap-1 text-left transition-all ${sel ? 'border-ondo-green bg-ondo-green' : 'border-gray-200 hover:border-ondo-green/50 bg-white'}`}
                        >
                          <span className={`font-title font-black uppercase text-[15px] tracking-widest ${sel ? 'text-white' : 'text-ondo-black'}`}>
                            {freq === 'quincenal'
                              ? resolveText(getSetting('quincenalLabel', { es: 'Quincenal', en: 'Biweekly' }))
                              : resolveText(getSetting('mensualLabel', { es: 'Mensual', en: 'Monthly' }))}
                          </span>
                          <span className={`font-body text-[12px] leading-snug ${sel ? 'text-white/70' : 'text-gray-400'}`}>
                            {freqDeliveriesLabel}
                          </span>
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: freqDeliveries }).map((_, i) => (
                              <span key={i} className={`w-2 h-2 rounded-full ${sel ? 'bg-white/60' : 'bg-ondo-green/20'}`} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cantidad — cards con total acumulado */}
                  <p className="font-title text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                    {resolveText(getSetting('quantityLabel', { es: 'Sopas por envío', en: 'Soups per delivery' }))}
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {([4, 6, 10] as const).map(qty => {
                      const selected = funnelQuantity === qty;
                      const total = qty * deliveries;
                      return (
                        <button
                          key={qty}
                          onClick={() => { setFunnelQuantity(qty); setFunnelSoupQty({}); }}
                          className={`relative p-4 border-2 flex flex-col gap-2 transition-all text-left ${selected ? 'border-ondo-green bg-ondo-green' : 'border-gray-200 hover:border-ondo-green/50 bg-white'}`}
                        >
                          {qty === 6 && (
                            <span className={`absolute top-2 right-2 font-title font-black text-[7px] uppercase tracking-widest px-1.5 py-0.5 ${selected ? 'bg-white text-ondo-green' : 'bg-ondo-orange text-white'}`}>
                              {lang === 'es' ? 'Popular' : 'Popular'}
                            </span>
                          )}
                          {/* Dot grid — sopas por envío */}
                          <div className="flex flex-wrap gap-1 min-h-[24px]">
                            {Array.from({ length: qty }).map((_, i) => (
                              <span key={i} className={`w-2.5 h-2.5 rounded-full ${selected ? 'bg-white/80' : 'bg-ondo-green/25'}`} />
                            ))}
                          </div>
                          {/* Cantidad por envío */}
                          <div className="leading-none">
                            <span className={`font-title font-black text-[36px] leading-none ${selected ? 'text-white' : 'text-ondo-black'}`}>{qty}</span>
                            <span className={`font-body text-[10px] block mt-0.5 ${selected ? 'text-white/70' : 'text-gray-400'}`}>
                              {lang === 'es' ? 'sopas/envío' : 'soups/delivery'}
                            </span>
                          </div>
                          {/* Total acumulado */}
                          <div className={`text-[11px] font-title font-bold border-t pt-2 mt-1 ${selected ? 'border-white/20 text-white' : 'border-gray-100 text-ondo-green'}`}>
                            {total} {lang === 'es' ? 'en total' : 'total'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón con precio */}
                  <button
                    onClick={() => setFunnelStep('soups')}
                    className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[14px] flex items-center justify-center gap-3"
                  >
                    <span>{lang === 'es' ? 'CONTINUAR' : 'CONTINUE'}</span>
                    {planPrice && (
                      <span className="font-body font-normal text-[13px] text-white/80 normal-case tracking-normal">
                        · {planPrice}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {/* Card "Elección de ONDO" — integrada en el grid */}
                  {(() => {
                    const ondoQty = funnelSoupQty[ONDO_CHOICE_ID] || 0;
                    const ondoImg = getSetting('ondoChoiceImage');
                    const ondoBg = getSetting('ondoChoiceBgColor', 'bg-ondo-beige');
                    return (
                      <div className={`border transition-all ${ondoQty > 0 ? 'border-ondo-green' : 'border-gray-100'}`}>
                        <div className={`aspect-[4/3] ${ondoBg} relative overflow-hidden`}>
                          {ondoImg ? (
                            <img
                              src={resolveImage(ondoImg)}
                              alt={resolveText(getSetting('ondoChoiceTitle', { es: 'Elección de ONDO', en: "ONDO's Choice" }))}
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <span className="font-title font-black text-[32px] text-ondo-orange/40 leading-none">?</span>
                              <span className="font-title font-black text-[9px] uppercase tracking-widest text-ondo-orange/40">ONDO</span>
                            </div>
                          )}
                          {ondoQty > 0 && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-ondo-green flex items-center justify-center">
                              <span className="font-title font-black text-white text-[10px]">{ondoQty}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="font-title font-bold uppercase text-[10px] truncate text-ondo-black leading-tight">
                            {resolveText(getSetting('ondoChoiceTitle', { es: 'Elección de ONDO', en: "ONDO's Choice" }))}
                          </p>
                          <p className="font-body text-[9px] text-gray-400 mt-0.5 leading-tight line-clamp-2 mb-2">
                            {resolveText(getSetting('ondoChoiceDescription', { es: 'Sorpresa de temporada seleccionada por nuestro chef', en: 'Seasonal surprise selected by our chef' }))}
                          </p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setFunnelSoupQty(prev => { const n = { ...prev }; if ((n[ONDO_CHOICE_ID] || 0) > 0) n[ONDO_CHOICE_ID]--; if (n[ONDO_CHOICE_ID] === 0) delete n[ONDO_CHOICE_ID]; return n; })}
                              disabled={ondoQty === 0}
                              className="w-7 h-7 border border-gray-200 flex items-center justify-center text-ondo-black disabled:opacity-30 hover:border-ondo-green transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-title font-bold text-[16px] text-ondo-black w-6 text-center">{ondoQty}</span>
                            <button
                              onClick={() => { if (funnelRemaining <= 0) return; setFunnelSoupQty(prev => ({ ...prev, [ONDO_CHOICE_ID]: (prev[ONDO_CHOICE_ID] || 0) + 1 })); }}
                              disabled={funnelRemaining <= 0}
                              className="w-7 h-7 bg-ondo-green text-white flex items-center justify-center disabled:opacity-30 hover:bg-ondo-light-green transition-colors"
                            >
                              <Plus className="w-3 h-3" />
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
                        className={`border transition-all ${qty > 0 ? 'border-ondo-green' : 'border-gray-100'}`}
                      >
                        <div className={`aspect-[4/3] ${p.bgColor || 'bg-ondo-beige'} relative overflow-hidden`}>
                          <img
                            src={resolveImage(p.image)}
                            alt={resolveText(p.title)}
                            className="w-full h-full object-cover mix-blend-multiply"
                          />
                          {qty > 0 && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-ondo-green flex items-center justify-center">
                              <span className="font-title font-black text-white text-[10px]">{qty}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="font-title font-bold uppercase text-[10px] truncate text-ondo-black leading-tight mb-2">
                            {resolveText(p.title)}
                          </p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setFunnelSoupQty(prev => { const n = { ...prev }; if ((n[p._id] || 0) > 0) n[p._id]--; if (n[p._id] === 0) delete n[p._id]; return n; })}
                              disabled={qty === 0}
                              className="w-7 h-7 border border-gray-200 flex items-center justify-center text-ondo-black disabled:opacity-30 hover:border-ondo-green transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-title font-bold text-[16px] text-ondo-black w-6 text-center">{qty}</span>
                            <button
                              onClick={() => { if (funnelRemaining <= 0) return; setFunnelSoupQty(prev => ({ ...prev, [p._id]: (prev[p._id] || 0) + 1 })); }}
                              disabled={funnelRemaining <= 0}
                              className="w-7 h-7 bg-ondo-green text-white flex items-center justify-center disabled:opacity-30 hover:bg-ondo-light-green transition-colors"
                            >
                              <Plus className="w-3 h-3" />
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
                  onClick={() => setFunnelStep('summary')}
                  disabled={!funnelCanProceed}
                  className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-5 transition-all hover:bg-ondo-green text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {lang === 'es' ? 'SIGUIENTE' : 'NEXT'} &rarr;
                </button>
              </div>
            )}

            {/* ── PASO 4: RESUMEN + CHECKOUT ────────────────────────────── */}
            {/* ── PASO 5: RESUMEN + CHECKOUT ────────────────────────────── */}
            {funnelStep === 'summary' && (
              <div className="p-8 md:p-10 bg-ondo-white">
                <button
                  onClick={() => setFunnelStep('soups')}
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


      {/* ── MODAL: Soup Request Popup ── */}
      {showSoupModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowSoupModal(false)}
        >
          <div
            className="bg-ondo-white shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSoupModal(false)}
              className="absolute top-4 right-4 z-10 p-2 hover:opacity-60 transition-opacity"
            >
              <X className="w-5 h-5 text-ondo-green" />
            </button>

            <div className="p-8 md:p-10 flex flex-col bg-ondo-white">
               {!soupSubmitted ? (
                 <>
                   <p className="font-title text-[11px] uppercase tracking-[0.25em] text-ondo-green border-b border-ondo-green/20 pb-3 mb-6 inline-block self-start pr-6">
                     {lang === 'es' ? 'ONDO SOUPS' : 'ONDO SOUPS'}
                   </p>
                   
                   <h2 className="font-title font-black text-[32px] md:text-[42px] uppercase leading-[0.9] text-ondo-green mb-6 tracking-tight">
                     {resolveText(getSetting('popupTitle', { es: '¿Que sopas te apapachan?', en: 'What soups comfort you?' }))}
                   </h2>

                   <p className="font-body text-ondo-green text-[15px] leading-relaxed mb-8">
                     {resolveText(getSetting('popupMessage', { 
                       es: 'Dinos que sopas te encantaría que hicieramos y serás de los primeros en probarlos', 
                       en: 'Tell us what soups you would love us to make and you will be among the first to try them' 
                     }))}
                   </p>

                   <form onSubmit={handleSoupSubmit} className="flex flex-col gap-4">
                     <div>
                       <label className="font-title text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                         {resolveText(getSetting('field1Label', { es: '¿Qué sopa tienes en mente?', en: 'What soup do you have in mind?' }))}
                       </label>
                       <textarea
                         required
                         rows={3}
                         value={soupIdea}
                         onChange={e => setSoupIdea(e.target.value)}
                         placeholder={lang === 'es' ? 'Ej: Crema de alcachofa, Sopa de cebolla...' : 'e.g. Artichoke cream, Onion soup...'}
                         className="w-full px-4 py-3 border border-ondo-green/20 font-body text-sm focus:outline-none focus:border-ondo-green bg-ondo-beige/30 resize-none"
                       />
                     </div>

                     <div>
                       <label className="font-title text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                         {resolveText(getSetting('field2Label', { es: 'Tu Correo', en: 'Your Email' }))}
                       </label>
                       <input
                         required
                         type="email"
                         value={soupEmail}
                         onChange={e => setSoupEmail(e.target.value)}
                         placeholder={lang === 'es' ? 'tu@correo.com' : 'your@email.com'}
                         className="w-full px-4 py-3 border border-ondo-green/20 font-body text-sm focus:outline-none focus:border-ondo-green bg-ondo-beige/30"
                       />
                     </div>

                     <p className="font-body text-[11px] text-gray-400 italic mb-2">
                       {resolveText(getSetting('footerNote', { 
                         es: '*al enviar aceptas recibir comunicaciones ligeras del equipo Ondo', 
                         en: '*by submitting you agree to receive light communication from team Ondo' 
                       }))}
                     </p>

                     <button
                       type="submit"
                       disabled={isSubmittingSoup}
                       className="border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-4 px-8 transition-colors text-[14px] self-start disabled:opacity-50"
                     >
                       {isSubmittingSoup ? (lang === 'es' ? 'ENVIANDO...' : 'SENDING...') : (lang === 'es' ? 'ENVIAR' : 'SUBMIT')} &rarr;
                     </button>
                   </form>
                 </>
               ) : (
                 <div className="py-12 flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-ondo-green flex items-center justify-center mb-6">
                     <CheckCircle className="w-8 h-8 text-white" />
                   </div>
                   <h2 className="font-title font-black text-[28px] uppercase leading-tight text-ondo-green mb-4">
                     {resolveText(getSetting('successMessage', { es: '¡GRACIAS!', en: 'THANK YOU!' }))}
                   </h2>
                   <p className="font-body text-ondo-green text-[15px] leading-relaxed mb-8">
                     {lang === 'es' 
                       ? 'Hemos recibido tu idea. ¡Te avisaremos pronto!' 
                       : 'We have received your idea. We will let you know soon!'}
                   </p>
                   <button
                     onClick={() => setShowSoupModal(false)}
                     className="border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-3 px-8 transition-colors text-[13px]"
                   >
                     {lang === 'es' ? 'CERRAR' : 'CLOSE'}
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
